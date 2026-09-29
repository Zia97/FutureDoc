import { lexicalSimilarity, normaliseText } from './vr-common.mjs';

export const SECTION_CONFIG = {
  dm: {
    name: 'decision_making',
    versions: ['decision_making', 'timed_decision_making'],
    tables: {
      practiceParents: 'decision_making_questions',
      practiceOptions: 'decision_making_question_options',
      practiceStatements: 'decision_making_question_statements',
      timedTests: 'timed_decision_making_tests',
      timedParents: 'timed_decision_making_questions',
      timedOptions: 'timed_decision_making_question_options',
      timedStatements: 'timed_decision_making_question_statements',
    },
  },
  qr: {
    name: 'quantitative_reasoning',
    versions: ['quantitative_reasoning', 'timed_quantitative_reasoning'],
    tables: {
      practiceParents: 'quantitative_reasoning_sets',
      practiceChildren: 'quantitative_reasoning_questions',
      timedTests: 'timed_quantitative_reasoning_tests',
      timedParents: 'timed_quantitative_reasoning_sets',
      timedChildren: 'timed_quantitative_reasoning_questions',
    },
  },
  sj: {
    name: 'situational_judgement',
    versions: ['situational_judgement', 'timed_situational_judgement'],
    tables: {
      practiceParents: 'situational_judgement_scenarios',
      practiceChildren: 'situational_judgement_questions',
      timedTests: 'timed_situational_judgement_tests',
      timedParents: 'timed_situational_judgement_scenarios',
      timedChildren: 'timed_situational_judgement_questions',
    },
  },
};

export function normaliseRemote(section, rows) {
  if (section === 'dm') return normaliseDmRows(rows);
  if (section === 'qr') return normaliseQrRows(rows);
  if (section === 'sj') return normaliseSjRows(rows);
  throw new Error(`Unsupported section: ${section}`);
}

export function normalisePreview(section, practice, timed) {
  if (section === 'dm') {
    return [
      ...practice.map((question) => dmUnit(question, 'practice', null)),
      ...timed.flatMap((test) => (test.questions || []).map((question) => dmUnit(question, 'timed', test.id))),
    ];
  }
  if (section === 'qr') {
    return [
      ...practice.map((set) => qrUnit(set, 'practice', null)),
      ...timed.flatMap((test) => (test.sets || []).map((set) => qrUnit(set, 'timed', test.id))),
    ];
  }
  return [
    ...practice.map((scenario) => sjUnit(scenario, 'practice', null)),
    ...timed.flatMap((test) => (test.scenarios || []).map((scenario) => sjUnit(scenario, 'timed', test.id))),
  ];
}

export function unitSimilarity(query, unit) {
  return lexicalSimilarity(query, unit.comparison_text);
}

export function exactFingerprint(value) {
  return normaliseText(value);
}

function normaliseDmRows(rows) {
  const practiceOptions = groupBy(rows.practiceOptions, 'question_id');
  const practiceStatements = groupBy(rows.practiceStatements, 'question_id');
  const timedOptions = groupBy(rows.timedOptions, 'question_id');
  const timedStatements = groupBy(rows.timedStatements, 'question_id');
  return [
    ...rows.practiceParents.map((q) => dmUnit({
      ...q,
      decision_making_question_options: practiceOptions.get(q.id) || [],
      decision_making_question_statements: practiceStatements.get(q.id) || [],
    }, 'practice', null)),
    ...rows.timedParents.map((q) => dmUnit({
      ...q,
      options: timedOptions.get(q.id) || [],
      decision_making_question_statements: timedStatements.get(q.id) || [],
    }, 'timed', q.test_id)),
  ];
}

function normaliseQrRows(rows) {
  const practiceChildren = groupBy(rows.practiceChildren, 'set_id');
  const timedChildren = groupBy(rows.timedChildren, 'set_id');
  return [
    ...rows.practiceParents.map((set) => qrUnit({
      ...set,
      quantitative_reasoning_questions: practiceChildren.get(set.id) || [],
    }, 'practice', null)),
    ...rows.timedParents.map((set) => qrUnit({
      ...set,
      questions: timedChildren.get(set.id) || [],
    }, 'timed', set.test_id)),
  ];
}

function normaliseSjRows(rows) {
  const practiceChildren = groupBy(rows.practiceChildren, 'scenario_id');
  const timedChildren = groupBy(rows.timedChildren, 'scenario_id');
  return [
    ...rows.practiceParents.map((scenario) => sjUnit({
      ...scenario,
      situational_judgement_questions: practiceChildren.get(scenario.id) || [],
    }, 'practice', null)),
    ...rows.timedParents.map((scenario) => sjUnit({
      ...scenario,
      items: timedChildren.get(scenario.id) || [],
    }, 'timed', scenario.test_id)),
  ];
}

function dmUnit(question, mode, testId) {
  const options = question.decision_making_question_options || question.options || [];
  const statements = question.decision_making_question_statements || [];
  const textParts = [
    question.title,
    question.type,
    question.stem,
    JSON.stringify(question.table_data || question.tableData || ''),
    JSON.stringify(question.stimulus_diagram || question.stimulusDiagram || ''),
    ...options.map((option) => option.option_text || option.text || ''),
    ...statements.map((statement) => statement.statement_text || statement.text || ''),
  ];
  return {
    id: question.id,
    mode,
    test_id: testId,
    title: question.title,
    type: question.type,
    comparison_text: textParts.join(' '),
    question_count: 1,
    payload: { ...question, options, decision_making_question_statements: statements },
  };
}

function qrUnit(set, mode, testId) {
  const questions = set.quantitative_reasoning_questions || set.questions || [];
  const textParts = [
    set.title,
    JSON.stringify(set.stimulus || ''),
    ...questions.flatMap((question) => [question.question_text || question.stem || '', JSON.stringify(question.options || [])]),
  ];
  return {
    id: set.id || set.set_id,
    mode,
    test_id: testId,
    title: set.title,
    type: set.stimulus?.type || 'unknown',
    comparison_text: textParts.join(' '),
    question_count: questions.length,
    payload: { ...set, questions },
  };
}

function sjUnit(scenario, mode, testId) {
  const items = scenario.situational_judgement_questions || scenario.items || [];
  const body = scenario.body || scenario.stem || '';
  const textParts = [body, ...items.map((item) => item.question_text || item.text || '')];
  return {
    id: scenario.id,
    mode,
    test_id: testId,
    title: body.slice(0, 90),
    type: 'scenario',
    comparison_text: textParts.join(' '),
    question_count: items.length,
    payload: { ...scenario, items },
  };
}

function groupBy(rows, key) {
  const result = new Map();
  for (const row of rows || []) {
    const values = result.get(row[key]) || [];
    values.push(row);
    result.set(row[key], values);
  }
  for (const values of result.values()) values.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  return result;
}
