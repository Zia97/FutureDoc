// One request at a time. If a ticket is read while a count request is in flight,
// discard that older result and fetch again before updating any badges.
export function createSupportNotificationMonitor({ load, onChange }) {
  let stopped = false;
  let running = null;
  let refreshAgain = false;

  async function drain() {
    do {
      refreshAgain = false;
      try {
        const counts = await load();
        if (!stopped && !refreshAgain) onChange(counts);
      } catch {
        // An offline refresh must not erase an unread indicator.
      }
    } while (!stopped && refreshAgain);
  }

  function refresh() {
    if (stopped) return Promise.resolve();
    refreshAgain = true;
    if (!running) running = drain().finally(() => {
      running = null;
      // Also handle a refresh queued after drain finished but before this
      // finalizer runs (for example, a successful mark-read response).
      if (!stopped && refreshAgain) return refresh();
    });
    return running;
  }

  return { refresh, stop() { stopped = true; } };
}
