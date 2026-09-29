import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { validateSectionCandidate } from '../scripts/section-validator-core.mjs';

test('valid DM practice candidate passes deterministic checks', () => {
  const input = [dmQuestion()];
  const report = validateSectionCandidate({ section: 'dm', input, modeHint: 'practice', expectedQuestions: 1 });
  assert.equal(report.deterministic_verdict, 'pass', JSON.stringify(report.issues));
});

test('DM statement questions require five independently explained answers', () => {
  const input = [dmQuestion({ type: 'syllogism', decision_making_question_options: [], decision_making_question_statements: [] })];
  const report = validateSectionCandidate({ section: 'dm', input, modeHint: 'practice' });
  assert.equal(report.deterministic_verdict, 'fail');
  assert(report.issues.some((issue) => issue.code === 'dm.statements'));
});

test('DM rejects malformed or non-renderable Venn config', () => {
  const q = dmQuestion({ type: 'venn_diagram' });
  q.decision_making_question_options[0].option_data = { nonsense: true };
  const report = validateSectionCandidate({ section: 'dm', input: [q], modeHint: 'practice' });
  assert.equal(report.deterministic_verdict, 'fail');
  assert(report.issues.some((issue) => issue.code === 'dm.venn_schema'));
});

test('valid QR practice candidate passes renderer and option checks', () => {
  const input = [{
    id: randomUUID(), title: 'Ferry passenger counts', is_free: true,
    stimulus: { type: 'table', context: 'Passenger totals by day.', data: { headers: ['Day', 'Adults'], rows: [['Mon', '120']] } },
    quantitative_reasoning_questions: [{
      id: randomUUID(), question_text: 'How many adults travelled on Monday?',
      options: ['100', '110', '120', '130', '140'].map((text, i) => ({ label: 'ABCDE'[i], text })),
      correct_answer: 'C', answer_reason: 'The Monday row gives 120 adults, so option C is correct.', order_index: 0, difficulty: 'normal',
    }],
  }];
  const report = validateSectionCandidate({ section: 'qr', input, modeHint: 'practice', expectedQuestions: 1 });
  assert.equal(report.deterministic_verdict, 'pass', JSON.stringify(report.issues));
});

test('QR rejects malformed chart dimensions', () => {
  const input = [{
    id: randomUUID(), title: 'Broken chart', is_free: true,
    stimulus: { type: 'bar_chart', context: 'Values.', data: { labels: ['A', 'B'], series: [{ name: 'X', values: [1] }] } },
    quantitative_reasoning_questions: [qrQuestion()],
  }];
  const report = validateSectionCandidate({ section: 'qr', input, modeHint: 'practice' });
  assert.equal(report.deterministic_verdict, 'fail');
  assert(report.issues.some((issue) => issue.code === 'qr.chart_length'));
});

test('QR rejects malformed geometry and descending numeric options', () => {
  const q = qrQuestion();
  q.options = ['5', '4', '3', '2', '1'].map((text, i) => ({ label: 'ABCDE'[i], text }));
  const input = [{
    id: randomUUID(), title: 'Broken geometry', is_free: true,
    stimulus: { type: 'geometry_diagram', context: 'A shape.', data: { shapes: [{ type: 'circle', cx: 2 }] } },
    quantitative_reasoning_questions: [q],
  }];
  const report = validateSectionCandidate({ section: 'qr', input, modeHint: 'practice' });
  assert.equal(report.deterministic_verdict, 'fail');
  assert(report.issues.some((issue) => issue.code === 'qr.geometry_number'));
  assert(report.issues.some((issue) => issue.code === 'qr.numeric_option_order'));
});

test('section brief enforces unit sizes and stimulus allocations', () => {
  const input = [qrSet()];
  const brief = {
    section: 'qr', mode: 'practice', question_count: 1, unit_count: 1,
    unit_question_counts: [2], difficulty_allocation: { normal_questions: 1, hard_questions: 0 },
    type_or_skill_allocation: { 'stimulus:bar_chart:sets': 1 },
  };
  const report = validateSectionCandidate({ section: 'qr', input, modeHint: 'practice', brief });
  assert.equal(report.deterministic_verdict, 'fail');
  assert(report.issues.some((issue) => issue.code === 'brief.unit_question_counts'));
  assert(report.issues.some((issue) => issue.code === 'brief.type.stimulus:bar_chart:sets'));
});

