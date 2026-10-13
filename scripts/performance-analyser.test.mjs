import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPerformanceReport, gradeResponse, comparableTrend, choosePracticeQuestions } from '../src/lib/performance/engine.js';
import { profileHasPro, revenueCatHasPro } from '../src/lib/performance/access.js';
import { selectPracticeItems } from '../src/lib/performance/practice.js';
import { readAllPages } from '../src/lib/performance/pagination.js';

const NOW = Date.parse('2026-10-13T12:00:00Z');
const day = 86400000;
const skill = { id: 'qr.ratio', section: 'qr', label: 'Ratios' };
const question = (id, extra = {}) => ({ id, section: 'qr', mode: 'practice', parentId: `set-${id}`, primarySkillId: skill.id,
  confidence: 'high', difficulty: 'normal', answer: 'A', ...extra });
const attempt = (questionId, extra = {}) => ({ id: `attempt-${questionId}`, questionId, section: 'qr', mode: 'practice',
  selectedAnswer: 'A', answeredAt: new Date(NOW - day).toISOString(), timeMs: 12000, ...extra });
const report = (questions, attempts, extra = {}) => buildPerformanceReport({ catalogue: { skills: [skill], questions }, attempts, isPro: true, now: NOW, ...extra });

test('free report contains only basic breakdown, never skill IDs or practice selections', () => {
  const result = report([question('q1')], [attempt('q1')], { isPro: false });
  assert.equal(result.overview.accuracy, 100);
  assert.equal(result.details, null);
  assert.equal(result.access, 'free');
  assert.ok(!JSON.stringify(result).includes('qr.ratio'));
  assert.ok(!JSON.stringify(result).includes('q1'));
});

test('a correct retry does not inflate first-response score and clears mistake queue', () => {
  const result = report([question('q1')], [attempt('q1', { id: 'first', selectedAnswer: 'B', answeredAt: new Date(NOW - 2 * day).toISOString() }), attempt('q1', { id: 'retry' })]);
  assert.equal(result.overview.accuracy, 0);
  assert.equal(result.overview.questions, 1);
  assert.deepEqual(result.details.skills[0].reviewQuestionIds, []);
});

test('fresh drills use only unseen practice questions and preserve selected order', () => {
  const result = report([question('q1'), question('q2'), question('timed', { mode: 'timed' }), question('bad', { excludedReason: 'key mismatch' }), question('uncertain', { confidence: 'low' })], [attempt('q1')]);
  assert.deepEqual(choosePracticeQuestions(result.details.skills[0]), ['q2']);
  assert.deepEqual(selectPracticeItems([{ id: 'q1' }, { id: 'q2' }, { id: 'preview', isPreview: true }], ['q2', 'preview', 'q1', 'q2']).map((q) => q.id), ['q2', 'q1']);
  assert.deepEqual(selectPracticeItems([{ id: 'q1' }], []), []);
});

test('no answers produces an honest empty report', () => {
  const result = report([question('q1')], []);
  assert.equal(result.overview.accuracy, null);
  assert.equal(result.details.skills[0].status, 'Unexplored');
  assert.deepEqual(result.details.priorities, []);
});

test('many questions from one passage are insufficient independent evidence', () => {
  const qs = Array.from({ length: 12 }, (_, i) => question(`q${i}`, { parentId: 'one-passage' }));
  const result = report(qs, qs.map((q) => attempt(q.id, { selectedAnswer: 'B' })));
  assert.equal(result.details.skills[0].supported, false);
  assert.equal(result.details.skills[0].status, 'Early signal');
  assert.deepEqual(result.details.priorities, []);
});

test('enough distinct recent evidence creates a priority; stale evidence does not', () => {
  const qs = Array.from({ length: 12 }, (_, i) => question(`q${i}`));
  const recent = report(qs, qs.map((q) => attempt(q.id, { selectedAnswer: 'B' })));
  assert.deepEqual(recent.details.priorities, ['qr.ratio']);
  const stale = report(qs, qs.map((q) => attempt(q.id, { selectedAnswer: 'B', answeredAt: new Date(NOW - 40 * day).toISOString() })));
  assert.equal(stale.details.skills[0].status, 'Check again');
  assert.deepEqual(stale.details.priorities, []);
});

test('SJ adjacent ratings earn half marks and binary ratings do not invent partial credit', () => {
  const sj = question('sj', { section: 'sj', labelSet: 1, answer: 'Very important' });
  assert.deepEqual(gradeResponse(sj, 'Important'), { earned: 0.5, possible: 1 });
  assert.deepEqual(gradeResponse(sj, 'Not important at all'), { earned: 0, possible: 1 });
  assert.deepEqual(gradeResponse(question('qr'), 'B'), { earned: 0, possible: 1 });
});

test('DM full question partial marks are calculated using the statement key', () => {
  const q = question('dm', { section: 'dm', statementAnswers: ['Yes', 'No', 'Yes', 'No', 'Yes'] });
  assert.deepEqual(gradeResponse(q, { 0: 'Yes', 1: 'No', 2: 'Yes', 3: 'No', 4: 'No' }), { earned: 1, possible: 2 });
  assert.deepEqual(gradeResponse(q, { 0: 'Yes', 1: 'No', 2: 'Yes', 3: 'No', 4: 'Yes' }), { earned: 2, possible: 2 });
  assert.deepEqual(gradeResponse(q, null), { earned: 0, possible: 2 });
});

