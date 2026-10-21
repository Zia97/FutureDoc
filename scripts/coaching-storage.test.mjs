import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as sessionState from '../src/lib/coaching/sessionState.js';
import * as engine from '../src/lib/coaching/engine.js';
import * as contentTransport from '../src/lib/coaching/contentTransport.js';
import * as coachAccess from '../src/lib/coaching/access.js';
import { deviceContent, sampleDeviceBanks } from './helpers/coaching-device-content.mjs';
const proSubscription = { isPro: true, customerInfo: { entitlements: { active: { 'UCAT Genius AI Pro': { expirationDate: '2100-01-01T00:00:00Z' } } } } };
import { initialProgress, validateProgress } from '../src/lib/coaching/engine.js';
const transpile = (file) => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function setup(storedValues = new Map()) {
  const values = storedValues, writes = [], inserts = [], requests = [];
  const storage = { getItem: async (k) => values.get(k) ?? null, multiGet: async (keys) => keys.map((k) => [k,values.get(k) ?? null]), setItem: async (k, v) => { values.set(k, v); }, getAllKeys: async () => [...values.keys()], removeItem: async (k) => values.delete(k), multiRemove: async (keys) => keys.forEach((k) => values.delete(k)) };
  const state = { user: 'alice', offline: false, remote: null, banks: {} };
  const supabase = { auth: { getSession: async () => ({ data: { session: state.user ? { user: { id: state.user }, access_token: state.user } : null } }) },
    functions: { invoke: async (_fn, { body }) => {
      requests.push(body);
      if (state.offline) return { error: new Error('offline') };
      if (body.action === 'reset_progress') { state.remote = null; return { data: { ok: true } }; }
      let remote = state.sessions ? state.sessions.get(body.id) : state.remote;
      if (body.action === 'import_session') {
        remote ??= state.deviceImports?.get(body.id);
        if (!remote) return { data: { error: 'content_changed' } };
        if (state.sessions) state.sessions.set(body.id, remote); else state.remote = remote;
      }
      if (body.action === 'prepare_next') {
        if (state.prepareError) return { data: { error: state.prepareError } };
        remote = state.prepared;
      }
      if (body.action === 'session' && !remote) return { data: { error: 'session_not_found' } };
      if (body.action === 'save') {
        if (!remote && state.prepared?.id === body.id) remote = state.prepared;
        if (body.version !== remote.version) return { data: { error: 'version_conflict' } };
        writes.push(body); remote = { ...remote, ...body, version: body.version + 1, status: body.progress.phase === 'finished' ? 'completed' : 'active' };
        if (state.sessions) state.sessions.set(body.id, remote); else state.remote = remote;
        if (state.dropSaveResponse) return { error: new Error('response lost') };
      }
      const wire = state.compactReply && remote ? contentTransport.compactCoachSession(remote, state.snapshots, body.contentVersions) : remote;
      const reply = { data: { session: structuredClone(wire) } };
      if (state.beforeReply) await state.beforeReply(body);
      return reply;
    } },
    rpc: (name, { p_attempts: rows }) => ({
      setHeader(_key, value) { assert.equal(value, `Bearer ${state.user}`); return this; },
      then(resolve, reject) {
        assert.equal(name, 'upload_practice_attempts'); assert.ok(rows.length <= 50);
        return (async () => {
          if (state.beforeUpload) await state.beforeUpload();
          const result = state.offline ? { error: { code: 'offline' } } : {};
          if (!state.offline) rows.forEach((row) => { if (!inserts.some((r) => r.id === row.id)) inserts.push(row); });
          return result;
        })().then(resolve,reject);
      },
    }) };
  const service = {}, queue = {};
  const context = (exports) => ({ exports, console, require: (path) => path.includes('async-storage') ? { default: storage } : path.endsWith('supabase') ? { supabase } : path.endsWith('/coaching/access') ? coachAccess : path.endsWith('deviceContent') ? deviceContent : path.endsWith('practiceContentService') ? { readPracticeBanks: async () => state.banks } : path.endsWith('contentTransport') ? contentTransport : path.endsWith('coachingService') ? service : path.endsWith('sessionState') ? sessionState : path.endsWith('/engine') ? engine : path.endsWith('performanceService') ? { performanceCache: { invalidate() {} } } : null });
  vm.runInNewContext(transpile('src/services/coachingService.js'), context(service));
  vm.runInNewContext(transpile('src/services/practiceAttemptQueue.js'), context(queue));
  return { state, values, writes, inserts, requests, service, queue };
}
const session = () => ({ id: 's1', version: 0, status: 'active', kind: 'practice', budgets: { vr: null },
  questions: ['q1', 'q2'].map((id) => ({ id, section: 'vr', choices: [{ value: 'A' }, { value: 'B' }], tag: {} })),
  progress: { ...initialProgress(), phase: 'paused', interrupted: true, answers: { q1: 'A' }, elapsed: { vr: 1200 } } });
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};
const tick = () => new Promise((resolve) => setImmediate(resolve));

