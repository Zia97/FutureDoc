import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as mapping from '../src/lib/practiceContent.js';
import { compactCoachSession, hydrateCoachSession } from '../src/lib/coaching/contentTransport.js';
import { initialProgress, publicSession } from '../src/lib/coaching/engine.js';
import { LABEL_SETS } from '../src/constants/sjLabelSets.js';
import { createBoundedAsyncCache } from '../src/lib/boundedAsyncCache.js';

const sectionNames = ['verbal_reasoning', 'decision_making', 'quantitative_reasoning', 'situational_judgement'];
const shortNames = ['vr', 'dm', 'qr', 'sj'];
const methods = ['fetchAllVRPassagesPaginated', 'fetchAllDMQuestionsPaginated', 'fetchAllQRSetsPaginated', 'fetchAllSJScenariosPaginated'];
const maps = [mapping.mapPassages, mapping.mapQuestions, mapping.mapSets, mapping.mapScenarios];
const raw = shortNames.map((s) => JSON.parse(fs.readFileSync(`src/dev/preview-${s}.json`, 'utf8')));
const json = (value) => JSON.parse(JSON.stringify(value));
const tick = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; };
const transpile = (path) => ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

function fixture(existing = []) {
  const values = new Map(existing.map((i) => [`content_cache_${sectionNames[i]}`, JSON.stringify({ version: 1, data: maps[i](raw[i]) })]));
  const state = { versions: [1, 1, 1, 1], calls: [], writes: [], offline: false, fail: null, failDisk: false };
  const storage = {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => { if (state.failDisk) throw Error('Disk full'); values.set(key, value); state.writes.push(key); },
    removeItem: async (key) => values.delete(key),
  };
  const db = {
    async getContentVersion(section) {
      if (state.checkGate) await state.checkGate;
      if (state.offline) throw Error('offline');
      return { version: state.versions[sectionNames.indexOf(section)] };
    },
    async getAllContentVersions() { return sectionNames.map((section, i) => ({ section, version: state.versions[i] })); },
  };
  methods.forEach((method, i) => { db[method] = async (progress) => {
    state.calls.push(i);
    if (state.downloadGate) await state.downloadGate;
    if (state.fail === i) throw Error('Interrupted');
    progress();
    state.afterFetch?.(i);
    return raw[i];
  }; });
  const cache = {}, service = {};
  const run = (path, exports, require) => vm.runInNewContext(transpile(path), { exports, require, console });
  run('src/services/contentCache.js', cache, () => ({ default: storage }));
  run('src/services/practiceContentService.js', service, (path) => {
    if (path.endsWith('dbQueries')) return { db };
    if (path.endsWith('withRetry')) return { withRetry: (fn) => fn() };
    if (path.endsWith('contentCache')) return cache;
    if (path.endsWith('practiceContent')) return mapping;
    throw Error(path);
  });
  return { values, state, cache, service, db, run };
}

test('first coaching setup reuses practice downloads and counts only banks stored on device', async () => {
  const f = fixture([0, 2]), progress = [];
  await f.service.ensureCoachQuestionBanks((value) => {
    progress.push(json(value));
    assert.equal(value.loaded, f.values.size);
  });
  assert.deepEqual(f.state.calls.sort(), [1, 3]);
  assert.equal(f.values.size, 4);
  assert.equal(progress[0].loaded, 2);
  assert.equal(progress.at(-1).ready, true);
  assert.equal(progress.at(-1).loaded, 4);
  assert.ok(progress.some((value) => value.section === 'Decision Making' && value.pages === 1));
  // Subsequent opens, including offline, are ready without awaiting versions.
  const network = deferred(); f.state.checkGate = network.promise;
  let ready = false;
  await f.service.ensureCoachQuestionBanks((value) => { ready = value.ready; });
  assert.equal(ready, true);
  network.resolve();
});

test('practice and coaching share an in-flight bank download and both receive progress', async () => {
  const f = fixture([1, 2, 3]), gate = deferred();
  f.state.downloadGate = gate.promise;
  const practiceProgress = [], coachProgress = [];
  const practice = f.service.syncPracticeContent(sectionNames[0], (value) => practiceProgress.push(value));
  const coach = f.service.ensureCoachQuestionBanks((value) => coachProgress.push(value));
  await tick(); assert.deepEqual(f.state.calls, [0]);
  gate.resolve(); await Promise.all([practice, coach]);
  assert.equal(f.state.calls.filter((i) => i === 0).length, 1);
  assert.ok(practiceProgress.some((value) => value.loaded === 1));
  assert.ok(coachProgress.some((value) => value.pages === 1));
  assert.deepEqual(json((await practice).data), maps[0](raw[0]));
});

test('interrupted setup and storage failures retry missing banks without losing completed downloads', async () => {
  const f = fixture(); f.state.fail = 1;
  await assert.rejects(f.service.ensureCoachQuestionBanks(), /Interrupted/);
  assert.equal(f.values.size, 1);
  f.state.fail = null; f.state.failDisk = true;
  await assert.rejects(f.service.ensureCoachQuestionBanks(), /Disk full/);
  assert.equal(f.values.size, 1);
  f.state.failDisk = false;
  await f.service.ensureCoachQuestionBanks();
  assert.equal(f.values.size, 4);
  assert.equal(f.state.calls.filter((i) => i === 0).length, 1);
});

