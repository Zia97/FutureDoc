import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mapTimedDMTests } from '../../../../src/utils/dm/normalizeTimedDM.js';

test('timed DM preview maps canonical MCQ options for every question', () => {
  const preview = JSON.parse(fs.readFileSync('src/dev/preview-dm-timed.json', 'utf8'));
  const [testData] = mapTimedDMTests(preview, true);

  assert.equal(testData.questions.length, 35);
  for (const question of testData.questions) {
    const expectsOptions = ['logic_puzzle', 'recognising_assumptions', 'venn_diagram', 'probabilistic'].includes(question.type);
    if (expectsOptions) {
      assert.equal(question.options.length, 4, `Question ${question.questionId} should expose four options`);
      assert.deepEqual(question.options.map((option) => option.label), ['A', 'B', 'C', 'D']);
    }
  }
});

test('timed DM option precedence supports database, canonical preview, and generic shapes', () => {
  const base = { id: 'q', order_index: 1 };
  const wrapper = (question) => [{ id: 't', questions: [question] }];
  const option = (label, text) => ({ label, option_text: text, order_index: 1 });

  assert.equal(mapTimedDMTests(wrapper({ ...base, timed_decision_making_question_options: [option('A', 'database')] }))[0].questions[0].options[0].text, 'database');
  assert.equal(mapTimedDMTests(wrapper({ ...base, decision_making_question_options: [option('B', 'preview')] }))[0].questions[0].options[0].text, 'preview');
  assert.equal(mapTimedDMTests(wrapper({ ...base, options: [{ label: 'C', text: 'generic', order_index: 1 }] }))[0].questions[0].options[0].text, 'generic');
});
