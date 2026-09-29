import fs from 'node:fs';
import path from 'node:path';

export const TFC_OPTIONS = ['True', 'False', "Can't tell"];

export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith('--')) {
      args._.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

export function writeJson(filePath, value) {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return resolved;
}

export function loadEnvFile(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) return;
  for (const rawLine of fs.readFileSync(resolved, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

export function isUuidV4(value) {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function wordCount(value) {
  const words = String(value || '').trim().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
  return words?.length || 0;
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'for', 'from',
  'had', 'has', 'have', 'he', 'her', 'his', 'in', 'into', 'is', 'it', 'its', 'not',
  'of', 'on', 'or', 'that', 'the', 'their', 'there', 'they', 'this', 'to', 'was',
  'were', 'which', 'who', 'with', 'would', 'according', 'passage', 'following',
]);

export function normaliseText(value) {
  return String(value || '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}'\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value) {
  return new Set(normaliseText(value).split(' ').filter((word) => word.length > 2 && !STOP_WORDS.has(word)));
}

function jaccard(left, right) {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

function ngrams(value, size = 3) {
  const text = normaliseText(value).replace(/\s/g, '');
  const result = new Set();
  for (let i = 0; i <= text.length - size; i += 1) result.add(text.slice(i, i + size));
  return result;
}

function dice(left, right) {
  const a = ngrams(left);
  const b = ngrams(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return (2 * intersection) / (a.size + b.size);
}

export function lexicalSimilarity(left, right) {
  if (!left || !right) return 0;
  if (normaliseText(left) === normaliseText(right)) return 1;
  return Number((0.7 * jaccard(left, right) + 0.3 * dice(left, right)).toFixed(4));
}

export function candidatePassages(input, modeHint) {
  if (!Array.isArray(input)) throw new Error('Top-level JSON value must be an array.');
  const looksTimed = input.length === 1 && input[0] && Array.isArray(input[0].passages);
  const mode = modeHint || (looksTimed ? 'timed' : 'practice');
  if (mode === 'timed') {
    if (!looksTimed) throw new Error('Timed VR expects an array containing one test wrapper with a passages array.');
    return { mode, wrappers: input, passages: input[0].passages };
  }
  if (looksTimed) throw new Error('Practice VR expects a flat array of passages, without a test wrapper.');
  return { mode, wrappers: [], passages: input };
}

export function passageFormat(passage) {
  const questions = passage?.verbal_reasoning_questions || [];
  if (!questions.length) return 'unknown';
  const tfc = questions.every((q) => isTfcOptions(q.options));
  const mc = questions.every((q) => Array.isArray(q.options) && q.options.length === 4 &&
    JSON.stringify(q.options) !== JSON.stringify(TFC_OPTIONS));
  return tfc ? 'tfc' : mc ? 'mc' : 'mixed';
}

export function corpusFromPreview(practiceInput, timedInput) {
  const passages = [];
  for (const passage of practiceInput) passages.push(normalisePassage(passage, 'practice', null));
  for (const test of timedInput) {
    for (const passage of test.passages || []) passages.push(normalisePassage(passage, 'timed', test.id));
  }
  return buildCorpus('preview-json', passages, {
    warning: 'Offline preview fallback: incomplete and potentially stale compared with Supabase.',
    timed_tests: timedInput.map(({ id, title, passage_count, question_count, time_minutes }) => ({
      id, title, passage_count, question_count, time_minutes,
    })),
  });
}

export function corpusFromRows(rows) {
  const practiceQuestionsByPassage = groupBy(rows.practiceQuestions, 'passage_id');
  const timedQuestionsByPassage = groupBy(rows.timedQuestions, 'passage_id');
  const passages = [
    ...rows.practicePassages.map((p) => normalisePassage({
      ...p,
      verbal_reasoning_questions: practiceQuestionsByPassage.get(p.id) || [],
    }, 'practice', null)),
    ...rows.timedPassages.map((p) => normalisePassage({
      ...p,
      verbal_reasoning_questions: timedQuestionsByPassage.get(p.id) || [],
    }, 'timed', p.test_id)),
  ];
  return buildCorpus('supabase', passages, {
    content_versions: rows.contentVersions,
    timed_tests: rows.timedTests,
  });
}

function groupBy(rows, key) {
  const result = new Map();
  for (const row of rows) {
    const values = result.get(row[key]) || [];
    values.push(row);
    result.set(row[key], values);
  }
  for (const values of result.values()) values.sort((a, b) => a.order_index - b.order_index);
  return result;
}

function normalisePassage(passage, mode, testId) {
  const questions = [...(passage.verbal_reasoning_questions || [])]
    .sort((a, b) => a.order_index - b.order_index)
    .map((q) => ({
      id: q.id,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      answer_reason: q.answer_reason,
      order_index: q.order_index,
      difficulty: q.difficulty || 'normal',
    }));
  return {
    id: passage.id,
    section: 'vr',
    mode,
    test_id: testId,
    title: passage.title,
    body: passage.body,
    format: passageFormat({ verbal_reasoning_questions: questions }),
    questions,
  };
}

function buildCorpus(source, passages, metadata = {}) {
  passages.sort((a, b) => `${a.mode}:${a.test_id || ''}:${a.title}`.localeCompare(`${b.mode}:${b.test_id || ''}:${b.title}`));
  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    source,
    section: 'vr',
    metadata,
    counts: {
      passages: passages.length,
      questions: passages.reduce((sum, p) => sum + p.questions.length, 0),
      practice_passages: passages.filter((p) => p.mode === 'practice').length,
      timed_passages: passages.filter((p) => p.mode === 'timed').length,
    },
    passages,
  };
}

function isTfcOptions(options) {
  if (!Array.isArray(options) || options.length !== 3) return false;
  return options.map((value) => String(value).toLowerCase()).join('|') === "true|false|can't tell";
}