test('DM practice statements count as one question and never multiply whole-question timing', () => {
  const q = question('dm', { section: 'dm', statementAnswers: ['Yes', 'No', 'Yes', 'No', 'Yes'] });
  const rows = q.statementAnswers.map((answer, i) => attempt(q.id, { id: `statement-${i}`, section: 'dm', statementIndex: i, selectedAnswer: answer, timeMs: 45000 }));
  const result = report([q], rows);
  assert.equal(result.overview.questions, 1);
  assert.equal(result.overview.possible, 2);
  assert.equal(result.overview.accuracy, 100);
  assert.equal(result.overview.medianSeconds, 45);
  assert.equal(result.overview.timedQuestions, 1);
  const incomplete = report([q], rows.slice(0, 3));
  assert.equal(incomplete.overview.accuracy, null);
  assert.equal(incomplete.overview.excludedQuestions, 1);
});

test('untimed answers and timed answers stay separate even if question IDs overlap', () => {
  const qs = [question('same'), question('same', { mode: 'timed' })];
  const rows = [attempt('same'), attempt('same', { mode: 'timed', selectedAnswer: 'B' })];
  assert.equal(report(qs, rows).overview.accuracy, 100);
  assert.equal(report(qs, rows, { mode: 'timed' }).overview.accuracy, 0);
});

test('unknown timing is not zero and confirmed source defects are unscored', () => {
  const result = report([question('q1'), question('bad', { excludedReason: 'Wrong key' })], [attempt('q1', { timeMs: null }), attempt('bad', { selectedAnswer: 'B' })]);
  assert.equal(result.overview.accuracy, 100);
  assert.equal(result.overview.medianSeconds, null);
  assert.equal(result.overview.excludedQuestions, 1);
});

test('low-confidence tags contribute to basic marks but do not diagnose a skill', () => {
  const result = report([question('q1', { confidence: 'low' })], [attempt('q1')]);
  assert.equal(result.overview.accuracy, 100);
  assert.equal(result.details.skills[0].accuracy, null);
  assert.equal(result.details.excludedFromSkills, 1);
});

test('timed unanswered questions reduce marks but are excluded from response speed', () => {
  const result = report([question('q1', { mode: 'timed' })], [attempt('q1', { mode: 'timed', selectedAnswer: '', timeMs: 8000 })], { mode: 'timed' });
  assert.equal(result.overview.accuracy, 0);
  assert.equal(result.overview.medianSeconds, null);
});

test('a move to easier questions does not manufacture an improvement claim', () => {
  const rows = Array.from({ length: 6 }, (_, i) => ({ questionId: `hard${i}`, parentId: `hard${i}`, difficulty: 'hard', earned: 0, possible: 1, answeredAt: new Date(NOW - 20 * day).toISOString() }))
    .concat(Array.from({ length: 6 }, (_, i) => ({ questionId: `easy${i}`, parentId: `easy${i}`, difficulty: 'normal', earned: 1, possible: 1, answeredAt: new Date(NOW - day).toISOString() })));
  assert.equal(comparableTrend(rows, NOW), null);
  const matched = rows.map((r) => ({ ...r, difficulty: 'normal' }));
  assert.equal(comparableTrend(matched, NOW).delta, 100);
});

test('future and invalid-section attempts cannot influence the report', () => {
  const result = report([question('q1')], [attempt('q1', { answeredAt: new Date(NOW + day).toISOString() }), attempt('q1', { section: 'invalid' })]);
  assert.equal(result.overview.questions, 0);
});

test('subscription expiry, cancellation and trial access obey the active entitlement', () => {
  assert.equal(profileHasPro({ is_premium: true, premium_expires_at: new Date(NOW - 1).toISOString() }, NOW), false);
  assert.equal(profileHasPro({ is_premium: false }, NOW), false);
  assert.equal(profileHasPro({ is_admin: true }, NOW), true);
  assert.equal(revenueCatHasPro({ entitlements: { 'UCAT Genius AI Pro': { expires_date: new Date(NOW + day).toISOString() } } }, NOW), true);
  assert.equal(revenueCatHasPro({ entitlements: { 'UCAT Genius AI Pro': { expires_date: null } } }, NOW), true);
  assert.equal(revenueCatHasPro({ entitlements: { 'UCAT Genius AI Pro': { expires_date: new Date(NOW - 1).toISOString() } } }, NOW), false);
  assert.equal(revenueCatHasPro({}, NOW), false);
});

test('pagination reads beyond 1000 rows and propagates partial-read failures', async () => {
  const source = Array.from({ length: 1241 }, (_, id) => ({ id }));
  let page = 0;
  const factory = () => {
    let after = -1, limit = 0;
    const query = { order: () => query, limit: (n) => { limit = n; return query; }, gt: (_, n) => { after = n; return query; },
      then: (resolve) => { page++; resolve({ data: source.filter((row) => row.id > after).slice(0, limit), error: null }); } };
    return query;
  };
  const result = await readAllPages(factory);
  assert.equal(result.length, 1241);
  assert.equal(new Set(result.map((r) => r.id)).size, 1241);
  assert.equal(page, 3);
  await assert.rejects(readAllPages(() => { const query = { order: () => query, limit: () => query, then: (resolve) => resolve({ error: new Error('failed') }) }; return query; }), /failed/);
});

test('flattened targeted items keep their passage, diagram and original IDs', () => {
  const item = { stemId: 'set1', resource: 'passage text', stimulus: { type: 'table' }, question: { questionId: 'q1' } };
  assert.equal(selectPracticeItems([item], ['q1'])[0], item);
});
