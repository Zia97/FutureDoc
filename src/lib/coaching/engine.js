import { gradeResponse, summarise, comparableTrend } from '../performance/engine.js';
import { getVRScaledScore, getDMScaledScore, getQRScaledScore } from '../ucatScoring.js';

export const COACH_VERSION = 'coach-v1';
export const SECTIONS = ['vr', 'dm', 'qr', 'sj'];
export const SECTION_SECONDS = { vr: 360, dm: 760, qr: 520, sj: 270 };
export const SECTION_NAMES = { vr: 'Verbal Reasoning', dm: 'Decision Making', qr: 'Quantitative Reasoning', sj: 'Situational Judgement' };
const DAY = 86400000;
const answered = (a) => a != null && a !== '' && (typeof a !== 'object' || Object.keys(a).length > 0);
const key = (q) => `${q.section}:${q.mode === 'timed' ? 'timed' : 'practice'}:${q.questionId ?? q.id}`;

export function validExamDate(value) {
  return value === null || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value);
}

// Complete parent groups only. Scoring/tag snapshots are frozen with every session.
/** @param {{catalogue: any, section: string, evidence?: any[], skillId?: string, review?: boolean, assessment?: boolean, seed?: number}} options */
export function selectGroups({ catalogue, section, evidence = [], skillId, review = false, assessment = false, seed = 0 }) {
  const all = catalogue.questions.filter((q) => q.section === section && q.mode === 'practice');
  const groups = new Map();
  for (const q of all) { if (!groups.has(q.parentId)) groups.set(q.parentId, []); groups.get(q.parentId).push(q); }
  const seen = new Set(evidence.map(key));
  const latest = new Map();
  for (const e of [...evidence].sort((a, b) => String(a.answeredAt).localeCompare(String(b.answeredAt)))) latest.set(key(e), e);
  const wrong = new Set([...latest].filter(([, e]) => e.earned < e.possible).map(([k]) => k));
  const targetSize = section === 'dm' ? 1 : section === 'sj' ? 3 : 4;
  let candidates = [...groups.values()].filter((qs) => qs.every((q) => !q.excludedReason && q.confidence !== 'low') &&
    (!assessment || qs.length === targetSize) && qs.length <= 5 &&
    (!skillId || qs.some((q) => q.primarySkillId === skillId)) &&
    (assessment || (review ? qs.some((q) => wrong.has(key(q))) : qs.every((q) => !seen.has(key(q))))));
  const hash = (s) => [...s].reduce((n, c) => (Math.imul(n, 31) + c.charCodeAt(0)) >>> 0, seed >>> 0);
  candidates.sort((a, b) => hash(a[0].parentId) - hash(b[0].parentId));
  const selected = [], covered = new Set(), formats = new Set();
  const count = assessment ? 12 / targetSize : section === 'dm' ? 4 : 1;
  while (selected.length < count && candidates.length) {
    const score = (qs) => qs.reduce((n, q) => n + (!covered.has(q.primarySkillId) ? 4 : 0) + (!formats.has(q.format) ? 2 : 0), 0) / qs.length;
    candidates.sort((a, b) => score(b) - score(a));
    const next = candidates.shift(); selected.push(next);
    next.forEach((q) => { covered.add(q.primarySkillId); formats.add(q.format); });
  }
  if (!selected.length || (assessment && selected.length !== count)) throw new Error('question_pool_exhausted');
  return selected.flat();
}