test('coaching hydrates a compact response from the captured device bank during a background content update', async () => {
  const f = setup(); f.state.remote = session(); f.state.compactReply = true;
  f.state.snapshots = f.state.remote.questions.map((q) => ({ ...q, bankVersion: 1 }));
  f.state.banks = { verbal_reasoning: { version: 1, data: [{ id: 'passage', resource: 'Downloaded passage', questions: [
    { questionId: 'q1', questionText: 'Downloaded first question', options: ['A', 'B'] },
    { questionId: 'q2', questionText: 'Downloaded second question', options: ['A', 'B'] },
  ] }] } };
  f.state.remote.questions.forEach((q) => { q.parentId = 'passage'; });
  f.state.beforeReply = async () => { f.state.banks = { verbal_reasoning: { version: 2, data: [] } }; };
  const { session: loaded } = await f.service.coachRequest('alice', 'session', { id: 's1' });
  assert.deepEqual(JSON.parse(JSON.stringify(f.requests[0].contentVersions)), { verbal_reasoning: 1 });
  assert.equal(loaded.questions[0].context, 'Downloaded passage');
  assert.equal(loaded.questions[0].text, 'Downloaded first question');
  assert.equal(loaded.questions[0].contentRef, undefined);
  assert.equal(f.requests.length, 1);
});

test('a damaged bank falls back to the original server snapshot without repeating a save', async () => {
  const f = setup(); f.state.remote = session(); f.state.compactReply = true;
  f.state.snapshots = f.state.remote.questions.map((q) => ({ ...q, bankVersion: 1 }));
  f.state.banks = { verbal_reasoning: { version: 1, data: [{ id: 'corrupted' }] } };
  const { session: loaded } = await f.service.coachRequest('alice', 'session', { id: 's1' });
  assert.equal(f.requests.length, 2);
  assert.equal(Object.keys(f.requests[1].contentVersions).length, 0);
  assert.equal(loaded.questions[0].contentRef, undefined);
  assert.equal(loaded.questions[0].id, 'q1');
  await f.service.coachRequest('alice', 'save', { id: 's1', version: 0, progress: session().progress });
  assert.equal(f.requests.at(-1).contentVersions, undefined);
  assert.equal(f.writes.length, 1);
});

test('server defaults for unanswered questions do not create a false conflict', async () => {
  const f = setup(); await f.service.saveCoachCheckpoint('alice', session());
  f.state.remote = { ...session(), version: 1, progress: { ...session().progress,
    answers: { q1: 'A', q2: null }, flags: { q1: false, q2: false }, times: { q1: 0, q2: 0 } } };
  const loaded = await f.service.refreshCoachSession('alice', 's1');
  assert.equal(loaded.session.version, 1);
  assert.equal(loaded.dirty, false);
});

test('a lost save response recovers on retry without losing answers entered afterwards', async () => {
  const f = setup(); f.state.remote = session();
  await f.service.saveCoachCheckpoint('alice', session());
  f.state.dropSaveResponse = true;
  await assert.rejects(f.service.saveCoachSession('alice', session()));
  assert.equal(f.state.remote.version, 1, 'The server committed the request before the response was lost');
  // Match the defaults filled by validateProgress on the real server.
  Object.assign(f.state.remote.progress, { flags: { q1: false, q2: false }, times: { q1: 0, q2: 0 } });
  f.state.remote.progress.answers.q2 = null;
  const newer = session(); newer.progress.answers.q2 = 'B'; newer.progress.elapsed.vr = 2400;
  await f.service.saveCoachCheckpoint('alice', newer);
  f.state.dropSaveResponse = false;
  const saved = await f.service.saveCoachSession('alice', newer);
  assert.equal(saved.session.version, 2);
  assert.equal(saved.session.progress.answers.q2, 'B');
  assert.deepEqual(f.writes.map((write) => write.version), [0, 1]);
});

test('reopening after a lost save response rebases later local answers onto the acknowledged version', async () => {
  const f = setup(); f.state.remote = session(); f.state.dropSaveResponse = true;
  await f.service.saveCoachCheckpoint('alice', session());
  await assert.rejects(f.service.saveCoachSession('alice', session()));
  const newer = session(); newer.progress.answers.q2 = 'B';
  await f.service.saveCoachCheckpoint('alice', newer);
  f.state.dropSaveResponse = false;
  const loaded = await f.service.refreshCoachSession('alice', 's1');
  assert.equal(loaded.session.version, 1);
  assert.equal(loaded.session.progress.answers.q2, 'B');
  assert.equal(loaded.dirty, true);
  const saved = await f.service.saveCoachSession('alice', loaded.session);
  assert.equal(saved.session.version, 2);
});

test('divergent saves reconcile automatically using the active device answers', async () => {
  const f = setup(); f.state.remote = session(); f.state.dropSaveResponse = true;
  await f.service.saveCoachCheckpoint('alice', session());
  await assert.rejects(f.service.saveCoachSession('alice', session()));
  f.state.remote.progress.answers.q1 = 'B'; f.state.dropSaveResponse = false;
  f.state.remote.progress.answers.q2 = 'B';
  const saved = await f.service.saveCoachSession('alice', session());
  assert.equal(saved.session.progress.answers.q1, 'A');
  assert.equal(saved.session.progress.answers.q2, 'B');
  assert.equal(saved.session.version, 2);
});

