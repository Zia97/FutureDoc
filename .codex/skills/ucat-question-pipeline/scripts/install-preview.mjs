// Installs a validated candidate into the static JSON file used by the app's Developer toggle.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, readJson } from './vr-common.mjs';
import { validateSectionCandidate } from './section-validator-core.mjs';

const args = parseArgs(process.argv.slice(2));
const inputPath = args._[0];
const section = String(args.section || '').toLowerCase();
const mode = String(args.mode || 'practice').toLowerCase();
const allowedSections = new Set(['vr', 'dm', 'qr', 'sj']);

if (!inputPath || !allowedSections.has(section) || !['practice', 'timed'].includes(mode)) {
  throw new Error('Usage: npm run questions:preview:install -- <candidate.json> -- --section <vr|dm|qr|sj> --mode <practice|timed> --brief <brief.json> --write');
}

const candidate = readJson(inputPath);
assertPreviewShape(candidate, section, mode);
if (section !== 'vr') {
  if (args.write && !args.brief) throw new Error('--write requires --brief so count, allocation, and corpus run are release-gated.');
  const corpusPath = path.resolve(`content-authoring/cache/${section}-corpus.json`);
  const corpus = fs.existsSync(corpusPath) ? readJson(corpusPath) : null;
  const brief = args.brief ? readJson(args.brief) : null;
  const validation = validateSectionCandidate({ section, input: candidate, modeHint: mode, corpus, brief });
  if (validation.deterministic_verdict !== 'pass') {
    const summary = validation.issues.filter((issue) => issue.severity === 'error').slice(0, 8)
      .map((issue) => `${issue.code}: ${issue.message}`).join('\n- ');
    throw new Error(`Preview install blocked by deterministic validation:\n- ${summary}`);
  }
  console.log(`Validation: PASS (${validation.counts.questions} questions, ${validation.counts.warnings} warning(s))`);
}

const suffix = mode === 'timed' ? `-${section}-timed.json` : `-${section}.json`;
const targetPath = path.resolve('src/dev', `preview${suffix}`);
console.log(`Candidate: ${path.relative(process.cwd(), path.resolve(inputPath))}`);
console.log(`Target: ${path.relative(process.cwd(), targetPath)}`);

if (!args.write) {
  console.log('Dry run only. Re-run with --write after validation and user approval.');
  process.exit(0);
}

const backupDir = path.resolve('content-authoring/cache/preview-backups');
fs.mkdirSync(backupDir, { recursive: true });
if (fs.existsSync(targetPath)) {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const backupPath = path.join(backupDir, `${path.basename(targetPath, '.json')}-${stamp}.json`);
  fs.copyFileSync(targetPath, backupPath);
  console.log(`Backup: ${path.relative(process.cwd(), backupPath)}`);
}

const temporaryPath = `${targetPath}.tmp`;
fs.writeFileSync(temporaryPath, `${JSON.stringify(candidate, null, 2)}\n`, 'utf8');
JSON.parse(fs.readFileSync(temporaryPath, 'utf8'));
fs.renameSync(temporaryPath, targetPath);
console.log(`Installed: ${path.relative(process.cwd(), targetPath)}`);
console.log('Reload the development app so Metro rebundles the JSON module.');

function assertPreviewShape(value, currentSection, currentMode) {
  if (!Array.isArray(value) || value.length === 0) throw new Error('Preview candidate must be a non-empty JSON array.');
  const first = value[0];
  const checks = {
    'vr:practice': () => typeof first.body === 'string' && Array.isArray(first.verbal_reasoning_questions),
    'vr:timed': () => Array.isArray(first.passages),
    'dm:practice': () => typeof first.stem === 'string' && typeof first.type === 'string',
    'dm:timed': () => Array.isArray(first.questions),
    'qr:practice': () => first.stimulus && Array.isArray(first.quantitative_reasoning_questions),
    'qr:timed': () => Array.isArray(first.sets),
    'sj:practice': () => typeof first.body === 'string' && Array.isArray(first.situational_judgement_questions),
    'sj:timed': () => Array.isArray(first.scenarios),
  };
  if (!checks[`${currentSection}:${currentMode}`]()) {
    throw new Error(`Candidate does not match the ${currentSection.toUpperCase()} ${currentMode} preview shape.`);
  }
}
