// Read-only exporter: it never writes to Supabase.
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  corpusFromPreview,
  corpusFromRows,
  loadEnvFile,
  parseArgs,
  readJson,
  writeJson,
} from './vr-common.mjs';

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const source = args.source || 'remote';
const output = args.output || 'content-authoring/cache/vr-corpus.json';

let corpus;
if (source === 'preview') {
  // Local fallback for offline work; it may not contain every deployed question.
  corpus = corpusFromPreview(
    readJson(args.practice || path.join(root, 'src/dev/preview-vr.json')),
    readJson(args.timed || path.join(root, 'src/dev/preview-vr-timed.json')),
  );
} else if (source === 'remote') {
  loadEnvFile(args.env || path.join(root, '.env.local'));
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local.');
  }
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const versionsBefore = selectVrVersions(await fetchAll(client, 'content_versions', 'section'));
  const [practicePassages, practiceQuestions, timedTests, timedPassages, timedQuestions] = await Promise.all([
    fetchAll(client, 'verbal_reasoning_passages', 'id'),
    fetchAll(client, 'verbal_reasoning_questions', 'id'),
    fetchAll(client, 'timed_verbal_reasoning_tests', 'id'),
    fetchAll(client, 'timed_verbal_reasoning_passages', 'id'),
    fetchAll(client, 'timed_verbal_reasoning_questions', 'id'),
  ]);
  const versionsAfter = selectVrVersions(await fetchAll(client, 'content_versions', 'section'));
  if (JSON.stringify(versionsBefore) !== JSON.stringify(versionsAfter)) {
    throw new Error('VR content_versions changed during export. Run the sync command again for a consistent snapshot.');
  }
  assertNoOrphans(practicePassages, practiceQuestions, timedPassages, timedQuestions);
  corpus = corpusFromRows({
    practicePassages,
    practiceQuestions,
    timedTests,
    timedPassages,
    timedQuestions,
    contentVersions: versionsAfter,
  });
} else {
  throw new Error(`Unknown --source ${source}. Use remote or preview.`);
}

// The brief records this value so a future run can prove which snapshot it used.
corpus.run_id = args['run-id'] || `vr-sync-${corpus.generated_at.replace(/[-:.TZ]/g, '').slice(0, 14)}`;

const written = writeJson(output, corpus);
console.log(`VR corpus written to ${written}`);
console.log(`Source: ${corpus.source}`);
console.log(`Run ID: ${corpus.run_id}`);
console.log(`Passages: ${corpus.counts.passages} | Questions: ${corpus.counts.questions}`);

async function fetchAll(client, table, orderColumn) {
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client.from(table).select('*').order(orderColumn).range(from, from + pageSize - 1);
    if (error) throw new Error(`Could not read ${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}

function selectVrVersions(rows) {
  return rows
    .filter((row) => ['verbal_reasoning', 'timed_verbal_reasoning'].includes(row.section))
    .map(({ section, version }) => ({ section, version }))
    .sort((a, b) => a.section.localeCompare(b.section));
}

function assertNoOrphans(practicePassages, practiceQuestions, timedPassages, timedQuestions) {
  const practiceIds = new Set(practicePassages.map((row) => row.id));
  const timedIds = new Set(timedPassages.map((row) => row.id));
  const orphanPractice = practiceQuestions.filter((row) => !practiceIds.has(row.passage_id));
  const orphanTimed = timedQuestions.filter((row) => !timedIds.has(row.passage_id));
  if (orphanPractice.length || orphanTimed.length) {
    throw new Error(`Export found orphan questions (practice ${orphanPractice.length}, timed ${orphanTimed.length}).`);
  }
}
