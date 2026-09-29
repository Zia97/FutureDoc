// Deterministic checks complement an independent human/model content review.
import path from 'node:path';
import {
  TFC_OPTIONS,
  candidatePassages,
  isUuidV4,
  lexicalSimilarity,
  normaliseText,
  parseArgs,
  passageFormat,
  readJson,
  wordCount,
  writeJson,
} from './vr-common.mjs';

const args = parseArgs(process.argv.slice(2));
const inputPath = args._[0];
if (!inputPath) throw new Error('Usage: npm run questions:check:vr -- <candidate.json> [--expected-questions 20]');

const input = readJson(inputPath);
const parsed = candidatePassages(input, args.mode);
const corpus = args.corpus === 'none' ? null : readJson(args.corpus || 'content-authoring/cache/vr-corpus.json');
const brief = args.brief ? readJson(args.brief) : null;
const issues = [];
const ids = new Map();
const corpusIds = new Map();
for (const passage of corpus?.passages || []) {
  corpusIds.set(passage.id, `${passage.mode} passage "${passage.title}"`);
  for (const question of passage.questions || []) corpusIds.set(question.id, `${passage.mode} question in "${passage.title}"`);
}

if (parsed.mode === 'timed') validateTimedWrapper(parsed.wrappers[0]);
for (const [passageIndex, passage] of parsed.passages.entries()) validatePassage(passage, passageIndex);

const questionCount = parsed.passages.reduce(
  (sum, passage) => sum + (passage.verbal_reasoning_questions?.length || 0), 0,
);
if (args['expected-questions'] && questionCount !== Number(args['expected-questions'])) {
  add('error', 'batch.question_count', `Expected ${args['expected-questions']} questions but found ${questionCount}.`);
}
const formats = parsed.passages.map(passageFormat);
const mcCount = formats.filter((value) => value === 'mc').length;
const tfcCount = formats.filter((value) => value === 'tfc').length;
if (brief) validateBrief(brief, questionCount);
if (parsed.mode === 'practice' && parsed.passages.length >= 2 && mcCount <= tfcCount) {
  add('error', 'batch.format_ratio', `MC passages must outnumber TFC passages; found ${mcCount} MC and ${tfcCount} TFC.`);
}

const similarity = corpus ? compareWithCorpus(parsed.passages, corpus.passages || []) : [];
const report = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  input: relativePath(inputPath),
  mode: parsed.mode,
  counts: {
    passages: parsed.passages.length,
    questions: questionCount,
    mc_passages: mcCount,
    tfc_passages: tfcCount,
    errors: issues.filter((issue) => issue.severity === 'error').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
  },
  deterministic_verdict: issues.some((issue) => issue.severity === 'error') ? 'fail' : 'pass',
  issues,
  nearest_existing_content: similarity,
  note: 'A pass means the machine-checkable contract passed. It is not an answer-correctness verdict.',
};

const reportPath = args.report || inputPath.replace(/\.json$/i, '') + '.deterministic-report.json';
const written = writeJson(reportPath, report);
console.log(`Deterministic verdict: ${report.deterministic_verdict.toUpperCase()}`);
console.log(`Passages: ${report.counts.passages} | Questions: ${report.counts.questions}`);
console.log(`Errors: ${report.counts.errors} | Warnings: ${report.counts.warnings}`);
console.log(`Report: ${written}`);
for (const issue of issues) console.log(`[${issue.severity.toUpperCase()}] ${issue.code}: ${issue.message}`);
if (report.deterministic_verdict === 'fail' || (args.strict && report.counts.warnings)) process.exitCode = 1;

function add(severity, code, message, location) {
  issues.push({ severity, code, message, ...(location ? { location } : {}) });
}

function registerId(id, location) {
  if (!isUuidV4(id)) add('error', 'schema.uuid_v4', `Invalid UUID v4: ${String(id)}`, location);
  if (ids.has(id)) add('error', 'schema.duplicate_uuid', `UUID is also used at ${ids.get(id)}.`, location);
  else ids.set(id, location);
  if (corpusIds.has(id)) add('error', 'schema.corpus_uuid_collision', `UUID already belongs to ${corpusIds.get(id)}.`, location);
}

