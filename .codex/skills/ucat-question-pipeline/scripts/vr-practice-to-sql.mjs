// Generates SQL only. It does not connect to or modify Supabase.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { candidatePassages, parseArgs, readJson } from './vr-common.mjs';

const args = parseArgs(process.argv.slice(2));
const inputPath = args._[0];
const outputPath = args.output;
if (!inputPath || !outputPath) {
  throw new Error('Usage: npm run questions:migration:vr -- <approved.json> --output <migration.sql>');
}
const validatorPath = new URL('./validate-vr-candidate.mjs', import.meta.url);
const validationArgs = [fileURLToPath(validatorPath), inputPath, '--mode', 'practice'];
if (args.corpus) validationArgs.push('--corpus', args.corpus);
const validation = spawnSync(process.execPath, validationArgs, { encoding: 'utf8' });
if (validation.stdout) process.stdout.write(validation.stdout);
if (validation.stderr) process.stderr.write(validation.stderr);
if (validation.status !== 0) throw new Error('Refusing to generate SQL because deterministic validation failed.');
const parsed = candidatePassages(readJson(inputPath), 'practice');
const lines = [
  '-- Generated VR practice content. Review before running supabase db push.',
  `-- Source: ${path.basename(inputPath)}`,
  '-- This file only inserts content; it does not alter the schema.',
  '',
];

for (const [index, passage] of parsed.passages.entries()) {
  lines.push(`-- Passage ${index + 1}: ${passage.title}`);
  lines.push('INSERT INTO verbal_reasoning_passages (id, title, body, is_free) VALUES');
  lines.push(`  (${sql(passage.id)}, ${sql(passage.title)}, ${sql(passage.body)}, ${passage.is_free ? 'true' : 'false'})`);
  lines.push(';');
  lines.push('');
  lines.push('INSERT INTO verbal_reasoning_questions');
  lines.push('  (id, passage_id, question_text, options, correct_answer, answer_reason, order_index, difficulty)');
  lines.push('VALUES');
  const questionRows = passage.verbal_reasoning_questions.map((question) => {
    const options = `ARRAY[${question.options.map(sql).join(', ')}]`;
    return `  (${sql(question.id)}, ${sql(passage.id)}, ${sql(question.question_text)}, ${options}, ${sql(question.correct_answer)}, ${sql(question.answer_reason)}, ${question.order_index}, ${sql(question.difficulty)})`;
  });
  lines.push(`${questionRows.join(',\n')}`);
  lines.push(';');
  lines.push('');
}

const resolved = path.resolve(outputPath);
fs.mkdirSync(path.dirname(resolved), { recursive: true });
fs.writeFileSync(resolved, lines.join('\n'), 'utf8');
console.log(`Migration written to ${resolved}`);
console.log('Not applied to Supabase. Review it, then run supabase db push separately.');

function sql(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}
