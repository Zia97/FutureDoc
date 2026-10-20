import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPerformanceReport } from '../src/lib/performance/engine.js';

function report({ section = 'qr', mode = 'practice', question = {}, answer = 'A', cohortAnswers = [{ answer: 'A', count: 3 }, { answer: 'B', count: 2 }], count = 3, extra = [] } = {}) {
  const questions = Array.from({ length: count }, (_, i) => ({ section, mode, id: `q${i}`, answer: 'A', ...question }));
  const attempts = questions.map((q) => ({ id: q.id, questionId: q.id, section, mode, selectedAnswer: answer, answeredAt: '2026-01-01T00:00:00Z' }));
  const cohort = { rows: questions.map((q) => ({ questionId: q.id, section, mode, answers: cohortAnswers })).concat(extra) };
  return buildPerformanceReport({ catalogue: { questions, skills: [] }, attempts, cohort, mode }).overview.sections.find((s) => s.section === section).cohort;
}

test('free users see matched cohort comparison without unrelated questions changing it', () => {
  const result = report({ extra: [{ section: 'qr', mode: 'practice', questionId: 'unattempted', answers: [{ answer: 'B', count: 10000 }] }] });
  assert.deepEqual(result, { yourAccuracy: 100, cohortAccuracy: 60, matchedQuestions: 3, delta: 40, basis: 'matched', status: 'ready' });
});

test('small cohorts and sparse student samples do not show misleading percentages', () => {
  assert.equal(report({ count: 2 }).cohortAccuracy, null);
  assert.equal(report({ cohortAnswers: [{ answer: 'A', count: 4 }] }).cohortAccuracy, null);
  assert.equal(report({ question: { excludedReason: 'Invalid key' } }).cohortAccuracy, null);
});

test('SJ cohort comparison includes the same partial credit as the student', () => {
  const result = report({ section: 'sj', question: { answer: 'Very important', options: ['Very important', 'Important', 'Of minor importance', 'Not important'] },
    answer: 'Important', cohortAnswers: [{ answer: 'Very important', count: 2 }, { answer: 'Important', count: 3 }] });
  assert.equal(result.yourAccuracy, 50);
  assert.equal(result.cohortAccuracy, 70);
  assert.equal(result.delta, -20);
});

test('timed DM statement groups use whole-question partial credit for both sides', () => {
  const all = { 0: 'Yes', 1: 'No', 2: 'Yes', 3: 'No', 4: 'Yes' }, partial = { ...all, 4: 'No' };
  const result = report({ section: 'dm', mode: 'timed', question: { statementAnswers: Object.values(all) }, answer: partial,
    cohortAnswers: [{ answer: all, count: 3 }, { answer: partial, count: 2 }] });
  assert.equal(result.yourAccuracy, 50);
  assert.equal(result.cohortAccuracy, 80);
});

test('practice distributions cannot be used as timed cohort data', () => {
  const result = report({ mode: 'timed', cohortAnswers: [], extra: Array.from({ length: 3 }, (_, i) => ({ section: 'qr', mode: 'practice', questionId: `q${i}`, answers: [{ answer: 'A', count: 10 }] })) });
  assert.equal(result.cohortAccuracy, null);
});

test('a section average remains available when enough students answered different questions', () => {
  const qs = Array.from({ length: 6 }, (_, i) => ({ id: `q${i}`, section: 'vr', mode: 'practice', answer: 'A' }));
  const attempts = qs.slice(0, 3).map((q) => ({ id: q.id, questionId: q.id, section: 'vr', mode: 'practice', selectedAnswer: 'A', answeredAt: '2026-01-01' }));
  const cohort = { groups: [{ section: 'vr', mode: 'practice', students: 5 }], rows: qs.slice(3).map((q) => ({ questionId: q.id, section: 'vr', mode: 'practice', answers: [{ answer: 'A', count: 2 }, { answer: 'B', count: 1 }] })) };
  const build = (data, rows = attempts) => buildPerformanceReport({ catalogue: { questions: qs, skills: [] }, attempts: rows, cohort: data }).overview.sections[0].cohort;
  const result = build(cohort);
  assert.equal(result.basis, 'section');
  assert.equal(result.cohortAccuracy, 67);
  assert.equal(result.yourAccuracy, 100);
  assert.equal(result.matchedQuestions, 0);
  assert.equal(build({ ...cohort, groups: [{ section: 'vr', mode: 'practice', students: 4 }] }).status, 'insufficient_cohort');
  assert.equal(build(cohort, []).cohortAccuracy, 67, 'free students can see a section benchmark before attempting questions');
  assert.equal(build(cohort, []).status, 'needs_answers');
  assert.equal(build(null).status, 'unavailable');
});

test('mini mocks use private scoring snapshots and never borrow ordinary timed or practice cohorts', () => {
  const qs = Array.from({ length: 3 }, (_, i) => ({ id: `private${i}`, section: 'dm', answer: 'A', primarySkillId: 'dm.logic' }));
  const attempts = qs.map((tag) => ({ id: tag.id, questionId: tag.id, section: 'dm', mode: 'coaching', cohortMode: 'assessment', tag, kind: 'assessment', selectedAnswer: 'A', answeredAt: '2026-01-01' }));
  const rows = qs.map((tag) => ({ questionId: tag.id, section: 'dm', mode: 'assessment', tag, answers: [{ answer: 'A', count: 3 }, { answer: 'B', count: 2 }] }));
  const result = (cohortRows, data = attempts) => buildPerformanceReport({ catalogue: { questions: [], skills: [] }, attempts: data, cohort: { rows: cohortRows }, mode: 'coaching' }).overview.sections[1].cohort;
  assert.equal(result(rows).cohortAccuracy, 60);
  assert.equal(result(rows.map((row) => ({ ...row, mode: 'timed' }))).cohortAccuracy, null);
  assert.equal(result(rows, attempts.map((row) => ({ ...row, interrupted: true }))).cohortAccuracy, null);
});