// A sensitivity range, NOT an empirically calibrated confidence interval. Never
// use real-exam SEM for a 12-question sample or alter estimates to sell Pro.
export function practiceEstimate(sections) {
  const converters = { vr: getVRScaledScore, dm: getDMScaledScore, qr: getQRScaledScore };
  const results = {};
  for (const section of ['vr', 'dm', 'qr']) {
    const s = sections.find((r) => r.section === section);
    if (!s?.possible || s.questions !== 12) return null;
    const delta = 2 * s.possible / s.questions;
    const convert = (marks) => Math.round(converters[section](100 * Math.max(0, Math.min(s.possible, marks)) / s.possible) / 10) * 10;
    results[section] = { value: convert(s.earned), low: convert(s.earned - delta), high: convert(s.earned + delta) };
  }
  const sum = (field) => Object.values(results).reduce((n, r) => n + r[field], 0);
  return { value: sum('value'), low: sum('low'), high: sum('high'), sections: results,
    method: 'existing-app-mapping-sensitivity-v1', label: 'Practice estimate',
    explanation: 'A rough conversion using the app’s practice scoring model. The illustrative range shows the effect of two questions per section changing. It is not a confidence interval or a prediction of your UCAT score. This short assessment has not been calibrated against real exam results.' };
}

export function sessionEvidence(session) {
  return session.questions.map((q) => {
    const answer = session.progress.answers[q.id] ?? null;
    return { id: `${session.id}:${q.id}`, sessionId: session.id, questionId: q.id, section: q.section,
      mode: 'coach', kind: session.kind, tag: q.tag, selectedAnswer: answer,
      timeMs: session.progress.times[q.id] ?? 0, answeredAt: session.completed_at,
      interrupted: session.progress.interrupted, ...gradeResponse(q.tag, answer) };
  });
}

// Reconstruct statement telemetry before using it as evidence. All retakes stay
// in storage; only the first encounter counts towards fresh-question trends.
export function normaliseEvidence(raw, catalogue) {
  const tags = new Map(catalogue.questions.map((q) => [key(q), q]));
  const statementGroups = new Map();
  const rows = [];
  for (const e of [...raw].sort((a, b) => String(a.answeredAt).localeCompare(String(b.answeredAt)))) {
    const tag = e.tag ?? tags.get(key(e));
    if (!tag || tag.excludedReason || tag.confidence === 'low') continue;
    if (e.statementIndex != null) {
      const k = key(e);
      if (!statementGroups.has(k) || statementGroups.get(k).selectedAnswer[e.statementIndex] != null) statementGroups.set(k, { ...e, tag, selectedAnswer: {}, times: new Set() });
      const group = statementGroups.get(k);
      group.selectedAnswer[e.statementIndex] = e.selectedAnswer; group.times.add(e.timeMs); group.answeredAt = e.answeredAt;
      if (tag.statementAnswers?.every((_, i) => answered(group.selectedAnswer[i]))) {
        rows.push({ ...group, timeMs: group.times.size === 1 ? [...group.times][0] : null });
        statementGroups.delete(k);
      }
    } else rows.push({ ...e, tag });
  }
  return rows.map((e) => ({ ...e, ...gradeResponse(e.tag, e.selectedAnswer), parentId: e.tag.parentId,
    skillId: e.tag.primarySkillId, difficulty: e.tag.difficulty, answered: answered(e.selectedAnswer),
    timeMs: Number.isFinite(e.timeMs) && e.timeMs >= 500 && e.timeMs <= 600000 ? e.timeMs : null }));
}

