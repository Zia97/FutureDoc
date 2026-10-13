import test from 'node:test';
import assert from 'node:assert/strict';
import { createPerformanceCache, PERFORMANCE_CACHE_PREFIX, PERFORMANCE_REFRESH_INTERVAL } from '../src/lib/performance/cache.js';

const snapshot = (pro = false, accuracy = 72) => ({ snapshotVersion: 1, reports: Object.fromEntries(['practice', 'timed'].map((mode) => [mode,
  { schemaVersion: 1, mode, access: pro ? 'pro' : 'free', overview: { accuracy }, details: pro ? { skills: [] } : null }])) });
const deferred = () => { let resolve; const promise = new Promise((r) => { resolve = r; }); return { promise, resolve }; };
function harness() {
  let time = 1000000, calls = 0, next = null;
  const records = new Map();
  const storage = { getItem: async (k) => records.get(k) ?? null, setItem: async (k, v) => records.set(k, v),
    removeItem: async (k) => records.delete(k), getAllKeys: async () => [...records.keys()] };
  const factory = () => createPerformanceCache({ storage, now: () => time,
    fetchSnapshot: async ({ includeDetails }) => { calls++; return next ? next(includeDetails) : snapshot(includeDetails); } });
  return { factory, records, calls: () => calls, advance: (n) => { time += n; }, transport: (fn) => { next = fn; } };
}

test('all screens and both modes share one request and reopening never refreshes automatically', async () => {
  const h = harness(), cache = h.factory(), pending = deferred();
  h.transport(() => pending.promise);
  const visits = Array.from({ length: 5 }, () => cache.ensure('alice', true));
  await new Promise(setImmediate);
  assert.equal(h.calls(), 1);
  pending.resolve(snapshot(true));
  await Promise.all(visits);
  h.advance(24 * 60 * 60 * 1000);
  await cache.ensure('alice', true);
  assert.equal(h.calls(), 1);
  assert.equal(cache.getState('alice').snapshot.reports.timed.access, 'pro');
});

test('manual refresh cooldown is shared, survives restart and permits exactly one refresh at five minutes', async () => {
  const h = harness(); let cache = h.factory();
  await cache.ensure('alice', false);
  await Promise.all(Array.from({ length: 15 }, () => cache.refresh('alice', false)));
  assert.equal(h.calls(), 1);
  cache = h.factory();
  await cache.ensure('alice', false);
  h.advance(PERFORMANCE_REFRESH_INTERVAL - 1);
  await cache.refresh('alice', false);
  assert.equal(h.calls(), 1);
  h.advance(1);
  const pending = deferred(); h.transport(() => pending.promise);
  const requests = Array.from({ length: 10 }, () => cache.refresh('alice', false));
  await new Promise(setImmediate);
  assert.equal(h.calls(), 2);
  pending.resolve(snapshot(false, 81)); await Promise.all(requests);
  assert.equal(cache.getState('alice').snapshot.reports.practice.overview.accuracy, 81);
  assert.equal(cache.getState('alice').snapshot.reports.timed.overview.accuracy, 81);
});

test('Pro upgrades fetch paid details immediately and downgrades remove them without a request', async () => {
  const h = harness(), cache = h.factory();
  await cache.ensure('alice', false);
  await cache.ensure('alice', true);
  assert.equal(h.calls(), 2);
  assert.equal(cache.getState('alice').snapshot.reports.practice.access, 'pro');
  await cache.ensure('alice', false);
  assert.equal(h.calls(), 2);
  assert.equal(cache.getState('alice').snapshot.reports.practice.details, null);
  const restarted = h.factory(); await restarted.ensure('alice', false);
  assert.equal(restarted.getState('alice').snapshot.reports.timed.details, null);
});

test('a downgrade during a paid refresh cannot restore paid data', async () => {
  const h = harness(), cache = h.factory();
  await cache.ensure('alice', true);
  h.advance(PERFORMANCE_REFRESH_INTERVAL);
  const pending = deferred(); h.transport(() => pending.promise);
  const refresh = cache.refresh('alice', true); await new Promise(setImmediate);
  await cache.ensure('alice', false);
  pending.resolve(snapshot(true, 99)); await refresh;
  assert.equal(cache.getState('alice').snapshot.reports.practice.details, null);
  assert.equal(cache.getState('alice').snapshot.reports.practice.overview.accuracy, 72);
});

