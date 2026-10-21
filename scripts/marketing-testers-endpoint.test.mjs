import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../supabase/functions/marketing-testers/handler.js';
import { premiumProfile, PRO_ENTITLEMENT } from '../supabase/functions/_shared/revenuecat-pro.js';

const NOW = Date.parse('2026-10-21T12:00:00Z');
const input = (action, extra = {}, token = 'valid') => new Request('https://example.test', { method: 'POST',
  headers: token ? { Authorization: `Bearer ${token}` } : {}, body: JSON.stringify({ action, email: 'tester@example.test', ...extra }) });

function fixture({ admin = true, rcOk = true, paid = false, configured = true, rpcOk = true } = {}) {
  const calls = [], network = [];
  const target = { user_id: 'tester', email: 'tester@example.test', display_name: 'Tester', is_admin: false,
    is_premium: false, premium_expires_at: null, marketing_tester_expires_at: null };
  let subscriber = { entitlements: {} };
  const client = {
    auth: { getUser: async (token) => ({ data: { user: token === 'valid' ? { id: 'admin' } : null } }) },
    from(table) {
      const query = { table, filters: [] }; calls.push(query);
      const builder = {
        select(columns) { query.columns = columns; return this; },
        update(values) { query.update = values; return this; },
        eq(key, value) { query.filters.push([key, value]); return this; },
        async maybeSingle() { return { data: query.columns === 'is_admin' ? { is_admin: admin } : target }; },
        then(resolve) { Object.assign(target, query.update); return Promise.resolve({ error: null }).then(resolve); },
      };
      return builder;
    },
    async rpc(name, args) {
      calls.push({ name, args });
      if (!rpcOk) return { error: Error('database down') };
      target.marketing_tester_expires_at = args.p_until;
      return { error: null };
    },
  };
  const request = async (url, options) => {
    network.push({ url, options });
    if (!rcOk) return new Response('{}', { status: 503 });
    if (url.endsWith('/promotional')) subscriber = { entitlements: { [PRO_ENTITLEMENT]: { expires_date: new Date(JSON.parse(options.body).end_time_ms).toISOString(), product_identifier: 'rc_promo' } } };
    if (url.endsWith('/revoke_promotionals')) subscriber = { entitlements: paid ? { [PRO_ENTITLEMENT]: { expires_date: new Date(NOW + 150 * 86400000).toISOString(), product_identifier: 'paid-yearly' } } : {} };
    return new Response(JSON.stringify({ subscriber }), { status: 200 });
  };
  return { target, calls, network, handler: createHandler({ client, revenueCatSecret: configured ? 'test-only-secret' : null, request, now: () => NOW }) };
}

test('missing and forged sessions and all non-admin flags fail before any grant or private lookup', async () => {
  for (const action of ['lookup', 'grant', 'revoke']) {
    for (const token of [null, 'forged']) {
      const f = fixture(); assert.equal((await f.handler(input(action, {}, token))).status, 401);
      assert.equal(f.calls.length, 0); assert.equal(f.network.length, 0);
    }
    for (const admin of [false, null, 'true', 1]) {
      const f = fixture({ admin }); assert.equal((await f.handler(input(action, { is_admin: true, actor: 'admin' }))).status, 403);
      assert.equal(f.calls.length, 1); assert.equal(f.network.length, 0);
    }
  }
});

test('grant verifies complimentary Pro, sets only the separate tester permission and never promotes an admin', async () => {
  const f = fixture();
  const response = await f.handler(input('grant', { days: 90, actor: 'forged-actor', is_admin: true }));
  assert.equal(response.status, 200);
  const user = (await response.json()).user;
  assert.equal(user.testerExpiresAt, new Date(NOW + 90 * 86400000).toISOString());
  assert.equal(user.isPro, true); assert.equal(f.target.is_admin, false);
  assert.equal(f.calls.find((call) => call.name).args.p_actor, 'admin');
  assert.equal(f.network[0].options.method, 'POST');
  assert.equal(JSON.parse(f.network[0].options.body).end_time_ms, NOW + 90 * 86400000);
  assert.ok(f.calls.filter((call) => call.update).every((call) => !('is_admin' in call.update) && !('trial_claimed_at' in call.update)));
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('input bounds, existing admin targets and missing server secrets cannot grant access', async () => {
  for (const days of [0, -1, 366, 1.5, '90']) {
    const f = fixture(); assert.equal((await f.handler(input('grant', { days }))).status, 400);
    assert.equal(f.network.length, 0);
  }
  const f = fixture(); f.target.is_admin = true;
  assert.equal((await f.handler(input('grant'))).status, 400);
  assert.equal(f.network.length, 0);
  assert.equal((await fixture({ configured: false }).handler(input('grant'))).status, 503);
});

test('a failed RevenueCat grant never enables tester tools; a later database failure is reported as partial', async () => {
  const f = fixture({ rcOk: false });
  assert.equal((await f.handler(input('grant'))).status, 502);
  assert.equal(f.target.marketing_tester_expires_at, null);
  assert.equal(f.calls.filter((call) => call.name).length, 0);
  const partial = fixture({ rpcOk: false });
  const response = await partial.handler(input('grant'));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, 'access_update_failed');
});

test('revocation disables marketing tools and revokes promotions while preserving a paid entitlement', async () => {
  for (const paid of [false, true]) {
    const f = fixture({ paid }); f.target.marketing_tester_expires_at = new Date(NOW + 86400000).toISOString();
    assert.equal((await f.handler(input('revoke'))).status, 400);
    const response = await f.handler(input('revoke', { confirmRevoke: true }));
    assert.equal(response.status, 200);
    assert.equal(f.target.marketing_tester_expires_at, null);
    assert.equal(f.target.is_premium, paid);
    assert.equal(f.target.is_admin, false);
    assert.ok(f.network[0].url.endsWith('/revoke_promotionals'));
    assert.equal((await response.json()).user.isPro, paid);
  }
});

test('failed promotional revocation still removes demo permission and can be retried', async () => {
  const f = fixture({ rcOk: false }); f.target.marketing_tester_expires_at = new Date(NOW + 86400000).toISOString();
  assert.equal((await f.handler(input('revoke', { confirmRevoke: true }))).status, 502);
  assert.equal(f.target.marketing_tester_expires_at, null);
});

test('premium mirroring uses the current combined entitlement instead of a stale or expired promotion', () => {
  assert.equal(premiumProfile({ entitlements: {} }, NOW).is_premium, false);
  assert.equal(premiumProfile({ entitlements: { [PRO_ENTITLEMENT]: { expires_date: new Date(NOW - 1).toISOString() } } }, NOW).is_premium, false);
  assert.equal(premiumProfile({ entitlements: { [PRO_ENTITLEMENT]: { expires_date: null } } }, NOW).is_premium, true);
});
