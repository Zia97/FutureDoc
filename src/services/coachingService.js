import AsyncStorage from '@react-native-async-storage/async-storage';
import { readPracticeBanks } from './practiceContentService';
import { hydrateCoachSession } from '../lib/coaching/contentTransport';
import { supabase } from '../lib/supabase';
import { performanceCache } from './performanceService';
import { reconcileCoachSession, resumeUntimedSession } from '../lib/coaching/sessionState';
import { localSessionResult } from '../lib/coaching/engine';
import { assertCoachProAccess, assertCoachSessionAccess } from '../lib/coaching/access';
import { createDeviceCoachSession, deviceCoachProfile } from '../lib/coaching/deviceContent';

const PREFIX = 'coach_checkpoint_v1:';
const HUB_PREFIX = 'coach_hub_v1:';
const PREFERENCES = 'coach_preferences_v1:';
const NEXT_PREFIX = 'coach_next_v1:';
const nextRequests = new Map(), nextSets = new Map();
const starts = new Map();
const writes = new Map();
const sessionSaves = new Map();
const preferenceWrites = new Map();
const preferenceSync = new Map();
const hubCache = new Map();
const completions = new Map();
const activeSessions = new Set(), backgroundSync = new Map(), resettingUsers = new Set();
const keyFor = (userId, id) => `${PREFIX}${userId}:${id}`;
const hubKeyFor = (userId) => `${HUB_PREFIX}${userId}`;
const canonical = (value) => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])])) : value;
// The server fills unanswered questions, flags and times with defaults. Compare
// those defaults too when recognising a save whose response never arrived.
function sameProgress(remote, progress) {
  const normalise = (p) => {
    const result = { ...p };
    for (const [field, fallback] of [['answers', null], ['flags', false], ['times', 0], ['elapsed', 0]]) {
      const keys = new Set([...Object.keys(remote.progress[field] ?? {}), ...Object.keys(progress[field] ?? {})]);
      result[field] = Object.fromEntries([...keys].map((key) => [key, p[field]?.[key] ?? fallback]));
    }
    return JSON.stringify(canonical(result));
  };
  return normalise(remote.progress) === normalise(progress);
}
const messages = {
  forbidden: 'Developer sample results are available to admin accounts only.',
  pro_required: 'Your free coaching preview is complete. Pro unlocks ongoing coaching.',
  assessment_required: 'Complete your starting assessment first.',
  question_pool_exhausted: 'There are no eligible questions for this focus right now. Try another skill or review your mistakes.',
  assessment_content_unavailable: 'The assessment is being updated. Please try again later.',
  content_changed: 'These questions have been updated. Please try another focus.',
  daily_limit: 'You have reached today’s chat limit. Your practice and saved plan are still available.',
  message_in_progress: 'Your coach is still replying. Try again in a moment.',
  message_already_completed: 'That reply finished before it reached your chat. Send the message again to get a fresh reply.',
  session_not_found: 'This session could not be found for your account.',
};
export async function coachRequest(userId, action, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.id !== userId) { const error = new Error('Please sign in to use your coach.'); error.code = 'unauthorized'; throw error; }
  // Capture these exact versions for hydration even if a background refresh
  // replaces a bank while the request is in flight. Saves use full snapshots.
  const usesBanks = ['start', 'session', 'prepare_next'].includes(action);
  const banks = usesBanks ? await readPracticeBanks() : {};
  const contentVersions = Object.fromEntries(Object.entries(banks).map(([key, bank]) => [key, bank.version]));
  const invoke = (versions) => supabase.functions.invoke('ai-coach', {
    body: { ...payload, action, ...(usesBanks ? { contentVersions: versions } : {}) }, headers: { Authorization: `Bearer ${session.access_token}` },
  });
  let { data, error } = await invoke(contentVersions);
  if (!error && data?.session) {
    try { data = { ...data, session: hydrateCoachSession(data.session, banks) }; }
    catch {
      // A damaged/removed bank must not strand an earned session. These three
      // actions are idempotent; request its original frozen content once.
      ({ data, error } = await invoke({}));
    }
  }
  let code = data?.error;
  if (error?.context?.json) { try { code = (await error.context.json()).error ?? code; } catch { /* Transport failure. */ } }
  if (error || code) {
    const failure = new Error(messages[code] ?? 'Your coach could not connect. Your saved progress is safe; check your connection and retry.');
    failure.code = code; throw failure;
  }
  if (action === 'reset_progress' || (action === 'save' && data?.session?.status === 'completed')) performanceCache.invalidate(userId);
  if (action === 'save' && data?.session?.status === 'completed') void recordLocalCompletion(userId, data.session).catch(() => {});
  return data;
}
function updateCheckpoint(key, transform) {
  const pending = (writes.get(key) ?? Promise.resolve()).catch(() => {}).then(async () => {
    let previous = null;
    try { previous = JSON.parse(await AsyncStorage.getItem(key)); } catch { /* Replace damaged draft. */ }
    const next = transform(previous);
    if (next === null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, JSON.stringify(next));
    return next;
  });
  writes.set(key, pending);
  pending.finally(() => { if (writes.get(key) === pending) writes.delete(key); }).catch(() => {});
  return pending;
}
export function saveCoachCheckpoint(userId, session, dirty = true) {
  // Snapshot before queueing: later edits must not change an earlier checkpoint.
  const snapshot = JSON.parse(JSON.stringify(localSessionResult(session)));
  const saved = updateCheckpoint(keyFor(userId, session.id), () => ({ session: snapshot, dirty }));
  if (snapshot.progress.phase !== 'finished' || !snapshot.report) return saved;
  const work = (completions.get(userId) ?? Promise.resolve()).catch(() => {}).then(async () => {
    const checkpoint = await saved;
    await recordLocalCompletion(userId, snapshot);
    return checkpoint;
  });
  completions.set(userId, work);
  work.finally(() => { if (completions.get(userId) === work) completions.delete(userId); }).catch(() => {});
  return work;
}
export async function readCoachSessionCache(userId, id) {
  const key = keyFor(userId, id);
  // Device reads never wait for network requests, including an older upload.
  return readCheckpoint(key);
}
async function readCheckpoint(key) {
  await writes.get(key);
  try {
    return JSON.parse(await AsyncStorage.getItem(key));
  } catch { return null; }
}
export async function loadCoachHubCache(userId) {
  await completions.get(userId);
  await writes.get(hubKeyFor(userId));
  const cached = await readHubCache(userId);
  if (!cached?.baseline || !cached?.profile) {
    // Recover a kill between committing the result and updating its dashboard.
    const baseline = (await deviceSessions(userId)).map((s) => localSessionResult(s))
      .find((s) => s.kind === 'assessment' && s.report);
    if (baseline) {
      await recordLocalCompletion(userId, baseline);
      return readHubCache(userId);
    }
  }
  return cached;
}
async function readHubCache(userId) {
  if (hubCache.has(userId)) return hubCache.get(userId);
  try {
    const cached = JSON.parse(await AsyncStorage.getItem(hubKeyFor(userId)));
    if (cached) hubCache.set(userId, cached);
    return cached;
  } catch { return null; }
}
export async function saveCoachHubCache(userId, data, { local = false } = {}) {
  await readHubCache(userId);
  const incoming = data;
  return updateCheckpoint(hubKeyFor(userId), (stored) => {
    const previous = hubCache.get(userId) ?? stored;
    data = typeof incoming === 'function' ? incoming(previous) : incoming;
    if (previous?.previewAvailable === false) data = { ...data, previewAvailable: false };
    const localOnly = (previous?.history ?? []).filter((entry) => !(data.history ?? []).some((item) => item.id === entry.id));
    if (localOnly.length) data = { ...data,
      history: [...localOnly, ...(data.history ?? [])].sort((a, b) => (Date.parse(b.completed_at) || 0) - (Date.parse(a.completed_at) || 0)).slice(0, 20),
      active: localOnly.some((entry) => entry.id === data.active?.id) ? null : data.active,
      ...(localOnly.some((entry) => entry.id === previous.baseline?.id) ? { baseline: previous.baseline } : {}),
    };
    if (!local && previous?.active?.pendingCloud && previous.active.id !== data.active?.id) data = { ...data, active: previous.active };
    // A late hub response must never turn a completed mock back into onboarding.
    if (previous?.baseline && (!data.baseline || localOnly.some((entry) => entry.kind === 'assessment'))) {
      data = { ...data, baseline: previous.baseline, profile: previous.profile ?? data.profile };
    }
    if (previous?.localSettings && !local) {
      const pending = Object.fromEntries(Object.entries(previous.localSettings).filter(([key, value]) => data.settings?.[key] !== value));
      data = { ...data, settings: { ...data.settings, ...pending }, localSettings: pending };
    }
    hubCache.set(userId, data);
    return data;
  });
}
async function recordLocalCompletion(userId, session) {
  const entry = { id: session.id, kind: session.kind, title: session.title, report: session.report,
    completed_at: session.completedAt, pendingCloud: session.status !== 'completed' };
  await saveCoachHubCache(userId, (previous) => {
    const cached = previous ?? { settings: { time_multiplier: 1 }, history: [], previewAvailable: true };
    return { ...cached,
      active: cached.active?.id === session.id ? null : cached.active,
      history: [entry, ...(cached.history ?? []).filter((item) => item.id !== session.id)].slice(0, 20),
      ...(session.kind === 'assessment' ? { baseline: { id: session.id, report: session.report },
        profile: cached.baseline?.id === session.id && cached.profile ? cached.profile : deviceCoachProfile([session], cached.settings?.exam_date) } : {}),
    };
  }, { local: true });
}

