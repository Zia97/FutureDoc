// Converts an approved DM/QR/SJ practice candidate to fail-fast SQL. It never applies SQL.
import path from 'node:path';
import fs from 'node:fs';
import { parseArgs, readJson } from './vr-common.mjs';
import { validateSectionCandidate } from './section-validator-core.mjs';

const args = parseArgs(process.argv.slice(2));
const inputPath = args._[0];
const section = String(args.section || '').toLowerCase();
if (!inputPath || !['dm', 'qr', 'sj'].includes(section)) {
  throw new Error('Usage: section-practice-to-sql <approved.json> --section <dm|qr|sj> --brief <brief.json> --output <migration.sql>');
}
if (!args.brief) throw new Error('Migration generation requires --brief to enforce the approved count, allocation, and corpus run.');
const input = readJson(inputPath);
const corpusPath = args.corpus || `content-authoring/cache/${section}-corpus.json`;
const corpus = readJson(corpusPath);
const brief = readJson(args.brief);
const report = validateSectionCandidate({ section, input, modeHint: 'practice', corpus, brief, expectedQuestions: args['expected-questions'] });
if (report.deterministic_verdict !== 'pass') {
  const failures = report.issues.filter((i) => i.severity === 'error').map((i) => `${i.code}: ${i.message}`).join('\n');
  throw new Error(`Migration blocked because validation failed:\n${failures}`);
}
const output = args.output || inputPath.replace(/\.json$/i, '') + '.sql';
const sql = section === 'dm' ? dmSql(input) : section === 'qr' ? qrSql(input) : sjSql(input);
const resolved = path.resolve(output);
fs.mkdirSync(path.dirname(resolved), { recursive: true });
fs.writeFileSync(resolved, sql, 'utf8');
console.log(`Migration written: ${resolved}`);
console.log('Not applied. Review the SQL diff; a separate explicit command is required to update Supabase.');

function dmSql(questions) {
  const lines = header('DM', inputPath);
  lines.push('DO $migration$', 'DECLARE', '  v_base_order integer;', 'BEGIN', '  SELECT COALESCE(MAX(order_index), 0) INTO v_base_order FROM decision_making_questions;');
  questions.forEach((q, index) => {
    const statementType = ['syllogism', 'interpreting_info'].includes(q.type);
    lines.push(
      `  INSERT INTO decision_making_questions (id, title, type, stem, table_data, stimulus_diagram, venn_geometry, correct_answer, answer_reason, order_index, difficulty, hide_labels, is_free) VALUES (${s(q.id)}::uuid, ${s(q.title)}, ${s(q.type)}::dm_question_type, ${s(q.stem)}, ${j(q.table_data)}, ${j(q.stimulus_diagram)}, ${j(q.venn_geometry)}, ${statementType ? 'NULL' : s(q.correct_answer)}, ${statementType ? 'NULL' : s(q.answer_reason)}, v_base_order + ${index + 1}, ${s(q.difficulty)}, ${b(q.hide_labels)}, ${b(q.is_free)});`,
    );
    const options = q.decision_making_question_options || q.options || [];
    options.forEach((o) => lines.push(
      `  INSERT INTO decision_making_question_options (question_id, label, option_text, option_data, venn_geometry, order_index) VALUES (${s(q.id)}::uuid, ${s(o.label)}, ${s(o.option_text ?? o.text ?? '')}, ${j(o.option_data ?? o.vennConfig)}, ${j(o.venn_geometry ?? o.vennGeometry)}, ${Number(o.order_index)});`,
    ));
    (q.decision_making_question_statements || []).forEach((st) => lines.push(
      `  INSERT INTO decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES (${s(q.id)}::uuid, ${s(st.statement_text)}, ${s(st.correct_answer)}, ${s(st.answer_reason)}, ${Number(st.order_index)});`,
    ));
  });
  lines.push('END', '$migration$;', 'COMMIT;', '');
  return lines.join('\n');
}

function qrSql(sets) {
  const lines = header('QR', inputPath);
  sets.forEach((set) => {
    const setRef = `author_${set.id.replace(/-/g, '')}`;
    lines.push(`INSERT INTO quantitative_reasoning_sets (id, set_ref, title, stimulus, is_free) VALUES (${s(set.id)}::uuid, ${s(setRef)}, ${s(set.title)}, ${j(set.stimulus)}, ${b(set.is_free)});`);
    set.quantitative_reasoning_questions.forEach((q) => {
      const questionRef = `author_${q.id.replace(/-/g, '')}`;
      lines.push(`INSERT INTO quantitative_reasoning_questions (id, set_id, question_ref, question_text, options, correct_answer, answer_reason, order_index, difficulty) VALUES (${s(q.id)}::uuid, ${s(set.id)}::uuid, ${s(questionRef)}, ${s(q.question_text)}, ${j(q.options)}, ${s(q.correct_answer)}, ${s(q.answer_reason)}, ${Number(q.order_index)}, ${s(q.difficulty)});`);
    });
  });
  lines.push('COMMIT;', '');
  return lines.join('\n');
}

function sjSql(scenarios) {
  const lines = header('SJ', inputPath);
  scenarios.forEach((scenario) => {
    lines.push(`INSERT INTO situational_judgement_scenarios (id, body, is_free) VALUES (${s(scenario.id)}::uuid, ${s(scenario.body)}, ${b(scenario.is_free)});`);
    scenario.situational_judgement_questions.forEach((q) => lines.push(
      `INSERT INTO situational_judgement_questions (id, scenario_id, question_text, correct_answer, answer_reason, order_index, label_set, difficulty) VALUES (${s(q.id)}::uuid, ${s(scenario.id)}::uuid, ${s(q.question_text)}, ${s(q.correct_answer)}, ${s(q.answer_reason)}, ${Number(q.order_index)}, ${Number(q.label_set)}, ${s(q.difficulty)});`,
    ));
  });
  lines.push('COMMIT;', '');
  return lines.join('\n');
}

function header(label, source) {
  return [
    `-- ${label} practice content generated from ${path.basename(source)}.`,
    '-- Fail-fast inserts: any ID/ref collision aborts the transaction.',
    '-- Content-version triggers update versions automatically; do not bump them manually.',
    'BEGIN;',
  ];
}
function s(value) { return value == null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`; }
function j(value) { return value == null ? 'NULL' : `${s(JSON.stringify(value))}::jsonb`; }
function b(value) { return value === true ? 'TRUE' : 'FALSE'; }
