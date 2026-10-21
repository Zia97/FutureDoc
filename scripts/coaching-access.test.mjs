import test from 'node:test';
import assert from 'node:assert/strict';
import { hasCoachProAccess } from '../src/lib/coaching/access.js';

test('coaching access fails closed for unknown accounts and cached or expired subscriptions', () => {
  const now = Date.parse('2026-10-20T12:00:00Z');
  const subscription = (expirationDate) => ({ isPro: true, customerInfo: {
    entitlements: { active: { 'UCAT Genius AI Pro': { expirationDate } } },
  } });
  assert.equal(hasCoachProAccess(subscription('2026-10-21T12:00:00Z'), now), true);
  assert.equal(hasCoachProAccess(subscription(null), now), true);
  assert.equal(hasCoachProAccess({ isPro: true, adminOverride: true }, now), true);
  for (const state of [undefined, {}, { isPro: true }, { isPro: false },
    { ...subscription(null), loading: true }, { ...subscription(null), isPro: false },
    subscription('2026-10-20T12:00:00Z'), subscription('2026-10-19T12:00:00Z'), subscription('invalid')]) {
    assert.equal(hasCoachProAccess(state, now), false);
  }
});