test('refresh keeps the complete old bank until its replacement is stable and persisted', async () => {
  const f = fixture([0]); f.state.versions[0] = 2;
  f.state.afterFetch = () => {
    assert.equal(JSON.parse(f.values.get(`content_cache_${sectionNames[0]}`)).version, 1);
    f.state.versions[0] = 3;
  };
  await f.service.syncPracticeContent(sectionNames[0]);
  assert.equal(f.state.calls.length, 2, 'The bank changed during download, so the mixed version is discarded');
  assert.equal((await f.cache.getCached(sectionNames[0])).version, 3);
  f.state.offline = true;
  await assert.rejects(f.service.syncPracticeContent(sectionNames[0]), /offline/);
  assert.equal((await f.cache.getCached(sectionNames[0])).version, 3);
});

test('foreground version checks retain both practice and timed banks while refreshing in background', async () => {
  const f = fixture([0]); f.state.versions[0] = 2;
  f.values.set('content_cache_timed_verbal_reasoning', JSON.stringify({ version: 1, data: ['saved test'] }));
  const exports = {}, refreshing = [];
  f.run('src/services/contentUpdateService.js', exports, (path) => {
    if (path === 'react' || path === 'react-native' || path.endsWith('NetworkContext')) return {};
    if (path.endsWith('dbQueries')) return { db: { getAllContentVersions: async () => [
      { section: sectionNames[0], version: 2 }, { section: 'timed_verbal_reasoning', version: 2 },
    ] } };
    if (path.endsWith('contentCache')) return f.cache;
    return { syncPracticeContent: (section) => { refreshing.push(section); return Promise.resolve(); } };
  });
  assert.equal(await exports.forceContentVersionCheck(), 2);
  assert.deepEqual(refreshing, [sectionNames[0]]);
  assert.equal(f.values.size, 2);
  assert.equal((await f.cache.getCached(sectionNames[0])).version, 1);
});

test('post-download version checks cannot join or be overwritten by an older in-flight version query', async () => {
  const exports = {}, queries = [];
  vm.runInNewContext(transpile('src/lib/dbQueries.js'), { exports, require(path) {
    if (path.endsWith('boundedAsyncCache')) return { createBoundedAsyncCache };
    return { supabase: { from(table) {
      assert.equal(table, 'content_versions');
      return { select() { const request = deferred(); queries.push(request); return request.promise; } };
    } } };
  } });
  const older = exports.db.getContentVersion(sectionNames[0]); await tick();
  const fresh = exports.db.getContentVersion(sectionNames[0], { force: true }); await tick();
  assert.equal(queries.length, 2);
  queries[1].resolve({ data: [{ section: sectionNames[0], version: 2 }] });
  assert.equal((await fresh).version, 2);
  queries[0].resolve({ data: [{ section: sectionNames[0], version: 1 }] });
  assert.equal((await older).version, 1);
  assert.equal((await exports.db.getContentVersion(sectionNames[0])).version, 2);
  assert.equal(queries.length, 2);
});

function contentModule() {
  const exports = {};
  vm.runInNewContext(transpile('supabase/functions/ai-coach/content.ts'), { exports, require(path) {
    if (path.endsWith('sjLabelSets.js')) return { LABEL_SETS };
    if (path.endsWith('.json')) return { default: JSON.parse(fs.readFileSync('supabase/functions/ai-coach/assessment-v2.json', 'utf8')) };
    return {};
  } });
  return exports;
}

test('all four downloaded banks hydrate the same question content as server snapshots, including DM formats', async () => {
  const content = contentModule(), banks = {};
  for (let i = 0; i < 4; i++) {
    const section = shortNames[i], base = sectionNames[i];
    banks[base] = { version: 7, data: maps[i](raw[i]) };
    const tags = raw[i].flatMap((parent) => (section === 'dm' ? [parent] : parent[`${base}_questions`]).map((child) => ({
      id: child.id, parentId: parent.id, section, answer: child.correct_answer,
      statementAnswers: [...(child.decision_making_question_statements ?? [])].sort((a, b) => a.order_index - b.order_index).map((s) => s.correct_answer),
    })));
    const questions = await content.loadQuestions({ from(table) { return {
      select() { return table === 'content_versions' ? Promise.resolve({ data: [{ section: base, version: 7 }] }) : this; },
      in: async () => ({ data: raw[i] }),
    }; } }, tags);
    const full = publicSession({ id: 'set', kind: 'practice', status: 'active', progress: initialProgress(), questions });
    const compact = compactCoachSession(full, questions, { [base]: 7 });
    assert.ok(compact.questions.every((q) => q.contentRef));
    const hydrated = hydrateCoachSession(compact, banks);
    // Cache mappings normalise absent DM geometry to null and hideLabels to false.
    const normalise = (session) => json({ ...session, questions: session.questions.map((q) => ({ ...q, dm: q.dm && {
      ...q.dm, stimulusVennGeometry: q.dm.stimulusVennGeometry ?? null, hideLabels: q.dm.hideLabels ?? false,
      options: q.dm.options.map((o) => ({ ...o, vennConfig: o.vennConfig ?? null, vennGeometry: o.vennGeometry ?? null })),
    } })) });
    assert.deepEqual(normalise(hydrated), normalise(full), section);
    assert.equal('explanation' in hydrated.questions[0], false);
    assert.deepEqual(json(compactCoachSession(full, questions, { [base]: 6 })), json(full), 'Different bank versions retain frozen server content');
    assert.throws(() => hydrateCoachSession(compact, {}), /content_cache_miss/);
  }
});
