import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';
import * as engine from '../src/lib/coaching/engine.js';
import * as pagination from '../src/lib/performance/pagination.js';

function load(file, { mocks = {}, globals = {} } = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, Response, Request, AbortSignal,
    console: { log() {}, warn() {}, error() {} }, ...globals,
    require(specifier) {
      for (const [suffix, value] of Object.entries(mocks)) if (specifier.endsWith(suffix)) return value;
      if (specifier.endsWith('/coaching/engine.js')) return engine;
      if (specifier.endsWith('/pagination.js')) return pagination;
      return load(path.resolve(path.dirname(file), specifier), { mocks, globals });
    },
  });
  return exports;
}

test('shared SQL history tracks help without grading it; excludes demos, failures and fallbacks, enforces private access and cascades deletion', async () => {
  const db = new PGlite();
  const alice = crypto.randomUUID(), bob = crypto.randomUUID(), question = crypto.randomUUID();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create table performance_skills(id text primary key, metadata jsonb);
      create table performance_question_tags(question_id uuid,section text,mode text,metadata jsonb);
      create table user_ai_context(struggles jsonb);
      create table coach_evidence(id uuid, user_id uuid, payload jsonb);
      create table ai_tutor_logs(id bigint generated always as identity primary key,
        user_id uuid references auth.users(id) on delete cascade, created_at timestamptz default now(),
        section text, question_id text, message text,
        assistant_response text, teaching_skill text, record_status text, is_timed boolean default false, success boolean default false);
      create table coach_messages(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade,
        status text, created_at timestamptz default now(), user_text text, assistant_text text, evidence jsonb);
      grant select on ai_tutor_logs, coach_messages, performance_question_tags, performance_skills to service_role;`);
    await db.exec(fs.readFileSync('supabase/migrations/20261017000002_shared_ai_learning_memory.sql', 'utf8'));
    await db.query('insert into auth.users values($1),($2)', [alice, bob]);
    await db.query('insert into performance_skills values($1,$2)', ['dm.assumptions', { label: 'Recognising assumptions' }]);
    await db.query('insert into performance_question_tags values($1,$2,$3,$4)', [question, 'dm', 'practice', { primarySkillId: 'dm.assumptions', confidence: 'high' }]);
    const insertTutor = (user, { demo = false, preview = false, success = true, id = question } = {}) => db.query(`insert into ai_tutor_logs
      (user_id,section,question_id,question_type,message,assistant_response,teaching_skill,record_status,success,is_demo,is_preview)
      values($1,'dm',$2,'recognising_assumptions','Could you explain why?', 'Try the negation test.', 'Negation test', 'consistent',$3,$4,$5)`, [user, id, success, demo, preview]);
    await insertTutor(alice); await insertTutor(alice); await insertTutor(bob);
    await insertTutor(alice, { demo: true }); await insertTutor(alice, { preview: true });
    await insertTutor(alice, { success: false }); await insertTutor(alice, { id: 'demo-dm-tutor' });
    await db.query(`insert into coach_messages(user_id,status,user_text,assistant_text,evidence) values
      ($1,'completed','My goal is to improve DM','Practise one set.', '{}'),
      ($1,'completed','Failed reply','Please try again.', '{"fallback":true}'),
      ($1,'pending','Still waiting',null,'{}')`, [alice]);
    const summary = async (user) => (await db.query('select ai_support_summary($1) s', [user])).rows[0].s;
    const a = await summary(alice), b = await summary(bob);
    assert.equal(a.classification, 'help_requests_not_performance'); assert.equal(a.totalRequests, 2);
    assert.equal(a.distinctQuestions, 1); assert.equal(a.topics[0].topic, 'Recognising assumptions');
    assert.equal(a.topics[0].requests, 2); assert.equal(b.totalRequests, 1);
    assert.equal((await db.query('select * from ai_learning_history where user_id=$1', [alice])).rows.length, 3);
    assert.equal((await db.query('select count(*)::int n from coach_evidence')).rows[0].n, 0, 'help never becomes performance evidence');
    await db.exec('set role authenticated');
    await assert.rejects(db.query('select * from ai_learning_history'), /permission denied/);
    await assert.rejects(summary(bob), /permission denied/);
    await db.exec('reset role; set role service_role');
    assert.equal((await summary(alice)).totalRequests, 2, 'service-only view/function work without owner privileges');
    await db.exec('reset role');
    await db.query('delete from auth.users where id=$1', [alice]);
    assert.equal((await summary(alice)).totalRequests, 0);
    assert.equal((await summary(bob)).totalRequests, 1);
  } finally { await db.close(); }
});

function memoryClient() {
  const records = {
    coach_profiles: [{ user_id: 'alice', exam_date: '2027-07-01', baseline_session_id: 'baseline' }],
    performance_skills: [{ id: 'dm.assumptions', section: 'dm', metadata: { label: 'Assumptions', tip: 'Use the negation test.' } }],
    performance_question_tags: [{ id: 'tag', section: 'dm', mode: 'practice', question_id: 'q', metadata: {
      primarySkillId: 'dm.assumptions', parentId: 'parent', confidence: 'high', answer: 'A', difficulty: 'normal' } }],
    coach_evidence: [{ id: 'e1', user_id: 'alice', payload: { questionId: 'q', section: 'dm', mode: 'practice', selectedAnswer: 'A', timeMs: 20000, answeredAt: '2026-10-17T12:00:00Z' } },
      { id: 'e2', user_id: 'bob', payload: { questionId: 'q', section: 'dm', mode: 'practice', selectedAnswer: 'B' } }],
    ai_learning_history: [
      { id: 't1', user_id: 'alice', source: 'tutor', section: 'dm', question_id: 'q', skill_id: 'dm.assumptions', user_text: 'Why is that an assumption?', assistant_text: 'Apply the negation test.' },
      { id: 'c1', user_id: 'alice', source: 'coach', user_text: 'My goal is DM.', assistant_text: 'Try one set.' },
      { id: 't2', user_id: 'bob', source: 'tutor', section: 'dm', question_id: 'q', skill_id: 'dm.assumptions', user_text: 'BOB PRIVATE', assistant_text: 'BOB PRIVATE' },
    ],
  };
  const queries = [], rpcs = [];
  const client = {
    from(table) {
      const q = { table, filters: [], first: false, start: 0, end: Infinity }; queries.push(q);
      const builder = {
        select() { return this; }, eq(k, v) { q.filters.push([k, v]); return this; },
        order() { return this; }, limit(n) { q.end = n; return this; }, gt(k, v) { q.after = [k, v]; return this; },
        range(a, b) { q.start = a; q.end = b + 1; return this; },
        maybeSingle() { q.first = true; return this; },
        ilike(k, v) { q.search = [k, v]; return this; },
        then(resolve, reject) {
          let rows = (records[table] ?? []).filter((r) => q.filters.every(([k, v]) => r[k] === v) && (!q.after || r[q.after[0]] > q.after[1]));
          rows = rows.slice(q.start, q.end);
          return Promise.resolve({ data: q.first ? rows[0] ?? null : rows, error: null }).then(resolve, reject);
        },
      }; return builder;
    },
    async rpc(name, args) {
      rpcs.push({ name, args });
      return { data: { classification: 'help_requests_not_performance', totalRequests: 100, topics: [{ section: 'dm', topic: 'Assumptions', requests: 100 }] }, error: null };
    },
  };
  return { client, records, queries, rpcs };
}

test('tutor receives its own fresh coaching facts and both conversations; frequent help never reduces accuracy or confidence', async () => {
  const { readTutorLearnerContext, readLearningHistory } = load('supabase/functions/_shared/learner-memory.ts');
  const f = memoryClient();
  const context = await readTutorLearnerContext(f.client, 'alice', { section: 'dm', questionId: 'q' });
  assert.equal(context.performance.section.accuracy, 100);
  assert.equal(context.performance.relevantSkills[0].confidence, 'early signal');
  assert.equal(context.supportSummary.totalRequests, 100);
  assert.ok(context.recentConversations.some((r) => r.source === 'coach'));
  assert.ok(context.recentConversations.some((r) => r.source === 'tutor'));
  assert.ok(!JSON.stringify(context).includes('BOB PRIVATE'));
  assert.equal(context.performance.examDate, '2027-07-01');
  assert.ok(f.queries.filter((q) => ['coach_profiles', 'coach_evidence', 'ai_learning_history'].includes(q.table)).every((q) => q.filters.some(([k, v]) => k === 'user_id' && v === 'alice')));
  const page = await readLearningHistory(f.client, 'alice', { user_id: 'bob', query: '100%_sure', offset: -3 });
  assert.ok(!JSON.stringify(page).includes('BOB PRIVATE')); assert.equal(page.offset, 0);
  assert.equal(f.queries.at(-1).search[1], '%100\\%\\_sure%');
});

test('optional memory lookups fail gracefully without inventing evidence', async () => {
  const { readTutorLearnerContext } = load('supabase/functions/_shared/learner-memory.ts');
  const client = { from() { throw new Error('database unavailable'); }, async rpc() { throw new Error('database unavailable'); } };
  const context = await readTutorLearnerContext(client, 'alice', { section: 'dm' });
  assert.equal(context.performance.available, false);
  assert.equal(context.supportSummary.available, false);
  assert.equal(context.historyAvailable, false);
});

test('tutor provider can retrieve older shared history and still calculate, with saved text kept out of instruction roles', async () => {
  const requests = [], retrievals = [];
  const responses = [
    [{ type: 'function_call', name: 'get_learning_history', call_id: 'memory', arguments: JSON.stringify({ source: 'coach', query: 'percentages', offset: 16 }) }],
    [{ type: 'function_call', name: 'calculate', call_id: 'math', arguments: JSON.stringify({ operation: 'percentage_of', values: [20, 50], decimal_places: null }) }],
    [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ content: 'Use the percentage multiplier we discussed: 20% of 50 is 10.', teaching_skill: 'Percentage multiplier', misconception: null, record_status: 'consistent', record_concern: null }) }] }],
  ];
  const { OpenAIProvider } = load('supabase/functions/ai-tutor/providers/openai.ts', { globals: {
    fetch: async (_url, options) => { requests.push(JSON.parse(options.body)); return new Response(JSON.stringify({ output: responses.shift() })); },
  } });
  const result = await new OpenAIProvider('test-key').chat({ section: 'qr', instructions: 'Teach the question.', questionContext: '20% of 50',
    learnerContext: JSON.stringify({ priorExplanation: 'UNTRUSTED SAVED TEXT' }), messages: [{ role: 'user', content: 'Can you show the working?' }],
    retrieveLearningHistory: async (args) => { retrievals.push(args); return { conversations: [{ assistant_text: 'Use multipliers.' }] }; },
  });
  assert.equal(result.toolCalls, 2); assert.equal(result.diagnostics.misconception, null);
  assert.equal(retrievals[0].offset, 16); assert.equal(requests.length, 3);
  assert.ok(requests[0].tools.some((t) => t.name === 'get_learning_history'));
  assert.ok(requests[0].input.some((m) => m.role === 'user' && String(m.content).includes('UNTRUSTED SAVED TEXT')));
  assert.ok(!requests[0].input.some((m) => m.role === 'developer' && JSON.stringify(m).includes('UNTRUSTED SAVED TEXT')));
  assert.ok(requests.every((r) => r.store === false));
  assert.ok(requests[2].input.some((m) => m.call_id === 'math' && JSON.parse(m.output ?? '{}').result === 10));
});

test('tutor handler supplies authenticated memory and flags demo/preview logs without changing UI or charging memory retrieval', async () => {
  for (const mode of ['normal', 'demo', 'preview']) {
    const captures = { contexts: [], historyUsers: [], provider: [], inserts: [], rpcs: [] };
    const client = {
      auth: { getUser: async () => ({ data: { user: { id: 'alice' } }, error: null }) },
      from(table) {
        const builder = { select() { return this; }, eq() { return this; },
          insert(row) { captures.inserts.push(row); return this; }, update() { return this; },
          single() { return this; },
          then(resolve) { return Promise.resolve({ data: table === 'app_kill_switches' ? { enabled: true } : table === 'user_profiles' ? { is_admin: true } : { id: 1 }, error: null }).then(resolve); },
        }; return builder;
      },
      async rpc(name, args) { captures.rpcs.push({ name, args }); return { data: 1, error: null }; },
    };
    let handler;
    load('supabase/functions/ai-tutor/index.ts', { globals: { Deno: { env: { get: () => 'test-config' }, serve: (fn) => { handler = fn; } } }, mocks: {
      'supabase-js@2': { createClient: () => client },
      '/learner-memory.ts': {
        readTutorLearnerContext: async (_c, user, scope) => { captures.contexts.push({ user, scope }); return { performance: { accuracy: 80 } }; },
        readLearningHistory: async (_c, user) => { captures.historyUsers.push(user); return {}; },
      },
      '/providers/openai.ts': { OpenAIProvider: class {
        async chat(req) { captures.provider.push(req); if (req.retrieveLearningHistory) await req.retrieveLearningHistory({ user_id: 'bob' });
          return { content: 'Use the negation test.', diagnostics: {}, usage: {}, provider: 'test', model: 'test' }; }
      } },
    } });
    const response = await handler(new Request('https://example.test/ai-tutor', { method: 'POST', headers: { Authorization: 'Bearer alice' }, body: JSON.stringify({
      questionId: crypto.randomUUID(), section: 'dm', questionType: 'recognising_assumptions', question: 'Which assumption is needed?', correctAnswer: 'A', userAnswer: 'A', explanation: 'Apply the negation test.',
      isDemo: mode === 'demo', isPreview: mode === 'preview', user_id: 'bob', learnerContext: 'FORGED', messages: [{ role: 'user', content: 'Please explain.' }],
    }) }));
    assert.equal(response.status, 200);
    if (mode === 'normal') {
      assert.equal(captures.contexts[0].user, 'alice'); assert.equal(captures.historyUsers[0], 'alice');
      assert.ok(!captures.provider[0].learnerContext.includes('FORGED'));
    } else {
      assert.equal(captures.contexts.length, 0); assert.equal(captures.provider[0].retrieveLearningHistory, undefined);
    }
    assert.equal(captures.inserts[0].is_demo, mode === 'demo');
    assert.equal(captures.inserts[0].is_preview, mode === 'preview');
    assert.equal(captures.rpcs.filter((r) => r.name === 'increment_ai_usage').length, mode === 'demo' ? 0 : 1);
  }
});