test('answers entered during a session fetch survive its older response', async () => {
  const f = setup(), response = deferred(); f.state.remote = session();
  await f.service.saveCoachCheckpoint('alice', session(), false);
  f.state.beforeReply = (body) => body.action === 'session' ? response.promise : undefined;
  const loading = f.service.refreshCoachSession('alice', 's1'); await tick();
  const newer = session(); newer.progress.answers.q2 = 'B';
  await f.service.saveCoachCheckpoint('alice', newer);
  response.resolve();
  const loaded = await loading;
  assert.equal(loaded.session.progress.answers.q2, 'B');
  assert.equal(loaded.dirty, true);
  assert.equal((await f.service.readCoachSessionCache('alice', 's1')).session.progress.answers.q2, 'B');
});

test('opening a runner reads the device immediately while a hub upload is still pending', async () => {
  const f = setup(), response = deferred(); f.state.remote = session();
  await f.service.saveCoachCheckpoint('alice', session());
  f.state.beforeReply = (body) => body.action === 'save' ? response.promise : undefined;
  const flushing = f.service.flushCoachCheckpoints('alice'); await tick();
  const unregister = f.service.registerCoachSession('alice', 's1');
  let opened = false;
  const reading = f.service.readCoachSessionCache('alice', 's1').then((value) => { opened = true; return value; });
  await tick(); assert.equal(opened, true);
  const initial = await reading;
  assert.equal(initial.session.version, 0);
  assert.equal(initial.session.progress.answers.q1, 'A');
  response.resolve(); await flushing;
  const cached = await f.service.readCoachSessionCache('alice', 's1');
  assert.equal(cached.session.version, 1);
  assert.equal(cached.dirty, false);
  unregister();
});

test('background retries recover a lost acknowledgement and finish without a conflict prompt', async () => {
  const f = setup(); f.state.remote = session(); f.state.dropSaveResponse = true;
  await f.service.saveCoachCheckpoint('alice', session());
  await assert.rejects(f.service.flushCoachCheckpoints('alice'));
  f.state.dropSaveResponse = false;
  await f.service.flushCoachCheckpoints('alice');
  const cached = await f.service.readCoachSessionCache('alice', 's1');
  assert.equal(cached.dirty, false);
  assert.equal(cached.session.version, 2);
});

test('overlapping saves for the same set wait and reuse the acknowledged version', async () => {
  const f = setup(), response = deferred(); f.state.remote = session();
  await f.service.saveCoachCheckpoint('alice', session());
  f.state.beforeReply = (body) => body.action === 'save' ? response.promise : undefined;
  const first = f.service.saveCoachSession('alice', session()); await tick();
  const newer = session(); newer.progress.answers.q2 = 'B';
  await f.service.saveCoachCheckpoint('alice', newer);
  const second = f.service.saveCoachSession('alice', newer); await tick();
  assert.equal(f.writes.length, 1);
  response.resolve(); await first;
  const saved = await second;
  assert.equal(saved.session.version, 2);
  assert.equal(saved.session.progress.answers.q2, 'B');
  assert.deepEqual(f.writes.map((write) => write.version), [0, 1]);
});
test('offline checkpoints persist and never load through another account', async () => {
  const f = setup(); await f.service.saveCoachCheckpoint('alice', session()); f.state.offline = true;
  const loaded = await f.service.loadCoachSession('alice', 's1'); assert.equal(loaded.session.progress.answers.q1, 'A');
  assert.equal(f.requests.length, 0, 'Device loads do not make an auth or session request');
  f.state.user = 'bob'; await assert.rejects(f.service.loadCoachSession('bob', 's1'));
});
test('loading conflicting progress keeps local answers and account-only answers without a reload choice', async () => {
  const f = setup(); await f.service.saveCoachCheckpoint('alice', session());
  f.state.remote = { ...session(), version: 1, progress: { ...session().progress, answers: { q1: 'B', q2: 'B' } } };
  const loaded = await f.service.refreshCoachSession('alice', 's1');
  assert.equal(loaded.session.progress.answers.q1, 'A');
  assert.equal(loaded.session.progress.answers.q2, 'B');
  assert.equal(loaded.session.version, 1);
  assert.equal(loaded.dirty, true);
});