function validateTimedWrapper(test) {
  if (!test || typeof test !== 'object') return add('error', 'timed.wrapper', 'Missing timed-test wrapper.');
  if (test.passage_count !== 11) add('error', 'timed.passage_count', 'Timed VR passage_count must be 11.');
  if (test.question_count !== 44) add('error', 'timed.question_count', 'Timed VR question_count must be 44.');
  if (test.time_minutes !== 22) add('error', 'timed.time_minutes', 'Timed VR time_minutes must be 22.');
  if (test.passages?.length !== 11) add('error', 'timed.passages', 'Timed VR must contain exactly 11 passages.');
}

function validatePassage(passage, passageIndex) {
  const location = `passages[${passageIndex}]`;
  if (!passage || typeof passage !== 'object') return add('error', 'schema.passage', 'Passage must be an object.', location);
  checkKeys(
    passage,
    parsed.mode === 'practice'
      ? ['id', 'title', 'body', 'is_free', 'verbal_reasoning_questions']
      : ['id', 'title', 'body', 'verbal_reasoning_questions'],
    location,
  );
  registerId(passage.id, `${location}.id`);
  if (!nonEmpty(passage.title)) add('error', 'schema.title', 'Passage title must be a non-empty string.', location);
  if (parsed.mode === 'practice' && /^passage\s+\d+/i.test(String(passage.title || ''))) {
    add('error', 'schema.practice_title', 'Practice titles must not start with Passage N.', location);
  }
  if (!nonEmpty(passage.body)) add('error', 'schema.body', 'Passage body must be a non-empty string.', location);
  const words = wordCount(passage.body);
  if (words < 200 || words > 400) add('error', 'content.passage_length', `Passage has ${words} words; required range is 200-400.`, location);
  const paragraphs = String(passage.body || '').split(/\n\s*\n/).filter((value) => value.trim());
  if (paragraphs.length < 2) add('warning', 'content.paragraphs', 'Passage should contain at least two paragraphs.', location);
  if (parsed.mode === 'practice' && typeof passage.is_free !== 'boolean') {
    add('error', 'schema.is_free', 'Practice passage is_free must be a boolean.', location);
  }
  const questions = passage.verbal_reasoning_questions;
  if (!Array.isArray(questions) || questions.length !== 4) {
    add('error', 'schema.questions_per_passage', 'Each passage must contain exactly four questions.', location);
    return;
  }
  const format = passageFormat(passage);
  if (format === 'mixed' || format === 'unknown') add('error', 'schema.mixed_format', 'All four questions must use one format: MC or TFC.', location);
  const orderIndexes = new Set();
  const correctPositions = [];
  for (const [questionIndex, question] of questions.entries()) {
    const qLocation = `${location}.verbal_reasoning_questions[${questionIndex}]`;
    checkKeys(question, ['id', 'question_text', 'options', 'correct_answer', 'answer_reason', 'order_index', 'difficulty'], qLocation);
    registerId(question.id, `${qLocation}.id`);
    if (!nonEmpty(question.question_text)) add('error', 'schema.question_text', 'question_text must be non-empty.', qLocation);
    if (!Array.isArray(question.options)) add('error', 'schema.options', 'options must be an array.', qLocation);
    else if (format === 'tfc' && JSON.stringify(question.options) !== JSON.stringify(TFC_OPTIONS)) {
      add('error', 'schema.tfc_options', `TFC options must be exactly ${JSON.stringify(TFC_OPTIONS)}.`, qLocation);
    } else if (format === 'mc' && (question.options.length !== 4 || new Set(question.options).size !== 4 || !question.options.every(nonEmpty))) {
      add('error', 'schema.mc_options', 'MC options must be four unique non-empty strings.', qLocation);
    }
    if (!question.options?.includes(question.correct_answer)) {
      add('error', 'schema.correct_answer', 'correct_answer must exactly match one option.', qLocation);
    } else correctPositions.push(question.options.indexOf(question.correct_answer));
    if (!nonEmpty(question.answer_reason)) add('error', 'schema.answer_reason', 'answer_reason must be non-empty.', qLocation);
    else if (wordCount(question.answer_reason) < 12) add('warning', 'content.short_explanation', 'answer_reason is unusually short.', qLocation);
    if (![0, 1, 2, 3].includes(question.order_index)) add('error', 'schema.order_index', 'order_index must be 0, 1, 2, or 3.', qLocation);
    if (orderIndexes.has(question.order_index)) add('error', 'schema.order_index_duplicate', 'order_index is duplicated in this passage.', qLocation);
    orderIndexes.add(question.order_index);
    if (!['normal', 'hard'].includes(question.difficulty)) add('error', 'schema.difficulty', 'difficulty must be normal or hard.', qLocation);
  }
  if (orderIndexes.size !== 4) add('error', 'schema.order_index_sequence', 'order_index must contain 0, 1, 2, and 3 once each.', location);
  if (format === 'tfc' && new Set(questions.map((q) => q.correct_answer)).size < 3) {
    add('error', 'content.tfc_distribution', 'A TFC passage must use True, False, and Can\'t tell at least once.', location);
  }
  const normalisedQuestions = questions.map((question) => normaliseText(question.question_text));
  if (new Set(normalisedQuestions).size !== normalisedQuestions.length) {
    add('error', 'novelty.within_passage_question', 'A passage contains duplicate question text.', location);
  }
  if (format === 'mc' && new Set(correctPositions).size === 1) {
    add('warning', 'content.mc_position_distribution', 'All four MC answers use the same option position.', location);
  }
}