async function deviceSessions(userId) {
  const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(`${PREFIX}${userId}:`));
  return (await Promise.all(keys.map(readCheckpoint))).filter(Boolean).map((entry) => entry.session);
}

export function startCoachSession(userId, kind, focus = {}, subscription) {
  if (resettingUsers.has(userId)) return Promise.reject(new Error('Coaching reset is in progress.'));
  if (starts.has(userId)) return starts.get(userId);
  const work = (async () => {
    if (!['assessment', 'practice', 'review', 'timed_check'].includes(kind)) throw new Error('Invalid coaching session.');
    const hub = await loadCoachHubCache(userId) ?? { settings: { time_multiplier: 1 }, history: [], previewAvailable: true };
    const sessions = await deviceSessions(userId);
    const active = sessions.find((s) => s.id === hub.active?.id && !s.report)
      ?? sessions.find((s) => !s.report && s.progress.phase !== 'finished' && (s.localOrigin || s.progress.phase !== 'instructions'));
    if (active) return { session: active };
    if (hub.active?.id) return loadCoachSession(userId, hub.active.id, subscription);
    if (kind === 'assessment' && hub.baseline) return loadCoachSession(userId, hub.baseline.id, subscription);
    if (kind !== 'assessment') {
      if (!hub.baseline) throw new Error('Complete your starting assessment first.');
      if (!hub.previewAvailable) assertCoachProAccess(subscription);
    }
    const banks = kind === 'assessment' ? {} : await readPracticeBanks();
    const created = createDeviceCoachSession({ id: newCoachRequestId(), kind, focus, banks, sessions,
      settings: hub.settings, profile: hub.profile });
    const previous = sessions.find((s) => s.id === hub.history?.[0]?.id && s.report)
      ?? sessions.filter((s) => s.report).sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))[0];
    if (previous && kind !== 'assessment') created.previousSessionId = previous.id;
    const started = resumeUntimedSession(created);
    await saveCoachCheckpoint(userId, started);
    const previewAvailable = kind === 'assessment' ? hub.previewAvailable : false;
    await saveCoachHubCache(userId, { ...hub, previewAvailable,
      active: { id: started.id, title: started.title, kind, pendingCloud: true } }, { local: true });
    void saveCoachSession(userId, started).catch(() => {});
    return { session: started, previewAvailable };
  })();
  starts.set(userId, work);
  work.finally(() => { if (starts.get(userId) === work) starts.delete(userId); }).catch(() => {});
  return work;
}

