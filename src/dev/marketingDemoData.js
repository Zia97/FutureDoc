// Disposable presentation fixtures. No storage, network, real answers or user IDs.
import { practiceEstimate } from '../lib/coaching/engine.js';
import { getSJLabelSet } from '../lib/sjScoring.js';

const DAY = 86400000;
const SECTIONS = ['vr', 'dm', 'qr', 'sj'];
const NAMES = { vr: 'Verbal Reasoning', dm: 'Decision Making', qr: 'Quantitative Reasoning', sj: 'Situational Judgement' };
const PACE = { vr: 28, dm: 62, qr: 37, sj: 22 };
const TYPES = ['syllogism', 'logic_puzzle', 'recognising_assumptions', 'interpreting_info', 'venn_diagram', 'probabilistic'];
const pct = (earned, possible) => possible ? Math.round(100 * earned / possible) : null;
function stats(accuracy, questions, seconds) {
  const earned = Math.round(accuracy * questions / 100);
  return { accuracy: pct(earned, questions), earned, possible: questions, questions, answered: questions,
    sets: Math.ceil(questions / 4), medianSeconds: seconds, timedQuestions: questions };
}
function combine(rows) {
  const questions = rows.reduce((n, row) => n + row.questions, 0);
  const earned = rows.reduce((n, row) => n + row.earned, 0);
  const possible = rows.reduce((n, row) => n + row.possible, 0);
  return { accuracy: pct(earned, possible), earned, possible, questions, answered: questions,
    sets: rows.reduce((n, row) => n + row.sets, 0), medianSeconds: questions ? Math.round(rows.reduce((n, row) => n + row.medianSeconds * row.questions, 0) / questions) : null,
    timedQuestions: questions };
}

function skillHistory(summary, date) {
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const count = Math.floor(summary.questions / 6) + (i >= 6 - summary.questions % 6 ? 1 : 0);
    return { date: date(35 - i * 7), ...stats(Math.max(0, Math.min(100, summary.accuracy - 12 + i * 5)), count, summary.medianSeconds) };
  });
  let missing = summary.earned - weeks.reduce((n, week) => n + week.earned, 0);
  for (const week of missing > 0 ? [...weeks].reverse() : weeks) {
    const change = Math.max(-week.earned, Math.min(week.possible - week.earned, missing));
    week.earned += change; week.accuracy = pct(week.earned, week.possible); missing -= change;
  }
  return weeks;
}

