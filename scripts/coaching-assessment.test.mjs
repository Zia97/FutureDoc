import test from 'node:test';
import assert from 'node:assert/strict';
import { assessmentSectionItems, assessmentQuestionStatus } from '../src/lib/coaching/assessmentView.js';
import { tickProgress, advanceSection, pauseProgress } from '../src/lib/coaching/sessionState.js';
import { initialProgress, SECTION_SECONDS, validateProgress } from '../src/lib/coaching/engine.js';

function session() {
  return { kind: 'assessment', budgets: SECTION_SECONDS, progress: initialProgress(), questions:
    ['vr', 'dm', 'qr', 'sj'].flatMap((section) => Array.from({ length: 12 }, (_, index) => ({ id: `${section}-${index}`,
      section, parentId: `${section}-parent-${Math.floor(index / 4)}`, choices: [{ value: 'A' }, { value: 'B' }],
      tag: { answer: 'A' }, ...(section === 'dm' && index === 0 ? { dm: { statements: Array(5).fill({ text: 'A statement' }) } } : {}) }))) };
}

test('assessment navigator resets numbering within each section and excludes closed questions', () => {
  const s = session();
  const vr = assessmentSectionItems(s);
  assert.equal(vr.length, 12); assert.equal(vr[0].flatIndex, 0); assert.equal(vr[11].sessionIndex, 11);
  assert.equal(vr[4].stemIndex, 1);
  s.progress = advanceSection(s, s.progress);
  const dm = assessmentSectionItems(s);
  assert.equal(dm.length, 12); assert.equal(dm[0].flatIndex, 0); assert.equal(dm[0].sessionIndex, 12);
  assert.ok(dm.every((item) => item.questionId.startsWith('dm-')));
});

test('question status distinguishes unseen, visited, partly completed statements and fully answered items', () => {
  const s = session(), seen = new Set(), q = s.questions[12];
  assert.equal(assessmentQuestionStatus(q, s.progress, seen), 'Unseen');
  seen.add(q.id); assert.equal(assessmentQuestionStatus(q, s.progress, seen), 'Incomplete');
  s.progress.answers[q.id] = { 0: 'Yes', 1: 'No', 2: 'Yes', 3: 'No' };
  assert.equal(assessmentQuestionStatus(q, s.progress, seen), 'Incomplete');
  s.progress.answers[q.id][4] = 'No'; assert.equal(assessmentQuestionStatus(q, s.progress, seen), 'Answered');
  s.progress.times['vr-0'] = 500; assert.equal(assessmentQuestionStatus(s.questions[0], s.progress, seen), 'Incomplete');
  s.progress.answers['vr-0'] = 'B'; assert.equal(assessmentQuestionStatus(s.questions[0], s.progress, seen), 'Answered');
});

test('section-review time consumes the timer without being attributed to the last question', () => {
  const s = session(); s.progress.phase = 'running';
  s.progress = tickProgress(s, 10000);
  s.progress = tickProgress(s, 15000, false);
  assert.equal(s.progress.elapsed.vr, 25000); assert.equal(s.progress.times['vr-0'], 10000);
  assert.equal(validateProgress({ ...s, progress: initialProgress() }, s.progress).times['vr-0'], 10000);
  s.progress = pauseProgress(s.progress); s.progress = tickProgress(s, 30000, false);
  assert.equal(s.progress.elapsed.vr, 25000);
});

test('four mini timed sections advance on expiry and retain answers and flags through pauses', () => {
  const s = session(); s.progress.answers['vr-0'] = 'A'; s.progress.flags['vr-0'] = true;
  for (const [index, section] of ['vr', 'dm', 'qr', 'sj'].entries()) {
    s.progress.phase = 'running'; s.progress = tickProgress(s, (SECTION_SECONDS[section] + 20) * 1000);
    assert.deepEqual(s.progress.closedSections, ['vr', 'dm', 'qr', 'sj'].slice(0, index + 1));
    assert.equal(s.progress.phase, index === 3 ? 'finished' : 'instructions');
  }
  assert.equal(s.progress.answers['vr-0'], 'A'); assert.equal(s.progress.flags['vr-0'], true);
});
