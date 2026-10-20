import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as engine from '../src/lib/coaching/engine.js';
import * as access from '../src/lib/performance/access.js';
import * as pagination from '../src/lib/performance/pagination.js';

const alice = '00000000-0000-4000-8000-000000000001', bob = '00000000-0000-4000-8000-000000000002';
const id = '00000000-0000-4000-8000-000000000003';
const source = ts.transpileModule(fs.readFileSync('supabase/functions/ai-coach/index.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function fixture({ premium = false, completed = false, chatAllowed = false } = {}) {
  const tag = { id: 'q1', section: 'vr', mode: 'practice', parentId: 'p1', confidence: 'high', primarySkillId: 'vr.test', answer: 'A', difficulty: 'normal' };
  const catalogue = { skills: [{ id: 'vr.test', label: 'Finding evidence', section: 'vr' }], questions: [tag] };
  const s = { id, user_id: alice, title: 'Test', status: completed ? 'completed' : 'active', kind: 'assessment', version: 0,
    questions: [{ id: 'q1', section: 'vr', choices: [{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }], tag, explanation: 'SECRET ANSWER REASON' }],
    budgets: { vr: 60 }, progress: engine.initialProgress(), report: completed ? { sections: [] } : null };
  const records = {
    user_profiles: [alice, bob].map((user_id) => ({ user_id, is_premium: premium })),
    coach_profiles: [alice, bob].map((user_id) => ({ user_id, baseline_session_id: completed ? id : null, exam_date: null, time_multiplier: 1, preview_session_id: null, free_chat_used: 0, chat_day_used: 0 })),
    coach_sessions: [s], coach_evidence: [], coach_messages: [], coach_plans: [], coach_milestones: [],
  };
  const queries = [], rpcs = [], sharedReads = [], modelRequests = [];
  const client = {
    auth: { getUser: async (token) => ({ data: { user: token === 'alice' ? { id: alice } : token === 'bob' ? { id: bob } : null }, error: null }) },
    from(table) {
      const q = { table, filters: [], single: false, limit: Infinity, offset: 0 }; queries.push(q);
      const builder = {
        select(_columns, options) { q.head = options?.head; return this; },
        eq(k, v) { q.filters.push([k, v]); return this; },
        gt(k, v) { q.after = [k, v]; return this; }, order() { return this; },
        limit(n) { q.limit = n; return this; }, range(a, b) { q.offset = a; q.limit = b - a + 1; return this; },
        maybeSingle() { q.single = true; return this; }, single() { q.single = true; return this; },
        upsert(value, options) { q.upsert = value; q.ignore = options?.ignoreDuplicates; return this; },
        update(value) { q.update = value; return this; },
        then(resolve, reject) {
          let rows = (records[table] ?? []).filter((r) => q.filters.every(([k, v]) => r[k] === v) && (!q.after || r[q.after[0]] > q.after[1]));
          if (q.upsert && !q.ignore) records[table].push(q.upsert);
          if (q.update) rows.forEach((r) => Object.assign(r, q.update));
          const count = rows.length; rows = rows.slice(q.offset, q.offset + q.limit);
          return Promise.resolve({ data: q.head ? null : q.single ? rows[0] ?? null : rows, count, error: null }).then(resolve, reject);
        },
      }; return builder;
    },
    async rpc(name, args) {
      rpcs.push({ name, args });
      if (name === 'coach_reset_progress') {
        const profile = records.coach_profiles.find((row) => row.user_id === args.p_user);
        profile.free_chat_used += records.coach_messages.filter((row) => row.user_id === args.p_user && row.status === 'completed' && row.free_credit_used).length;
        profile.chat_day_used += records.coach_messages.filter((row) => row.user_id === args.p_user).length;
        Object.assign(profile, { baseline_session_id: null, preview_session_id: profile.preview_session_id ? 'reset-preview-used' : null, exam_date: null, time_multiplier: 1 });
        for (const table of ['coach_sessions', 'coach_evidence', 'coach_messages', 'coach_plans', 'coach_milestones']) {
          records[table] = records[table].filter((row) => row.user_id !== args.p_user);
        }
        return { data: null, error: null };
      }
      if (name === 'coach_save_session') {
        Object.assign(s, { progress: args.p_progress, report: args.p_report, version: s.version + 1, status: args.p_report ? 'completed' : 'active' });
        return { data: s, error: null };
      }
      if (name === 'coach_reserve_message') {
        if (!chatAllowed) return { data: null, error: { message: 'daily_limit' } };
        const message = { id, user_id: args.p_user, request_id: args.p_request, status: 'pending', user_text: args.p_text, created_at: new Date().toISOString() };
        records.coach_messages.push(message);
        return { data: { reserved: true, message }, error: null };
      }
      if (name === 'coach_complete_message') {
        const message = records.coach_messages.find((row) => row.user_id === args.p_user && row.request_id === args.p_request);
        Object.assign(message, { status: 'completed', assistant_text: args.p_assistant, free_credit_used: args.p_free_credit_used });
        return { data: message, error: null };
      }
      throw new Error(`Unexpected RPC ${name}`);
    },
  };
  const exports = {};
  vm.runInNewContext(source, { exports, Response, AbortSignal, console: { error() {} }, Deno: { env: { get: () => undefined }, serve() {} },
    require(specifier) {
      if (specifier.startsWith('https://')) return { createClient: () => client };
      if (specifier.endsWith('engine.js')) return engine;
      if (specifier.endsWith('access.js')) return access;
      if (specifier.endsWith('pagination.js')) return pagination;
      if (specifier.endsWith('coaching-data.ts')) return { readEvidence: async (db, userId) => (await pagination.readAllPages(() => db.from('coach_evidence').select('id,payload').eq('user_id', userId))).map((r) => r.payload) };
      if (specifier.endsWith('learner-memory.ts')) return {
        readSharedLearningContext: async (_db, userId) => { sharedReads.push({ kind: 'context', userId }); return { supportSummary: { totalRequests: 4, classification: 'help_requests_not_performance' } }; },
        readLearningHistory: async (_db, userId, args) => { sharedReads.push({ kind: 'history', userId, args }); return { conversations: [{ source: 'tutor', assistant_text: 'Use the negation test.' }] }; },
      };
      if (specifier.endsWith('content.ts')) return { readCatalogue: async () => catalogue };
      if (specifier.endsWith('agent.ts')) return { coachReply: async (request) => {
        if (!chatAllowed) throw new Error('Model should not be called');
        modelRequests.push(request);
        await request.retrieve('get_learning_history', { source: 'tutor', user_id: bob, query: 'negation', offset: 0 });
        return { content: 'We can revisit the negation test in your next set.', used: ['get_profile', 'get_learning_history'] };
      } };
      throw new Error(specifier);
    },
  });
  return { records, rpcs, queries, sharedReads, modelRequests, s, request: (body, token = 'alice', method = 'POST') => exports.handleCoach(new Request('https://example.test/ai-coach', {
    method, headers: token ? { Authorization: `Bearer ${token}` } : {}, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
  }), client) };
}
test('endpoint authenticates, validates and scopes every session to its owner', async () => {
  const f = fixture();
  assert.equal((await f.request({}, null)).status, 401); assert.equal((await f.request({}, 'forged')).status, 401);
  assert.equal((await f.request(null)).status, 400); assert.equal((await f.request([])).status, 400);
  assert.equal((await f.request({}, 'alice', 'GET')).status, 405);
  assert.equal((await f.request({ action: 'session', id }, 'bob')).status, 404);
  const response = await (await f.request({ action: 'session', id })).json();
  assert.equal(response.session.id, id); assert.ok(!JSON.stringify(response).includes('SECRET')); assert.ok(!('tag' in response.session.questions[0]));
});
test('a client cannot skip assessment, bypass server entitlement or forge a result', async () => {
  const f = fixture();
  assert.equal((await f.request({ action: 'start', kind: 'practice', isPro: true })).status, 409);
  assert.equal((await f.request({ action: 'chat', text: 'Hello', requestId: id, isPro: true })).status, 409);
  const progress = { ...engine.initialProgress(), phase: 'finished', closedSections: ['vr'], answers: { q1: 'B' } };
  const result = await (await f.request({ action: 'save', id, version: 0, progress, report: { earned: 100 } })).json();
  assert.equal(result.session.report.sections[0].earned, 0);
  assert.ok(JSON.stringify(result).includes('SECRET ANSWER REASON'));
  assert.equal(f.rpcs[0].args.p_user, alice);
  assert.equal(f.rpcs[0].args.p_evidence[0].earned, 0);
  const paid = fixture({ completed: true }); paid.records.coach_profiles[0].preview_session_id = 'used';
  assert.equal((await paid.request({ action: 'start', kind: 'practice', isPro: true })).status, 402);
});
test('save conflicts and invalid answers never reach the mutation RPC', async () => {
  const f = fixture();
  assert.equal((await f.request({ action: 'save', id, version: 100, progress: {} })).status, 409);
  assert.equal((await f.request({ action: 'save', id, version: 0, progress: { ...engine.initialProgress(), answers: { q1: 'INVENTED' } } })).status, 400);
  assert.equal(f.rpcs.length, 0);
});

test('the first-plan introduction uses only the authenticated student’s completed mini mock', async () => {
  const unfinished = fixture();
  assert.equal((await unfinished.request({ action: 'initial_plan', id })).status, 409);
  const f = fixture({ completed: true });
  f.s.progress.answers.q1 = 'A';
  f.s.completed_at = '2026-10-20T12:00:00Z';
  f.s.report = engine.buildSessionReport(f.s);
  f.records.coach_evidence.push({ user_id: alice, payload: { questionId: 'unrelated-practice' } });
  assert.equal((await f.request({ action: 'initial_plan', id }, 'bob')).status, 404);
  assert.equal((await f.request({ action: 'initial_plan', id: bob })).status, 400);
  const result = await (await f.request({ action: 'initial_plan', id })).json();
  assert.equal(result.seen, false);
  assert.equal(result.profile.freshQuestions, 1);
  assert.equal(result.profile.skills[0].accuracy, 100);
  assert.equal(result.report.sections[0].accuracy, 100);
  assert.ok(!JSON.stringify(result).includes('SECRET ANSWER REASON'));
});

test('acknowledging the introduction is account scoped, idempotent and skips subsequent walkthroughs', async () => {
  const f = fixture({ completed: true });
  assert.equal((await f.request({ action: 'acknowledge_plan', id: bob })).status, 400);
  assert.equal(f.records.coach_profiles[0].plan_intro_session_id, undefined);
  assert.equal((await f.request({ action: 'acknowledge_plan', id }, 'bob')).status, 404);
  for (let i = 0; i < 2; i++) assert.equal((await f.request({ action: 'acknowledge_plan', id })).status, 200);
  assert.equal(f.records.coach_profiles[0].plan_intro_session_id, id);
  assert.equal(f.records.coach_profiles[1].plan_intro_session_id, undefined);
  assert.deepEqual(await (await f.request({ action: 'initial_plan', id })).json(), { seen: true });
});
test('chat quotas are reserved before any model call; settings validate before update', async () => {
  const f = fixture({ completed: true });
  assert.equal((await f.request({ action: 'chat', requestId: id, text: 'How am I doing?' })).status, 429);
  assert.equal(f.rpcs[0].args.p_pro, false);
  assert.equal((await f.request({ action: 'settings', examDate: '2026-02-30', timeMultiplier: 1 })).status, 400);
  assert.equal((await f.request({ action: 'settings', examDate: '2027-06-10' })).status, 200);
  assert.equal(f.records.coach_profiles[0].exam_date, '2027-06-10'); assert.equal(f.records.coach_profiles[1].exam_date, null);
});

test('coach handler shares tutor support context and scopes history to Auth even when model arguments name another account', async () => {
  const f = fixture({ completed: true, chatAllowed: true });
  const response = await f.request({ action: 'chat', requestId: id, text: 'What should we revisit?' });
  assert.equal(response.status, 200);
  assert.ok((await response.json()).reply.includes('negation test'));
  assert.equal(f.modelRequests[0].sharedLearning.supportSummary.totalRequests, 4);
  assert.ok(f.sharedReads.every((read) => read.userId === alice));
  assert.equal(f.sharedReads.find((r) => r.kind === 'history').args.user_id, bob, 'model-supplied account cannot replace Auth');
  assert.equal(f.records.coach_evidence.length, 0, 'support history does not create scored evidence');
});

test('a student can reset only their own coaching data with explicit confirmation', async () => {
  const f = fixture({ completed: true });
  f.records.coach_profiles[0].preview_session_id = id;
  f.records.coach_messages.push({ user_id: alice, status: 'completed', free_credit_used: true, user_text: 'Past chat' });
  f.records.coach_evidence.push({ user_id: alice, payload: { questionId: 'old' } });
  f.records.coach_evidence.push({ user_id: bob, payload: { questionId: 'keep' } });
  assert.equal((await f.request({ action: 'reset_progress' })).status, 400);
  assert.equal(f.rpcs.length, 0);
  assert.equal((await f.request({ action: 'reset_progress', confirm: 'DELETE_COACHING_DATA', userId: bob })).status, 200);
  assert.equal(f.rpcs[0].args.p_user, alice);
  assert.equal(Object.keys(f.rpcs[0].args).length, 1);
  assert.equal(f.records.coach_sessions.length, 0);
  assert.equal(f.records.coach_evidence.length, 1);
  assert.equal(f.records.coach_evidence[0].user_id, bob);
  assert.equal(f.records.coach_profiles[0].baseline_session_id, null);
  assert.ok(f.records.coach_profiles[0].preview_session_id && f.records.coach_profiles[0].preview_session_id !== id, 'reset cannot refund the free coached set or retain its old session ID');
  assert.equal(f.records.coach_profiles[0].free_chat_used, 1, 'reset cannot refund free chat');
  assert.equal((await f.request({ action: 'session', id })).status, 404);
});
