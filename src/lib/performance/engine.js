// Shared by the authenticated edge function and the local analysis tests.
// No UI, network calls, predictions or model-generated statistics live here.
import { getSJMark } from '../sjScoring.js';
import { compareCohort } from './cohort.js';

export const SECTIONS = ['vr', 'dm', 'qr', 'sj'];
export const MIN_SKILL_QUESTIONS = 10;
export const MIN_SKILL_SETS = 3;
const DAY = 86400000;
export const questionKey = (section, mode, id) => `${section}:${mode}:${id}`;
const percent = (earned, possible) => possible > 0 ? Math.round(100 * earned / possible) : null;
const hasAnswer = (value) => value !== null && value !== undefined && value !== '';
const dateMs = (value) => Date.parse(value) || 0;

export function createCatalogue(batches) {
  return {
    skills: batches.flatMap((batch) => batch.skills.map((skill) => ({ ...skill, section: batch.section }))),
    questions: batches.flatMap((batch) => batch.questions.map((q) => ({ ...q, section: batch.section }))),
  };
}

export function gradeResponse(question, selectedAnswer, fallbackCorrect = null) {
  if (question?.excludedReason) return { earned: null, possible: 0 };
  const statements = question?.statementAnswers;
  if (Array.isArray(statements) && statements.length) {
    let selected = selectedAnswer;
    if (typeof selected === 'string') {
      try { selected = JSON.parse(selected); } catch { selected = null; }
    }
    const correct = statements.filter((answer, i) => selected?.[i] === answer).length;
    return { earned: correct === statements.length ? 2 : (statements.length === 5 && correct === 4 ? 1 : 0), possible: 2 };
  }
  if (question?.section === 'sj' && question.answer) {
    return { earned: getSJMark(selectedAnswer, question.answer, question), possible: 1 };
  }
  if (question?.answer != null) return { earned: selectedAnswer === question.answer ? 1 : 0, possible: 1 };
  if (typeof fallbackCorrect === 'boolean') return { earned: fallbackCorrect ? 1 : 0, possible: 1 };
  return { earned: null, possible: 0 };
}

function validTime(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 500 && value <= 600000 ? value : null;
}

// DM practice telemetry stores a row for each statement, with the same whole-
// question time on every row. Reconstruct first/latest responses per statement
// before scoring; never multiply the timing by the number of statements.
function collapseAttempts(rows, byKey, latest = false) {
  const sorted = [...rows].sort((a, b) => dateMs(a.answeredAt) - dateMs(b.answeredAt) || String(a.id).localeCompare(String(b.id)));
  if (latest) sorted.reverse();
  const selected = new Map();
  for (const row of sorted) {
    const key = `${questionKey(row.section, row.mode, row.questionId)}:${row.statementIndex ?? -1}`;
    if (!selected.has(key)) selected.set(key, row);
  }
  const groups = new Map();
  for (const row of selected.values()) {
    const key = questionKey(row.section, row.mode, row.questionId);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.entries()].map(([key, parts]) => {
    const q = parts[0].tag ?? byKey.get(key);
    const row = parts[0];
    let answer = row.selectedAnswer;
    let timeMs = validTime(row.timeMs);
    let incomplete = false;
    if (row.mode === 'practice' && q?.statementAnswers?.length) {
      answer = Object.fromEntries(parts.filter((p) => p.statementIndex != null).map((p) => [p.statementIndex, p.selectedAnswer]));
      incomplete = q.statementAnswers.some((_, i) => !hasAnswer(answer[i]));
      // Different recorded durations may belong to different retries. Do not
      // manufacture a combined duration from those historical statement rows.
      if (new Set(parts.map((p) => p.timeMs)).size > 1) timeMs = null;
    }
    const grade = incomplete ? { earned: null, possible: 0 } : gradeResponse(q, answer, row.isCorrect);
    return {
      key, section: row.section, mode: row.mode, questionId: row.questionId, tag: q,
      cohortMode: row.cohortMode ?? row.mode, kind: row.kind, interrupted: row.interrupted === true,
      parentId: q?.parentId ?? row.questionId, skillId: q?.primarySkillId ?? null,
      difficulty: q?.difficulty ?? 'unknown', confidence: q?.confidence ?? 'low',
      answeredAt: parts.map((p) => p.answeredAt).sort((a, b) => dateMs(b) - dateMs(a))[0],
      testId: row.testId ?? null, ...grade, timeMs,
      answered: q?.statementAnswers?.length ? Object.values(answer ?? {}).some(hasAnswer) : hasAnswer(answer),
      excluded: !!q?.excludedReason || incomplete,
      tagged: !!q && q.confidence !== 'low' && !q.excludedReason,
    };
  });
}

