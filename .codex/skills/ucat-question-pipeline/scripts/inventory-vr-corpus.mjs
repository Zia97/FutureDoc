// Produces a compact planning view; no answers or user data are included.
import { lexicalSimilarity, parseArgs, readJson, writeJson } from './vr-common.mjs';

const args = parseArgs(process.argv.slice(2));
const corpusPath = args.corpus || 'content-authoring/cache/vr-corpus.json';
const outputPath = args.output || 'content-authoring/cache/vr-corpus-inventory.json';
const corpus = readJson(corpusPath);
const query = String(args.query || args._.join(' ')).trim();

const passages = (corpus.passages || []).map((passage) => ({
  id: passage.id,
  mode: passage.mode,
  test_id: passage.test_id,
  title: passage.title,
  format: passage.format,
  question_stems: (passage.questions || []).map((question) => question.question_text),
  ...(query ? { query_score: lexicalSimilarity(query, `${passage.title} ${passage.body}`) } : {}),
}));
if (query) passages.sort((a, b) => b.query_score - a.query_score);

const inventory = {
  schema_version: 1,
  corpus_run_id: corpus.run_id,
  corpus_generated_at: corpus.generated_at,
  corpus_source: corpus.source,
  query: query || null,
  counts: corpus.counts,
  passages: query ? passages.slice(0, Number(args.limit || 12)) : passages,
};
console.log(`VR inventory written to ${writeJson(outputPath, inventory)}`);
console.log(query ? `Nearest ${inventory.passages.length} passages for: ${query}` : `Titles indexed: ${inventory.passages.length}`);