test('automatic reconciliation preserves closed sections and produces server-valid timing and completion', () => {
  const remote = session();
  remote.kind = 'assessment'; remote.version = 4; remote.budgets = { vr: 2, dm: 2 };
  remote.questions.push(...['d1', 'd2'].map((id) => ({ id, section: 'dm', tag: {}, choices: [{ value: 'A' }, { value: 'B' }] })));
  remote.progress = { ...initialProgress(), phase: 'running', sectionIndex: 1, index: 2, closedSections: ['vr'],
    answers: { q1: 'A', q2: 'B', d1: 'B' }, elapsed: { vr: 2000, dm: 1200 },
    times: { q1: 1000, q2: 1000, d1: 1000 }, flags: { q1: true } };
  const local = structuredClone(remote);
  local.version = 3; local.progress.phase = 'finished'; local.progress.closedSections = ['vr', 'dm'];
  local.progress.answers = { q1: 'B', q2: 'A', d2: 'A' };
  local.progress.times = { q1: 0, q2: 0, d2: 1000 };
  const merged = sessionState.reconcileCoachSession(remote, local);
  const validated = validateProgress(remote, merged.progress);
  assert.equal(merged.version, 4);
  assert.equal(validated.answers.q1, 'A', 'A closed section cannot be changed by an older device');
  assert.equal(validated.answers.d1, 'B', 'Keep answers found only in the account copy');
  assert.equal(validated.answers.d2, 'A');
  assert.equal(validated.times.d1, 1000);
  assert.equal(validated.times.d2, 200, 'Concurrent question times cannot exceed working time');
  assert.equal(validated.phase, 'finished');
});

test('a device behind the current section moves forward automatically without reopening closed questions', () => {
  const remote = session(); remote.budgets.dm = null;
  remote.questions.push({ id: 'd1', section: 'dm', choices: [{ value: 'A' }], tag: {} });
  remote.progress = { ...initialProgress(), phase: 'running', sectionIndex: 1, index: 2, closedSections: ['vr'],
    answers: { q1: 'B' }, elapsed: { vr: 1200, dm: 0 }, times: {}, flags: {} };
  const merged = sessionState.reconcileCoachSession(remote, session());
  assert.equal(merged.progress.sectionIndex, 1);
  assert.equal(merged.progress.index, 2);
  assert.equal(merged.progress.answers.q1, 'B');
  assert.doesNotThrow(() => validateProgress(remote, merged.progress));
});

test('a completed report is authoritative when another device still has unfinished progress', () => {
  const remote = { ...session(), status: 'completed', report: { sections: [] } };
  assert.equal(sessionState.reconcileCoachSession(remote, session()), remote);
});
test('lost save acknowledgements reconcile despite Postgres JSON key ordering', async () => {
  const f = setup(); await f.service.saveCoachCheckpoint('alice', session());
  f.state.remote = { ...session(), version: 1, progress: Object.fromEntries(Object.entries(session().progress).reverse()) };
  const saved = await f.service.refreshCoachSession('alice', 's1'); assert.equal(saved.dirty, false); assert.equal(saved.session.version, 1);
});
test('background upload leaves an open runner alone and preserves completed offline work', async () => {
  const f = setup(); const s = session(); s.progress.phase = 'finished'; await f.service.saveCoachCheckpoint('alice', s); f.state.remote = session();
  const unregister = f.service.registerCoachSession('alice', 's1'); await f.service.flushCoachCheckpoints('alice'); assert.equal(f.writes.length, 0);
  unregister(); await f.service.flushCoachCheckpoints('alice'); assert.equal(f.writes.length, 1);
  const saved = await f.service.loadCoachSession('alice', 's1'); assert.equal(saved.session.status, 'completed'); assert.equal(saved.dirty, false);
});
test('practice attempts retain stable IDs offline, stay account scoped and clear only after upload', async () => {
  const f = setup(); f.state.offline = true;
  await f.queue.queuePracticeAttempt({ user_id: 'alice', question_id: 'q1', selected_answer: 'A' }); await tick(); assert.equal(f.values.size, 1);
  f.state.offline = false; f.state.user = 'bob'; await f.queue.flushPracticeAttempts('alice'); assert.equal(f.inserts.length, 0);
  f.state.user = 'alice'; await f.queue.flushPracticeAttempts('alice'); assert.equal(f.inserts.length, 1); assert.equal(f.values.size, 0);
  await f.queue.flushPracticeAttempts('alice'); assert.equal(f.inserts.length, 1);
});
test('practice backlog drains in bounded batches and retries without dropping another account', async () => {
  const f = setup();
  for (let i = 0; i < 125; i++) f.values.set(`practice_upload_v1:alice:${i}`,
    JSON.stringify({ id: `attempt-${i}`, user_id: 'alice', question_id: 'q1' }));
  f.values.set('practice_upload_v1:bob:one', JSON.stringify({ id: 'bob-one', user_id: 'bob' }));
  f.state.offline = true;
  await assert.rejects(f.queue.flushPracticeAttempts('alice'));
  assert.equal(f.values.size, 126);
  f.state.offline = false;
  await f.queue.flushPracticeAttempts('alice');
  assert.equal(f.inserts.length, 125);
  assert.equal(f.values.size, 1);
  assert.ok(f.values.has('practice_upload_v1:bob:one'));
});
test('coaching reset removes only the signed-in student\'s local coaching data after server success', async () => {
  const f = setup();
  await f.service.saveCoachCheckpoint('alice', session());
  await f.service.saveCoachCheckpoint('bob', { ...session(), id: 'bob-session' });
  f.values.set('coach_preferences_v1:alice', 'queued');
  f.values.set('coach_preferences_v1:bob', 'keep');
  f.values.set('unrelated', 'keep');
  f.state.offline = true;
  await assert.rejects(f.service.resetCoachProgress('alice'));
  assert.ok(f.values.has('coach_checkpoint_v1:alice:s1'), 'offline reset keeps unfinished progress');
  f.state.offline = false;
  await f.service.resetCoachProgress('alice');
  assert.equal(f.requests.at(-1).confirm, 'DELETE_COACHING_DATA');
  assert.ok(!f.values.has('coach_checkpoint_v1:alice:s1'));
  assert.ok(!f.values.has('coach_preferences_v1:alice'));
  assert.ok(f.values.has('coach_checkpoint_v1:bob:bob-session'));
  assert.ok(f.values.has('coach_preferences_v1:bob'));
  assert.ok(f.values.has('unrelated'));
  await assert.rejects(f.service.loadCoachSession('alice', 's1'), /could not be found/);
});
test('cached coaching dashboards are account scoped and cleared by a reset', async () => {
  const f = setup();
  const alice = { profile: { summary: 'Alice progress' }, settings: { exam_date: null, time_multiplier: 1 } };
  const bob = { profile: { summary: 'Bob progress' }, settings: { exam_date: null, time_multiplier: 1 } };
  await f.service.saveCoachHubCache('alice', alice);
  await f.service.saveCoachHubCache('bob', bob);
  assert.equal((await f.service.loadCoachHubCache('alice')).profile.summary, 'Alice progress');
  await f.service.resetCoachProgress('alice');
  assert.equal(await f.service.loadCoachHubCache('alice'), null);
  assert.equal((await f.service.loadCoachHubCache('bob')).profile.summary, 'Bob progress');
});
test('local preferences stay available when account sync is offline', async () => {
  const f = setup(); f.state.offline = true;
  await f.service.queueCoachPreferences('alice', { examDate: '2027-06-01', timeMultiplier: 1.25 });
  assert.deepEqual(JSON.parse(f.values.get('coach_preferences_v1:alice')), { examDate: '2027-06-01', timeMultiplier: 1.25 });
  f.state.offline = false;
  await f.service.flushCoachPreferences('alice');
  assert.equal(f.values.has('coach_preferences_v1:alice'), false);
  assert.equal(f.requests.at(-1).timeMultiplier, 1.25);
});