export function buildMarketingDemo(catalogue, now = Date.now()) {
  const date = (daysAgo) => new Date(now - daysAgo * DAY).toISOString();
  const skills = catalogue.map((meta, index) => {
    const local = catalogue.filter((s) => s.section === meta.section).findIndex((s) => s.id === meta.id);
    // Every section has strengths and weaker skills, with a gradual upward trend.
    const target = [88, 60, 82, 70, 76, 85, 64, 79][local % 8];
    const practice = stats(target + 3, 36 + index % 3 * 4, PACE[meta.section]);
    const timed = stats(target - 4, 24 + index % 3 * 4, PACE[meta.section] - 3);
    const coaching = stats(target + 1, 20 + index % 3 * 4, PACE[meta.section] + 2);
    const history = skillHistory(combine([practice, timed, coaching]), date);
    return { ...meta, ...combine([practice, timed, coaching]), supported: true, stale: false, confidence: 'established',
      status: target >= 80 ? 'Strong' : target >= 65 ? 'Developing' : 'Needs practice',
      trend: { delta: 8 + index % 5, recentCount: 22, priorCount: 20 },
      timedTrend: { delta: 6 + index % 4, recentCount: 16, priorCount: 14 },
      practice, timed, coaching, history, newQuestionIds: [], reviewQuestionIds: [], priority: 100 - target };
  });
  const priorities = [...skills].sort((a, b) => b.priority - a.priority).slice(0, 3);
  const reports = Object.fromEntries(['practice', 'timed', 'coaching', 'combined'].map((mode) => {
    const modeSkills = skills.map((skill) => ({ ...skill, ...(mode === 'combined' ? {} : skill[mode]),
      history: mode === 'combined' ? skill.history : skillHistory(skill[mode], date) }));
    const sections = SECTIONS.map((section, i) => {
      const summary = combine(modeSkills.filter((s) => s.section === section));
      return { section, ...summary, excludedQuestions: 0,
        conditions: mode === 'coaching' ? ['assessment', 'practice', 'timed_check', 'review'].map((kind) => ({ kind, ...stats(summary.accuracy, Math.floor(summary.questions / 4), PACE[section]) })) : undefined,
        cohort: { status: 'ready', basis: 'matched', yourAccuracy: summary.accuracy, cohortAccuracy: 63 + i * 2,
          matchedQuestions: summary.questions, delta: summary.accuracy - (63 + i * 2) } };
    });
    return [mode, { schemaVersion: 1, generatedAt: date(0), mode, access: 'pro',
      overview: { ...combine(sections), sections, excludedQuestions: 0 },
      skillCatalogue: catalogue, details: { skills: modeSkills, priorities: priorities.map((s) => s.id), reviewCount: 28, freshQuestionCount: 144, excludedFromSkills: 0,
        history: SECTIONS.map((section) => ({ section, weeks: Array.from({ length: 6 }, (_, i) => ({ date: date(35 - i * 7),
          ...combine(modeSkills.filter((s) => s.section === section).map((s) => s.history[i])) })) })) } }];
  }));
  const overallHistory = Array.from({ length: 42 }, (_, i) => ({ date: date(41 - i).slice(0, 10),
    accuracy: Math.round(58 + i * 0.53 + Math.sin(i * 0.6) * 1.4) }));
  const runningSections = SECTIONS.map((section, index) => ({ section, ...stats([80, 75, 85, 80][index], 20, PACE[section]) }));
  overallHistory[overallHistory.length - 1].accuracy = Math.round(runningSections.reduce((n, s) => n + s.accuracy, 0) / 4);
  const baselineSections = SECTIONS.map((section, i) => ({ section, ...stats([58, 50, 67, 58][i], 12, PACE[section]), seconds: [310, 690, 460, 230][i], budgetSeconds: [360, 760, 520, 270][i] }));
  const report = { sections: baselineSections, estimate: practiceEstimate(baselineSections), interrupted: false, timeMultiplier: 1, previouslySeen: 0,
    summary: 'Your strongest starting point is Quantitative Reasoning. Focus next on logic and inference techniques.' };
  const history = Array.from({ length: 8 }, (_, i) => {
    const section = SECTIONS[i % 4], skill = skills.find((s) => s.section === section && s.accuracy < 70);
    return { id: `marketing-session-${i}`, kind: i % 3 === 0 ? 'timed_check' : 'practice',
      title: `${NAMES[section]} · ${skill?.label ?? 'Targeted practice'}`, completed_at: date(i * 2),
      report: { sections: [{ section, ...stats(80 - i * 2, 8, PACE[section]), seconds: 8 * PACE[section], budgetSeconds: null }],
        estimate: null, interrupted: false, timeMultiplier: 1, previouslySeen: 0,
        summary: 'Review the explanations for the marks you missed, then continue with your next focus.' } };
  });
  const coach = { pro: true, previewAvailable: false, chatRemaining: 18, active: null,
    settings: { time_multiplier: 1, exam_date: date(-28).slice(0, 10) },
    baseline: { id: 'marketing-baseline', completed_at: date(41), report }, history,
    profile: { version: 'coach-v1', generatedAt: date(0), skills, sections: reports.combined.overview.sections, runningSections, overallHistory,
      strengths: [...skills].filter((s) => s.accuracy >= 80).sort((a, b) => b.accuracy - a.accuracy).slice(0, 4),
      weaknesses: priorities, plan: priorities.map((s, i) => ({ skillId: s.id, section: s.section, title: s.label,
        reason: `${s.accuracy}% across ${s.questions} questions.`, tip: s.tip, lessonRoute: s.lessonRoute, lessonId: s.lessonId, order: i + 1 })),
      freshQuestions: reports.combined.overview.questions, totalAttempts: reports.combined.overview.questions + 96, daysToExam: 28,
      milestones: ['Completed your starting assessment', '250 fresh questions explored', 'A strength supported by repeated evidence'],
      history: reports.combined.details.history[0].weeks } };
  return { reports, coach, streak: { currentStreak: 12, longestStreak: 18 }, examDate: coach.settings.exam_date };
}

