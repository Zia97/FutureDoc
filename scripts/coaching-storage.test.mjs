import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const transpile = (file) => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function setup() {
  const values = new Map(), writes = [], inserts = [], requests = [];
  const storage = { getItem: async (k) => values.get(k) ?? null, multiGet: async (keys) => keys.map((k) => [k,values.get(k) ?? null]), setItem: async (k, v) => { values.set(k, v); }, getAllKeys: async () => [...values.keys()], removeItem: async (k) => values.delete(k), multiRemove: async (keys) => keys.forEach((k) => values.delete(k)) };
  const state = { user: 'alice', offline: false, remote: null };
  const supabase = { auth: { getSession: async () => ({ data: { session: state.user ? { user: { id: state.user }, access_token: state.user } : null } }) },
    functions: { invoke: async (_fn, { body }) => {
      requests.push(body);
      if (state.offline) return { error: new Error('offline') };
      if (body.action === 'reset_progress') { state.remote = null; return { data: { ok: true } }; }
      if (body.action === 'session' && !state.remote) return { data: { error: 'session_not_found' } };
      if (body.action === 'save') { writes.push(body); state.remote = { ...state.remote, ...body, version: body.version + 1, status: body.progress.phase === 'finished' ? 'completed' : 'active' }; }
      return { data: { session: structuredClone(state.remote) } };
    } },
    rpc: (name, { p_attempts: rows }) => ({
      setHeader(_key, value) { assert.equal(value, `Bearer ${state.user}`); return this; },
      then(resolve, reject) {
        assert.equal(name, 'upload_practice_attempts'); assert.ok(rows.length <= 50);
        const result = state.offline ? { error: { code: 'offline' } } : {};
        if (!state.offline) rows.forEach((row) => { if (!inserts.some((r) => r.id === row.id)) inserts.push(row); });
        return Promise.resolve(result).then(resolve,reject);
      },
    }) };
  const service = {}, queue = {};
  const context = (exports) => ({ exports, console, require: (path) => path.includes('async-storage') ? { default: storage } : path.endsWith('supabase') ? { supabase } : path.endsWith('coachingService') ? service : path.endsWith('performanceService') ? { performanceCache: { invalidate() {} } } : null });
  vm.runInNewContext(transpile('src/services/coachingService.js'), context(service));
  vm.runInNewContext(transpile('src/services/practiceAttemptQueue.js'), context(queue));
  return { state, values, writes, inserts, requests, service, queue };
}
const session = () => ({ id: 's1', version: 0, status: 'active', progress: { phase: 'paused', answers: { q1: 'A' }, elapsed: { vr: 1200 } } });
test('offline checkpoints persist and never load through another account', async () => {
  const f = setup(); await f.service.saveCoachCheckpoint('alice', session()); f.state.offline = true;
  const loaded = await f.service.loadCoachSession('alice', 's1'); assert.equal(loaded.offline, true); assert.equal(loaded.session.progress.answers.q1, 'A');
  f.state.user = 'bob'; await assert.rejects(f.service.loadCoachSession('alice', 's1'), /sign in/);
});
test('conflicting devices do not silently overwrite unsynced answers', async () => {
  const f = setup(); await f.service.saveCoachCheckpoint('alice', session());
  f.state.remote = { ...session(), version: 1, progress: { ...session().progress, answers: { q1: 'B' } } };
  await assert.rejects(f.service.loadCoachSession('alice', 's1'), /another device/);
  assert.equal((await f.service.loadCoachSession('alice', 's1', true)).session.progress.answers.q1, 'B');
});
test('lost save acknowledgements reconcile despite Postgres JSON key ordering', async () => {
  const f = setup(); await f.service.saveCoachCheckpoint('alice', session());
  f.state.remote = { ...session(), version: 1, progress: { elapsed: { vr: 1200 }, answers: { q1: 'A' }, phase: 'paused' } };
  const saved = await f.service.loadCoachSession('alice', 's1'); assert.equal(saved.dirty, false); assert.equal(saved.session.version, 1);
});
test('background upload leaves an open runner alone and preserves completed offline work', async () => {
  const f = setup(); const s = session(); s.progress.phase = 'finished'; await f.service.saveCoachCheckpoint('alice', s); f.state.remote = session();
  const unregister = f.service.registerCoachSession('alice', 's1'); await f.service.flushCoachCheckpoints('alice'); assert.equal(f.writes.length, 0);
  unregister(); await f.service.flushCoachCheckpoints('alice'); assert.equal(f.writes.length, 1);
  const saved = await f.service.loadCoachSession('alice', 's1'); assert.equal(saved.session.status, 'completed'); assert.equal(saved.dirty, false);
});
test('practice attempts retain stable IDs offline, stay account scoped and clear only after upload', async () => {
  const f = setup(); f.state.offline = true;
  await assert.rejects(f.queue.queuePracticeAttempt({ user_id: 'alice', question_id: 'q1', selected_answer: 'A' })); assert.equal(f.values.size, 1);
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