test('acknowledging a plan preserves the dashboard saved on the device', async () => {
  for (const action of ['acknowledge_plan']) {
    const f = setup();
    const welcome = { profile: null, baseline: null, settings: {} };
    await f.service.saveCoachHubCache('alice', welcome);
    await f.service.saveCoachHubCache('bob', welcome);
    f.state.remote = session();
    await f.service.coachRequest('alice', action, { id: 's1', version: 0, progress: { phase: 'finished' } });
    assert.ok(await f.service.loadCoachHubCache('alice'));
    assert.equal(f.values.has('coach_hub_v1:alice'), true);
    assert.equal((await f.service.loadCoachHubCache('bob')).profile, null);
  }
});

test('local completion updates device history without clearing the dashboard or awaiting an upload', async () => {
  const f = setup(), s = session();
  await f.service.saveCoachHubCache('alice', { profile: { skills: [] }, settings: {}, active: { id: s.id }, history: [] });
  s.progress.phase = 'finished';
  s.offlineScoring = Object.fromEntries(s.questions.map((q) => [q.id, { tag: { section: 'vr', answer: 'A', parentId: 'p1' } }]));
  f.state.offline = true;
  await f.service.saveCoachCheckpoint('alice', s);
  const loaded = await f.service.loadCoachSession('alice', s.id);
  const hub = await f.service.loadCoachHubCache('alice');
  assert.equal(loaded.session.report.sections[0].earned, 1);
  assert.equal(loaded.dirty, true);
  assert.equal(hub.active, null);
  assert.equal(hub.history[0].id, s.id);
  assert.equal(hub.history[0].report.sections[0].earned, 1);
  assert.equal(f.requests.length, 0);
  await f.service.saveCoachHubCache('alice', { profile: {}, settings: {}, active: { id: s.id }, history: [] });
  const refreshed = await f.service.loadCoachHubCache('alice');
  assert.equal(refreshed.history[0].id, s.id, 'An older cloud dashboard cannot erase a local completion');
  assert.equal(refreshed.active, null);
});

test('practice submission resolves after the device write while the cloud upload remains blocked', async () => {
  const f = setup(), upload = deferred();
  f.state.beforeUpload = () => upload.promise;
  await f.queue.queuePracticeAttempt({ user_id: 'alice', question_id: 'q1', selected_answer: 'A' });
  await tick();
  assert.equal(f.values.size, 1);
  assert.equal(f.inserts.length, 0);
  upload.resolve(); await f.queue.flushPracticeAttempts('alice');
  assert.equal(f.inserts.length, 1);
  assert.equal(f.values.size, 0);
});

