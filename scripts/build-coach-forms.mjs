import fs from 'node:fs';
import { selectGroups, SECTIONS } from '../src/lib/coaching/engine.js';
const batches = SECTIONS.map((s) => JSON.parse(fs.readFileSync(`src/data/performance/${s}-tags.json`, 'utf8')));
const catalogue = { skills: batches.flatMap((b) => b.skills), questions: batches.flatMap((b) => b.questions.map((q) => ({ ...q, section: b.section }))) };
const used = new Set();
const forms = Array.from({ length: 3 }, (_, i) => {
  const questions = SECTIONS.flatMap((section) => selectGroups({ catalogue: { ...catalogue, questions: catalogue.questions.filter((q) => !used.has(q.parentId)) }, section, assessment: true, seed: 17 + i * 101 }));
  questions.forEach((q) => used.add(q.parentId));
  return { id: `baseline-v1-${i + 1}`, questions: questions.map((q) => ({ id: q.id, section: q.section, contentHash: q.contentHash })) };
});
fs.mkdirSync('supabase/functions/ai-coach', { recursive: true });
fs.writeFileSync('supabase/functions/ai-coach/forms.json', JSON.stringify({ version: 1, forms }, null, 2) + '\n');
console.log(forms.map((f) => ({ id: f.id, questions: f.questions.length })));
