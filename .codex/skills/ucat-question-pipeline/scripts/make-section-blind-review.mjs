// Creates an answer-free packet and a response form for an independent reviewer.
import { parseArgs, readJson, writeJson } from './vr-common.mjs';

const args = parseArgs(process.argv.slice(2));
const inputPath = args._[0];
const section = String(args.section || '').toLowerCase();
if (!inputPath || !['dm', 'qr', 'sj'].includes(section)) {
  throw new Error('Usage: make-section-blind-review <candidate.json> --section <dm|qr|sj> --output <blind.json>');
}
const input = readJson(inputPath);
const blind = stripAnswers(structuredClone(input));
const response = {
  schema_version: 1,
  section,
  candidate: inputPath,
  committed_before_answer_reveal: false,
  reviewer: null,
  reviewed_at: null,
  responses: buildResponseRows(section, input),
  overall_notes: null,
};
const output = args.output || inputPath.replace(/\.json$/i, '') + '.blind.json';
const responseOutput = args['response-output'] || inputPath.replace(/\.json$/i, '') + '.blind-response.json';
console.log(`Blind packet: ${writeJson(output, blind)}`);
console.log(`Response form: ${writeJson(responseOutput, response)}`);
console.log('The validator must save and commit the response form before seeing the original candidate.');

function stripAnswers(value) {
  if (Array.isArray(value)) return value.map(stripAnswers);
  if (!value || typeof value !== 'object') return value;
  const result = {};
  for (const [key, child] of Object.entries(value)) {
    if (['correct_answer', 'answer_reason', 'difficulty'].includes(key)) continue;
    result[key] = stripAnswers(child);
  }
  return result;
}

function buildResponseRows(currentSection, data) {
  const rows = [];
  if (currentSection === 'dm') {
    const questions = data[0]?.questions || data;
    questions.forEach((q) => {
      const statements = q.decision_making_question_statements || [];
      if (statements.length) statements.forEach((s, i) => rows.push(row(q.id, s.id || `${q.id}:statement:${i}`, s.statement_text)));
      else rows.push(row(q.id, q.id, q.stem));
    });
  } else if (currentSection === 'qr') {
    const sets = data[0]?.sets || data;
    sets.forEach((set) => (set.questions || set.quantitative_reasoning_questions || []).forEach((q) => rows.push(row(set.set_id || set.id, q.id, q.stem || q.question_text))));
  } else {
    const scenarios = data[0]?.scenarios || data;
    scenarios.forEach((scenario) => (scenario.items || scenario.situational_judgement_questions || []).forEach((item) => rows.push(row(scenario.id, item.id, item.text || item.question_text))));
  }
  return rows;
}

function row(parentId, itemId, prompt) {
  return {
    parent_id: parentId,
    item_id: itemId,
    prompt,
    independent_answer: null,
    independent_working_or_rationale: null,
    ambiguity_or_multiple_valid_answers: null,
    confidence: null,
  };
}
