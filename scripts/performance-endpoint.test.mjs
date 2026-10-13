import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as engine from '../src/lib/performance/engine.js';
import * as access from '../src/lib/performance/access.js';
import * as pagination from '../src/lib/performance/pagination.js';

const source = ts.transpileModule(fs.readFileSync('supabase/functions/performance-analysis/index.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

// Exercise the actual edge handler with an in-memory PostgREST adapter. These
// tests make no network requests and never use real accounts or credentials.
function endpoint({ premium = false, secret = null, subscriber = {}, revenueCatStatus = 200 } = {}) {
  let handler;
  const queries = [], revenueCatRequests = [];
  const records = {
    performance_skills: [{ id: 'qr.ratios', section: 'qr', metadata: { label: 'Ratios' } }],
    performance_question_tags: ['practice', 'timed'].map((mode) => ({ id: `qr:${mode}:q1`, section: 'qr', mode, question_id: 'q1',
      metadata: { primarySkillId: 'qr.ratios', parentId: 'set1', answer: 'A', confidence: 'high', difficulty: 'normal' } })),
    practice_question_attempts: [
      { id: 'a1', user_id: 'alice', section: 'qr', question_id: 'q1', selected_answer: 'A', answered_at: '2026-01-01T12:00:00Z' },
      { id: 'b1', user_id: 'bob', section: 'qr', question_id: 'q1', selected_answer: 'B', answered_at: '2026-01-01T12:00:00Z' },
    ],
    timed_quantitative_reasoning_exam_attempts: [
      { id: 'e1', user_id: 'alice', test_id: 't1', submitted_at: '2026-01-01T12:00:00Z' },
      { id: 'e2', user_id: 'bob', test_id: 't1', submitted_at: '2026-01-01T12:00:00Z' },
    ],
    timed_quantitative_reasoning_question_answers: [
      { id: 'ta1', user_id: 'alice', exam_attempt_id: 'e1', question_id: 'q1', selected_answer: 'A' },
      { id: 'ta2', user_id: 'bob', exam_attempt_id: 'e2', question_id: 'q1', selected_answer: 'B' },
    ],
    user_profiles: ['alice', 'bob'].map((user_id) => ({ user_id, is_admin: false, is_premium: premium, premium_expires_at: null })),
  };
  const client = {
    auth: { getUser: async (token) => ({ data: { user: ['alice', 'bob'].includes(token) ? { id: token } : null }, error: null }) },
    from(table) {
      const query = { table, filters: [], limit: Infinity, single: false }; queries.push(query);
      const builder = {
        select() { return this; },
        eq(key, value) { query.filters.push({ op: 'eq', key, value }); return this; },
        lte(key, value) { query.filters.push({ op: 'lte', key, value }); return this; },
        gt(key, value) { query.filters.push({ op: 'gt', key, value }); return this; },
        order() { return this; },
        limit(value) { query.limit = value; return this; },
        single() { query.single = true; return this; },
        then(resolve, reject) {
          let rows = [...(records[table] ?? [])];
          for (const { op, key, value } of query.filters) rows = rows.filter((r) => op === 'eq' ? r[key] === value : op === 'gt' ? r[key] > value : r[key] <= value);
          rows.sort((a, b) => String(a.id).localeCompare(String(b.id)));
          rows = rows.slice(0, query.limit);
          return Promise.resolve({ data: query.single ? rows[0] : rows, error: null }).then(resolve, reject);
        },
      };
      return builder;
    },
  };
  vm.runInNewContext(source, {
    exports: {}, Response, AbortSignal, console: { error() {} },
    require(specifier) {
      if (specifier.startsWith('https://esm.sh/')) return { createClient: () => client };
      if (specifier.endsWith('engine.js')) return engine;
      if (specifier.endsWith('access.js')) return access;
      if (specifier.endsWith('pagination.js')) return pagination;
      throw new Error(`Unexpected import: ${specifier}`);
    },
    Deno: { env: { get: (name) => name === 'REVENUECAT_SECRET_KEY' ? secret : 'test-only' }, serve: (fn) => { handler = fn; } },
    fetch: async (url) => { revenueCatRequests.push(url); return new Response(JSON.stringify({ subscriber }), { status: revenueCatStatus }); },
  });
  return {
    queries, revenueCatRequests,
    request: ({ token = 'alice', body = { mode: 'practice', includeDetails: false }, raw, method = 'POST' } = {}) => handler(new Request('https://test.invalid/performance-analysis', {
      method, headers: token ? { Authorization: `Bearer ${token}` } : {},
      ...(method === 'POST' ? { body: raw ?? JSON.stringify(body) } : {}),
    })),
  };
}

test('edge handler authenticates and validates requests before reading student data', async () => {
  const api = endpoint();
  assert.equal((await api.request({ token: null })).status, 401);
  assert.equal((await api.request({ token: 'forged' })).status, 401);
  assert.equal((await api.request({ method: 'GET' })).status, 405);
  assert.equal((await api.request({ method: 'OPTIONS' })).status, 200);
  assert.equal((await api.request({ raw: '{' })).status, 400);
  assert.equal((await api.request({ raw: 'x'.repeat(1025) })).status, 413);
  assert.equal((await api.request({ body: { mode: 'anything' } })).status, 400);
  assert.equal(api.queries.length, 0);
});

test('free reports omit paid details even when the caller forges Pro and another user ID', async () => {
  const api = endpoint();
  const response = await api.request({ body: { mode: 'practice', includeDetails: true, isPro: true, userId: 'bob' } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const report = await response.json();
  assert.equal(report.access, 'free');
  assert.equal(report.details, null);
  assert.equal(report.overview.questions, 1);
  assert.equal(report.overview.accuracy, 100);
  for (const query of api.queries.filter((q) => !q.table.startsWith('performance_'))) {
    assert.ok(query.filters.some((f) => f.op === 'eq' && f.key === 'user_id' && f.value === 'alice'), query.table);
  }
});

test('catalogue caching never mixes student reports, including timed answers', async () => {
  const api = endpoint({ premium: true });
  const alice = await (await api.request({ body: { mode: 'timed', includeDetails: true } })).json();
  const bob = await (await api.request({ token: 'bob', body: { mode: 'timed', includeDetails: true } })).json();
  assert.equal(alice.access, 'pro');
  assert.equal(alice.overview.accuracy, 100);
  assert.equal(bob.overview.accuracy, 0);
  assert.equal(alice.details.skills[0].timed.questions, 1);
  assert.equal(bob.details.skills[0].timed.questions, 1);
  assert.equal(api.queries.filter((q) => q.table === 'performance_question_tags').length, 1);
  assert.ok(!JSON.stringify(alice).includes('"answer":'));
});

test('RevenueCat verifies a new purchase and overrides stale profile access', async () => {
  const paid = endpoint({ secret: 'test-only', subscriber: { entitlements: { 'UCAT Genius AI Pro': { expires_date: null } } } });
  assert.equal((await (await paid.request({ body: { mode: 'practice', includeDetails: true } })).json()).access, 'pro');
  assert.ok(paid.revenueCatRequests[0].endsWith('/alice'));
  const expired = endpoint({ premium: true, secret: 'test-only', subscriber: { entitlements: { 'UCAT Genius AI Pro': { expires_date: '2020-01-01T00:00:00Z' } } } });
  assert.equal((await (await expired.request({ body: { mode: 'practice', includeDetails: true } })).json()).access, 'free');
  const unavailable = endpoint({ premium: true, secret: 'test-only', revenueCatStatus: 503 });
  assert.equal((await unavailable.request({ body: { mode: 'practice', includeDetails: true } })).status, 503);
  // Basic analysis remains available without a RevenueCat round trip.
  assert.equal((await unavailable.request()).status, 200);
});
