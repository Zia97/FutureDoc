// Deterministic candidate checker for DM, QR, and SJ.
import path from 'node:path';
import { parseArgs, readJson, writeJson } from './vr-common.mjs';
import { validateSectionCandidate } from './section-validator-core.mjs';

const args = parseArgs(process.argv.slice(2));
const inputPath = args._[0];
const section = String(args.section || '').toLowerCase();
if (!inputPath || !['dm', 'qr', 'sj'].includes(section)) {
  throw new Error('Usage: validate-section-candidate <candidate.json> --section <dm|qr|sj> [--mode practice|timed]');
}
const corpus = args.corpus === 'none' ? null : readJson(args.corpus || `content-authoring/cache/${section}-corpus.json`);
const brief = args.brief ? readJson(args.brief) : null;
const report = validateSectionCandidate({
  section,
  input: readJson(inputPath),
  modeHint: args.mode,
  corpus,
  brief,
  expectedQuestions: args['expected-questions'],
});
report.input = path.relative(process.cwd(), path.resolve(inputPath));
const reportPath = args.report || inputPath.replace(/\.json$/i, '') + '.deterministic-report.json';
const written = writeJson(reportPath, report);
console.log(`Deterministic verdict: ${report.deterministic_verdict.toUpperCase()}`);
console.log(`Section: ${section.toUpperCase()} | Mode: ${report.mode} | Questions: ${report.counts.questions}`);
console.log(`Errors: ${report.counts.errors} | Warnings: ${report.counts.warnings}`);
console.log(`Report: ${written}`);
for (const issue of report.issues) console.log(`[${issue.severity.toUpperCase()}] ${issue.code}: ${issue.message}`);
if (report.deterministic_verdict === 'fail' || (args.strict && report.counts.warnings)) process.exitCode = 1;
