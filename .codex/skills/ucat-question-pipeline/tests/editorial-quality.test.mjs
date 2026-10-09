import test from 'node:test';
import assert from 'node:assert/strict';
import { editorialIssues, argumentPatternIssues } from '../scripts/editorial-quality.mjs';

test('unresolved editor deliberation is blocked, including nested statement explanations', () => {
  assert.equal(editorialIssues([{ statements: [{ answer_reason: 'Hmm. FLAG potential problem. Proceed with the keyed answer.' }] }]).length, 1);
  assert.equal(editorialIssues([{ answer_reason: 'The flag marks the final checkpoint.' }]).length, 0);
});

const batch = (keys) => keys.map((correct_answer) => ({
  type: 'recognising_assumptions', correct_answer,
  options: ['Yes; relevant.', 'No; somewhat relevant.', 'Yes; further relevant evidence.', 'No; direct evidence concerning the principal outcome.'].map((text, i) => ({ label: 'ABCD'[i], text })),
}));

test('a recurring correct-option length cue blocks a batch', () => {
  for (const key of ['A', 'D']) assert(argumentPatternIssues(batch(Array(8).fill(key))).some((issue) => issue.code === 'dm.argument_length_cue'));
});

test('varied correct lengths pass and tied options are not uniquely longest', () => {
  assert.equal(argumentPatternIssues(batch([...('ABCDABCD')])).length, 0);
  const input = batch(Array(8).fill('D'));
  input.forEach((q) => q.options.forEach((o) => { o.text = 'Same word count'; }));
  assert.equal(argumentPatternIssues(input).length, 0);
});