export async function loadCoachInitialPlan(userId, id) {
  const [checkpoint, hub] = await Promise.all([readCoachSessionCache(userId, id), loadCoachHubCache(userId)]);
  const session = checkpoint?.session && localSessionResult(checkpoint.session);
  if (session?.report) return { seen: hub?.settings?.plan_intro_session_id === id,
    profile: deviceCoachProfile([session], hub?.settings?.exam_date), report: session.report };
  return coachRequest(userId, 'initial_plan', { id });
}
export async function clearCoachHubCache(userId) {
  hubCache.delete(userId);
  await AsyncStorage.removeItem(hubKeyFor(userId));
}
export async function loadCoachSession(userId, id, subscription) {
  const local = await readCoachSessionCache(userId, id);
  if (local?.session) {
    assertCoachSessionAccess(local.session, subscription);
    return { ...local, session: localSessionResult(local.session) };
  }
  return refreshCoachSession(userId, id);
}

export function peekCoachNextSet(userId, previousId) {
  return nextSets.get(`${NEXT_PREFIX}${userId}:${previousId}`) ?? null;
}
export function prepareCoachNextSet(userId, session, subscription) {
  if (session.kind === 'assessment' || resettingUsers.has(userId)) return Promise.resolve(null);
  try { assertCoachProAccess(subscription); } catch (error) { return Promise.reject(error); }
  const key = `${NEXT_PREFIX}${userId}:${session.id}`;
  if (nextSets.has(key)) return Promise.resolve(nextSets.get(key));
  if (nextRequests.has(key)) return nextRequests.get(key);
  const work = (async () => {
    await writes.get(key);
    let cached;
    try { cached = JSON.parse(await AsyncStorage.getItem(key)); } catch { /* Download a replacement. */ }
    const next = cached?.session ?? (await coachRequest(userId, 'prepare_next', { id: session.id })).session;
    if (resettingUsers.has(userId)) return null;
    if (!next?.questions?.length || next.id === session.id || next.previousSessionId !== session.id) throw new Error('Your next questions could not be prepared. Please try again.');
    const existing = await readCoachSessionCache(userId, next.id);
    if (existing?.dirty || existing?.session.status === 'completed' || (existing && existing.session.progress.phase !== 'instructions')) return null;
    if (!existing) await saveCoachCheckpoint(userId, next, false);
    await updateCheckpoint(key, () => ({ session: next }));
    nextSets.set(key, next);
    return next;
  })();
  nextRequests.set(key, work);
  work.finally(() => { if (nextRequests.get(key) === work) nextRequests.delete(key); }).catch(() => {});
  return work;
}
export function takeCoachNextSet(userId, previousId, subscription) {
  assertCoachProAccess(subscription);
  const key = `${NEXT_PREFIX}${userId}:${previousId}`, ready = nextSets.get(key);
  if (!ready) return null;
  nextSets.delete(key);
  const started = resumeUntimedSession(ready);
  // Persist before starting the upload; neither operation blocks navigation.
  void saveCoachCheckpoint(userId, started).then(async () => {
    const cached = await loadCoachHubCache(userId);
    if (cached) await saveCoachHubCache(userId, { ...cached, active: { id: started.id, title: started.title, kind: started.kind, pendingCloud: true } }, { local: true });
    return saveCoachSession(userId, started);
  }).catch(() => {});
  void updateCheckpoint(key, () => null).catch(() => {});
  return started;
}
export async function refreshCoachSession(userId, id) {
  const key = keyFor(userId, id);
  await writes.get(key);
  let local = await readCoachSessionCache(userId, id);
  if (local?.session.localOrigin) return local;
  let remote;
  try { remote = (await coachRequest(userId, 'session', { id })).session; }
  catch (error) {
    if (error.code === 'session_not_found') await AsyncStorage.removeItem(key);
    if (!local || ['session_not_found', 'unauthorized'].includes(error.code)) throw error;
    return { ...local, offline: true };
  }
  // Read again inside the write queue: answers can change while the fetch runs.
  return updateCheckpoint(key, (latest) => {
    local = latest ?? local;
    if (local?.session.version > remote.version) return local;
    if (remote.status === 'completed' || !local?.dirty) return { session: remote, dirty: false };
    if (remote.version === local.session.version) return { ...local, session: localSessionResult({ ...local.session,
      offlineScoring: remote.offlineScoring ?? local.session.offlineScoring }) };
    if (sameProgress(remote, local.session.progress)) return { session: remote, dirty: false };
    return { session: localSessionResult(reconcileCoachSession(remote, local.session)), dirty: true };
  });
}