function validateBrief(value, actualQuestionCount) {
  if (value.mode && value.mode !== parsed.mode) add('error', 'brief.mode', `Brief mode ${value.mode} does not match candidate mode ${parsed.mode}.`);
  if (Number(value.question_count) !== actualQuestionCount) add('error', 'brief.question_count', `Brief requires ${value.question_count} questions but candidate has ${actualQuestionCount}.`);
  if (Number(value.passage_count) !== parsed.passages.length) add('error', 'brief.passage_count', `Brief requires ${value.passage_count} passages but candidate has ${parsed.passages.length}.`);
  const expectedMc = Number(value.format_allocation?.mc_passages);
  const expectedTfc = Number(value.format_allocation?.tfc_passages);
  if (Number.isFinite(expectedMc) && expectedMc !== mcCount) add('error', 'brief.mc_passages', `Brief requires ${expectedMc} MC passages but candidate has ${mcCount}.`);
  if (Number.isFinite(expectedTfc) && expectedTfc !== tfcCount) add('error', 'brief.tfc_passages', `Brief requires ${expectedTfc} TFC passages but candidate has ${tfcCount}.`);
  const difficulties = parsed.passages.flatMap((passage) => passage.verbal_reasoning_questions || []).map((question) => question.difficulty);
  const normal = difficulties.filter((value) => value === 'normal').length;
  const hard = difficulties.filter((value) => value === 'hard').length;
  const expectedNormal = Number(value.difficulty_allocation?.normal_questions);
  const expectedHard = Number(value.difficulty_allocation?.hard_questions);
  if (Number.isFinite(expectedNormal) && expectedNormal !== normal) add('error', 'brief.normal_questions', `Brief requires ${expectedNormal} normal questions but candidate has ${normal}.`);
  if (Number.isFinite(expectedHard) && expectedHard !== hard) add('error', 'brief.hard_questions', `Brief requires ${expectedHard} hard questions but candidate has ${hard}.`);
  if (corpus && !value.corpus_run_id) add('error', 'brief.corpus_run_id_missing', 'Brief must record the corpus run_id.');
  if (corpus && !corpus.run_id) add('error', 'corpus.run_id_missing', 'Loaded corpus has no run_id; refresh it before generation.');
  if (corpus && value.corpus_run_id && value.corpus_run_id !== corpus.run_id) add('error', 'brief.corpus_run_id', `Brief used corpus ${value.corpus_run_id}, but checker loaded ${corpus.run_id}.`);
}

