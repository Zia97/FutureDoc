import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as engine from '../src/lib/coaching/engine.js';
import * as access from '../src/lib/performance/access.js';
import * as contentTransport from '../src/lib/coaching/contentTransport.js';
import * as pagination from '../src/lib/performance/pagination.js';

const alice = '00000000-0000-4000-8000-000000000001', bob = '00000000-0000-4000-8000-000000000002';
const id = '00000000-0000-4000-8000-000000000003';
const source = ts.transpileModule(fs.readFileSync('supabase/functions/ai-coach/index.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function fixture({ premium = false, completed = false, chatAllowed = false, revenueCat = null, revenueCatStatus = 200 } = {}) {
  const tag = { id: 'q1', section: 'vr', mode: 'practice', parentId: 'p1', confidence: 'high', primarySkillId: 'vr.test', answer: 'A', difficulty: 'normal' };
  const catalogue = { skills: [{ id: 'vr.test', label: 'Finding evidence', section: 'vr' }], questions: [tag] };
  const s = { id, user_id: alice, title: 'Test', status: completed ? 'completed' : 'active', kind: 'assessment', version: 0,
    questions: [{ id: 'q1', section: 'vr', choices: [{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }], tag, explanation: 'SECRET ANSWER REASON' }],
    budgets: { vr: 60 }, progress: engine.initialProgress(), report: completed ? { sections: [] } : null };
  const records = {
    user_profiles: [alice, bob].map((user_id) => ({ user_id, is_premium: premium })),
    coach_profiles: [alice, bob].map((user_id) => ({ user_id, baseline_session_id: completed ? id : null, exam_date: null, time_multiplier: 1, preview_session_id: null, free_chat_used: 0, chat_day_used: 0 })),
    coach_sessions: [s], coach_next_sets: [], coach_evidence: [], coach_messages: [], coach_plans: [], coach_milestones: [],
  };
  const queries = [], rpcs = [], sharedReads = [], modelRequests = [];
  const client = {
    auth: { getUser: async (token) => ({ data: { user: token === 'alice' ? { id: alice } : token === 'bob' ? { id: bob } : null }, error: null }) },
    from(table) {
      const q = { table, filters: [], single: false, limit: Infinity, offset: 0 }; queries.push(q);
      const builder = {
        select(_columns, options) { q.head = options?.head; return this; },
        eq(k, v) { q.filters.push([k, v]); return this; },
        is(k, v) { q.filters.push([k, v]); return this; },
        gt(k, v) { q.after = [k, v]; return this; }, order() { return this; },
        limit(n) { q.limit = n; return this; }, range(a, b) { q.offset = a; q.limit = b - a + 1; return this; },
        maybeSingle() { q.single = true; return this; }, single() { q.single = true; return this; },
        upsert(value, options) { q.upsert = value; q.ignore = options?.ignoreDuplicates; return this; },
        update(value) { q.update = value; return this; },
        then(resolve, reject) {
          let rows = (records[table] ?? []).filter((r) => q.filters.every(([k, v]) => (r[k] ?? null) === v) && (!q.after || r[q.after[0]] > q.after[1]));
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
        const target = records.coach_sessions.find((row) => row.id === args.p_id);
        Object.assign(target, { progress: args.p_progress, report: args.p_report, version: target.version + 1, status: args.p_report ? 'completed' : 'active' });
        if (target.kind === 'assessment' && args.p_report) records.coach_profiles.find((profile) => profile.user_id === args.p_user).baseline_session_id = target.id;
        for (const payload of args.p_evidence) records.coach_evidence.push({ id: payload.id, user_id: args.p_user, payload });
        return { data: target, error: null };
      }
      if (name === 'coach_start_session' || name === 'coach_import_session') {
        const profile = records.coach_profiles.find((row) => row.user_id === args.p_user);
        if (args.p_session.kind !== 'assessment' && !args.p_pro && profile.preview_session_id) return { error: { message: 'pro_required' } };
        const next = { ...args.p_session, id: args.p_session.id ?? '00000000-0000-4000-8000-000000000006', user_id: args.p_user, version: 0, status: 'active' };
        if (next.kind !== 'assessment' && !args.p_pro) profile.preview_session_id = next.id;
        records.coach_sessions.push(next);
        return { data: next, error: null };
      }
      if (name === 'coach_prepare_next_set') {
        const prepared = { id: `00000000-0000-4000-8000-${String(records.coach_next_sets.length + 10).padStart(12, '0')}`,
          user_id: args.p_user, previous_session_id: args.p_previous, session: args.p_session, claimed_at: null };
        records.coach_next_sets.push(prepared);
        return { data: prepared, error: null };
      }
      if (name === 'coach_activate_next_set') {
        assert.equal(args.p_pro, true, 'Activation requires the server to verify current Pro');
        const prepared = records.coach_next_sets.find((row) => row.id === args.p_id && row.user_id === args.p_user);
        const previous = records.coach_sessions.find((row) => row.id === prepared.previous_session_id && row.user_id === args.p_user);
        if (previous?.status !== 'completed') return { error: { message: 'previous_incomplete' } };
        const next = { ...prepared.session, id: prepared.id, user_id: args.p_user, status: 'active', version: 0 };
        records.coach_sessions.push(next); prepared.claimed_at = new Date().toISOString(); prepared.session = null;
        return { data: next, error: null };
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
  vm.runInNewContext(source, { exports, Response, AbortSignal,
    fetch: async () => new Response(JSON.stringify({ subscriber: revenueCat }), { status: revenueCatStatus }),
    console: { error() {} }, Deno: { env: { get: (key) => key === 'REVENUECAT_SECRET_KEY' && revenueCat ? 'server-secret' : undefined }, serve() {} },
    require(specifier) {
      if (specifier.startsWith('https://')) return { createClient: () => client };
      if (specifier.endsWith('engine.js')) return engine;
      if (specifier.endsWith('contentTransport.js')) return contentTransport;
      if (specifier.endsWith('access.js')) return access;
      if (specifier.endsWith('pagination.js')) return pagination;
      if (specifier.endsWith('coaching-data.ts')) return { readEvidence: async (db, userId) => (await pagination.readAllPages(() => db.from('coach_evidence').select('id,payload').eq('user_id', userId))).map((r) => r.payload) };
      if (specifier.endsWith('learner-memory.ts')) return {
        readSharedLearningContext: async (_db, userId) => { sharedReads.push({ kind: 'context', userId }); return { supportSummary: { totalRequests: 4, classification: 'help_requests_not_performance' } }; },
        readLearningHistory: async (_db, userId, args) => { sharedReads.push({ kind: 'history', userId, args }); return { conversations: [{ source: 'tutor', assistant_text: 'Use the negation test.' }] }; },
      };
      if (specifier.endsWith('content.ts')) return { readCatalogue: async () => catalogue,
        selectAssessment: () => ({ id: 'assessment-test', tags: catalogue.questions }),
        loadQuestions: async (_client, tags) => tags.map((tag) => ({ ...s.questions[0], id: tag.id, tag })) };
      if (specifier.endsWith('agent.ts')) return { coachReply: async (request) => {
        if (!chatAllowed) throw new Error('Model should not be called');
        modelRequests.push(request);
        await request.retrieve('get_learning_history', { source: 'tutor', user_id: bob, query: 'negation', offset: 0 });
        return { content: 'We can revisit the negation test in your next set.', used: ['get_profile', 'get_learning_history'] };
      } };
      throw new Error(specifier);
    },
  });
  return { records, rpcs, queries, sharedReads, modelRequests, s, catalogue, request: (body, token = 'alice', method = 'POST') => exports.handleCoach(new Request('https://example.test/ai-coach', {
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
  assert.equal(response.session.id, id); assert.ok(!('tag' in response.session.questions[0]));
  assert.equal(response.session.questions[0].explanation, undefined);
  assert.equal(response.session.offlineScoring.q1.explanation, 'SECRET ANSWER REASON');
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

test('the endpoint uses device-bank references only for matching frozen versions and keeps scoring canonical', async () => {
  const f = fixture(); f.s.kind = 'practice'; f.s.questions[0].bankVersion = 2;
  const response = await (await f.request({ action: 'session', id, contentVersions: { verbal_reasoning: 2 } })).json();
  assert.deepEqual(response.session.questions[0].contentRef, { bank: 'verbal_reasoning', version: 2 });
  assert.equal(response.session.questions[0].choices, undefined);
  assert.equal(response.session.offlineScoring.q1.explanation, 'SECRET ANSWER REASON');
  const outdated = await (await f.request({ action: 'session', id, contentVersions: { verbal_reasoning: 1 } })).json();
  assert.ok(outdated.session.questions[0].choices);
  assert.equal(outdated.session.questions[0].contentRef, undefined);
  const oldClient = await (await f.request({ action: 'session', id })).json();
  assert.ok(oldClient.session.questions[0].choices);
  assert.equal((await f.request({ action: 'session', id, contentVersions: { verbal_reasoning: 2 } }, 'bob')).status, 404);
  const done = await (await f.request({ action: 'save', id, version: 0, contentVersions: { verbal_reasoning: 2 }, progress: {
    ...engine.initialProgress(), phase: 'finished', closedSections: ['vr'], answers: { q1: 'B' },
  } })).json();
  assert.ok(done.session.questions[0].choices);
  assert.equal(done.session.questions[0].grade.earned, 0);
  assert.equal(done.session.questions[0].contentRef, undefined);
});

test('starting another set accepts a device-finished set without waiting for its background upload', async () => {
  const f = fixture({ completed: true, premium: true });
  const previousId = '00000000-0000-4000-8000-000000000005';
  const previous = { ...structuredClone(f.s), id: previousId, kind: 'practice', status: 'active', version: 0, progress: engine.initialProgress() };
  f.records.coach_sessions.push(previous);
  f.catalogue.questions.push({ ...f.catalogue.questions[0], id: 'q2', parentId: 'p2' });
  const progress = { ...engine.initialProgress(), phase: 'finished', closedSections: ['vr'], answers: { q1: 'B' } };
  const response = await f.request({ action: 'start', kind: 'practice', section: 'vr', previous: { id: previousId, progress } });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.notEqual(result.session.id, previousId);
  assert.equal(result.session.questions[0].id, 'q2', 'The just-finished questions cannot repeat');
  assert.equal(previous.status, 'completed');
  assert.equal(previous.report.sections[0].earned, 0, 'The server still computes the final grade');
  const savingCalls = f.rpcs.filter((call) => call.name === 'coach_save_session');
  assert.equal(savingCalls.length, 1);
  const retry = await f.request({ action: 'start', kind: 'practice', section: 'vr', previous: { id: previousId, progress } });
  assert.equal(retry.status, 200);
  assert.equal(f.rpcs.filter((call) => call.name === 'coach_save_session').length, 1, 'Retries do not complete the set twice');
});

test('completion bundled with the next download remains account scoped and validates progress', async () => {
  const f = fixture();
  const progress = { ...engine.initialProgress(), phase: 'finished', closedSections: ['vr'] };
  assert.equal((await f.request({ action: 'start', kind: 'practice', previous: { id, progress } }, 'bob')).status, 404);
  assert.equal((await f.request({ action: 'start', kind: 'practice', previous: { id, progress: engine.initialProgress() } })).status, 400);
  assert.equal(f.rpcs.length, 0);
});

function addPracticeParent(f) {
  const previous = { ...structuredClone(f.s), id: '00000000-0000-4000-8000-000000000005', kind: 'practice', status: 'active', version: 0, progress: engine.initialProgress() };
  f.records.coach_sessions.push(previous);
  for (const number of [2, 3]) f.catalogue.questions.push({ ...f.catalogue.questions[0], id: `q${number}`, parentId: `p${number}` });
  return previous;
}

test('the next set downloads during practice without completing, scoring or replacing the current set', async () => {
  const f = fixture({ completed: true, premium: true }), previous = addPracticeParent(f);
  const response = await f.request({ action: 'prepare_next', id: previous.id });
  assert.equal(response.status, 200);
  const { session: ready } = await response.json();
  assert.equal(ready.previousSessionId, previous.id);
  assert.equal(ready.progress.phase, 'instructions');
  assert.notEqual(ready.questions[0].id, 'q1');
  assert.ok(ready.offlineScoring[ready.questions[0].id]);
  assert.equal(previous.status, 'active');
  assert.equal(previous.progress.phase, 'instructions');
  assert.equal(f.records.coach_evidence.length, 0);
  assert.equal(f.records.coach_sessions.length, 2, 'Ready content is not another active session');
  const again = await (await f.request({ action: 'prepare_next', id: previous.id })).json();
  assert.equal(again.session.id, ready.id);
  assert.equal(f.records.coach_next_sets.length, 1);
  const following = await (await f.request({ action: 'prepare_next', id: ready.id })).json();
  assert.notEqual(following.session.questions[0].id, ready.questions[0].id);
  assert.notEqual(following.session.questions[0].id, 'q1', 'Also exclude the older set whose upload may be pending');
});

test('saving a prepared set validates answers and ownership before activation and uses its frozen content', async () => {
  const f = fixture({ completed: true, premium: true }), previous = addPracticeParent(f);
  const { session: ready } = await (await f.request({ action: 'prepare_next', id: previous.id })).json();
  const q = ready.questions[0].id;
  const progress = { ...engine.initialProgress(), phase: 'running', answers: { [q]: 'B' } };
  const activations = () => f.rpcs.filter((call) => call.name === 'coach_activate_next_set').length;
  assert.equal((await f.request({ action: 'save', id: ready.id, version: 0, progress }, 'bob')).status, 404);
  assert.equal((await f.request({ action: 'save', id: ready.id, version: 0, progress: { ...progress, answers: { [q]: 'INVALID' } } })).status, 400);
  assert.equal(activations(), 0);
  assert.equal((await f.request({ action: 'save', id: ready.id, version: 0, progress })).status, 409);
  assert.equal(f.records.coach_sessions.some((row) => row.id === ready.id), false, 'A premature background upload remains queued without displacing the current set');
  await f.request({ action: 'save', id: previous.id, version: 0, progress: { ...engine.initialProgress(), phase: 'finished', closedSections: ['vr'], answers: { q1: 'A' } } });
  const response = await f.request({ action: 'save', id: ready.id, version: 0, progress });
  assert.equal(response.status, 200);
  const { session: saved } = await response.json();
  assert.equal(saved.id, ready.id);
  assert.equal(saved.questions[0].id, q);
  assert.equal(saved.progress.answers[q], 'B');
  assert.equal(f.records.coach_next_sets[0].session, null);
});

test('prefetch respects paid access, private ownership and exhausted question pools', async () => {
  const free = fixture({ completed: true }), parent = addPracticeParent(free);
  assert.equal((await free.request({ action: 'prepare_next', id: parent.id })).status, 402);
  assert.equal(free.records.coach_next_sets.length, 0);
  const paid = fixture({ completed: true, premium: true }), owned = addPracticeParent(paid);
  assert.equal((await paid.request({ action: 'prepare_next', id: owned.id }, 'bob')).status, 404);
  paid.catalogue.questions.splice(1);
  const exhausted = await (await paid.request({ action: 'prepare_next', id: owned.id })).json();
  assert.equal(exhausted.error, 'question_pool_exhausted');
  assert.equal(paid.records.coach_next_sets.length, 0);
});

test('a reservation prepared while subscribed cannot activate or prefetch again after Pro expires', async () => {
  const f = fixture({ completed: true, premium: true }), parent = addPracticeParent(f);
  const { session: ready } = await (await f.request({ action: 'prepare_next', id: parent.id })).json();
  await f.request({ action: 'save', id: parent.id, version: 0, progress: {
    ...engine.initialProgress(), phase: 'finished', closedSections: ['vr'], answers: { q1: 'A' },
  } });
  f.records.user_profiles[0].premium_expires_at = '2000-01-01T00:00:00Z';
  assert.equal((await f.request({ action: 'prepare_next', id: parent.id, isPro: true })).status, 402);
  const refused = await f.request({ action: 'save', id: ready.id, version: 0,
    progress: { ...engine.initialProgress(), phase: 'running' }, isPro: true, p_pro: true });
  assert.equal(refused.status, 402);
  assert.equal(f.rpcs.filter((call) => call.name === 'coach_activate_next_set').length, 0);
  assert.equal(f.records.coach_next_sets[0].claimed_at, null);
  assert.ok(!f.records.coach_sessions.some((s) => s.id === ready.id));
  assert.equal((await f.request({ action: 'session', id: parent.id })).status, 200, 'Completed results remain available');
});

test('RevenueCat expiration and outages fail closed even if the profile mirror still says premium', async () => {
  for (const options of [
    { revenueCat: { entitlements: { 'UCAT Genius AI Pro': { expires_date: '2000-01-01T00:00:00Z' } } }, expected: 402 },
    { revenueCat: {}, revenueCatStatus: 503, expected: 503 },
  ]) {
    const f = fixture({ premium: true, completed: true, ...options }), parent = addPracticeParent(f);
    assert.equal((await f.request({ action: 'prepare_next', id: parent.id })).status, options.expected);
    assert.equal(f.records.coach_next_sets.length, 0);
    f.records.coach_sessions.find((s) => s.id === parent.id).status = 'completed';
    f.records.coach_profiles[0].preview_session_id = parent.id;
    assert.equal((await f.request({ action: 'start', kind: 'review', section: 'vr', isPro: true })).status, options.expected);
  }
});

test('the free coached set is consumed once and cannot be refreshed by changing practice mode', async () => {
  const f = fixture({ completed: true });
  const response = await f.request({ action: 'start', kind: 'practice', section: 'vr' });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.previewAvailable, false);
  assert.equal(f.records.coach_profiles[0].preview_session_id, result.session.id);
  assert.equal((await (await f.request({ action: 'start', kind: 'practice', section: 'vr' })).json()).session.id, result.session.id, 'Repeated starts resume the same free set');
  await f.request({ action: 'save', id: result.session.id, version: 0, progress: {
    ...engine.initialProgress(), phase: 'finished', closedSections: ['vr'], answers: { q1: 'A' },
  } });
  for (const kind of ['practice', 'review', 'timed_check']) {
    assert.equal((await f.request({ action: 'start', kind, section: 'vr', isPro: true })).status, 402);
  }
  assert.equal(f.records.coach_sessions.filter((s) => s.kind !== 'assessment').length, 1);
});

test('the free starting assessment does not consume the coached-practice preview', async () => {
  const f = fixture(); f.records.coach_sessions = [];
  const response = await f.request({ action: 'start', kind: 'assessment' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).previewAvailable, true);
  assert.equal(f.records.coach_profiles[0].preview_session_id, null);
});

test('free hub retains the initial plan, keeps real progress, and does not save adaptive plans', async () => {
  const f = fixture({ completed: true });
  f.s.completed_at = '2026-10-20T12:00:00Z'; f.s.progress.answers.q1 = 'A';
  f.catalogue.skills.push({ id: 'vr.new', label: 'New focus', section: 'vr' });
  const tag = { ...f.catalogue.questions[0], id: 'new-question', parentId: 'new-passage', primarySkillId: 'vr.new' };
  f.catalogue.questions.push(tag);
  f.records.coach_evidence.push(...engine.sessionEvidence(f.s).map((payload) => ({ user_id: alice, payload })),
    { user_id: alice, payload: { questionId: tag.id, section: 'vr', mode: 'practice', tag, selectedAnswer: 'B', answeredAt: '2026-10-20T13:00:00Z' } });
  const initial = engine.buildCoachProfile({ catalogue: f.catalogue, rawEvidence: engine.sessionEvidence(f.s), baselineCompletedAt: f.s.completed_at });
  const free = await (await f.request({ action: 'hub' })).json();
  assert.deepEqual(free.profile.plan, JSON.parse(JSON.stringify(initial.plan)));
  assert.equal(free.profile.freshQuestions, 2, 'Progress is not frozen with the free plan');
  assert.equal(f.queries.filter((q) => q.table === 'coach_plans' && q.upsert).length, 0);
  f.records.user_profiles[0].is_premium = true;
  const paid = await (await f.request({ action: 'hub' })).json();
  assert.notDeepEqual(paid.profile.plan, initial.plan);
  assert.equal(paid.profile.planSkills, undefined);
  assert.equal(f.queries.filter((q) => q.table === 'coach_plans' && q.upsert).length, 1);
});

test('the first plan can be requested immediately after device completion, before background upload', async () => {
  const f = fixture();
  const progress = { ...engine.initialProgress(), phase: 'finished', closedSections: ['vr'], answers: { q1: 'A' } };
  const response = await f.request({ action: 'initial_plan', id, previous: { id, progress } });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.report.sections[0].earned, 1);
  assert.equal(result.profile.freshQuestions, 1);
  assert.equal(f.s.status, 'completed');
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

test('device session imports freeze server content, keep stable UUIDs and ignore forged grading', async () => {
  const f = fixture({ completed: true });
  const deviceId = '00000000-0000-4000-8000-000000000099';
  const tag = f.catalogue.questions[0]; tag.contentHash = 'frozen-version';
  const body = { action: 'import_session', id: deviceId, kind: 'practice', formVersion: 'practice-v1',
    questionIds: [tag.id], contentHashes: [tag.contentHash], timeMultiplier: 1.25,
    questions: [{ tag: { answer: 'FORGED' } }], report: { earned: 999 } };
  const response = await f.request(body);
  assert.equal(response.status, 200);
  const { session } = await response.json();
  assert.equal(session.id, deviceId); assert.equal(session.report, undefined);
  const imported = f.records.coach_sessions.find((s) => s.id === deviceId);
  assert.equal(imported.questions[0].tag.answer, 'A');
  assert.equal(imported.time_multiplier, 1.25);
  const count = f.rpcs.filter((r) => r.name === 'coach_import_session').length;
  assert.equal((await f.request(body)).status, 200);
  assert.equal(f.rpcs.filter((r) => r.name === 'coach_import_session').length, count, 'Repeated imports read the same session');
  assert.equal((await f.request({ ...body, id: '00000000-0000-4000-8000-000000000098' })).status, 402, 'Offline creation cannot bypass preview limits');
  const foreign = await (await f.request({ action: 'session', id: deviceId }, 'bob')).json();
  assert.equal(foreign.error, 'session_not_found');
});

test('device imports reject missing questions, changed snapshots and partial parent groups before writing', async () => {
  const f = fixture({ premium: true, completed: true });
  const tag = f.catalogue.questions[0]; tag.contentHash = 'frozen-version';
  const body = { action: 'import_session', id: '00000000-0000-4000-8000-000000000099', kind: 'practice',
    formVersion: 'practice-v1', questionIds: [tag.id], contentHashes: ['old-version'], timeMultiplier: 1 };
  assert.equal((await f.request(body)).status, 503);
  assert.equal((await f.request({ ...body, questionIds: ['missing'] })).status, 400);
  f.catalogue.questions.push({ ...tag, id: 'q2' });
  assert.equal((await f.request({ ...body, contentHashes: [tag.contentHash] })).status, 400);
  assert.ok(!f.rpcs.some((r) => r.name === 'coach_import_session'));
});
