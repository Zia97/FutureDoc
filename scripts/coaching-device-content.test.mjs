import test from 'node:test';
import assert from 'node:assert/strict';
import { deviceContent, sampleDeviceBanks } from './helpers/coaching-device-content.mjs';
import { initialProgress, localSessionResult, validateProgress } from '../src/lib/coaching/engine.js';

const banks = sampleDeviceBanks();
for (const section of ['vr', 'dm', 'qr', 'sj']) test(`${section}: downloaded questions support offline practice, timing, results and mistake review`, () => {
  const create = (kind, sessions = []) => deviceContent.createDeviceCoachSession({ id: `${section}-${kind}`,
    kind, focus: { section }, banks, sessions, settings: { time_multiplier: 1.25 } });
  const session = create('practice');
  assert.ok(session.questions.length > 0);
  assert.ok(session.questions.every((q) => q.section === section));
  assert.equal(session.budgets[section], null);
  assert.equal(session.localOrigin.contentHashes.length, session.questions.length);
  assert.ok(session.localOrigin.contentHashes.every(Boolean));
  const progress = { ...initialProgress(), phase: 'finished', closedSections: [section] };
  const serverShape = { ...session, questions: session.questions.map((q) => ({ ...q, tag: session.offlineScoring[q.id].tag })) };
  assert.equal(validateProgress(serverShape, progress).phase, 'finished');
  const finished = localSessionResult({ ...session, progress });
  assert.equal(finished.report.sections[0].earned, 0);
  assert.ok(finished.questions.every((q) => q.explanation === 'Downloaded explanation'));
  const review = create('review', [finished]);
  assert.ok(review.questions.some((q) => session.questions.some((prior) => q.id === prior.id)));
  const timed = create('timed_check', [finished]);
  assert.ok(timed.budgets[section] > 0);
  assert.ok(timed.questions.every((q) => !session.questions.some((prior) => prior.id === q.id)), 'Next practice avoids completed device questions');
});

test('missing or incomplete banks cannot create partial question groups', () => {
  assert.throws(() => deviceContent.createDeviceCoachSession({ id: 'missing', kind: 'practice',
    focus: { section: 'vr' }, banks: {}, sessions: [] }), /question_pool_exhausted/);
  const partial = structuredClone(banks);
  partial.verbal_reasoning.data = partial.verbal_reasoning.data.slice(0, 1);
  partial.verbal_reasoning.data[0].questions.pop();
  assert.throws(() => deviceContent.createDeviceCoachSession({ id: 'partial', kind: 'practice',
    focus: { section: 'vr' }, banks: partial, sessions: [] }), /question_pool_exhausted/);
});
