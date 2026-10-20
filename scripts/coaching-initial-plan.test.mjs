import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInitialPlan } from '../src/lib/coaching/initialPlan.js';

const weak = { id: 'dm.logic', label: 'Conditional logic', section: 'dm', accuracy: 25, questions: 4, tip: 'Check each conclusion against the rules.' };
const strong = { id: 'vr.evidence', label: 'Finding evidence', section: 'vr', accuracy: 100, questions: 4 };
const report = { sections: [{ section: 'vr', accuracy: 100, answered: 12, questions: 12, seconds: 280, budgetSeconds: 360 }] };

test('the introduction follows the saved plan and explains observed and unexplored priorities honestly', () => {
  const profile = { skills: [weak, strong], plan: [
    { skillId: weak.id, title: weak.label, section: weak.section },
    { skillId: 'qr.ratios', title: 'Ratios', section: 'qr' },
  ] };
  const plan = buildInitialPlan(profile, report);
  assert.deepEqual(plan.priorities.map((item) => item.id), ['dm.logic', 'qr.ratios']);
  assert.match(plan.priorities[0].reason, /dropped marks.*Check each conclusion/);
  assert.match(plan.priorities[1].reason, /explore/);
  assert.doesNotMatch(plan.priorities[1].reason, /dropped marks|struggl/);
  assert.equal(plan.strength.title, strong.label);
  assert.equal(plan.pace, null);
});

test('perfect and zero-score mocks do not invent weaknesses or strengths', () => {
  const perfect = buildInitialPlan({ skills: [strong], plan: [{ skillId: strong.id, title: strong.label, section: 'vr' }] }, report);
  assert.doesNotMatch(perfect.priorities[0].reason, /dropped marks/);
  const zero = buildInitialPlan({ skills: [{ ...weak, accuracy: 0 }] }, { sections: [{ section: 'dm', accuracy: 0 }] });
  assert.equal(zero.strength, null);
  assert.equal(zero.priorities.length, 1);
  assert.deepEqual(buildInitialPlan(null, null), { priorities: [], strength: null, pace: null });
});

test('a relatively stronger section is distinguished from a strong skill on limited results', () => {
  const result = buildInitialPlan({ skills: [{ ...weak, questions: 1 }] }, { sections: [{ section: 'dm', accuracy: 25 }] });
  assert.equal(result.strength.heading, 'Your strongest section so far');
  assert.equal(result.strength.title, 'Decision Making');
  assert.doesNotMatch(result.strength.description, /handled.*well/);
});

test('pace guidance needs unanswered questions at the time limit and an uninterrupted mock', () => {
  const timed = { sections: [{ section: 'qr', accuracy: 50, answered: 8, questions: 12, seconds: 520, budgetSeconds: 520 }] };
  assert.equal(buildInitialPlan(null, timed).pace.section, 'Quantitative Reasoning');
  assert.equal(buildInitialPlan(null, { ...timed, interrupted: true }).pace, null);
  assert.equal(buildInitialPlan(null, { sections: [{ ...timed.sections[0], seconds: 400 }] }).pace, null);
  assert.equal(buildInitialPlan(null, { sections: [{ ...timed.sections[0], answered: 12 }] }).pace, null);
});
