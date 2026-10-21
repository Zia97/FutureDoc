import test from 'node:test';
import assert from 'node:assert/strict';
import { createSupportNotificationMonitor } from '../src/services/supportNotificationMonitor.js';

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
const counts = unread => ({ unread, admin_unread: 0, is_admin: false });

test('reading a ticket invalidates an older pending count and updates every subscriber with fresh unread state', async () => {
  const pending = deferred();
  let requests = 0;
  const published = [];
  const monitor = createSupportNotificationMonitor({
    load: () => ++requests === 1 ? pending.promise : Promise.resolve(counts(0)),
    onChange: value => published.push(value),
  });
  const polling = monitor.refresh();
  const afterReading = monitor.refresh();
  const anotherRefresh = monitor.refresh();
  assert.equal(requests, 1, 'count requests do not overlap');
  pending.resolve(counts(1));
  await Promise.all([polling, afterReading, anotherRefresh]);
  assert.equal(requests, 2, 'pending refreshes coalesce into a single follow-up');
  assert.deepEqual(published, [counts(0)], 'a stale unread result cannot restore the red indicator');
});

test('signing out stops pending account results and future requests', async () => {
  const pending = deferred();
  const published = [];
  let requests = 0;
  const monitor = createSupportNotificationMonitor({
    load: () => { requests++; return pending.promise; },
    onChange: value => published.push(value),
  });
  const refresh = monitor.refresh();
  monitor.stop();
  pending.resolve(counts(3));
  await refresh;
  await monitor.refresh();
  assert.deepEqual(published, []);
  assert.equal(requests, 1);
  const nextAccount = createSupportNotificationMonitor({
    load: async () => counts(0), onChange: value => published.push(value),
  });
  await nextAccount.refresh();
  assert.deepEqual(published, [counts(0)]);
});

test('a mark-read refresh arriving as the previous request finishes is not dropped', async () => {
  let requests = 0;
  const published = [];
  const monitor = createSupportNotificationMonitor({
    load: async () => counts(++requests === 1 ? 1 : 0),
    onChange: value => published.push(value),
  });
  const first = monitor.refresh();
  queueMicrotask(() => monitor.refresh());
  await first;
  assert.equal(requests, 2);
  assert.deepEqual(published.at(-1), counts(0));
});

test('an offline refresh preserves unread indicators and a later successful read clears them', async () => {
  const published = [];
  let request = 0;
  const monitor = createSupportNotificationMonitor({
    load: async () => {
      request++;
      if (request === 2) throw new Error('offline');
      return counts(request === 1 ? 2 : 0);
    },
    onChange: value => published.push(value),
  });
  await monitor.refresh();
  await monitor.refresh();
  assert.deepEqual(published, [counts(2)]);
  await monitor.refresh();
  assert.deepEqual(published, [counts(2), counts(0)]);
});