export function buildCoachProfile({ catalogue, rawEvidence, examDate = null, baselineCompletedAt = null, now = Date.now() }) {
  const evidence = normaliseEvidence(rawEvidence, catalogue);
  const first = new Map();
  for (const row of [...evidence].sort((a, b) => String(a.answeredAt).localeCompare(String(b.answeredAt)))) if (!first.has(key(row))) first.set(key(row), row);
  const fresh = [...first.values()];
  const baselineTime = Date.parse(baselineCompletedAt);
  const runningEvidence = Number.isFinite(baselineTime)
    ? fresh.filter((row) => Date.parse(row.answeredAt) >= baselineTime)
    : [];
  const firstInSection = new Map();
  for (const row of [...runningEvidence].sort((a, b) => Date.parse(a.answeredAt) - Date.parse(b.answeredAt)
    || Number(b.kind === 'assessment') - Number(a.kind === 'assessment') || String(a.id).localeCompare(String(b.id)))) {
    const questionKey = `${row.section}:${row.questionId}`;
    if (!firstInSection.has(questionKey)) firstInSection.set(questionKey, row);
  }
  const runningSections = SECTIONS.map((section) => {
    const rows = [...firstInSection.values()].filter((row) => row.section === section)
      .sort((a, b) => Date.parse(a.answeredAt) - Date.parse(b.answeredAt) || String(a.id).localeCompare(String(b.id)))
      .slice(-20);
    return { section, ...summarise(rows) };
  });
  const skills = catalogue.skills.map((skill) => {
    const rows = fresh.filter((r) => r.skillId === skill.id);
    const stats = summarise(rows);
    const last = rows.map((r) => r.answeredAt).sort().at(-1) ?? null;
    const enough = stats.questions >= 10 && stats.sets >= 3;
    const timed = rows.filter((r) => (r.mode === 'timed' || r.kind === 'timed_check' || r.kind === 'assessment') && !r.interrupted);
    const practice = rows.filter((r) => r.mode === 'practice' || (r.mode === 'coach' && r.kind === 'practice'));
    return { ...skill, ...stats, last, confidence: enough ? 'established' : 'early signal',
      practice: summarise(practice), timed: summarise(timed),
      stale: !!last && Date.parse(last) < now - 28 * DAY,
      trend: comparableTrend(practice, now), timedTrend: comparableTrend(timed, now),
      priority: !stats.questions ? 55 : (100 - stats.accuracy) + (!enough ? 10 : 0) + (last && Date.parse(last) < now - 28 * DAY ? 20 : 0) };
  });
  const strengths = skills.filter((s) => s.questions >= 3 && s.accuracy >= 75).sort((a, b) => b.questions - a.questions || b.accuracy - a.accuracy).slice(0, 6);
  const weaknesses = skills.filter((s) => s.questions >= 2 && s.accuracy < 65).sort((a, b) => b.priority - a.priority).slice(0, 6);
  const ranked = [...skills].sort((a, b) => b.priority - a.priority);
  const daysToExam = examDate ? Math.ceil((Date.parse(examDate) - now) / DAY) : null;
  const recommended = ranked[0];
  const plan = ranked.slice(0, 3).map((s, i) => ({ skillId: s.id, section: s.section, title: s.label,
    reason: s.questions ? `${s.accuracy}% of marks across ${s.questions} fresh ${s.questions === 1 ? 'question' : 'questions'}${s.stale ? '; due for another check' : ''}${s.confidence === 'early signal' ? '. An early signal to explore' : ''}.` : 'We need more evidence in this skill.',
    tip: s.tip, lessonRoute: s.lessonRoute, lessonId: s.lessonId, order: i + 1 }));
  return { version: COACH_VERSION, generatedAt: new Date(now).toISOString(), skills, strengths, weaknesses, plan, runningSections,
    daysToExam, totalAttempts: rawEvidence.length, freshQuestions: fresh.length,
    summary: fresh.length ? `You have built a starting picture from ${fresh.length} fresh questions. ${recommended ? `Let’s work on ${recommended.label.toLowerCase()} next, one set at a time.` : 'Keep building your evidence, one set at a time.'}` : 'Your assessment will give us a starting point. You do not need to be perfect to begin.',
    dailyAdvice: daysToExam != null && daysToExam < 0 ? 'Your saved exam date has passed. Update it when you are ready to plan your next steps.' : daysToExam != null && daysToExam <= 2 ? 'Keep today light: review a familiar technique, take a break and prioritise rest.' : 'Start with one recommended set. Review the explanation, then continue or stop whenever you are ready.',
    sections: SECTIONS.map((section) => ({ section, ...summarise(fresh.filter((r) => r.section === section)) })),
    milestones: [fresh.length >= 48 && 'Completed your starting assessment', fresh.length >= 100 && '100 fresh questions explored', fresh.length >= 250 && '250 fresh questions explored', strengths.some((s) => s.confidence === 'established') && 'A strength supported by repeated evidence'].filter(Boolean),
    history: Array.from({ length: 6 }, (_, i) => {
      const from = now - (6 - i) * 7 * DAY, to = from + 7 * DAY;
      return { date: new Date(from).toISOString().slice(0, 10), ...summarise(fresh.filter((e) => Date.parse(e.answeredAt) >= from && Date.parse(e.answeredAt) < to)) };
    }) };
}

