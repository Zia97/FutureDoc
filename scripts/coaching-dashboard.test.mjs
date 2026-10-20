import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardStory, recommendationReason, resumeSummary, sectionSnapshot } from '../src/lib/coaching/dashboard.js';

const baseline = { report: { sections: [{ section: 'dm', questions: 12, accuracy: 50 }] } };
const logic = { id: 'logic', label: 'Conditional logic', section: 'dm', accuracy: 50, questions: 12, confidence: 'established' };
const plan = [{ skillId: logic.id, section: 'dm', title: logic.label }];
const profile = (extra = {}) => ({ skills: [logic], plan, weaknesses: [logic], freshQuestions: 12, ...extra });

test('dashboard distinguishes a baseline from ongoing practice without inventing improvement', () => {
  const initial = buildDashboardStory(profile(), baseline, [{ kind: 'assessment' }]);
  assert.equal(initial.stage, 'starting');
  assert.equal(initial.improvement, null);
  assert.equal(initial.focus.sectionTitle, 'Decision Making');
  assert.match(initial.focus.reason, /marks to pick up/);
  assert.equal(buildDashboardStory(profile(), baseline, [{ kind: 'practice' }]).stage, 'building');
  assert.equal(buildDashboardStory(profile({ freshQuestions: 13 }), baseline).stage, 'building');
  assert.equal(buildDashboardStory(null, null).improvement, null);
});

test('focus gains take priority and practice and timed trends remain separate', () => {
  const stronger = { ...logic, id: 'another', label: 'Another skill', trend: { delta: 30, priorCount: 5, recentCount: 6 } };
  const focused = { ...logic, trend: { delta: 8, priorCount: 6, recentCount: 8 }, timedTrend: { delta: -4, priorCount: 7, recentCount: 9 } };
  const story = buildDashboardStory(profile({ skills: [stronger, focused] }), baseline);
  assert.equal(story.stage, 'improving');
  assert.equal(story.improvement.skill.id, 'logic');
  assert.equal(story.improvement.mode, 'practice');
  assert.equal(story.improvement.delta, 8);
  assert.equal(story.improvement.recentCount, 8);
  assert.ok(story.improvements.every((gain) => gain.mode !== 'timed'));
});

test('stale, flat, declining, missing or malformed trends cannot become gains', () => {
  for (const delta of [0, -10, null, undefined, NaN, '20']) {
    const story = buildDashboardStory(profile({ skills: [{ ...logic, trend: { delta } }] }), baseline);
    assert.equal(story.improvement, null);
  }
  const story = buildDashboardStory(profile({ skills: [{ ...logic, stale: true, trend: { delta: 25 } }] }), baseline);
  assert.equal(story.improvement, null);
  assert.match(story.focus.reason, /refresher/);
});

test('per-mode section scores use total possible marks, including partial credit', () => {
  const data = { skills: [
    { section: 'dm', practice: { earned: 2, possible: 2, questions: 1 }, timed: { earned: 0, possible: 2, questions: 1 } },
    { section: 'dm', practice: { earned: 1, possible: 8, questions: 8 } },
    { section: 'sj', practice: { earned: 0.5, possible: 1, questions: 1 } },
  ] };
  const practice = sectionSnapshot(data, baseline, 'practice');
  assert.equal(practice.find((s) => s.id === 'dm').accuracy, 30);
  assert.equal(practice.find((s) => s.id === 'dm').questions, 9);
  assert.equal(practice.find((s) => s.id === 'sj').accuracy, 50);
  assert.equal(practice.find((s) => s.id === 'vr').accuracy, null);
  assert.equal(sectionSnapshot(data, baseline, 'timed').find((s) => s.id === 'dm').accuracy, 0);
});

test('a zero section score is preserved and the mini mock is only a fallback', () => {
  const rows = sectionSnapshot({ sections: [{ section: 'dm', accuracy: 0, questions: 15 }] }, baseline);
  assert.equal(rows.find((s) => s.id === 'dm').accuracy, 0);
  assert.equal(rows.find((s) => s.id === 'dm').questions, 15);
  assert.equal(sectionSnapshot(null, baseline).find((s) => s.id === 'dm').accuracy, 50);
});

test('empty running sections fall back to mini mock results while populated sections keep updating', () => {
  const saved = { report: { sections: [
    { section: 'vr', accuracy: 75, questions: 12 },
    { section: 'dm', accuracy: 50, questions: 12 },
    { section: 'qr', accuracy: 0, questions: 12 },
    { section: 'sj', accuracy: 63, questions: 12 },
  ] } };
  const runningSections = saved.report.sections.map(({ section }) => ({ section, accuracy: null, questions: 0 }));
  const rows = sectionSnapshot({ runningSections }, saved);
  assert.deepEqual(rows.map(({ accuracy, questions }) => ({ accuracy, questions })),
    saved.report.sections.map(({ accuracy, questions }) => ({ accuracy, questions })));
  runningSections[1] = { section: 'dm', accuracy: 0, questions: 20 };
  assert.equal(sectionSnapshot({ runningSections }, saved)[1].accuracy, 0);
  assert.equal(sectionSnapshot({ runningSections }, saved)[1].questions, 20);
  assert.ok(sectionSnapshot({ runningSections: [] }, null).every((row) => row.accuracy === null));
});

test('resuming counts complete DM statement answers and describes the saved focus', () => {
  const active = { kind: 'practice', title: 'Decision Making · Conditional logic' };
  const session = { questions: [
    { id: 'a', section: 'dm', dm: { statements: ['one', 'two'] } },
    { id: 'b', section: 'dm', dm: { statements: ['one', 'two'] } },
    { id: 'c', section: 'dm' }, { id: 'd', section: 'dm' },
  ], progress: { answers: { a: { 0: 'Yes' }, b: { 0: 'No', 1: 'Yes' }, c: 'A', d: '' } } };
  const result = resumeSummary(session, active);
  assert.equal(result.title, 'Conditional logic');
  assert.equal(result.sectionTitle, 'Decision Making');
  assert.equal(result.detail, '2 of 4 questions answered');
  assert.equal(resumeSummary(null, active).section, 'dm');
  assert.equal(resumeSummary(null, null), null);
  assert.equal(resumeSummary(session, { ...active, kind: 'assessment' }).sectionTitle, 'All four UCAT sections');
});

test('recommendations give a practical next step without calculation details and tutor help is ignored', () => {
  assert.match(recommendationReason({ ...logic, questions: 3, confidence: 'early signal' }), /technique.*practice/);
  assert.doesNotMatch(recommendationReason(logic), /first attempts|confidence|early signal/);
  assert.doesNotMatch(recommendationReason({ ...logic, questions: 0, accuracy: null }), /weak|struggl/);
  const withHelp = buildDashboardStory(profile({ tutorHelp: { vr: 5 } }), baseline);
  assert.deepEqual(withHelp, buildDashboardStory(profile(), baseline));
});
