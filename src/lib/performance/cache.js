export const PERFORMANCE_CACHE_PREFIX = 'performance_snapshot_v2:';
export const PERFORMANCE_REFRESH_INTERVAL = 5 * 60 * 1000;
const EMPTY = Object.freeze({ snapshot: null, loading: true, error: null, needsRefresh: false });

export function isPerformanceSnapshot(value) {
  return value?.snapshotVersion === 2 && ['practice', 'timed', 'coaching', 'combined'].every((mode) => {
    const report = value.reports?.[mode];
    return report?.schemaVersion === 1 && report.mode === mode && report.overview
      && ['free', 'pro'].includes(report.access) && (report.access !== 'pro' || Array.isArray(report.details?.skills));
  });
}

function withoutPro(snapshot) {
  return { ...snapshot, reports: Object.fromEntries(Object.entries(snapshot.reports)
    .map(([mode, report]) => [mode, { ...report, access: 'free', details: null }])) };
}

// One persisted snapshot contains BOTH modes and all skill details. Age alone
// never causes a fetch; only an explicit refresh, initial load or Pro upgrade
// does. Injected storage/transport let the lifecycle be tested without React.
export function createPerformanceCache({ storage, fetchSnapshot, now = Date.now }) {
  const entries = new Map(), listeners = new Map(), writes = new Map();
  function entryFor(userId) {
    if (!entries.has(userId)) entries.set(userId, { state: EMPTY, hydrated: false, active: true,
      fetchedAt: null, requestedPro: false, lastAttemptAt: null, hydrating: null, inFlight: null, epoch: 0, invalidated: false, revision: 0 });
    return entries.get(userId);
  }
  function publish(userId, entry, patch) {
    if (!entry.active) return;
    entry.state = { ...entry.state, ...patch };
    listeners.get(userId)?.forEach((listener) => listener());
  }
  function persist(userId, value) {
    const key = PERFORMANCE_CACHE_PREFIX + userId;
    const pending = (writes.get(key) ?? Promise.resolve()).catch(() => {}).then(() => value == null
      ? storage.removeItem(key) : storage.setItem(key, JSON.stringify(value))).catch(() => {});
    writes.set(key, pending);
    return pending;
  }
  function save(userId, entry) {
    return persist(userId, { userId, snapshot: entry.state.snapshot, fetchedAt: entry.fetchedAt,
      requestedPro: entry.requestedPro, lastAttemptAt: entry.lastAttemptAt, invalidated: entry.invalidated });
  }
  async function hydrate(userId, entry) {
    if (entry.hydrated) return;
    if (!entry.hydrating) entry.hydrating = (async () => {
      try {
        const value = JSON.parse(await storage.getItem(PERFORMANCE_CACHE_PREFIX + userId));
        if (entry.active && value?.userId === userId && isPerformanceSnapshot(value.snapshot)
          && Number.isFinite(value.fetchedAt)) {
          entry.fetchedAt = value.fetchedAt;
          entry.lastAttemptAt = Number.isFinite(value.lastAttemptAt) ? value.lastAttemptAt : value.fetchedAt;
          entry.requestedPro = value.requestedPro === true;
          entry.invalidated = value.invalidated === true;
          publish(userId, entry, { snapshot: value.snapshot, loading: false, error: null, needsRefresh: entry.invalidated });
        }
      } catch { /* Missing/corrupt storage is a cold load, not a broken screen. */ }
      entry.hydrated = true;
    })();
    await entry.hydrating;
  }
  async function load(userId, isPro, manual) {
    if (!userId) return;
    const entry = entryFor(userId);
    await hydrate(userId, entry);
    if (!entry.active) return;
    if (!isPro && entry.requestedPro) {
      // Revoke cached paid details, including any paid fetch still in flight.
      entry.epoch++;
      entry.inFlight = null;
      entry.requestedPro = false;
      if (entry.state.snapshot) {
        publish(userId, entry, { snapshot: withoutPro(entry.state.snapshot), loading: false });
        save(userId, entry);
      }
    }
    const upgrading = isPro && !entry.requestedPro;
    if (entry.inFlight) {
      await entry.inFlight;
      return (upgrading || entry.invalidated) && entry.active ? load(userId, isPro, manual) : entry.state.snapshot;
    }
    if (entry.state.snapshot && !upgrading && !entry.invalidated) {
      if (!manual) return entry.state.snapshot;
      const elapsed = now() - (entry.lastAttemptAt ?? entry.fetchedAt);
      // A clock moving backwards must not accidentally bypass the cooldown.
      const cohortUnavailable = Object.values(entry.state.snapshot.reports).some((report) => report.overview.sections?.some((section) => section.cohort?.status === 'unavailable'));
      if (elapsed < PERFORMANCE_REFRESH_INTERVAL && !cohortUnavailable) return entry.state.snapshot;
    }
    if (!manual && entry.state.error && !upgrading) return entry.state.snapshot;
    const epoch = entry.epoch;
    const revision = entry.revision;
    entry.lastAttemptAt = now();
    entry.requestedPro = isPro;
    publish(userId, entry, { loading: !entry.state.snapshot, error: null, needsRefresh: false });
    if (entry.state.snapshot) save(userId, entry);
    entry.inFlight = (async () => {
      try {
        const snapshot = await fetchSnapshot({ userId, includeDetails: isPro });
        if (!isPerformanceSnapshot(snapshot)) throw new Error('Your analysis could not be loaded. Please try again.');
        if (!entry.active || epoch !== entry.epoch) return;
        entry.fetchedAt = now();
        entry.invalidated = revision !== entry.revision;
        entry.lastAttemptAt = entry.fetchedAt;
        publish(userId, entry, { snapshot: isPro ? snapshot : withoutPro(snapshot), loading: false, error: null, needsRefresh: entry.invalidated });
        await save(userId, entry);
      } catch (error) {
        if (epoch === entry.epoch) publish(userId, entry, { loading: false, error: entry.state.snapshot ? null : error.message, needsRefresh: false });
      } finally {
        if (epoch === entry.epoch) entry.inFlight = null;
      }
      return entry.active ? entry.state.snapshot : null;
    })();
    return entry.inFlight;
  }
  return {
    getState: (userId) => userId ? entryFor(userId).state : EMPTY,
    subscribe(userId, listener) {
      if (!listeners.has(userId)) listeners.set(userId, new Set());
      listeners.get(userId).add(listener);
      return () => listeners.get(userId)?.delete(listener);
    },
    ensure: (userId, isPro) => load(userId, isPro, false),
    refresh: (userId, isPro) => load(userId, isPro, true),
    invalidate(userId) {
      const entry = entries.get(userId);
      if (!entry) return;
      entry.invalidated = true; entry.revision++;
      publish(userId, entry, { needsRefresh: true });
      if (entry.state.snapshot) void save(userId, entry);
    },
    async completePractice(userId, section, questionIds) {
      const entry = entries.get(userId);
      if (!entry?.state.snapshot) return;
      entry.invalidated = true; entry.revision++;
      const completed = new Set(questionIds);
      const snapshot = { ...entry.state.snapshot, reports: Object.fromEntries(Object.entries(entry.state.snapshot.reports).map(([mode, report]) => [mode,
        !report.details ? report : { ...report, details: { ...report.details, skills: report.details.skills.map((skill) => skill.section !== section ? skill :
          { ...skill, newQuestionIds: skill.newQuestionIds.filter((id) => !completed.has(id)) }) } }])) };
      // Prevent a completed drill being offered as fresh again while scores
      // stay cached until the next visit to Progress or a manual refresh.
      publish(userId, entry, { snapshot, needsRefresh: true });
      await save(userId, entry);
    },
    async clearAll() {
      const ids = [...entries.keys()];
      for (const entry of entries.values()) { entry.active = false; entry.epoch++; }
      entries.clear();
      listeners.forEach((set) => set.forEach((listener) => listener()));
      // Queue removals behind any write already started before logout.
      const keys = await storage.getAllKeys();
      await Promise.all(keys.filter((key) => key.startsWith('performance_snapshot_v1:')).map((key) => storage.removeItem(key)));
      for (const key of keys) if (key.startsWith(PERFORMANCE_CACHE_PREFIX)) ids.push(key.slice(PERFORMANCE_CACHE_PREFIX.length));
      await Promise.all([...new Set(ids)].map((id) => persist(id, null)));
    },
  };
}