function compareWithCorpus(candidate, existing) {
  const results = [];
  for (const [candidateIndex, passage] of candidate.entries()) {
    const passageText = `${passage.title || ''} ${passage.body || ''}`;
    const passageMatches = existing
      .map((item) => ({
        existing_id: item.id,
        mode: item.mode,
        title: item.title,
        score: lexicalSimilarity(passageText, `${item.title || ''} ${item.body || ''}`),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter((match) => match.score >= 0.18);
    if (passageMatches[0]?.score >= 0.55) {
      add('error', 'novelty.passage_near_duplicate', `Passage resembles existing "${passageMatches[0].title}" (score ${passageMatches[0].score}).`, `passages[${candidateIndex}]`);
    } else if (passageMatches[0]?.score >= 0.35) {
      add('warning', 'novelty.passage_similarity', `Review similarity to existing "${passageMatches[0].title}" (score ${passageMatches[0].score}).`, `passages[${candidateIndex}]`);
    }
    const candidateQuestions = passage.verbal_reasoning_questions || [];
    const questionMatches = candidateQuestions.map((question, questionIndex) => {
      const nearest = existing.flatMap((item) => item.questions.map((existingQuestion) => ({
        existing_id: existingQuestion.id,
        passage_title: item.title,
        mode: item.mode,
        question_text: existingQuestion.question_text,
        score: lexicalSimilarity(
          `${passage.title || ''} ${question.question_text || ''}`,
          `${item.title || ''} ${existingQuestion.question_text || ''}`,
        ),
      }))).sort((a, b) => b.score - a.score)[0];
      if (nearest?.score >= 0.72) {
        add('error', 'novelty.question_near_duplicate', `Question resembles one in "${nearest.passage_title}" (score ${nearest.score}).`, `passages[${candidateIndex}].questions[${questionIndex}]`);
      } else if (nearest?.score >= 0.5) {
        add('warning', 'novelty.question_similarity', `Review question against "${nearest.passage_title}" (score ${nearest.score}).`, `passages[${candidateIndex}].questions[${questionIndex}]`);
      }
      return nearest && nearest.score >= 0.3 ? { candidate_order_index: question.order_index, ...nearest } : null;
    }).filter(Boolean);
    results.push({
      candidate_id: passage.id,
      candidate_title: passage.title,
      passage_matches: passageMatches,
      question_matches: questionMatches,
    });
  }
  for (let left = 0; left < candidate.length; left += 1) {
    for (let right = left + 1; right < candidate.length; right += 1) {
      const leftText = `${candidate[left].title || ''} ${candidate[left].body || ''}`;
      const rightText = `${candidate[right].title || ''} ${candidate[right].body || ''}`;
      const score = lexicalSimilarity(leftText, rightText);
      if (score >= 0.55) add('error', 'novelty.within_batch_passage', `Candidate passages ${left + 1} and ${right + 1} are too similar (score ${score}).`);
      else if (score >= 0.35) add('warning', 'novelty.within_batch_passage', `Review candidate passages ${left + 1} and ${right + 1} for overlap (score ${score}).`);
      const leftQuestions = candidate[left].verbal_reasoning_questions || [];
      const rightQuestions = candidate[right].verbal_reasoning_questions || [];
      for (const leftQuestion of leftQuestions) {
        for (const rightQuestion of rightQuestions) {
          const questionScore = lexicalSimilarity(
            `${candidate[left].title || ''} ${leftQuestion.question_text || ''}`,
            `${candidate[right].title || ''} ${rightQuestion.question_text || ''}`,
          );
          if (questionScore >= 0.78) {
            add('warning', 'novelty.within_batch_question', `Review similar questions in passages ${left + 1} and ${right + 1} (score ${questionScore}).`);
          }
        }
      }
    }
  }
  return results;
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function checkKeys(value, allowed, location) {
  for (const key of Object.keys(value || {})) {
    if (!allowed.includes(key)) add('error', 'schema.unknown_field', `Unknown app-JSON field: ${key}.`, location);
  }
}

function relativePath(value) {
  const relative = path.relative(process.cwd(), path.resolve(value));
  return relative || path.basename(value);
}
