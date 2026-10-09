import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimedExamQueue } from '../src/services/timedExamQueueCore.js';
import { createExamSubmission } from '../src/services/examSubmission.js';
import { shouldClaimQuestionSwipe } from '../src/utils/questionSwipe.js';
import { wrapChartLabel } from '../src/utils/chartLabels.js';

function deferred() {
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  return { promise, resolve };
}
function queueHarness(execute) {
  let stored = [];
  const queue = createTimedExamQueue({
    read: async () => structuredClone(stored),
    write: async (entries) => { stored = structuredClone(entries); },
    execute,
  });
  return { queue, stored: () => structuredClone(stored) };
}
const entry = (testKey, score = 1) => ({ userId: 'student', section: 'dm', op: 'submit', testKey, payload: { score } });

test('a pending upload never blocks saving another finished exam', async () => {
  const started = deferred(), network = deferred();
  const { queue, stored } = queueHarness(async () => { started.resolve(); await network.promise; });
  await queue.enqueue(entry(1));
  const upload = queue.flush({ id: 'student' });
  await started.promise;
  await queue.enqueue(entry(2));
  assert.equal(stored().length, 2);
  network.resolve();
  await upload;
  assert.equal(stored().length, 0);
});

test('a newer retake is uploaded after the old request and cannot be erased by it', async () => {
  const started = deferred(), network = deferred();
  const scores = [];
  const { queue, stored } = queueHarness(async (item) => {
    scores.push(item.payload.score);
    if (scores.length === 1) { started.resolve(); await network.promise; }
  });
  await queue.enqueue(entry(1, 10));
  const upload = queue.flush({ id: 'student' });
  await started.promise;
  await queue.enqueue(entry(1, 20));
  network.resolve();
  await upload;
  assert.deepEqual(scores, [10, 20]);
  assert.equal(stored().length, 0);
});

test('failed uploads and other users remain queued', async () => {
  const { queue, stored } = queueHarness(async () => { throw new Error('offline'); });
  await Promise.all([queue.enqueue(entry(1)), queue.enqueue({ ...entry(2), userId: 'another-student' })]);
  const result = await queue.flush({ id: 'student' });
  assert.equal(result.remaining, 1);
  assert.equal(stored().length, 2);
  assert.deepEqual([...await queue.pendingKeys('student', 'dm')], ['1']);
});

test('storage failures are reported to the caller instead of pretending to save', async () => {
  const queue = createTimedExamQueue({ read: async () => [], write: async () => { throw new Error('storage full'); }, execute: async () => {} });
  await assert.rejects(queue.enqueue(entry(1)), /storage full/);
});

test('manual finish and timer expiry submit once and only show results after persistence', async () => {
  const pending = deferred();
  const saved = [], states = [];
  let completed = 0;
  const submit = createExamSubmission({ save: async (attempt) => { saved.push(attempt); await pending.promise; }, onStateChange: (s) => states.push(s), onComplete: () => completed++ });
  const finishing = submit({ answer: 'B' });
  await submit({ answer: null });
  assert.equal(completed, 0);
  pending.resolve();
  await finishing;
  await submit({ answer: 'C' });
  assert.deepEqual(saved, [{ answer: 'B' }]);
  assert.equal(completed, 1);
  assert.deepEqual(states, ['saving', null]);
});

test('failed local save can retry the original answer snapshot', async () => {
  const saved = [], states = [];
  let completed = false;
  const submit = createExamSubmission({ save: async (attempt) => { saved.push(attempt); if (saved.length === 1) throw new Error('disk'); }, onStateChange: (s) => states.push(s), onComplete: () => { completed = true; } });
  await submit({ answer: 'A' });
  assert.equal(completed, false);
  await submit({ answer: 'D' });
  assert.deepEqual(saved, [{ answer: 'A' }, { answer: 'A' }]);
  assert.deepEqual(states, ['saving', 'error', 'saving', null]);
  assert.equal(completed, true);
});

test('answer taps with finger drift and vertical scrolling are not claimed as swipes', () => {
  for (const gesture of [{ dx: 20, dy: 2 }, { dx: 59, dy: 1 }, { dx: 90, dy: 80 }, { dx: 90, dy: 1, numberActiveTouches: 2 }]) {
    assert.equal(shouldClaimQuestionSwipe(gesture), false);
  }
  assert.equal(shouldClaimQuestionSwipe({ dx: -70, dy: 8 }), true);
});

test('marathon ranges wrap at narrow chart widths without losing values', () => {
  for (const label of ['Under 3:00', '3:00-3:29', '3:30-3:59', '4:00-4:29', '4:30-4:59', '5:00 or over']) {
    const lines = wrapChartLabel(label, 6);
    assert.ok(lines.every((line) => line.length <= 6));
    assert.equal(lines.join('').replace(/\s/g, ''), label.replace(/\s/g, ''));
  }
});