test('an old upload acknowledgement preserves answers entered after reopening on the same device', async () => {
  const f = setup(), response = deferred(); f.state.remote = session();
  await f.service.saveCoachCheckpoint('alice', session());
  f.state.beforeReply = (body) => body.action === 'save' ? response.promise : undefined;
  const uploading = f.service.saveCoachSession('alice', session()); await tick();
  const newer = session(); newer.progress.answers.q2 = 'B'; newer.progress.elapsed.vr = 2400;
  await f.service.saveCoachCheckpoint('alice', newer);
  const opened = await f.service.loadCoachSession('alice', 's1');
  assert.equal(opened.session.progress.answers.q2, 'B');
  response.resolve(); await uploading;
  const saved = await f.service.readCoachSessionCache('alice', 's1');
  assert.equal(saved.session.version, 1);
  assert.equal(saved.session.progress.answers.q2, 'B');
  assert.equal(saved.dirty, true);
});

test('an older download can gain device scoring in the background after the student has already finished', async () => {
  const f = setup(), response = deferred(); f.state.remote = session();
  f.state.remote.offlineScoring = Object.fromEntries(f.state.remote.questions.map((q) => [q.id, { tag: { section: 'vr', answer: 'A', parentId: 'p1' }, explanation: 'Downloaded explanation' }]));
  await f.service.saveCoachCheckpoint('alice', session());
  f.state.beforeReply = (body) => body.action === 'session' ? response.promise : undefined;
  const upgrading = f.service.refreshCoachSession('alice', 's1'); await tick();
  const finished = session(); finished.progress.phase = 'finished'; finished.progress.closedSections = ['vr'];
  await f.service.saveCoachCheckpoint('alice', finished);
  response.resolve();
  const loaded = await upgrading;
  assert.equal(loaded.session.progress.phase, 'finished');
  assert.equal(loaded.session.report.sections[0].earned, 1);
  assert.equal(loaded.session.questions[0].explanation, 'Downloaded explanation');
  assert.equal(loaded.dirty, true);
});

test('plan acknowledgements persist locally offline and upload later without a settings request', async () => {
  const f = setup(); f.state.offline = true;
  await f.service.queueCoachPreferences('alice', { planIntroSessionId: 's1' }); await tick();
  assert.equal(JSON.parse(f.values.get('coach_preferences_v1:alice')).planIntroSessionId, 's1');
  f.state.offline = false; await f.service.flushCoachPreferences('alice');
  assert.equal(f.values.has('coach_preferences_v1:alice'), false);
  assert.equal(f.requests.at(-1).action, 'acknowledge_plan');
  assert.equal(f.requests.some((request) => request.action === 'settings'), false);
});

test('unfinished saves and failed requests preserve the saved dashboard', async () => {
  const f = setup();
  await f.service.saveCoachHubCache('alice', { profile: null, settings: {} });
  f.state.remote = session();
  await f.service.coachRequest('alice', 'save', { id: 's1', version: 0, progress: { phase: 'paused' } });
  assert.ok(await f.service.loadCoachHubCache('alice'));
  f.state.offline = true;
  await assert.rejects(f.service.coachRequest('alice', 'acknowledge_plan', { id: 's1' }));
  assert.ok(await f.service.loadCoachHubCache('alice'));
});

const preparedNext = () => ({ ...session(), id: 's2', previousSessionId: 's1', progress: initialProgress() });

test('downgrade blocks both memory and disk prepared sets without deleting saved progress', async () => {
  const f = setup(); f.state.prepared = preparedNext();
  await f.service.prepareCoachNextSet('alice', session(), proSubscription);
  for (const subscription of [undefined, { isPro: false }, { ...proSubscription, loading: true }]) {
    assert.throws(() => f.service.takeCoachNextSet('alice', 's1', subscription), (error) => error.code === 'pro_required');
    await assert.rejects(f.service.prepareCoachNextSet('alice', session(), subscription), (error) => error.code === 'pro_required');
  }
  assert.equal(f.service.peekCoachNextSet('alice', 's1').id, 's2');
  const restarted = setup(f.values); restarted.state.offline = true;
  await assert.rejects(restarted.service.prepareCoachNextSet('alice', session(), { isPro: false }), (error) => error.code === 'pro_required');
  await assert.rejects(restarted.service.loadCoachSession('alice', 's2', { isPro: false }), (error) => error.code === 'pro_required');
  assert.equal(restarted.requests.length, 0, 'No server request is needed to block an offline bypass');
  await restarted.service.prepareCoachNextSet('alice', session(), proSubscription);
  assert.equal(restarted.service.takeCoachNextSet('alice', 's1', proSubscription).id, 's2', 'Restoring Pro can use the existing download');
});

test('a stale hub response cannot restore an already consumed free coached set', async () => {
  const f = setup();
  await f.service.saveCoachHubCache('alice', { settings: {}, previewAvailable: false });
  await f.service.saveCoachHubCache('alice', { settings: {}, previewAvailable: true, pro: true });
  assert.equal((await f.service.loadCoachHubCache('alice')).previewAvailable, false);
  const restarted = setup(f.values);
  assert.equal((await restarted.service.loadCoachHubCache('alice')).previewAvailable, false);
});