export function saveCoachSession(userId, snapshot, lineage = []) {
  if (lineage.includes(snapshot.id)) return Promise.reject(new Error('Invalid local session chain.'));
  const key = keyFor(userId, snapshot.id);
  const copy = JSON.parse(JSON.stringify(snapshot));
  const work = (sessionSaves.get(key) ?? Promise.resolve()).catch(() => {}).then(async () => {
    // Commit device writes before uploading; an upload is never the only copy.
    await writes.get(key);
    if (copy.previousSessionId) {
      const previous = await readCoachSessionCache(userId, copy.previousSessionId);
      if (previous?.session.status !== 'completed' && previous?.session.progress.phase === 'finished') {
        await saveCoachSession(userId, previous.session, [...lineage, copy.id]);
      }
    }
    const result = await sendCoachSession(userId, copy);
    await updateCheckpoint(key, (latest) => {
      if (latest?.session.version > result.session.version) return latest;
      if (!latest || result.session.status === 'completed' || sameProgress(copy, latest.session.progress)) {
        return { session: result.session, dirty: false };
      }
      return { session: localSessionResult(reconcileCoachSession(result.session, latest.session)), dirty: true };
    });
    return result;
  });
  sessionSaves.set(key, work);
  work.finally(() => { if (sessionSaves.get(key) === work) sessionSaves.delete(key); }).catch(() => {});
  return work;
}
async function sendCoachSession(userId, snapshot) {
  let draft = snapshot;
  if (snapshot.localOrigin) {
    const { session } = await coachRequest(userId, 'import_session', { id: snapshot.id, ...snapshot.localOrigin });
    if (session.status === 'completed') return { session };
    draft = reconcileCoachSession(session, snapshot);
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await coachRequest(userId, 'save', { id: draft.id, version: draft.version, progress: draft.progress });
    } catch (error) {
      if (error.code !== 'version_conflict' || attempt === 2) throw error;
      const remote = (await coachRequest(userId, 'session', { id: snapshot.id })).session;
      if (remote.status === 'completed') return { session: remote };
      draft = reconcileCoachSession(remote, draft);
    }
  }
}
export async function clearCoachData() {
  await Promise.allSettled([...starts.values(), ...completions.values()]);
  await Promise.allSettled([...nextRequests.values()]);
  await Promise.allSettled([...backgroundSync.values()]);
  await Promise.allSettled([...sessionSaves.values()]);
  await Promise.allSettled([...writes.values()]);
  await Promise.allSettled([...preferenceWrites.values()]);
  await Promise.allSettled([...preferenceSync.values()]);
  hubCache.clear();
  nextSets.clear();
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX) || k.startsWith(PREFERENCES) || k.startsWith(HUB_PREFIX) || k.startsWith(NEXT_PREFIX));
  if (keys.length) await AsyncStorage.multiRemove(keys);
}

