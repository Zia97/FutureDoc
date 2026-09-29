import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { lexicalSimilarity, normaliseText, passageFormat, wordCount } from '../scripts/vr-common.mjs';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const validator = path.join(skillRoot, 'scripts/validate-vr-candidate.mjs');
const blindReview = path.join(skillRoot, 'scripts/make-vr-blind-review.mjs');
const sqlGenerator = path.join(skillRoot, 'scripts/vr-practice-to-sql.mjs');

test('text helpers handle Unicode punctuation and similarity', () => {
  assert.equal(normaliseText('Can’t  TELL!'), "can't tell");
  assert.equal(wordCount("An archivist's carefully-indexed record."), 4);
  assert.equal(lexicalSimilarity('same text', 'same text'), 1);
});

test('legacy TFC capitalisation is recognised for corpus classification', () => {
  const questions = Array.from({ length: 4 }, () => ({ options: ['True', 'False', "Can't Tell"] }));
  assert.equal(passageFormat({ verbal_reasoning_questions: questions }), 'tfc');
});

test('validator passes a valid candidate and does not reject a generic stem alone', () => {
  withTemp((dir) => {
    const candidatePath = path.join(dir, 'candidate.json');
    const corpusPath = path.join(dir, 'corpus.json');
    const reportPath = path.join(dir, 'report.json');
    write(candidatePath, [makePassage()]);
    const existing = makePassage({
      passageId: '20000000-0000-4000-8000-000000000001',
      questionBase: 20,
      title: 'Unrelated Reed Instruments',
      body: longBody('reed'),
    });
    existing.verbal_reasoning_questions[0].question_text = makePassage().verbal_reasoning_questions[0].question_text;
    write(corpusPath, { passages: [{ ...existing, mode: 'timed', questions: existing.verbal_reasoning_questions }] });
    const result = run(validator, [candidatePath, '--corpus', corpusPath, '--report', reportPath]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = read(reportPath);
    assert.equal(report.deterministic_verdict, 'pass');
    assert.equal(report.issues.some((issue) => issue.code === 'novelty.question_near_duplicate'), false);
    assert.equal(path.isAbsolute(report.input), false);
  });
});

test('validator rejects corpus UUID and passage collisions', () => {
  withTemp((dir) => {
    const candidate = makePassage();
    const candidatePath = path.join(dir, 'candidate.json');
    const corpusPath = path.join(dir, 'corpus.json');
    const reportPath = path.join(dir, 'report.json');
    write(candidatePath, [candidate]);
    write(corpusPath, {
      passages: [{
        id: candidate.id,
        mode: 'practice',
        title: candidate.title,
        body: candidate.body,
        questions: candidate.verbal_reasoning_questions,
      }],
    });
    const result = run(validator, [candidatePath, '--corpus', corpusPath, '--report', reportPath]);
    assert.notEqual(result.status, 0);
    const codes = read(reportPath).issues.map((issue) => issue.code);
    assert.ok(codes.includes('schema.corpus_uuid_collision'));
    assert.ok(codes.includes('novelty.passage_near_duplicate'));
  });
});

test('validator enforces generation-brief allocations and corpus run ID', () => {
  withTemp((dir) => {
    const candidatePath = path.join(dir, 'candidate.json');
    const corpusPath = path.join(dir, 'corpus.json');
    const briefPath = path.join(dir, 'brief.json');
    const reportPath = path.join(dir, 'report.json');
    write(candidatePath, [makePassage()]);
    write(corpusPath, { run_id: 'current-run', passages: [] });
    write(briefPath, {
      mode: 'practice',
      question_count: 4,
      passage_count: 1,
      corpus_run_id: 'older-run',
      format_allocation: { mc_passages: 0, tfc_passages: 1 },
      difficulty_allocation: { normal_questions: 4, hard_questions: 0 },
    });
    const result = run(validator, [candidatePath, '--corpus', corpusPath, '--brief', briefPath, '--report', reportPath]);
    assert.notEqual(result.status, 0);
    const codes = read(reportPath).issues.map((issue) => issue.code);
    assert.ok(codes.includes('brief.mc_passages'));
    assert.ok(codes.includes('brief.hard_questions'));
    assert.ok(codes.includes('brief.corpus_run_id'));
  });
});

test('blind-review packet contains no answer key or explanation', () => {
  withTemp((dir) => {
    const candidatePath = path.join(dir, 'candidate.json');
    const outputPath = path.join(dir, 'blind.json');
    write(candidatePath, [makePassage()]);
    const result = run(blindReview, [candidatePath, '--output', outputPath]);
    assert.equal(result.status, 0, result.stderr);
    const raw = fs.readFileSync(outputPath, 'utf8');
    assert.equal(raw.includes('correct_answer'), false);
    assert.equal(raw.includes('answer_reason'), false);
    assert.equal(path.isAbsolute(read(outputPath).source_candidate), false);
  });
});

test('SQL generator validates first, escapes quotes, and fails loudly on collisions', () => {
  withTemp((dir) => {
    const candidatePath = path.join(dir, 'approved.json');
    const corpusPath = path.join(dir, 'corpus.json');
    const sqlPath = path.join(dir, 'migration.sql');
    const candidate = makePassage({ title: "Archivist's Ledger" });
    write(candidatePath, [candidate]);
    write(corpusPath, { passages: [] });
    const result = run(sqlGenerator, [candidatePath, '--corpus', corpusPath, '--output', sqlPath]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    assert.match(sql, /Archivist''s Ledger/);
    assert.equal(sql.includes('ON CONFLICT'), false);
    assert.equal(sql.includes('UPDATE content_versions'), false);
  });
});

function makePassage(overrides = {}) {
  const base = overrides.questionBase || 1;
  return {
    id: overrides.passageId || '10000000-0000-4000-8000-000000000001',
    title: overrides.title || 'Obscure Amber Registers',
    body: overrides.body || longBody('amber'),
    is_free: false,
    verbal_reasoning_questions: Array.from({ length: 4 }, (_, index) => ({
      id: `10000000-0000-4000-8000-${String(base + index + 1).padStart(12, '0')}`,
      question_text: index === 0
        ? 'Which of the following is most strongly supported by the passage?'
        : `What does the passage establish about register feature ${index}?`,
      options: ['The first interpretation', 'The second interpretation', 'The third interpretation', 'The fourth interpretation'],
      correct_answer: ['The first interpretation', 'The second interpretation', 'The third interpretation', 'The fourth interpretation'][index],
      answer_reason: 'The passage evidence supports this option, while each alternative changes or invents a stated detail.',
      order_index: index,
      difficulty: index === 3 ? 'hard' : 'normal',
    })),
  };
}

function longBody(prefix) {
  const words = Array.from({ length: 210 }, (_, index) => `${prefix}${index}`);
  return `${words.slice(0, 105).join(' ')}.\n\n${words.slice(105).join(' ')}.`;
}

function withTemp(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'future-doc-vr-'));
  try {
    callback(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], { cwd: process.cwd(), encoding: 'utf8' });
}

function write(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function read(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