export function buildSessionReport(session) {
  const evidence = sessionEvidence(session).map((e) => ({ ...e, answered: answered(e.selectedAnswer), parentId: e.tag.parentId }));
  const sections = SECTIONS.filter((s) => evidence.some((e) => e.section === s)).map((section) => ({ section,
    ...summarise(evidence.filter((e) => e.section === section)), seconds: Math.round((session.progress.elapsed[section] ?? 0) / 1000),
    budgetSeconds: session.budgets[section] ?? null }));
  return { sections, estimate: session.kind === 'assessment' ? practiceEstimate(sections) : null,
    interrupted: !!session.progress.interrupted, timeMultiplier: session.time_multiplier,
    previouslySeen: session.questions.filter((q) => q.tag.previouslySeen).length,
    summary: session.kind === 'assessment' ? 'Your starting point is saved. These results show where to begin; they do not set a limit on what you can achieve.' : 'Another set completed. Take a moment to review your answers before deciding what comes next.' };
}

// Deterministic, disposable result preview for developer builds. It exercises
// the same grading and report code as a completed assessment without saving a
// session or changing the student's profile.
export function buildSampleReport(questions) {
  const progress = initialProgress();
  progress.phase = 'finished';
  progress.closedSections = SECTIONS.filter((section) => questions.some((q) => q.section === section));
  const budgets = Object.fromEntries(progress.closedSections.map((section) => [section, SECTION_SECONDS[section]]));
  const grouped = Object.fromEntries(progress.closedSections.map((section) => [section, questions.filter((q) => q.section === section)]));
  for (const section of progress.closedSections) {
    const qs = grouped[section];
    const sectionIndex = progress.closedSections.indexOf(section);
    const elapsed = Math.floor(budgets[section] * 0.82 * 1000);
    progress.elapsed[section] = elapsed;
    qs.forEach((q, index) => {
      const exact = q.tag.statementAnswers?.length ? q.tag.statementAnswers : q.tag.answer;
      if (Array.isArray(exact)) {
        progress.answers[q.id] = Object.fromEntries(exact.map((answer, i) => [i,
          (index + i) % 5 === 0 ? (answer === 'Yes' ? 'No' : 'Yes') : answer]));
      } else if (section === 'sj') {
        const choices = q.choices.map((choice) => choice.value);
        const right = choices.indexOf(exact);
        progress.answers[q.id] = (index + sectionIndex) % 4 === 0 && choices.length > 1
          ? choices[(right + 1) % choices.length] : exact;
      } else if (index % 5 === 0) {
        progress.answers[q.id] = q.choices.find((choice) => choice.value !== exact)?.value ?? exact;
      } else progress.answers[q.id] = exact;
      progress.times[q.id] = Math.floor(elapsed / qs.length);
    });
  }
  const report = buildSessionReport({ id: 'development-sample', kind: 'assessment', questions, progress, budgets,
    time_multiplier: 1, completed_at: new Date().toISOString() });
  report.sample = true;
  report.summary = 'Sample results generated for development. These answers are illustrative and are not your performance.';
  if (report.estimate) report.estimate.explanation = 'Sample practice estimate generated for development only. It is not based on your answers and is not a prediction of your UCAT score.';
  return report;
}

export function initialProgress() {
  return { answers: {}, times: {}, flags: {}, elapsed: {}, index: 0, sectionIndex: 0, phase: 'instructions', interrupted: false, closedSections: [] };
}

