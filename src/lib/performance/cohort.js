const percent = (earned, possible) => possible > 0 ? Math.round(100 * earned / possible) : null;
const key = (row) => `${row.section}:${row.cohortMode ?? row.mode}:${row.questionId}`;

export function compareCohort(rows, byKey, cohort, grade, { section, mode: reportMode }) {
  const empty = { yourAccuracy: null, cohortAccuracy: null, matchedQuestions: 0, delta: null };
  if (!cohort || cohort.status === 'unavailable') return { ...empty, status: 'unavailable' };
  const distributions = new Map((cohort.rows ?? []).map((row) => [key(row), row]));
  function marks(distribution, question) {
    let total = 0, earned = 0, possible = 0;
    for (const answer of distribution.answers ?? []) {
      if (!Number.isSafeInteger(answer.count) || answer.count < 1) continue;
      const result = grade(question, answer.answer);
      if (!result.possible || result.earned == null) continue;
      total += answer.count; earned += result.earned * answer.count; possible = result.possible;
    }
    return { total, earned: total ? earned / total : 0, possible };
  }
  const eligible = rows.filter((row) => !row.excluded && row.possible > 0 && !row.interrupted);
  let earned = 0, cohortEarned = 0, possible = 0, matchedQuestions = 0;
  for (const row of eligible) {
    const distribution = distributions.get(key(row));
    if (!distribution) continue;
    const result = marks(distribution, row.tag ?? byKey.get(row.key));
    if (result.total < 5) continue;
    earned += row.earned; cohortEarned += result.earned; possible += row.possible; matchedQuestions++;
  }
  if (matchedQuestions >= 3) {
    const yourAccuracy = percent(earned, possible), cohortAccuracy = percent(cohortEarned, possible);
    return { yourAccuracy, cohortAccuracy, matchedQuestions, delta: yourAccuracy - cohortAccuracy, basis: 'matched', status: 'ready' };
  }

  // A broader section average can exist even when few exact questions overlap.
  // Keep each practice condition separate, and never publish small cohorts.
  const conditions = new Set(eligible.map((row) => row.cohortMode ?? row.mode));
  let benchmarkCondition = null;
  if (!conditions.size) {
    if (reportMode === 'combined' || reportMode === 'coaching') {
      const choices = reportMode === 'coaching' ? ['assessment', 'coach_practice', 'coach_timed'] : ['practice', 'timed', 'assessment', 'coach_practice', 'coach_timed'];
      benchmarkCondition = choices.find((mode) => cohort.groups?.some((group) => group.section === section && group.mode === mode && group.students >= 5));
      if (benchmarkCondition) conditions.add(benchmarkCondition);
    } else conditions.add(reportMode);
  }
  const averages = [];
  for (const mode of conditions) {
    const candidates = (cohort.rows ?? []).filter((row) => row.section === section && row.mode === mode);
    let groupEarned = 0, groupPossible = 0, questions = 0, safeQuestions = 0;
    for (const distribution of candidates) {
      const question = distribution.tag ?? byKey.get(`${distribution.section}:${distribution.mode}:${distribution.questionId}`);
      if (question?.excludedReason || question?.confidence === 'low') continue;
      const result = marks(distribution, question);
      if (!result.total || !result.possible) continue;
      groupEarned += result.earned; groupPossible += result.possible; questions++;
      if (result.total >= 5) safeQuestions++;
    }
    const students = cohort.groups?.find((group) => group.section === section && group.mode === mode)?.students ?? 0;
    if (questions < 3 || (students < 5 && safeQuestions < 3)) continue;
    const personal = eligible.filter((row) => (row.cohortMode ?? row.mode) === mode);
    const weight = personal.reduce((sum, row) => sum + row.possible, 0);
    averages.push({ fraction: groupEarned / groupPossible, weight });
  }
  // Do not silently drop a condition from a mixed comparison.
  if (!averages.length || averages.length !== conditions.size) return { ...empty, matchedQuestions, status: 'insufficient_cohort' };
  const personalPossible = eligible.reduce((sum, row) => sum + row.possible, 0);
  const cohortAccuracy = Math.round(100 * averages.reduce((sum, group) => sum + group.fraction * (group.weight || 1), 0)
    / averages.reduce((sum, group) => sum + (group.weight || 1), 0));
  const yourAccuracy = eligible.length >= 3 ? percent(eligible.reduce((sum, row) => sum + row.earned, 0), personalPossible) : null;
  return { yourAccuracy, cohortAccuracy, matchedQuestions, delta: yourAccuracy == null ? null : yourAccuracy - cohortAccuracy,
    basis: 'section', status: yourAccuracy == null ? 'needs_answers' : 'ready',
    ...(benchmarkCondition ? { condition: benchmarkCondition } : {}) };
}
