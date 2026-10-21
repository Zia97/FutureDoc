import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarketingDemoStore } from '../src/dev/marketingDemoStore.js';
import { buildMarketingDemo, marketingTimedRows, marketingPracticeData, marketingResultAnswers } from '../src/dev/marketingDemoData.js';
import skills from '../src/dev/marketingDemoSkills.js';
import { buildDashboardStory, sectionSnapshot } from '../src/lib/coaching/dashboard.js';
import { hasMarketingAccess } from '../src/lib/marketingAccess.js';

const now = Date.parse('2026-10-21T12:00:00Z');
function deviceStore(available = true) {
  const data = new Map([['real-progress', '{"accuracy":42}']]);
  const storage = { getItem: async (key) => data.get(key), setItem: async (key, value) => data.set(key, value) };
  return { data, store: createMarketingDemoStore({ storage, available }) };
}

test('toggling persists only the demo preference, restores immediately and notifies every screen', async () => {
  const { store, data } = deviceStore();
  let updates = 0;
  const unsubscribe = store.subscribe(() => updates++);
  assert.equal(store.getSnapshot(), false);
  await store.hydrate();
  const pending = store.setEnabled(true);
  assert.equal(store.getSnapshot(), true);
  await pending;
  await store.setEnabled(false);
  assert.equal(store.getSnapshot(), false);
  assert.equal(data.get('real-progress'), '{"accuracy":42}');
  assert.deepEqual([...data.keys()], ['real-progress', 'dev_marketing_demo']);
  assert.equal(updates, 3);
  unsubscribe();
});

test('a persisted preference works after restart and is ignored in release builds', async () => {
  for (const available of [true, false]) {
    const { store, data } = deviceStore(available);
    data.set('dev_marketing_demo', 'true');
    await store.hydrate();
    assert.equal(store.getSnapshot(), available);
    await store.setEnabled(false);
    assert.equal(data.get('dev_marketing_demo'), available ? 'false' : 'true');
  }
});

test('late hydration cannot overwrite a more recent toggle and disk writes preserve rapid-toggle order', async () => {
  let finishRead;
  const writes = [];
  const store = createMarketingDemoStore({ available: true, storage: {
    getItem: () => new Promise((resolve) => { finishRead = resolve; }),
    setItem: async (_key, value) => { writes.push(value); },
  } });
  const hydration = store.hydrate();
  const first = store.setEnabled(true), second = store.setEnabled(false), third = store.setEnabled(true);
  finishRead('false');
  await Promise.all([hydration, first, second, third]);
  assert.equal(store.getSnapshot(), true);
  assert.deepEqual(writes, ['true', 'false', 'true']);
});

test('production tester access is scoped to the approved account and revoked permissions cannot be enabled locally', async () => {
  const { store, data } = deviceStore(false);
  store.setAccess({ scope: 'tester', available: true });
  await store.hydrate(); await store.setEnabled(true);
  assert.equal(store.getSnapshot(), true);
  assert.equal(data.get('dev_marketing_demo:tester'), 'true');
  store.setAccess({ scope: 'student', available: false });
  await store.setEnabled(true);
  assert.equal(store.getSnapshot(), false);
  assert.equal(data.has('dev_marketing_demo:student'), false);
  store.setAccess({ scope: 'tester', available: true });
  await store.hydrate(); assert.equal(store.getSnapshot(), true);
  store.setAccess({ scope: 'tester', available: false });
  assert.equal(store.getSnapshot(), false);
});

test('an old account hydration cannot enable marketing for a different account', async () => {
  let complete;
  const store = createMarketingDemoStore({ available: false, storage: {
    getItem: () => new Promise((resolve) => { complete = resolve; }), setItem: async () => {},
  } });
  store.setAccess({ scope: 'tester', available: true });
  const hydration = store.hydrate();
  store.setAccess({ scope: 'student', available: false });
  complete('true'); await hydration;
  assert.equal(store.getSnapshot(), false);
});

test('tester permissions require a valid future expiry, independently of admin or Pro flags', () => {
  for (const expires of [null, undefined, '', true, 'invalid', new Date(now - 1).toISOString(), new Date(now).toISOString()]) {
    assert.equal(hasMarketingAccess(expires, now), false);
  }
  assert.equal(hasMarketingAccess(new Date(now + 1).toISOString(), now), true);
});