export async function resetCoachProgress(userId) {
  if (resettingUsers.has(userId)) throw new Error('Coaching reset is already in progress.');
  resettingUsers.add(userId);
  let accountDeleted = false;
  try {
    // Erase the account first. A failed network request must not discard the
    // only copy of an unfinished assessment stored on this device.
    await coachRequest(userId, 'reset_progress', { confirm: 'DELETE_COACHING_DATA' });
    accountDeleted = true;
    await Promise.allSettled([starts.get(userId), completions.get(userId)]);
    hubCache.delete(userId);
    const prefix = `${PREFIX}${userId}:`;
    await Promise.allSettled([...nextRequests].filter(([key]) => key.startsWith(`${NEXT_PREFIX}${userId}:`)).map(([, pending]) => pending));
    for (const key of nextSets.keys()) if (key.startsWith(`${NEXT_PREFIX}${userId}:`)) nextSets.delete(key);
    await Promise.allSettled([...backgroundSync].filter(([key]) => key.startsWith(prefix)).map(([, pending]) => pending));
    await Promise.allSettled([...sessionSaves].filter(([key]) => key.startsWith(prefix)).map(([, pending]) => pending));
    await Promise.allSettled([...writes].filter(([key]) => key.startsWith(prefix)).map(([, pending]) => pending));
    await Promise.allSettled([...preferenceWrites].filter(([key]) => key === `${PREFERENCES}${userId}`).map(([, pending]) => pending));
    await Promise.allSettled([...preferenceSync].filter(([key]) => key === `${PREFERENCES}${userId}`).map(([, pending]) => pending));
    const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(prefix) || key.startsWith(`${NEXT_PREFIX}${userId}:`) || key === `${PREFERENCES}${userId}` || key === hubKeyFor(userId));
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch (error) {
    if (accountDeleted) {
      const failure = new Error('Your coaching data was deleted from your account, but this device could not clear its saved copy. Reopen Coaching to retry.');
      failure.code = 'local_cleanup_failed';
      throw failure;
    }
    throw error;
  } finally {
    resettingUsers.delete(userId);
  }
}

