// This preference is device-only. Sample reports never enter a user-data cache.
export function createMarketingDemoStore({ storage, available }) {
  const key = 'dev_marketing_demo';
  let enabled = false;
  let revision = 0;
  let hydration;
  let writes = Promise.resolve();
  const listeners = new Set();
  let scope = null;
  const storageKey = () => scope ? `${key}:${scope}` : key;
  const emit = () => listeners.forEach((listener) => listener());
  return {
    getSnapshot: () => available && enabled,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    setAccess(next) {
      if (scope === next.scope && available === next.available) return;
      scope = next.scope;
      available = next.available;
      revision++;
      enabled = false;
      hydration = null;
      emit();
    },
    hydrate() {
      if (!available) return Promise.resolve();
      if (!hydration) {
        const started = revision;
        hydration = storage.getItem(storageKey()).then((value) => {
          if (revision === started) { enabled = value === 'true'; emit(); }
        }).catch(() => {});
      }
      return hydration;
    },
    setEnabled(value) {
      if (!available) return Promise.resolve();
      revision++;
      enabled = !!value;
      emit();
      // Serialize rapid toggles so an older disk write cannot win.
      const saved = String(enabled);
      const targetKey = storageKey();
      writes = writes.catch(() => {}).then(() => storage.setItem(targetKey, saved));
      return writes;
    },
  };
}