export function marketingListStatus(index) {
  return index < 8 ? 'completed' : index < 11 ? 'in_progress' : 'not_started';
}

export function marketingTimedRows(section, tests = [], now = Date.now()) {
  return Array.from({ length: Math.min(6, tests.length || 6) }, (_, i) => {
    const test = tests[i];
    const groups = test?.passages ?? test?.sets ?? test?.scenarios;
    const total = groups?.reduce((n, group) => n + (group.questions ?? group.items ?? []).length, 0)
      || test?.questions?.length || { vr: 44, dm: 35, qr: 36, sj: 69 }[section];
    const score = 56 + i * 5 + (section === 'qr' ? 5 : section === 'sj' ? 3 : 0);
    const correct = Math.round(total * score / 100), hardTotal = Math.round(total / 3);
    const hardCorrect = Math.round(correct * 0.27), normalCorrect = correct - hardCorrect;
    const seconds = PACE[section] + 8 - i;
    const breakdown = (keys) => Object.fromEntries(keys.map((key, j) => {
      const n = Math.floor(total / keys.length) + (j < total % keys.length ? 1 : 0);
      return [key, { correct: Math.round(n * score / 100), total: n }];
    }));
    return { test_id: tests[i]?.id ?? i + 1, score_percent: pct(correct, total), submitted_at: new Date(now - (35 - i * 7) * DAY).toISOString(),
      analytics_summary: { difficulty: { normal: { correct: normalCorrect, total: total - hardTotal }, hard: { correct: hardCorrect, total: hardTotal } },
        completion: { answered: total, total }, type_breakdown: section === 'dm' ? breakdown(TYPES) : undefined,
        stimulus_breakdown: section === 'qr' ? breakdown(['table', 'chart', 'text', 'geometry']) : undefined,
        mark_breakdown: { full: correct, partial: 0, zero: total - correct },
        pacing: { total_ms: total * seconds * 1000, timed_count: total, correct_ms: correct * (seconds - 2) * 1000,
          correct_count: correct, incorrect_ms: (total - correct) * (seconds + 4) * 1000, incorrect_count: total - correct } } };
  });
}

export function marketingPracticeData(section, now = Date.now()) {
  const cohortByKey = new Map();
  const rawAttempts = Array.from({ length: 180 }, (_, i) => {
    const question_id = `marketing-${section}-${i}`;
    const success = (i * 37 % 100) < 57 + Math.floor(i / 30) * 5;
    cohortByKey.set(`${question_id}:-1`, { correctPct: 0.64, avgTimeMs: (PACE[section] + 8) * 1000, totalFirstAttempts: 126 });
    return { question_id, is_correct: success, time_spent_ms: (PACE[section] + 12 - Math.floor(i / 15) + i % 7) * 1000,
      answered_at: new Date(now - (179 - i) / 180 * 41 * DAY).toISOString(), difficulty: i % 3 ? 'normal' : 'hard', type: TYPES[i % TYPES.length] };
  }).reverse();
  return { rawAttempts, latestAttempts: rawAttempts, cohortByKey, totalQuestions: 560 };
}

// Only used inside result renderers; never handed to answer hooks or submission.
export function marketingResultAnswers(questions, accuracy = 80) {
  const rightCount = Math.round(questions.length * accuracy / 100);
  return Object.fromEntries(questions.map((q, i) => {
    const id = q.questionId ?? q.itemId ?? q.id;
    const correct = Math.floor((i + 1) * rightCount / questions.length) > Math.floor(i * rightCount / questions.length);
    const choices = (getSJLabelSet(q) ?? ['A', 'B', 'C', 'D'])
      .map((option) => typeof option === 'string' ? option : option.value ?? option.label);
    const wrong = choices[(Math.max(0, choices.indexOf(q.answer)) + Math.max(1, Math.floor(choices.length / 2))) % choices.length];
    const answer = q.statements?.length
      ? Object.fromEntries(q.statements.map((s, index) => [index, correct ? s.answer : s.answer === 'Yes' ? 'No' : 'Yes']))
      : correct ? q.answer : wrong;
    return [id, answer];
  }));
}
