// Package independently accepted mini-assessment content for the edge service.
// This never writes questions to the general practice bank or to Supabase.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { LABEL_SETS } from '../src/constants/sjLabelSets.js';

const releaseFile = process.argv[2];
if (!releaseFile) throw new Error('Usage: node scripts/build-coach-assessment.mjs <accepted-release.json> [output.json]');
const root = path.dirname(path.resolve(releaseFile));
const release = JSON.parse(fs.readFileSync(releaseFile, 'utf8'));
assert.match(release.id ?? '', /^coach-intro-v\d+$/);
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const questions = [], provenance = {}, used = new Set();
for (const section of ['vr', 'dm', 'qr', 'sj']) {
  const input = release.sections[section];
  const candidateBytes = fs.readFileSync(path.resolve(root, input.candidate));
  const validationBytes = fs.readFileSync(path.resolve(root, input.validation));
  const validation = JSON.parse(validationBytes);
  assert.equal(validation.status, 'PASS', `${section}: independent review must pass`);
  assert.equal(validation.candidate_sha256, digest(candidateBytes), `${section}: candidate changed after independent review`);
  const candidate = JSON.parse(candidateBytes);
  const mappingBytes = fs.readFileSync(path.resolve(root, input.mapping));
  const mapping = JSON.parse(mappingBytes);
  const mappingRows = Array.isArray(mapping) ? mapping : mapping.questions;
  const mappings = new Map(mappingRows.map((tag) => [tag.id, tag]));
  const skills = JSON.parse(fs.readFileSync(`src/data/performance/${section}-tags.json`, 'utf8')).skills;
  const skillIds = new Set(skills.map((skill) => skill.id));
  const brief = JSON.parse(fs.readFileSync(path.resolve(root, input.brief), 'utf8'));
  const ordered = (rows = []) => [...rows].sort((a, b) => a.order_index - b.order_index);
  const before = questions.length;
  for (const parent of candidate) {
    const children = section === 'dm' ? [parent] : ordered(parent[`${{ vr: 'verbal_reasoning', qr: 'quantitative_reasoning', sj: 'situational_judgement' }[section]}_questions`]);
    if (section === 'vr' || section === 'qr') assert.equal(children.length, 4);
    if (section === 'sj') assert.equal(children.length, 3);
    for (const child of children) {
      assert.ok(!used.has(child.id), 'Duplicate assessment ID'); used.add(child.id);
      const reviewedTag = mappings.get(child.id);
      assert.ok(reviewedTag && skillIds.has(reviewedTag.primarySkillId), `${section}: missing reviewed canonical skill mapping`);
      assert.ok((reviewedTag.secondarySkillIds ?? []).every((id) => skillIds.has(id)), `${section}: noncanonical secondary skill`);
      const authorTag = { ...reviewedTag, parentId: reviewedTag.parentId ?? (section === 'dm' ? parent.id : undefined) };
      assert.equal(authorTag.parentId, parent.id, `${section}: skill mapping parent mismatch`);
      assert.equal(authorTag.difficulty, child.difficulty, `${section}: difficulty mapping mismatch`);
      const statements = ordered(child.decision_making_question_statements);
      const options = section === 'dm' ? ordered(child.decision_making_question_options) : section === 'sj' ? LABEL_SETS[child.label_set] : child.options;
      const choices = (options ?? []).map((option) => typeof option === 'string' ? { value: option, label: option }
        : { value: option.label, label: `${option.label}.  ${option.text ?? option.option_text ?? ''}` });
      if (statements.length) assert.equal(statements.length, 5);
      else assert.ok(choices.some((choice) => choice.value === child.correct_answer), `${section}: answer must match a displayed option`);
      const tag = { id: child.id, section, mode: 'practice', parentId: parent.id,
        primarySkillId: authorTag.primarySkillId, secondarySkillIds: authorTag.secondarySkillIds ?? [],
        difficulty: authorTag.difficulty, format: authorTag.format, rationale: authorTag.rationale,
        confidence: 'high', excludedReason: null,
        assessmentOnly: true, source: release.id, options: choices.map((choice) => choice.value),
        ...(statements.length ? { statementAnswers: statements.map((statement) => statement.correct_answer) } : { answer: child.correct_answer }),
        contentHash: digest(JSON.stringify({ parent, child, authorTag })), previouslySeen: false };
      questions.push({ id: child.id, section, parentId: parent.id, title: parent.title ?? '',
        context: section === 'vr' || section === 'sj' ? parent.body : null,
        text: child.question_text ?? '', stimulus: section === 'qr' ? parent.stimulus : null,
        dm: section === 'dm' ? { id: child.id, type: child.type, subtype: child.subtype, stem: child.stem,
          tableData: child.table_data, stimulusDiagram: child.stimulus_diagram, stimulusVennGeometry: child.venn_geometry, hideLabels: child.hide_labels,
          options: options.map((option) => ({ label: option.label, text: option.option_text, vennConfig: option.option_data, vennGeometry: option.venn_geometry })),
          statements: statements.map((statement) => ({ text: statement.statement_text })) } : null,
        choices, tag, explanation: child.answer_reason ?? null, statementReasons: statements.map((statement) => statement.answer_reason) });
    }
  }
  assert.equal(questions.length - before, 12, `${section}: mini-assessment needs exactly 12 questions`);
  assert.equal(mappings.size, 12, `${section}: exactly one skill mapping per question`);
  provenance[section] = { candidateSha256: digest(candidateBytes), independentValidationSha256: digest(validationBytes),
    skillMappingSha256: digest(mappingBytes), corpusRunId: brief.corpus_run_id ?? brief.corpusRunId, reviewStatus: 'PASS' };
}
assert.equal(questions.length, 48);
const result = { version: 2, id: release.id, title: 'Your starting assessment', assessmentOnly: true,
  validation: { status: 'PASS', method: 'independent-blind-and-revealed-review', sections: provenance }, questions };
const output = process.argv[3] ?? 'supabase/functions/ai-coach/assessment-v2.json';
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ output, id: result.id, questions: questions.length, sections: Object.keys(provenance) }));
