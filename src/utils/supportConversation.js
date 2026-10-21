// Keep an inverted list contiguous if more than one page arrives between polls.
// Dropping the old window in that case lets "Earlier messages" fetch the gap.
export function mergeSupportMessages(existing, incoming, mode) {
  const sorted = [...incoming].sort((a, b) => Number(b.id) - Number(a.id));
  const newestExisting = existing[0]?.id;
  const oldestIncoming = sorted.at(-1)?.id;
  const keep = mode === 'older' || (existing.length > 0 &&
    (sorted.length === 0 || Number(oldestIncoming) <= Number(newestExisting)));
  const byId = new Map((keep ? existing : []).map(m => [String(m.id), m]));
  for (const message of sorted) byId.set(String(message.id), message);
  return { messages: [...byId.values()].sort((a, b) => Number(b.id) - Number(a.id)), keptHistory: keep };
}
