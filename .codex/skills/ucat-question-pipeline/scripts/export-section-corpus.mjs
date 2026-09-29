// Read-only exporter for DM, QR, and SJ practice + timed content.
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { loadEnvFile, parseArgs, readJson, writeJson } from './vr-common.mjs';
import { SECTION_CONFIG, normalisePreview, normaliseRemote } from './section-common.mjs';

const args = parseArgs(process.argv.slice(2));
const section = String(args.section || '').toLowerCase();
const config = SECTION_CONFIG[section];
if (!config) throw new Error('Use --section dm, qr, or sj. VR uses questions:sync:vr.');

const source = args.source || 'remote';
const output = args.output || `content-authoring/cache/${section}-corpus.json`;
let units;
let versions = [];
let tests = [];

if (source === 'preview') {
  const practice = readJson(args.practice || `src/dev/preview-${section}.json`);
  const timed = readJson(args.timed || `src/dev/preview-${section}-timed.json`);
  units = normalisePreview(section, practice, timed);
  tests = timed.map(({ id, title, question_count, time_minutes }) => ({ id, title, question_count, time_minutes }));
} else if (source === 'remote') {
  loadEnvFile(args.env || path.resolve('.env.local'));
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing public Supabase URL or anonymous key in .env.local.');
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const versionsBefore = filterVersions(await fetchAll(client, 'content_versions', 'section'));
  const rows = {};
  for (const [name, table] of Object.entries(config.tables)) {
    rows[name] = await fetchAll(client, table, 'id');
  }
  const versionsAfter = filterVersions(await fetchAll(client, 'content_versions', 'section'));
  if (JSON.stringify(versionsBefore) !== JSON.stringify(versionsAfter)) {
    throw new Error(`${section.toUpperCase()} content changed during export. Run the sync again.`);
  }
  assertRelationships(section, rows);
  versions = versionsAfter;
  tests = rows.timedTests || [];
  units = normaliseRemote(section, rows);
} else {
  throw new Error('Use --source remote or preview.');
}

units.sort((a, b) => `${a.mode}:${a.test_id || ''}:${a.title}`.localeCompare(`${b.mode}:${b.test_id || ''}:${b.title}`));
const generatedAt = new Date().toISOString();
const corpus = {
  schema_version: 1,
  section,
  source: source === 'remote' ? 'supabase' : 'preview-json',
  run_id: args['run-id'] || `${section}-sync-${generatedAt.replace(/[-:.TZ]/g, '').slice(0, 14)}`,
  generated_at: generatedAt,
  warning: source === 'preview' ? 'Offline preview fallback: incomplete and potentially stale.' : null,
  content_versions: versions,
  timed_tests: tests,
  counts: {
    units: units.length,
    questions: units.reduce((sum, unit) => sum + unit.question_count, 0),
    practice_units: units.filter((unit) => unit.mode === 'practice').length,
    timed_units: units.filter((unit) => unit.mode === 'timed').length,
  },
  units,
};

console.log(`${section.toUpperCase()} corpus written to ${writeJson(output, corpus)}`);
console.log(`Source: ${corpus.source} | Run ID: ${corpus.run_id}`);
console.log(`Units: ${corpus.counts.units} | Questions: ${corpus.counts.questions}`);

async function fetchAll(client, table, orderColumn) {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client.from(table).select('*').order(orderColumn).range(from, from + pageSize - 1);
    if (error) throw new Error(`Could not read ${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}

function filterVersions(rows) {
  return rows
    .filter((row) => config.versions.includes(row.section))
    .map(({ section: name, version }) => ({ section: name, version }))
    .sort((a, b) => a.section.localeCompare(b.section));
}

function assertRelationships(currentSection, rows) {
  const checks = [];
  checks.push([rows.timedTests, rows.timedParents, 'test_id', 'timed parent rows']);
  if (currentSection === 'dm') {
    checks.push([rows.practiceParents, rows.practiceOptions, 'question_id', 'practice options']);
    checks.push([rows.practiceParents, rows.practiceStatements, 'question_id', 'practice statements']);
    checks.push([rows.timedParents, rows.timedOptions, 'question_id', 'timed options']);
    checks.push([rows.timedParents, rows.timedStatements, 'question_id', 'timed statements']);
  } else {
    const fk = currentSection === 'qr' ? 'set_id' : 'scenario_id';
    checks.push([rows.practiceParents, rows.practiceChildren, fk, 'practice children']);
    checks.push([rows.timedParents, rows.timedChildren, fk, 'timed children']);
  }
  for (const [parents, children, foreignKey, label] of checks) {
    const ids = new Set((parents || []).map((row) => row.id));
    const orphans = (children || []).filter((row) => !ids.has(row[foreignKey]));
    if (orphans.length) throw new Error(`Export found ${orphans.length} orphan ${label}.`);
  }
}
