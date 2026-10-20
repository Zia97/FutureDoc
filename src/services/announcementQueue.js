// Platform-independent queue; also exercised by the local student demonstration.
// No cached pending message may display without a fresh server authorization.
export const announcementSafeRoute = (name) => [
  'Home', 'PracticeSections', 'Coaching', 'PerformanceAnalytics', 'Community', 'TimedTestList', 'MainTabs',
  'TimedVRTestReview', 'TimedDMTestReview', 'TimedQRTestReview', 'TimedSJTestReview',
  'VRAnalytics', 'DMAnalytics', 'QRAnalytics', 'SJAnalytics',
].includes(name);

export function createAnnouncementQueue({ userId, storage, rpc, canDisplay, onChange }) {
  const key = `announcement_ack_v1:${userId}`;
  let acknowledgements = {}, current = null, running = false, stopped = false, loaded = false;
  let dismissing = false;
  const emit = () => { if (!stopped) onChange(current); };
  async function load() {
    if (loaded) return;
    acknowledgements = JSON.parse(await storage.getItem(key) || '{}');
    loaded = true;
  }
  async function poll() {
    if (running || stopped) return;
    running = true;
    try {
      await load();
      // Durable per-account acknowledgement outbox. A failure retains the tombstone.
      for (const id of Object.keys(acknowledgements)) {
        if (stopped) return;
        await rpc('acknowledge', id);
        delete acknowledgements[id];
        await storage.setItem(key, JSON.stringify(acknowledgements));
      }
      if (current || stopped) return;
      const pending = await rpc('pending');
      if (stopped || !canDisplay()) return;
      for (const item of pending || []) {
        if (acknowledgements[item.id] || stopped || !canDisplay()) continue;
        const authorized = await rpc('display', item.id);
        // A route change or app backgrounding during the request defers rendering.
        if (stopped || !canDisplay()) return;
        if (authorized) { current = authorized; emit(); return; }
      }
    } finally { running = false; }
  }
  async function dismiss() {
    if (!current || stopped || dismissing) return;
    dismissing = true;
    try {
      await load();
      const id = current.id;
      acknowledgements[id] = true;
      // Persist BEFORE closing: disk failure keeps the popup open for a retry.
      await storage.setItem(key, JSON.stringify(acknowledgements));
      current = null; emit();
      await poll().catch(() => {}); // Offline acknowledgement is already durable.
    } finally { dismissing = false; }
  }
  return { poll, dismiss, stop() { stopped = true; current = null; }, getCurrent: () => current };
}