test('an upgrade during a free fetch waits and then fetches the verified paid snapshot', async () => {
  const h = harness(), cache = h.factory(), pending = deferred();
  h.transport((pro) => pro ? snapshot(true) : pending.promise);
  const free = cache.ensure('alice', false); await new Promise(setImmediate);
  const upgrade = cache.ensure('alice', true);
  pending.resolve(snapshot(false)); await Promise.all([free, upgrade]);
  assert.equal(h.calls(), 2);
  assert.equal(cache.getState('alice').snapshot.reports.practice.access, 'pro');
});

test('cached results work offline and a failed refresh preserves results and its cooldown', async () => {
  const h = harness(), cache = h.factory();
  await cache.ensure('alice', true);
  h.advance(PERFORMANCE_REFRESH_INTERVAL);
  h.transport(() => { throw new Error('offline'); });
  await cache.refresh('alice', true);
  assert.equal(cache.getState('alice').snapshot.reports.practice.overview.accuracy, 72);
  assert.equal(cache.getState('alice').error, null);
  await cache.refresh('alice', true);
  assert.equal(h.calls(), 2);
  const restarted = h.factory(); await restarted.ensure('alice', true);
  await restarted.refresh('alice', true);
  assert.equal(h.calls(), 2);
});

test('initial failures can be retried manually without automatic retries on screen visits', async () => {
  const h = harness(), cache = h.factory();
  h.transport(() => { throw new Error('offline'); });
  await cache.ensure('alice', false); await cache.ensure('alice', false);
  assert.equal(cache.getState('alice').error, 'offline');
  assert.equal(h.calls(), 1);
  h.transport(() => snapshot()); await cache.refresh('alice', false);
  assert.equal(cache.getState('alice').error, null);
  assert.equal(h.calls(), 2);
});

test('accounts are isolated and malformed or foreign cached payloads cannot be loaded', async () => {
  const h = harness(), cache = h.factory();
  await cache.ensure('alice', true);
  assert.equal(cache.getState('bob').snapshot, null);
  h.records.set(PERFORMANCE_CACHE_PREFIX + 'bob', h.records.get(PERFORMANCE_CACHE_PREFIX + 'alice'));
  await cache.ensure('bob', false);
  assert.equal(cache.getState('bob').snapshot.reports.practice.access, 'free');
  h.records.set(PERFORMANCE_CACHE_PREFIX + 'charlie', 'broken JSON');
  await cache.ensure('charlie', false);
  assert.equal(h.calls(), 3);
});

test('logout removes saved reports and a late network response cannot recreate them', async () => {
  const h = harness(), cache = h.factory();
  await cache.ensure('alice', true);
  h.advance(PERFORMANCE_REFRESH_INTERVAL);
  const pending = deferred(); h.transport(() => pending.promise);
  const request = cache.refresh('alice', true); await new Promise(setImmediate);
  await cache.clearAll(); pending.resolve(snapshot(true)); await request;
  assert.equal(cache.getState('alice').snapshot, null);
  assert.equal(h.records.size, 0);
});

test('subscribers on different screens see refreshed data without their own fetch', async () => {
  const h = harness(), cache = h.factory(); let first = 0, second = 0;
  const off = cache.subscribe('alice', () => { first++; });
  cache.subscribe('alice', () => { second++; });
  await cache.ensure('alice', false);
  assert.ok(first > 0); assert.equal(first, second); off();
  h.advance(PERFORMANCE_REFRESH_INTERVAL); await cache.refresh('alice', false);
  assert.ok(second > first); assert.equal(h.calls(), 2);
});

test('completed drills leave the fresh selections without fetching or changing cached accuracy', async () => {
  const h = harness(), cache = h.factory();
  const value = snapshot(true);
  for (const report of Object.values(value.reports)) report.details.skills = [{ section: 'qr', newQuestionIds: ['q1', 'q2', 'q3'] }];
  h.transport(() => value);
  await cache.ensure('alice', true);
  await cache.completePractice('alice', 'qr', ['q1', 'q2']);
  assert.deepEqual(cache.getState('alice').snapshot.reports.practice.details.skills[0].newQuestionIds, ['q3']);
  assert.deepEqual(cache.getState('alice').snapshot.reports.timed.details.skills[0].newQuestionIds, ['q3']);
  assert.equal(cache.getState('alice').snapshot.reports.practice.overview.accuracy, 72);
  const restarted = h.factory(); await restarted.ensure('alice', true);
  assert.deepEqual(restarted.getState('alice').snapshot.reports.practice.details.skills[0].newQuestionIds, ['q3']);
  assert.equal(h.calls(), 1);
});