test('prefetch is deduplicated and stores a ready set without starting or uploading it', async () => {
  const f = setup(), download = deferred(); f.state.prepared = preparedNext();
  f.state.beforeReply = (body) => body.action === 'prepare_next' ? download.promise : undefined;
  const one = f.service.prepareCoachNextSet('alice', session(), proSubscription);
  const two = f.service.prepareCoachNextSet('alice', session(), proSubscription);
  assert.equal(one, two);
  download.resolve(); await one;
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].action, 'prepare_next');
  assert.equal(f.service.peekCoachNextSet('alice', 's1').id, 's2');
  const cached = await f.service.readCoachSessionCache('alice', 's2');
  assert.equal(cached.dirty, false);
  assert.equal(cached.session.progress.phase, 'instructions');
  assert.equal(f.writes.length, 0, 'Prefetch never saves an unanswered set to the account');
});

test('ready questions survive an app restart and can be opened offline with no network wait', async () => {
  const f = setup(); f.state.prepared = preparedNext();
  await f.service.prepareCoachNextSet('alice', session(), proSubscription);
  const restarted = setup(f.values); restarted.state.offline = true;
  await restarted.service.prepareCoachNextSet('alice', session(), proSubscription);
  assert.equal(restarted.requests.length, 0);
  const opened = restarted.service.takeCoachNextSet('alice', 's1', proSubscription);
  assert.equal(opened.id, 's2');
  assert.equal(opened.progress.phase, 'running');
  assert.equal(restarted.service.takeCoachNextSet('alice', 's1', proSubscription), null, 'A prepared set is consumed once');
  await tick();
  const checkpoint = await restarted.service.loadCoachSession('alice', 's2');
  assert.equal(checkpoint.dirty, true);
  assert.equal(checkpoint.session.progress.phase, 'running');
  assert.equal(restarted.values.has('coach_next_v1:alice:s1'), false);
});

test('claiming a next set uploads its predecessor first in the background and preserves newer answers', async () => {
  const f = setup(), upload = deferred(), previous = session();
  previous.progress.phase = 'finished'; previous.progress.closedSections = ['vr'];
  f.state.sessions = new Map([['s1', session()]]); f.state.prepared = preparedNext();
  await f.service.saveCoachCheckpoint('alice', previous);
  await f.service.saveCoachHubCache('alice', { profile: {}, settings: {}, active: { id: 's1' }, history: [] });
  await f.service.prepareCoachNextSet('alice', previous, proSubscription);
  f.state.beforeReply = (body) => body.action === 'save' && body.id === 's1' ? upload.promise : undefined;
  const next = f.service.takeCoachNextSet('alice', 's1', proSubscription);
  assert.equal(next.id, 's2');
  await tick();
  const newer = { ...next, progress: { ...next.progress, answers: { q2: 'B' } } };
  await f.service.saveCoachCheckpoint('alice', newer);
  const loaded = await f.service.loadCoachSession('alice', 's2');
  assert.equal(loaded.session.progress.answers.q2, 'B');
  assert.deepEqual(f.writes.map((write) => write.id), ['s1']);
  const localHub = await f.service.loadCoachHubCache('alice');
  assert.equal(localHub.active.id, 's2');
  await f.service.saveCoachHubCache('alice', { profile: {}, settings: {}, active: { id: 's1' }, history: [] });
  assert.equal((await f.service.loadCoachHubCache('alice')).active.id, 's2', 'A late cloud dashboard cannot hide the locally opened set');
  upload.resolve(); await tick(); await tick();
  const synced = await f.service.readCoachSessionCache('alice', 's2');
  assert.deepEqual(f.writes.map((write) => write.id), ['s1', 's2']);
  assert.equal(synced.session.progress.answers.q2, 'B');
  assert.equal(synced.dirty, true);
});

test('prepared sets stay account scoped and entitlement errors do not cache questions', async () => {
  const f = setup(); f.state.prepared = preparedNext();
  await f.service.prepareCoachNextSet('alice', session(), proSubscription);
  assert.equal(f.service.peekCoachNextSet('bob', 's1'), null);
  assert.equal(f.service.takeCoachNextSet('bob', 's1', proSubscription), null);
  f.state.prepareError = 'pro_required';
  await assert.rejects(f.service.prepareCoachNextSet('alice', { ...session(), id: 'another' }, proSubscription), (error) => error.code === 'pro_required');
  assert.equal(f.service.peekCoachNextSet('alice', 'another'), null);
  await f.service.clearCoachData();
  assert.equal(f.service.peekCoachNextSet('alice', 's1'), null);
  assert.equal([...f.values.keys()].some((key) => key.startsWith('coach_next_v1:')), false);
});

