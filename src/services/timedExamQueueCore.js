// Storage changes are serial; network requests never hold the storage lock.
export function createTimedExamQueue({ read, write, execute, isValid = () => true, onError = () => {}, onDrop = () => {} }) {
  let mutations = Promise.resolve();
  let activeFlush = null;
  let sequence = 0;
  const key = (entry) => `${entry.userId}|${entry.section}|${entry.testKey}`;
  const identity = (entry) => entry.queueId ?? JSON.stringify(entry);
  function mutate(fn) {
    const operation = mutations.then(async () => fn(await read()));
    mutations = operation.catch(() => {});
    return operation;
  }
  async function enqueue(entry) {
    const saved = { ...entry, queueId: `${Date.now()}-${++sequence}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString() };
    await mutate((entries) => write([...entries.filter((e) => key(e) !== key(saved)), saved]));
  }
  async function removePending(entry) {
    await mutate((entries) => write(entries.filter((e) => key(e) !== key(entry))));
  }
  async function pendingKeys(userId, section) {
    return mutate((entries) => new Set(entries.filter((e) => e.userId === userId && e.section === section).map((e) => String(e.testKey))));
  }
  async function drain(user) {
    let flushed = 0;
    let dropped = 0;
    for (;;) {
      const entry = await mutate((entries) => entries.find((e) => e.userId === user.id));
      if (!entry) return { flushed, remaining: 0, dropped };
      try {
        if (isValid(entry)) { await execute(entry); flushed++; }
        else { onDrop(entry); dropped++; }
        // A retake added during upload must not be removed with the old entry.
        await mutate((entries) => write(entries.filter((e) => identity(e) !== identity(entry))));
      } catch (error) {
        onError(error);
        const remaining = await mutate((entries) => entries.filter((e) => e.userId === user.id).length);
        return { flushed, remaining, dropped };
      }
    }
  }
  async function flush(user) {
    if (!user) return { flushed: 0, remaining: 0, dropped: 0 };
    if (activeFlush) { await activeFlush; return flush(user); }
    activeFlush = drain(user);
    try { return await activeFlush; }
    finally { activeFlush = null; }
  }
  return { enqueue, removePending, pendingKeys, flush };
}
