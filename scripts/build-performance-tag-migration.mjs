import fs from 'node:fs';
import { validatePerformanceTags } from './validate-performance-tags.mjs';

// Explicit local SQL preparation only. Never connects to or writes a database.
const { batches, summary } = validatePerformanceTags();
const destination = process.argv[2];
if (!destination?.endsWith('.sql')) throw new Error('Provide a destination .sql path');
const literal = (value) => `'${String(value).replaceAll("'", "''")}'`;
const statements = ['-- Reviewed performance skill metadata. Original questions and answers are unchanged.', 'BEGIN;'];
for (const batch of batches) {
  for (const skill of batch.skills) statements.push(`INSERT INTO public.performance_skills (id, section, metadata) VALUES (${literal(skill.id)}, ${literal(batch.section)}, ${literal(JSON.stringify(skill))}::jsonb) ON CONFLICT (id) DO UPDATE SET metadata = EXCLUDED.metadata;`);
  for (const q of batch.questions) {
    const values = [literal(`${batch.section}:${q.mode}:${q.id}`), literal(batch.section), literal(q.mode), `${literal(q.id)}::uuid`, literal(q.primarySkillId), `${literal(JSON.stringify(q))}::jsonb`, '1', literal(batch.corpusRunId)];
    statements.push(`INSERT INTO public.performance_question_tags (id, section, mode, question_id, primary_skill_id, metadata, taxonomy_version, corpus_run_id) VALUES (${values.join(', ')}) ON CONFLICT (section, mode, question_id) DO UPDATE SET primary_skill_id = EXCLUDED.primary_skill_id, metadata = EXCLUDED.metadata, taxonomy_version = EXCLUDED.taxonomy_version, corpus_run_id = EXCLUDED.corpus_run_id, reviewed_at = now();`);
  }
}
statements.push('COMMIT;', '');
fs.writeFileSync(destination, statements.join('\n'));
console.log(JSON.stringify({ destination, summary }));
