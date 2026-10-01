// Compact planning/search view for DM, QR, or SJ corpora.
import { parseArgs, readJson, writeJson } from './vr-common.mjs';
import { SECTION_CONFIG, unitSimilarity } from './section-common.mjs';

const args = parseArgs(process.argv.slice(2));
const section = String(args.section || '').toLowerCase();
if (!SECTION_CONFIG[section]) throw new Error('Use --section dm, qr, or sj.');
const corpus = readJson(args.corpus || `content-authoring/cache/${section}-corpus.json`);
const query = String(args.query || args._.join(' ')).trim();
const units = (corpus.units || []).map((unit) => ({
  id: unit.id,
  mode: unit.mode,
  test_id: unit.test_id,
  title: unit.title,
  type: unit.type,
  question_count: unit.question_count,
  ...(query ? { query_score: unitSimilarity(query, unit) } : {}),
}));
if (query) units.sort((a, b) => b.query_score - a.query_score);
const inventory = {
  schema_version: 1,
  section,
  corpus_run_id: corpus.run_id,
  corpus_generated_at: corpus.generated_at,
  corpus_source: corpus.source,
  query: query || null,
  counts: corpus.counts,
  units: query ? units.slice(0, Number(args.limit || 12)) : units,
};
const output = args.output || `content-authoring/cache/${section}-corpus-inventory.json`;
console.log(`${section.toUpperCase()} inventory written to ${writeJson(output, inventory)}`);
console.log(query ? `Nearest ${inventory.units.length} units for: ${query}` : `Units indexed: ${inventory.units.length}`);
