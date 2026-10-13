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
  assert.deepEqual(result, { yourAccuracy: 100, cohortAccuracy: 60, matchedQuestions: 3, delta: 40 });
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
