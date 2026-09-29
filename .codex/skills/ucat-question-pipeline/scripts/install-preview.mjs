// Installs a validated candidate into the static JSON file used by the app's Developer toggle.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, readJson } from './vr-common.mjs';
import { validateSectionCandidate } from './section-validator-core.mjs';

const args = parseArgs(process.argv.slice(2));
const inputPath = args._[0];
const section = String(args.section || '').toLowerCase();
const mode = String(args.mode || 'practice').toLowerCase();
const append = args.append === true;
const allowedSections = new Set(['vr', 'dm', 'qr', 'sj']);

if (!inputPath || !allowedSections.has(section) || !['practice', 'timed'].includes(mode)) {
  throw new Error('Usage: npm run questions:preview:install -- <candidate.json> -- --section <vr|dm|qr|sj> --mode <practice|timed> --brief <brief.json> [--append] --write');
}
if (append && (section !== 'qr' || mode !== 'practice')) {
  throw new Error('--append currently supports QR practice previews only.');
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
let output = candidate;
let addedSets = candidate.length;
if (append && fs.existsSync(targetPath)) {
  const existing = readJson(targetPath);
  assertPreviewShape(existing, section, mode);
  const existingById = new Map(existing.map((set) => [set.id, set]));
  const additions = candidate.filter((set) => {
    const previous = existingById.get(set.id);
    if (!previous) return true;
    if (JSON.stringify(previous) !== JSON.stringify(set)) {
      throw new Error(`Preview already contains set ${set.id} with different content.`);
    }
    return false;
  });
  output = [...existing, ...additions];
  addedSets = additions.length;
  const mergedValidation = validateSectionCandidate({ section, input: output, modeHint: mode });
  if (mergedValidation.deterministic_verdict !== 'pass') {
    const summary = mergedValidation.issues.filter((issue) => issue.severity === 'error').slice(0, 8)
      .map((issue) => `${issue.code}: ${issue.message}`).join('\n- ');
    throw new Error(`Combined QR preview is invalid:\n- ${summary}`);
  }
}
console.log(`Candidate: ${path.relative(process.cwd(), path.resolve(inputPath))}`);
console.log(`Target: ${path.relative(process.cwd(), targetPath)}`);
if (append) {
  const questionCount = (sets) => sets.reduce((total, set) => total + set.quantitative_reasoning_questions.length, 0);
  console.log(`Append: ${addedSets} new set(s); combined preview ${output.length} set(s), ${questionCount(output)} question(s)`);
}

if (!args.write) {
  console.log('Dry run only. Re-run with --write to install the validated preview.');
  process.exit(0);
}
if (append && addedSets === 0) {
  console.log('Candidate is already present in the QR preview; no file changed.');
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
fs.writeFileSync(temporaryPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
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