test('a bundled mock starts, completes, reopens and builds its first plan offline before any upload', async () => {
  const f = setup(); f.state.offline = true;
  const { session: started } = await f.service.startCoachSession('alice', 'assessment');
  assert.equal(started.questions.length, 48);
  assert.equal(started.localOrigin.formVersion, 'coach-intro-v2');
  assert.equal((await f.service.loadCoachHubCache('alice')).active.id, started.id);
  const finished = { ...started, progress: { ...started.progress, phase: 'finished', sectionIndex: 3, index: 47,
    closedSections: ['vr', 'dm', 'qr', 'sj'], answers: { [started.questions[0].id]: started.offlineScoring[started.questions[0].id].tag.answer } } };
  const saving = f.service.saveCoachCheckpoint('alice', finished);
  // Simulate pressing Back as soon as the report appears, during device writes.
  const returning = f.service.loadCoachHubCache('alice');
  await saving;
  assert.ok((await returning).profile);
  const reopened = setup(f.values); reopened.state.offline = true;
  const checkpoint = await reopened.service.loadCoachSession('alice', started.id);
  assert.ok(checkpoint.session.report);
  assert.equal(checkpoint.dirty, true);
  const hub = await reopened.service.loadCoachHubCache('alice');
  assert.ok(hub.profile); assert.equal(hub.active, null); assert.equal(hub.baseline.id, started.id);
  const plan = await reopened.service.loadCoachInitialPlan('alice', started.id);
  assert.ok(plan.profile.plan.length); assert.ok(plan.report.sections.length === 4);
  assert.equal(reopened.requests.length, 0, 'Reopening results and the first plan never contacts the server');
  await reopened.service.saveCoachHubCache('alice', { settings: {}, profile: null, baseline: null, active: { id: started.id }, history: [] });
  assert.ok((await reopened.service.loadCoachHubCache('alice')).profile, 'A stale welcome response cannot hide the completed mock');
  const remote = { ...started, progress: initialProgress() }; delete remote.localOrigin;
  reopened.state.sessions = new Map(); reopened.state.deviceImports = new Map([[started.id, remote]]);
  reopened.state.offline = false;
  await reopened.service.flushCoachCheckpoints('alice');
  const synced = await reopened.service.readCoachSessionCache('alice', started.id);
  assert.equal(synced.dirty, false); assert.equal(synced.session.status, 'completed');
  assert.equal(reopened.requests[0].action, 'import_session');
  assert.equal(reopened.requests[0].id, started.id);
  assert.equal(reopened.writes.length, 1);
  await reopened.service.flushCoachCheckpoints('alice');
  assert.equal(reopened.writes.length, 1, 'Retry does not duplicate the completed mock');
});

test('offline settings survive a restart and an older cloud dashboard', async () => {
  const f = setup(); f.state.offline = true;
  await f.service.saveCoachHubCache('alice', { settings: { time_multiplier: 1 }, profile: {} });
  await f.service.queueCoachPreferences('alice', { timeMultiplier: 1.5, planIntroSessionId: 's1' });
  const reopened = setup(f.values); reopened.state.offline = true;
  const merged = await reopened.service.saveCoachHubCache('alice', { settings: { time_multiplier: 1 }, profile: {} });
  assert.equal(merged.settings.time_multiplier, 1.5);
  assert.equal(merged.settings.plan_intro_session_id, 's1');
});

test('multiple offline sessions upload in dependency order after restart with stable IDs', async () => {
  const f = setup(); f.state.offline = true; f.state.banks = sampleDeviceBanks();
  const ids = [];
  for (const kind of ['assessment', 'practice', 'practice', 'timed_check']) {
    const { session: started } = await f.service.startCoachSession('alice', kind, { section: 'vr' }, proSubscription);
    ids.push(started.id);
    const finished = { ...started, progress: { ...started.progress, phase: 'finished', sectionIndex: kind === 'assessment' ? 3 : 0,
      index: kind === 'assessment' ? 47 : 0, closedSections: kind === 'assessment' ? ['vr', 'dm', 'qr', 'sj'] : ['vr'] } };
    await f.service.saveCoachCheckpoint('alice', finished);
  }
  const values = new Map([...f.values].reverse());
  const reopened = setup(values);
  reopened.state.sessions = new Map();
  reopened.state.deviceImports = new Map(ids.map((id) => {
    const { session: local } = JSON.parse(values.get(`coach_checkpoint_v1:alice:${id}`));
    const remote = { ...local, report: null, progress: initialProgress() }; delete remote.localOrigin;
    return [id, remote];
  }));
  await reopened.service.flushCoachCheckpoints('alice');
  assert.deepEqual(reopened.writes.map((write) => write.id), ids);
  for (const id of ids) assert.equal((await reopened.service.readCoachSessionCache('alice', id)).dirty, false);
});

test('an interrupted dashboard write recovers the completed mock directly from device checkpoints', async () => {
  const baseline = deviceContent.createDeviceCoachSession({ id: 'finished-mock', kind: 'assessment', banks: {}, sessions: [] });
  baseline.progress = { ...baseline.progress, phase: 'finished', sectionIndex: 3, index: 47, closedSections: ['vr', 'dm', 'qr', 'sj'] };
  const f = setup(new Map([
    ['coach_hub_v1:alice', JSON.stringify({ settings: {}, profile: null, baseline: null, active: { id: baseline.id } })],
    ['coach_checkpoint_v1:alice:finished-mock', JSON.stringify({ session: baseline, dirty: true })],
  ]));
  f.state.offline = true;
  const recovered = await f.service.loadCoachHubCache('alice');
  assert.ok(recovered.profile); assert.equal(recovered.baseline.id, baseline.id);
  assert.equal(recovered.active, null);
  assert.equal(f.requests.length, 0);
});