test('valid SJ practice candidate passes exact label checks', () => {
  const input = [{
    id: randomUUID(), is_free: true,
    body: 'A student notices that a confidential printout has been left beside a shared printer. Other people are entering the room.',
    situational_judgement_questions: [
      sjQuestion(0, 1, 'Very important'),
      sjQuestion(1, 2, 'A very appropriate thing to do'),
    ],
  }];
  const report = validateSectionCandidate({ section: 'sj', input, modeHint: 'practice', expectedQuestions: 2 });
  assert.equal(report.deterministic_verdict, 'pass', JSON.stringify(report.issues));
});

test('SJ rejects unsupported response formats and one-item scenarios', () => {
  const input = [{
    id: randomUUID(), is_free: true,
    body: 'A student sees a problem. The student considers what to do.',
    situational_judgement_questions: [{ ...sjQuestion(0, 3, 'Most appropriate') }],
  }];
  const report = validateSectionCandidate({ section: 'sj', input, modeHint: 'practice' });
  assert.equal(report.deterministic_verdict, 'fail');
  assert(report.issues.some((issue) => issue.code === 'sj.items_per_scenario'));
});

test('SJ rejects duplicate item wording', () => {
  const first = sjQuestion(0, 1, 'Very important');
  const second = { ...sjQuestion(1, 1, 'Important'), question_text: first.question_text };
  const report = validateSectionCandidate({ section: 'sj', input: [{ ...sjScenario(), situational_judgement_questions: [first, second] }], modeHint: 'practice' });
  assert.equal(report.deterministic_verdict, 'fail');
  assert(report.issues.some((issue) => issue.code === 'sj.duplicate_item'));
});

test('preview hooks mark local content and suppress remote submissions', () => {
  const checks = [
    ['src/hooks/queries/useVerbalReasoningPassages.js', 'isPreview'],
    ['src/hooks/queries/useDecisionMakingQuestions.js', 'isPreview'],
    ['src/hooks/queries/useQuantitativeReasoningSets.js', 'isPreview'],
    ['src/hooks/queries/useSituationalJudgementScenarios.js', 'isPreview'],
    ['src/hooks/attempts/useTimedVRExamProgress.js', 'test.isPreview || !user'],
    ['src/hooks/attempts/useTimedDMExamProgress.js', 'test.isPreview || !user'],
    ['src/hooks/attempts/useTimedQRExamProgress.js', 'test.isPreview || !user'],
    ['src/hooks/attempts/useTimedSJExamProgress.js', 'test.isPreview || !user'],
  ];
  for (const [relative, needle] of checks) {
    const source = fs.readFileSync(relative, 'utf8');
    assert(source.includes(needle), `${relative} should contain ${needle}`);
  }
});