test('all report modes use the same skills and their displayed totals reconcile', () => {
  const sample = buildMarketingDemo(skills, now);
  assert.deepEqual(sample, buildMarketingDemo(skills, now));
  for (const report of Object.values(sample.reports)) {
    assert.equal(report.details.skills.length, skills.length);
    assert.equal(report.overview.questions, report.overview.sections.reduce((n, s) => n + s.questions, 0));
    assert.equal(report.overview.earned, report.details.skills.reduce((n, s) => n + s.earned, 0));
    assert.equal(report.overview.accuracy, Math.round(100 * report.overview.earned / report.overview.possible));
    for (const skill of report.details.skills) {
      assert.ok(skill.accuracy > 0 && skill.accuracy < 100);
      assert.ok(skill.supported && !skill.stale);
      assert.equal(skill.history.length, 6);
      assert.equal(skill.history.reduce((n, week) => n + week.questions, 0), skill.questions);
      assert.equal(skill.history.reduce((n, week) => n + week.earned, 0), skill.earned);
      assert.ok(skill.history.at(-1).accuracy > skill.history[0].accuracy);
      // Sample metrics must never provide question IDs to a real practice session.
      assert.deepEqual(skill.newQuestionIds, []);
      assert.deepEqual(skill.reviewQuestionIds, []);
    }
  }
  assert.equal(sample.reports.combined.overview.questions,
    ['practice', 'timed', 'coaching'].reduce((n, mode) => n + sample.reports[mode].overview.questions, 0));
});

test('coach strengths, weaknesses, plan and running accuracy tell the same improving story', () => {
  const { coach } = buildMarketingDemo(skills, now);
  const story = buildDashboardStory(coach.profile, coach.baseline, coach.history);
  assert.equal(story.stage, 'improving');
  assert.ok(coach.profile.strengths.every((s) => s.accuracy >= 80));
  assert.ok(coach.profile.weaknesses.every((s) => s.accuracy < 65));
  assert.equal(story.focus.skillId, coach.profile.weaknesses[0].id);
  assert.equal(story.recentSessions.length, 8);
  const sections = sectionSnapshot(coach.profile, coach.baseline);
  assert.equal(coach.profile.overallHistory.at(-1).accuracy, Math.round(sections.reduce((n, s) => n + s.accuracy, 0) / 4));
  assert.ok(coach.profile.overallHistory.at(-1).accuracy > coach.profile.overallHistory[0].accuracy);
});

test('legacy analytics provide chronological results, timing and matched cohort data in every section', () => {
  for (const section of ['vr', 'dm', 'qr', 'sj']) {
    const rows = marketingTimedRows(section, [], now);
    assert.equal(rows.length, 6);
    assert.ok(rows.at(-1).score_percent > rows[0].score_percent);
    assert.ok(Date.parse(rows.at(-1).submitted_at) <= now);
    for (const row of rows) {
      const summary = row.analytics_summary;
      assert.equal(summary.completion.answered, summary.completion.total);
      assert.equal(summary.difficulty.normal.total + summary.difficulty.hard.total, summary.completion.total);
    }
    const practice = marketingPracticeData(section, now);
    assert.equal(practice.rawAttempts.length, 180);
    for (const row of practice.rawAttempts) {
      assert.ok(practice.cohortByKey.has(`${row.question_id}:-1`));
      assert.ok(row.time_spent_ms > 500 && row.time_spent_ms < 600000);
    }
  }
});

test('result previews build disposable answers without changing original questions or stored answers', () => {
  const questions = Array.from({ length: 10 }, (_, id) => ({ id: `q${id}`, answer: 'A' }));
  const original = structuredClone(questions);
  const answers = marketingResultAnswers(questions);
  assert.equal(Object.values(answers).filter((a) => a === 'A').length, 8);
  assert.deepEqual(questions, original);
  const statement = [{ id: 'dm', statements: [{ answer: 'Yes' }, { answer: 'No' }] }];
  assert.deepEqual(marketingResultAnswers(statement).dm, { 0: 'Yes', 1: 'No' });
});
