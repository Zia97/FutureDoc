import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { LABEL_SETS } from '../src/constants/sjLabelSets.js';
import { buildCoachProfile, buildSessionReport, initialProgress, publicSession, sessionEvidence, SECTION_SECONDS } from '../src/lib/coaching/engine.js';

const sections = ['vr', 'dm', 'qr', 'sj'];
const assessment = JSON.parse(fs.readFileSync('supabase/functions/ai-coach/assessment-v2.json', 'utf8'));
const batches = sections.map((section) => JSON.parse(fs.readFileSync(`src/data/performance/${section}-tags.json`, 'utf8')));
const catalogue = { skills: batches.flatMap((batch) => batch.skills.map((skill) => ({ ...skill, section: batch.section }))),
  questions: batches.flatMap((batch) => batch.questions.map((question) => ({ ...question, section: batch.section }))) };
function contentModule() {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync('supabase/functions/ai-coach/content.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, require(specifier) {
    if (specifier.endsWith('assessment-v2.json')) return { default: structuredClone(assessment) };
    if (specifier.endsWith('sjLabelSets.js')) return { LABEL_SETS };
    if (specifier.endsWith('coaching-data.ts')) return {};
    throw Error(specifier);
  } });
  return exports;
}

test('the private assessment has 48 new questions, complete groups and reviewed diagnostic coverage', () => {
  assert.equal(assessment.validation.status, 'PASS');
  assert.equal(assessment.questions.length, 48);
  const ids = new Set(), bankIds = new Set(catalogue.questions.map((question) => question.id));
  for (const section of sections) {
    const questions = assessment.questions.filter((question) => question.section === section);
    assert.equal(questions.length, 12);
    const provenance = assessment.validation.sections[section];
    assert.equal(provenance.reviewStatus, 'PASS');
    assert.match(provenance.candidateSha256, /^[a-f0-9]{64}$/);
    assert.match(provenance.independentValidationSha256, /^[a-f0-9]{64}$/);
    assert.ok(provenance.corpusRunId);
    const parents = new Set(questions.map((question) => question.parentId));
    assert.equal(parents.size, section === 'dm' ? 12 : section === 'sj' ? 4 : 3);
    for (const question of questions) {
      assert.ok(!ids.has(question.id) && !bankIds.has(question.id)); ids.add(question.id);
      assert.equal(question.tag.assessmentOnly, true); assert.equal(question.tag.source, assessment.id);
      assert.equal(question.tag.parentId, question.parentId);
      assert.ok(catalogue.skills.some((skill) => skill.id === question.tag.primarySkillId && skill.section === section));
      if (question.tag.statementAnswers) assert.equal(question.tag.statementAnswers.length, 5);
      else assert.ok(question.choices.some((choice) => choice.value === question.tag.answer));
    }
  }
  const dm = assessment.questions.filter((question) => question.section === 'dm');
  assert.equal(new Set(dm.map((question) => question.dm.type)).size, 6);
  for (const type of new Set(dm.map((question) => question.dm.type))) assert.equal(dm.filter((question) => question.dm.type === type).length, 2);
  const sjAnswers = new Set(assessment.questions.filter((question) => question.section === 'sj').map((question) => question.tag.answer));
  for (const scale of Object.values(LABEL_SETS)) for (const rating of scale) assert.ok(sjAnswers.has(rating), `Missing SJ rating ${rating}`);
});

test('assessment selection loads only private snapshots and rejects changed or mixed content', async () => {
  const content = contentModule();
  const selected = content.selectAssessment(catalogue, []);
  assert.equal(selected.id, 'coach-intro-v2'); assert.equal(selected.repeated, 0);
  assert.equal(content.selectAssessment(catalogue, [{ questionId: selected.tags[0].id }]).repeated, 1);
  const noDatabase = { from() { throw Error('Private assessment must not read the practice bank'); } };
  const questions = await content.loadQuestions(noDatabase, selected.tags);
  assert.equal(questions.length, 48);
  questions[0].tag.answer = 'Changed locally';
  assert.notEqual((await content.loadQuestions(noDatabase, selected.tags))[0].tag.answer, 'Changed locally');
  await assert.rejects(content.loadQuestions(noDatabase, [{ ...selected.tags[0], contentHash: 'changed' }]), /content_changed/);
  await assert.rejects(content.loadQuestions(noDatabase, [selected.tags[0], { ...selected.tags[1], assessmentOnly: false }]), /content_changed/);
  await assert.rejects(content.loadQuestions(noDatabase, [selected.tags[0], selected.tags[0]]), /content_changed/);
  assert.throws(() => content.selectAssessment({ skills: [], questions: [] }, []), /assessment_content_unavailable/);
});

test('private questions grade correctly, feed canonical skill evidence and hide keys until completion', async () => {
  const content = contentModule(), selected = content.selectAssessment(catalogue, []);
  const questions = await content.loadQuestions(null, selected.tags), progress = initialProgress();
  const session = { id: 'private-assessment', kind: 'assessment', status: 'active', questions, progress,
    budgets: SECTION_SECONDS, time_multiplier: 1, completed_at: '2026-10-17T12:00:00Z' };
  for (const question of questions) {
    progress.answers[question.id] = question.tag.statementAnswers
      ? Object.fromEntries(question.tag.statementAnswers.map((answer, index) => [index, answer])) : question.tag.answer;
    progress.times[question.id] = 12000;
  }
  progress.elapsed = Object.fromEntries(sections.map((section) => [section, 144000]));
  const active = publicSession(session);
  for (const question of active.questions) {
    for (const key of ['tag', 'answer', 'explanation', 'statementReasons', 'grade']) assert.equal(key in question, false);
    if (question.dm) assert.ok(question.dm.statements.every((statement) => Object.keys(statement).join() === 'text'));
  }
  const report = buildSessionReport(session);
  for (const section of report.sections) { assert.equal(section.questions, 12); assert.equal(section.earned, section.possible); }
  const profile = buildCoachProfile({ catalogue, rawEvidence: sessionEvidence(session), now: Date.parse(session.completed_at) });
  assert.equal(profile.freshQuestions, 48);
  assert.equal(profile.skills.reduce((count, skill) => count + skill.questions, 0), 48);
  session.status = 'completed';
  assert.ok(publicSession(session).questions.every((question) => question.answer != null && question.grade.earned === question.grade.possible));
});

test('ordinary coached practice continues loading the shared practice bank', async () => {
  const content = contentModule(), calls = [];
  const tag = { id: 'practice-question', parentId: 'practice-passage', section: 'vr', answer: 'A' };
  const client = { from(table) { calls.push(table); if (table === 'content_versions') return { select: async () => ({ data: [{ section: 'verbal_reasoning', version: 3 }], error: null }) }; return { select() { return this; }, async in(_column, ids) {
    assert.deepEqual(Array.from(ids), ['practice-passage']);
    return { error: null, data: [{ id: 'practice-passage', title: 'Practice', body: 'A passage', verbal_reasoning_questions: [
      { id: 'practice-question', order_index: 1, question_text: 'A question', correct_answer: 'A', options: ['A', 'B'], answer_reason: 'Reason' },
    ] }] };
  } }; } };
  const questions = await content.loadQuestions(client, [tag]);
  assert.deepEqual(calls, ['content_versions', 'verbal_reasoning_passages', 'content_versions']); assert.equal(questions[0].bankVersion, 3); assert.equal(questions[0].context, 'A passage');
  assert.equal(questions[0].tag.answer, 'A');
});