test('practice SQL converters are fail-fast files and do not edit content versions', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ucat-section-sql-'));
  try {
    const corpusPath = path.join(dir, 'corpus.json');
    fs.writeFileSync(corpusPath, JSON.stringify({ run_id: 'test', units: [] }));
    const cases = [
      ['dm', [dmQuestion()], 'decision_making_questions'],
      ['qr', [qrSet()], 'quantitative_reasoning_sets'],
      ['sj', [sjScenario()], 'situational_judgement_scenarios'],
    ];
    for (const [section, candidate, table] of cases) {
      const candidatePath = path.join(dir, `${section}.json`);
      const briefPath = path.join(dir, `${section}.brief.json`);
      const outputPath = path.join(dir, `${section}.sql`);
      fs.writeFileSync(candidatePath, JSON.stringify(candidate));
      fs.writeFileSync(briefPath, JSON.stringify(briefFor(section, candidate)));
      execFileSync(process.execPath, [
        '.codex/skills/ucat-question-pipeline/scripts/section-practice-to-sql.mjs',
        candidatePath, '--section', section, '--corpus', corpusPath, '--brief', briefPath, '--output', outputPath,
      ], { cwd: process.cwd(), stdio: 'pipe' });
      const sql = fs.readFileSync(outputPath, 'utf8');
      assert(sql.includes(table));
      assert(sql.includes('BEGIN;'));
      assert(sql.includes('COMMIT;'));
      assert(!sql.includes('UPDATE content_versions'));
      assert(!sql.includes('ON CONFLICT DO NOTHING'));
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('preview installer validates a DM candidate and remains dry-run by default', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ucat-preview-dry-'));
  try {
    const candidatePath = path.join(dir, 'dm.json');
    fs.writeFileSync(candidatePath, JSON.stringify([dmQuestion()]));
    const output = execFileSync(process.execPath, [
      '.codex/skills/ucat-question-pipeline/scripts/install-preview.mjs',
      candidatePath, '--section', 'dm', '--mode', 'practice',
    ], { cwd: process.cwd(), encoding: 'utf8' });
    assert(output.includes('Validation: PASS'));
    assert(output.includes('Dry run only'));
    assert.throws(() => execFileSync(process.execPath, [
      '.codex/skills/ucat-question-pipeline/scripts/install-preview.mjs',
      candidatePath, '--section', 'dm', '--mode', 'practice', '--write',
    ], { cwd: process.cwd(), stdio: 'pipe' }));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function dmQuestion(overrides = {}) {
  return {
    id: randomUUID(), title: 'Workshop allocation', type: 'logic_puzzle', difficulty: 'normal', is_free: true,
    stem: 'Four workshops are allocated to four rooms. Which allocation satisfies the stated constraints?',
    correct_answer: 'A', answer_reason: 'Checking each constraint leaves only option A as a complete valid allocation.', order_index: 1,
    decision_making_question_options: ['One', 'Two', 'Three', 'Four'].map((text, i) => ({ label: 'ABCD'[i], option_text: text, option_data: null, order_index: i + 1 })),
    decision_making_question_statements: [],
    ...overrides,
  };
}

function qrQuestion() {
  return {
    id: randomUUID(), question_text: 'What is the displayed value?',
    options: ['1', '2', '3', '4', '5'].map((text, i) => ({ label: 'ABCDE'[i], text })),
    correct_answer: 'A', answer_reason: 'The displayed value is 1, which corresponds to option A.', order_index: 0, difficulty: 'normal',
  };
}

function qrSet() {
  return {
    id: randomUUID(), title: 'Ferry passenger counts', is_free: true,
    stimulus: { type: 'table', context: 'Passenger totals by day.', data: { headers: ['Day', 'Adults'], rows: [['Mon', '120']] } },
    quantitative_reasoning_questions: [qrQuestion()],
  };
}

function sjScenario() {
  return {
    id: randomUUID(), is_free: true,
    body: 'A student notices that a confidential printout has been left beside a shared printer. Other people are entering the room.',
    situational_judgement_questions: [sjQuestion(0, 1, 'Very important'), sjQuestion(1, 2, 'A very appropriate thing to do')],
  };
}

function briefFor(section, candidate) {
  const questionCount = section === 'dm'
    ? candidate.length
    : candidate.reduce((sum, unit) => sum + (unit.quantitative_reasoning_questions || unit.situational_judgement_questions).length, 0);
  return {
    schema_version: 1, section, mode: 'practice', question_count: questionCount, unit_count: candidate.length,
    difficulty_allocation: { normal_questions: questionCount, hard_questions: 0 },
    type_or_skill_allocation: {}, corpus_run_id: 'test',
  };
}

function sjQuestion(order_index, label_set, correct_answer) {
  return {
    id: randomUUID(), label_set, question_text: `Proposed response ${order_index + 1}.`, correct_answer,
    answer_reason: 'This rating reflects the student role, proportional response, confidentiality, and prompt action in the scenario.',
    order_index, difficulty: 'normal',
  };
}
