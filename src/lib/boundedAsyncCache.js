// Shares in-flight loads and bounds retained data. Failures are never cached.
export function createBoundedAsyncCache({ ttlMs = 60_000, maxEntries = 8, maxBytes = 4_000_000 } = {}) {
  const entries = new Map();
  const flights = new Map();
  let bytes = 0;
  const remove = (key) => { const old = entries.get(key); if (old) bytes -= old.bytes; entries.delete(key); };
  return {
    async get(key, load) {
      const now = Date.now();
      for (const [k, entry] of entries) if (entry.expires <= now) remove(k);
      const hit = entries.get(key);
      if (hit) { entries.delete(key); entries.set(key, hit); return hit.value; }
      if (flights.has(key)) return flights.get(key);
      const work = Promise.resolve().then(load).then((value) => {
        const size = JSON.stringify(value)?.length * 2 || 0;
        if (size <= maxBytes) {
          while (entries.size >= maxEntries || bytes + size > maxBytes) remove(entries.keys().next().value);
          entries.set(key, { value, bytes: size, expires: Date.now() + ttlMs }); bytes += size;
        }
        return value;
      });
      flights.set(key, work);
      try { return await work; } finally { if (flights.get(key) === work) flights.delete(key); }
    },
    clear() { entries.clear(); bytes = 0; },
  };
}