export function summarise(rows) {
  const graded = rows.filter((r) => r.possible > 0 && r.earned != null && !r.excluded);
  const earned = graded.reduce((sum, r) => sum + r.earned, 0);
  const possible = graded.reduce((sum, r) => sum + r.possible, 0);
  const times = graded.filter((r) => r.answered && r.timeMs != null).map((r) => r.timeMs).sort((a, b) => a - b);
  const middle = Math.floor(times.length / 2);
  return {
    accuracy: percent(earned, possible), earned, possible,
    questions: graded.length, sets: new Set(graded.map((r) => r.parentId)).size,
    answered: graded.filter((r) => r.answered).length,
    medianSeconds: times.length ? Math.round((times.length % 2 ? times[middle] : (times[middle - 1] + times[middle]) / 2) / 100) / 10 : null,
    timedQuestions: times.length,
  };
}

// Compare only difficulty strata with enough fresh questions in BOTH windows.
// This avoids calling a switch from hard to easy practice an improvement.
export function comparableTrend(rows, now) {
  let weightedDelta = 0, weight = 0, recentCount = 0, priorCount = 0;
  for (const difficulty of ['normal', 'hard']) {
    const matching = rows.filter((r) => r.difficulty === difficulty && r.possible > 0);
    const recent = summarise(matching.filter((r) => dateMs(r.answeredAt) >= now - 14 * DAY));
    const prior = summarise(matching.filter((r) => dateMs(r.answeredAt) >= now - 28 * DAY && dateMs(r.answeredAt) < now - 14 * DAY));
    if (recent.questions < 5 || prior.questions < 5) continue;
    const n = Math.min(recent.questions, prior.questions);
    weightedDelta += (recent.accuracy - prior.accuracy) * n;
    weight += n;
    recentCount += recent.questions;
    priorCount += prior.questions;
  }
  return weight ? { delta: Math.round(weightedDelta / weight), recentCount, priorCount } : null;
}

function weekHistory(rows, now) {
  const end = new Date(now);
  end.setUTCHours(0, 0, 0, 0);
  // Rolling 7-day blocks ending today, with explicit dates for display.
  return Array.from({ length: 6 }, (_, i) => {
    const start = end.getTime() + DAY - (6 - i) * 7 * DAY;
    const subset = rows.filter((r) => dateMs(r.answeredAt) >= start && dateMs(r.answeredAt) < start + 7 * DAY);
    return { date: new Date(start).toISOString(), ...summarise(subset) };
  });
}