export function validateProgress(session, input) {
  if (!input || !['instructions', 'running', 'paused', 'finished'].includes(input.phase)) throw new Error('invalid_progress');
  const sections = SECTIONS.filter((s) => session.questions.some((q) => q.section === s));
  if (!Number.isInteger(input.sectionIndex) || input.sectionIndex < 0 || input.sectionIndex >= sections.length) throw new Error('invalid_progress');
  if (!Number.isInteger(input.index) || input.index < 0 || input.index >= session.questions.length) throw new Error('invalid_progress');
  const prior = session.progress, result = initialProgress();
  result.sectionIndex = input.sectionIndex; result.index = input.index; result.phase = input.phase;
  result.interrupted = prior.interrupted || input.interrupted === true || input.phase === 'paused';
  if (input.sectionIndex < prior.sectionIndex) throw new Error('invalid_section');
  const current = sections[input.sectionIndex];
  if (session.questions[input.index].section !== current) throw new Error('invalid_section');
  const expectedClosed = sections.slice(0, input.phase === 'finished' ? input.sectionIndex + 1 : input.sectionIndex);
  if (JSON.stringify(input.closedSections) !== JSON.stringify(expectedClosed)) throw new Error('invalid_section');
  result.closedSections = expectedClosed;
  for (const section of sections) {
    const elapsed = input.elapsed?.[section] ?? 0, old = prior.elapsed?.[section] ?? 0;
    if (!Number.isFinite(elapsed) || elapsed < old || elapsed < 0 || elapsed > (session.budgets[section] ? session.budgets[section] * 1000 : 86400000)) throw new Error('invalid_time');
    if (prior.closedSections.includes(section) && elapsed !== old) throw new Error('section_closed');
    if (sections.indexOf(section) > input.sectionIndex && elapsed !== 0) throw new Error('invalid_time');
    result.elapsed[section] = elapsed;
  }
  for (const q of session.questions) {
    const value = input.answers?.[q.id] ?? null;
    if (q.tag.statementAnswers?.length) {
      if (value !== null && (typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some((k) => !/^\d+$/.test(k) || +k >= q.tag.statementAnswers.length || !['Yes', 'No'].includes(value[k])))) throw new Error('invalid_answer');
    } else if (value !== null && !q.choices.some((c) => c.value === value)) throw new Error('invalid_answer');
    if (prior.closedSections.includes(q.section) && JSON.stringify(value) !== JSON.stringify(prior.answers[q.id] ?? null)) throw new Error('section_closed');
    if (sections.indexOf(q.section) > input.sectionIndex && value !== null) throw new Error('invalid_answer');
    result.answers[q.id] = value;
    const time = input.times?.[q.id] ?? 0;
    if (!Number.isFinite(time) || time < (prior.times[q.id] ?? 0) || time > result.elapsed[q.section]) throw new Error('invalid_time');
    result.times[q.id] = time; result.flags[q.id] = input.flags?.[q.id] === true;
  }
  for (const section of sections) {
    const total = session.questions.filter((q) => q.section === section).reduce((n, q) => n + result.times[q.id], 0);
    if (total > result.elapsed[section] + 1) throw new Error('invalid_time');
  }
  if (input.phase === 'finished' && input.sectionIndex !== sections.length - 1) throw new Error('incomplete_assessment');
  return result;
}

// Allowlist the public shape: never send grading metadata or explanations before completion.
export function publicSession(session) {
  const complete = session.status === 'completed';
  return { id: session.id, kind: session.kind, status: session.status, title: session.title, version: session.version,
    formVersion: session.form_version, progress: session.progress, budgets: session.budgets,
    timeMultiplier: session.time_multiplier, report: session.report, completedAt: session.completed_at,
    questions: session.questions.map((q) => ({ id: q.id, section: q.section, parentId: q.parentId,
      title: q.title, context: q.context, text: q.text, stimulus: q.stimulus, choices: q.choices,
      dm: q.dm ? { ...q.dm, statements: q.dm.statements.map((s) => ({ text: s.text })) } : null,
      ...(complete ? { answer: q.tag.statementAnswers ?? q.tag.answer, explanation: q.explanation,
        statementReasons: q.statementReasons, grade: gradeResponse(q.tag, session.progress.answers[q.id]) } : {}) })) };
}
