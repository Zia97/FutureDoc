// Prepare a reviewable update plan only. This script never writes SQL or contacts a database.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { SECTION_CONFIG } from '../.codex/skills/ucat-question-pipeline/scripts/section-common.mjs';
import { editorialIssues, argumentPatternIssues } from '../.codex/skills/ucat-question-pipeline/scripts/editorial-quality.mjs';

const run = path.resolve(process.argv[2] || 'content-authoring/cache/runs/report-fixes-20261001');
const batches = [
  ['practice-arguments-v1.json', 'practice-arguments-v1.validation.json'],
  ['timed-and-reported-v2.json', 'timed-and-reported-v2.validation.json'],
  ['venn-v3.json', 'venn-v3.validation.json'],
];
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const write = (name, value) => fs.writeFileSync(path.join(run, name), JSON.stringify(value, null, 2) + '\n');
const corpora = Object.fromEntries(['dm', 'qr', 'sj'].map((section) => [section, read(`content-authoring/cache/${section}-corpus.json`)]));
const candidates = [];
const evidence = [];
for (const [candidate, validation] of batches) {
  const report = read(path.join(run, validation));
  assert((report.blockers || []).length === 0, `Unresolved blockers in ${validation}`);
  assert(report.decision === 'accept' || /^(pass|accept)/.test(report.status || ''), `Not accepted: ${validation}`);
  const reviewedHash = report.candidate_sha256 || report.sha256?.[candidate] || report.hashes?.candidate || report.artifact_sha256?.[candidate];
  assert.equal(hash(path.join(run, candidate)), reviewedHash, `Candidate changed after review: ${candidate}`);
  candidates.push(...read(path.join(run, candidate)));
  evidence.push({ candidate, candidate_sha256: hash(path.join(run, candidate)), validation, validation_sha256: hash(path.join(run, validation)) });
}
assert.equal(candidates.length, 103);
const seenUnits = new Set(), seenRows = new Set(), changes = [], reviews = [];
const protectedFields = new Set(['id', 'question_id', 'set_id', 'scenario_id', 'test_id', 'created_at', 'order_index', 'is_free', 'difficulty', 'type', 'label', 'set_ref', 'question_ref', 'label_set']);
function addRow(table, before, after, unit) {
  assert.equal(before.id, after.id);
  assert.deepEqual(Object.keys(before).sort(), Object.keys(after).sort(), `Row shape changed ${table}/${before.id}`);
  const fields = Object.keys(before).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
  for (const key of fields) assert(!protectedFields.has(key), `Protected identity/placement field changed: ${table}/${before.id}/${key}`);
  if (!fields.length) return;
  const key = `${table}/${before.id}`;
  assert(!seenRows.has(key), `Duplicate row patch: ${key}`);
  seenRows.add(key);
  changes.push({ table, id: before.id, section: unit.section, mode: unit.mode, unit_id: unit.payload.id,
    before: Object.fromEntries(fields.map((field) => [field, before[field]])),
    after: Object.fromEntries(fields.map((field) => [field, after[field]])) });
}
function children(table, before, after, unit) {
  assert.deepEqual(before.map((item) => item.id), after.map((item) => item.id), `Child IDs/order changed in ${unit.payload.id}`);
  before.forEach((item, i) => addRow(table, item, after[i], unit));
}
function strip(object, keys) { return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key))); }
for (const unit of candidates) {
  const unitKey = `${unit.section}/${unit.mode}/${unit.payload.id}`;
  assert(!seenUnits.has(unitKey), `Duplicate unit ${unitKey}`);
  seenUnits.add(unitKey);
  const original = corpora[unit.section].units.find((item) => item.id === unit.payload.id && item.mode === unit.mode);
  assert(original, `Missing original ${unitKey}`);
  assert.equal(original.test_id, unit.test_id);
  const before = original.payload, after = unit.payload;
  const tables = SECTION_CONFIG[unit.section].tables;
  const mode = unit.mode === 'timed' ? 'timed' : 'practice';
  let aliases;
  if (unit.section === 'dm') {
    aliases = ['options', 'decision_making_question_options', 'decision_making_question_statements'];
    if (after.decision_making_question_options) assert.deepEqual(after.options, after.decision_making_question_options);
    children(tables[`${mode}Options`], before.options, after.options, unit);
    children(tables[`${mode}Statements`], before.decision_making_question_statements, after.decision_making_question_statements, unit);
  } else {
    const canonical = unit.section === 'qr' ? 'questions' : 'items';
    const mirror = unit.section === 'qr' ? 'quantitative_reasoning_questions' : 'situational_judgement_questions';
    aliases = [canonical, mirror];
    if (after[mirror]) assert.deepEqual(after[canonical], after[mirror]);
    children(tables[`${mode}Children`], before[canonical], after[canonical], unit);
  }
  addRow(tables[`${mode}Parents`], strip(before, aliases), strip(after, aliases), unit);
  reviews.push({ section: unit.section, mode: unit.mode, test_id: unit.test_id, before, after });
}
const editorial = editorialIssues(candidates);
const argumentIssues = ['practice', 'timed'].flatMap((mode) => argumentPatternIssues(candidates.filter((unit) => unit.section === 'dm' && unit.mode === mode).map((unit) => unit.payload)));
assert(![...editorial, ...argumentIssues].some((issue) => issue.severity === 'error'), 'Editorial checks failed');
const summary = { units: candidates.length, changed_rows: changes.length,
  by_table: Object.fromEntries([...new Set(changes.map((row) => row.table))].map((table) => [table, changes.filter((row) => row.table === table).length])) };