export function buildPerformanceReport({ catalogue, attempts, cohort = null, mode = 'practice', isPro = false, now = Date.now() }) {
  if (!['practice', 'timed', 'coaching', 'combined'].includes(mode)) throw new Error('Invalid performance mode');
  const byKey = new Map(catalogue.questions.map((q) => [questionKey(q.section, q.mode, q.id), q]));
  const safeRows = attempts.filter((r) => SECTIONS.includes(r.section) && ['practice', 'timed', 'coaching'].includes(r.mode) && dateMs(r.answeredAt) <= now);
  const firstAll = collapseAttempts(safeRows, byKey);
  const latestAll = collapseAttempts(safeRows, byKey, true);
  const combined = new Map();
  for (const row of [...firstAll].sort((a, b) => dateMs(a.answeredAt) - dateMs(b.answeredAt) || a.key.localeCompare(b.key))) {
    const id = `${row.section}:${row.questionId}`;
    if (!combined.has(id)) combined.set(id, row);
  }
  const first = mode === 'combined' ? [...combined.values()] : firstAll.filter((r) => r.mode === mode);
  const sections = SECTIONS.map((section) => {
    const rows = first.filter((r) => r.section === section);
    return { section, ...summarise(rows), excludedQuestions: rows.filter((r) => r.excluded).length,
      cohort: compareCohort(rows, byKey, cohort, gradeResponse, { section, mode }),
      conditions: mode === 'coaching' ? ['assessment', 'practice', 'timed_check', 'review'].map((kind) => ({ kind, ...summarise(rows.filter((r) => r.kind === kind)) })) : undefined };
  });
  const overview = { ...summarise(first), sections, excludedQuestions: first.filter((r) => r.excluded).length };
  const report = { schemaVersion: 1, generatedAt: new Date(now).toISOString(), mode, access: isPro ? 'pro' : 'free', overview, details: null,
    skillCatalogue: catalogue.skills.map(({ id, section, label }) => ({ id, section, label })) };
  // This early return is also the server boundary: free responses contain no
  // skill metrics, question IDs, recommendations or practice selections.
  if (!isPro) return report;

  const skillRows = first.filter((r) => r.tagged && !r.excluded);
  const practiceLatest = new Map(latestAll.filter((r) => r.mode === 'practice' || r.mode === 'coaching')
    .sort((a, b) => dateMs(a.answeredAt) - dateMs(b.answeredAt)).map((r) => [r.questionId, r]));
  const skills = catalogue.skills.map((skill) => {
    const rows = skillRows.filter((r) => r.skillId === skill.id);
    const stats = summarise(rows);
    const supported = stats.questions >= MIN_SKILL_QUESTIONS && stats.sets >= MIN_SKILL_SETS;
    const allModes = firstAll.filter((r) => r.tagged && !r.excluded && r.skillId === skill.id);
    const practice = summarise(allModes.filter((r) => r.mode === 'practice'));
    const timed = summarise(allModes.filter((r) => r.mode === 'timed'));
    const coaching = summarise(allModes.filter((r) => r.mode === 'coaching'));
    const eligible = catalogue.questions.filter((q) => q.section === skill.section && q.mode === 'practice' && q.primarySkillId === skill.id && q.confidence !== 'low' && !q.excludedReason);
    const seen = new Set(latestAll.filter((r) => r.section === skill.section).map((r) => r.questionId));
    const unseen = eligible.filter((q) => !seen.has(q.id));
    const review = eligible.filter((q) => {
      const last = practiceLatest.get(q.id);
      return last && last.possible > 0 && last.earned < last.possible;
    }).sort((a, b) => dateMs(practiceLatest.get(a.id).answeredAt) - dateMs(practiceLatest.get(b.id).answeredAt));
    const lastAt = rows.reduce((max, r) => Math.max(max, dateMs(r.answeredAt)), 0);
    const stale = lastAt > 0 && now - lastAt > 28 * DAY;
    // Mixed coaching conditions and All remain visible as history, without
    // presenting a change of practice conditions as a measured improvement.
    const trend = supported && !stale && (mode === 'practice' || mode === 'timed') ? comparableTrend(rows, now) : null;
    const status = !stats.questions ? 'Unexplored' : !supported ? 'Early signal' : stale ? 'Check again' : stats.accuracy >= 80 ? 'Strong' : stats.accuracy >= 60 ? 'Developing' : 'Needs practice';
    return {
      ...skill, ...stats, supported, stale, status, trend,
      practice, timed, coaching, history: weekHistory(rows, now),
      newQuestionIds: unseen.map((q) => q.id), reviewQuestionIds: review.map((q) => q.id),
      // Evidence strength and recent performance, not an invented score uplift.
      priority: supported && !stale && stats.accuracy < 80 && eligible.length ? (100 - stats.accuracy) * Math.min(1, stats.questions / 25) : 0,
    };
  });
  const priorities = skills.filter((s) => s.priority > 0).sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id)).slice(0, 3).map((s) => s.id);
  report.details = {
    skills, priorities,
    reviewCount: skills.reduce((sum, s) => sum + s.reviewQuestionIds.length, 0),
    freshQuestionCount: skills.reduce((sum, s) => sum + s.newQuestionIds.length, 0),
    excludedFromSkills: first.filter((r) => !r.tagged || r.excluded).length,
    history: SECTIONS.map((section) => ({ section, weeks: weekHistory(skillRows.filter((r) => r.section === section), now) })),
  };
  return report;
}

export function choosePracticeQuestions(skill, kind = 'fresh', limit = 8) {
  const source = kind === 'review' ? skill.reviewQuestionIds : skill.newQuestionIds;
  return [...new Set(source ?? [])].slice(0, Math.max(1, Math.min(20, limit)));
}