export function registerCoachSession(userId, id) {
  const key = keyFor(userId, id); activeSessions.add(key);
  return () => activeSessions.delete(key);
}
export async function flushCoachCheckpoints(userId) {
  if (!userId || resettingUsers.has(userId)) return;
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(`${PREFIX}${userId}:`));
  for (const key of keys) {
    if (resettingUsers.has(userId)) return;
    if (activeSessions.has(key) || backgroundSync.has(key)) continue;
    await writes.get(key);
    const raw = await AsyncStorage.getItem(key);
    if (!raw || activeSessions.has(key)) continue;
    const checkpoint = JSON.parse(raw);
    if (!checkpoint.dirty || checkpoint.session.status === 'completed') continue;
    const work = (async () => {
      const s = checkpoint.session;
      try {
        await saveCoachSession(userId, s);
      } catch (error) {
        if (error.code === 'session_not_found') {
          // Keep the device's only copy, including work created while offline.
          return;
        }
        // Keep progress queued for a later background retry.
        if (error.code !== 'version_conflict') throw error;
      }
    })();
    backgroundSync.set(key, work);
    try { await work; } finally { backgroundSync.delete(key); }
  }
}

export async function queueCoachExamDate(examDate) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return;
  await queueCoachPreferences(session.user.id, { examDate });
}
export async function queueCoachPreferences(userId, preferences) {
  const key = `${PREFERENCES}${userId}`;
  const pending = (preferenceWrites.get(key) ?? Promise.resolve()).catch(() => {}).then(async () => {
    let previous = {};
    try { previous = JSON.parse(await AsyncStorage.getItem(key)) ?? {}; } catch { /* Replace damaged draft. */ }
    await AsyncStorage.setItem(key, JSON.stringify({ ...previous, ...preferences }));
  });
  preferenceWrites.set(key, pending);
  try { await pending; } finally { if (preferenceWrites.get(key) === pending) preferenceWrites.delete(key); }
  const cached = await loadCoachHubCache(userId);
  if (cached) {
    const settings = { ...(preferences.examDate !== undefined ? { exam_date: preferences.examDate } : {}),
      ...(preferences.timeMultiplier !== undefined ? { time_multiplier: preferences.timeMultiplier } : {}),
      ...(preferences.planIntroSessionId ? { plan_intro_session_id: preferences.planIntroSessionId } : {}) };
    await saveCoachHubCache(userId, { ...cached, settings: { ...cached.settings, ...settings },
      localSettings: { ...cached.localSettings, ...settings } }, { local: true });
  }
  // The local preference is committed; network sync cannot delay the settings screen.
  void flushCoachPreferences(userId).catch(() => {});
}
export async function flushCoachPreferences(userId) {
  if (!userId) return;
  const key = `${PREFERENCES}${userId}`;
  if (preferenceSync.has(key)) return preferenceSync.get(key);
  const work = (async () => {
    while (true) {
      await preferenceWrites.get(key);
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return;
      const preferences = JSON.parse(raw);
      if (preferences.planIntroSessionId) {
        const baseline = await readCoachSessionCache(userId, preferences.planIntroSessionId);
        if (baseline?.dirty) await saveCoachSession(userId, baseline.session);
        await coachRequest(userId, 'acknowledge_plan', { id: preferences.planIntroSessionId });
      }
      const settings = Object.fromEntries(Object.entries(preferences).filter(([key]) => ['examDate', 'timeMultiplier'].includes(key)));
      if (Object.keys(settings).length) await coachRequest(userId, 'settings', settings);
      // Serialize deletion with new edits so an in-flight sync cannot erase them.
      const clear = (preferenceWrites.get(key) ?? Promise.resolve()).catch(() => {}).then(async () => {
        if (await AsyncStorage.getItem(key) === raw) await AsyncStorage.removeItem(key);
      });
      preferenceWrites.set(key, clear);
      try { await clear; } finally { if (preferenceWrites.get(key) === clear) preferenceWrites.delete(key); }
    }
  })();
  preferenceSync.set(key, work);
  try { await work; } finally { if (preferenceSync.get(key) === work) preferenceSync.delete(key); }
}

export function newCoachRequestId() {
  // UUID v4 idempotency key, not a security token. Works on native Hermes too.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16); return (c === 'x' ? r : (r & 3) | 8).toString(16);
  });
}
