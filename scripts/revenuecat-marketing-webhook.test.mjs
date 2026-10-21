import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { premiumProfile, revenueCatSubscriber, PRO_ENTITLEMENT } from '../supabase/functions/_shared/revenuecat-pro.js';

function fixture({ paid = true, outage = false } = {}) {
  let handler;
  const updates = [];
  const request = async () => {
    if (outage) return new Response('{}', { status: 503 });
    return new Response(JSON.stringify({ subscriber: { entitlements: paid ? { [PRO_ENTITLEMENT]: { expires_date: '2099-01-01T00:00:00Z', product_identifier: 'paid-subscription' } } : {} } }));
  };
  const source = ts.transpileModule(fs.readFileSync('supabase/functions/revenuecat-webhook/index.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { exports: {}, Response, console, Deno: { serve: (fn) => { handler = fn; },
    env: { get: (key) => key === 'REVENUECAT_WEBHOOK_AUTH' ? 'test-hook' : key === 'REVENUECAT_SECRET_KEY' ? 'test-secret' : 'test-value' } },
    require(path) {
      if (path.includes('revenuecat-pro')) return { premiumProfile, revenueCatSubscriber: (id, secret) => revenueCatSubscriber(id, secret, request) };
      return { createClient: () => ({ from: () => ({ update(value) { updates.push(value); return this; }, eq() { return this; }, select: async () => ({ data: [{ user_id: 'tester' }] }) }) }) };
    },
  });
  return { updates, run: (type) => handler(new Request('https://example.test', { method: 'POST', headers: { Authorization: 'test-hook' }, body: JSON.stringify({ event: {
    type, app_user_id: '00000000-0000-4000-8000-000000000002', expiration_at_ms: 1,
  } }) })) };
}
test('an expired promotional grant cannot revoke paid Pro and stale purchase events cannot restore revoked Pro', async () => {
  const paid = fixture(); assert.equal((await paid.run('EXPIRATION')).status, 200);
  assert.equal(paid.updates[0].is_premium, true);
  assert.equal(paid.updates[0].premium_product_id, 'paid-subscription');
  const revoked = fixture({ paid: false }); assert.equal((await revoked.run('NON_RENEWING_PURCHASE')).status, 200);
  assert.equal(revoked.updates[0].is_premium, false);
});
test('an entitlement verification outage leaves the existing mirror intact and asks RevenueCat to retry', async () => {
  const f = fixture({ outage: true }); assert.equal((await f.run('EXPIRATION')).status, 503);
  assert.equal(f.updates.length, 0);
});