write('accepted-content.json', candidates);
write('content-update-plan.json', { status: 'validated_awaiting_user_approval', note: 'Existing rows only. Before-values must match at release; no SQL generated or database changes made.', evidence,
  corpus_runs: Object.fromEntries(Object.entries(corpora).map(([section, corpus]) => [section, corpus.run_id])), summary, editorial_advisories: argumentIssues,
  expected_units: reviews.map(({ section, mode, test_id, before }) => ({ section, mode, test_id, payload: before })), changes });
write('final-structural-check.json', { status: 'pass', summary, checks: ['103 distinct existing units', 'Parent/child IDs and order preserved', 'No protected metadata changes', 'Mirrored content arrays agree', 'No duplicate row updates', 'No draft explanations or recurring length cues'], evidence });

const esc = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const paragraph = (text) => text ? `<p>${esc(text)}</p>` : '';
function question(question) {
  const options = question.options || question.decision_making_question_options || [];
  const statements = question.decision_making_question_statements || [];
  return paragraph(question.stem || question.question_text) +
    (options.length ? `<ol>${options.map((option) => `<li><b>${esc(option.label)}</b> ${esc(option.option_text ?? option.text ?? '')}${option.option_data ? ' [diagram in Venn gallery]' : ''}</li>`).join('')}</ol>` : '') +
    (statements.length ? statements.map((statement) => `<div class="statement">${paragraph(statement.statement_text)}<b>${esc(statement.correct_answer)}</b>${paragraph(statement.answer_reason)}</div>`).join('') : `<p class="key">Answer: ${esc(question.correct_answer)}</p>${paragraph(question.answer_reason)}`);
}
function render(unit, side) {
  const p = unit[side];
  if (unit.section === 'dm') return question(p);
  if (unit.section === 'sj') return paragraph(p.body) + p.items.map((item) => `<div class="statement">${question(item)}</div>`).join('');
  return paragraph(p.stimulus?.context) + `<details><summary>Chart/table data</summary><pre>${esc(JSON.stringify(p.stimulus, null, 2))}</pre></details>` + p.questions.map((q) => `<div class="statement">${question(q)}</div>`).join('');
}
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Question report fixes — review</title>
<style>body{font:16px/1.6 system-ui;margin:0;background:#f4f6fa;color:#172235}main{max-width:1400px;margin:auto;padding:24px}h1{line-height:1.2}p{white-space:pre-wrap}details{background:white;border:1px solid #d8dfeb;border-radius:10px;padding:16px;margin:12px 0}summary{cursor:pointer;font-weight:650}.columns{display:grid;grid-template-columns:1fr 1fr;gap:24px}.key{font-weight:700;color:#135338}.statement{border-top:1px solid #dde4ee;padding-top:12px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}small{color:#596579}input{font:inherit;padding:10px;width:min(90%,600px)}@media(max-width:750px){.columns{grid-template-columns:1fr}}</style>
<main><h1>Question report fixes</h1><p>Validated revisions to 103 existing content units. These changes are ready for your review and have not been applied to the live database. Student identities and report records are excluded.</p>
<p>Includes 73 argument questions, 23 Venn questions, and seven other DM/QR/SJ units with their neighbouring questions. Existing question IDs and placement are preserved.</p>
<p><a href="venn-gallery-v2.html">View all revised Venn diagrams</a> · <a href="content-update-plan.json">Exact field changes and validation evidence</a> · <a href="report-coverage.json">Coverage of all 21 reports</a></p>
<input id="search" type="search" placeholder="Filter by title, section or question ID" aria-label="Filter content">
${reviews.map((unit, i) => `<details class="unit" data-search="${esc(`${unit.section} ${unit.mode} ${unit.after.title || unit.after.body} ${unit.after.id}`.toLowerCase())}"><summary>${i + 1}. ${esc(unit.after.title || unit.after.body.slice(0, 100))} — ${esc(unit.section.toUpperCase())} ${unit.mode}${unit.test_id ? ` test ${unit.test_id}` : ''}</summary><small>${esc(unit.after.id)}</small><div class="columns"><section><h2>Before</h2>${render(unit, 'before')}</section><section><h2>Revised</h2>${render(unit, 'after')}</section></div></details>`).join('')}
</main><script>document.getElementById('search').addEventListener('input',e=>{const term=e.target.value.toLowerCase();document.querySelectorAll('.unit').forEach(el=>el.hidden=!el.dataset.search.includes(term));});</script></html>`;
fs.writeFileSync(path.join(run, 'review.html'), html);
console.log(JSON.stringify(summary));
