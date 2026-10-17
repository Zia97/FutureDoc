// Presentation derived from the saved profile. No new network or model call is
// needed to explain the next step, and a missing trend never becomes a gain.
export const COACH_SECTIONS = [
  { id: 'vr', title: 'Verbal Reasoning', short: 'VR', icon: 'book', color: 'blue' },
  { id: 'dm', title: 'Decision Making', short: 'DM', icon: 'person-cog', color: 'purple' },
  { id: 'qr', title: 'Quantitative Reasoning', short: 'QR', icon: 'calculator', color: 'teal' },
  { id: 'sj', title: 'Situational Judgement', short: 'SJ', icon: 'stethoscope', color: 'amber' },
];
export const sectionName = (id) => COACH_SECTIONS.find((section) => section.id === id)?.title ?? 'UCAT';

export function recommendationReason(skill) {
  if (!skill?.questions || skill.accuracy == null) return 'A few focused questions will help us understand how you approach this skill.';
  if (skill.stale) return 'Time for a refresher. Let’s check what has stuck and what needs another look.';
  const evidence = `${skill.accuracy}% of marks across ${skill.questions} first attempts.`;
  if (skill.confidence !== 'established') return `${evidence} An early signal to explore with more practice.`;
  if (skill.accuracy < 65) return `${evidence} A priority for recovering missed marks.`;
  return `${evidence} Let’s make this skill more consistent.`;
}

export function sectionSnapshot(profile, baseline, mode = 'all') {
  return COACH_SECTIONS.map((meta) => {
    let stats;
    if (mode === 'all') {
      stats = profile?.runningSections?.find((item) => item.section === meta.id)
        ?? profile?.sections?.find((item) => item.section === meta.id)
        ?? baseline?.report?.sections?.find((item) => item.section === meta.id);
    } else {
      const rows = (profile?.skills ?? []).filter((skill) => skill.section === meta.id).map((skill) => skill[mode]);
      const earned = rows.reduce((sum, item) => sum + (item?.earned ?? 0), 0);
      const possible = rows.reduce((sum, item) => sum + (item?.possible ?? 0), 0);
      stats = { earned, possible, accuracy: possible ? Math.round(100 * earned / possible) : null,
        questions: rows.reduce((sum, item) => sum + (item?.questions ?? 0), 0) };
    }
    return { ...meta, accuracy: stats?.accuracy ?? null, questions: stats?.questions ?? 0 };
  });
}

export function buildDashboardStory(profile, baseline, history = []) {
  const skills = profile?.skills ?? [];
  const plan = (profile?.plan ?? []).map((item) => {
    const skill = skills.find((candidate) => candidate.id === item.skillId);
    return { ...item, skill, reason: recommendationReason(skill), sectionTitle: sectionName(item.section) };
  });
  const focus = plan[0] ?? null;
  const weakIds = new Set((profile?.weaknesses ?? []).map((skill) => skill.id));
  const improvements = skills.flatMap((skill) => {
    if (skill.stale) return [];
    return [['practice', skill.trend], ['timed', skill.timedTrend]]
      .filter(([, trend]) => Number.isFinite(trend?.delta) && trend.delta > 0)
      .map(([mode, trend]) => ({ skill, mode, ...trend, isFocusArea: weakIds.has(skill.id) || skill.id === focus?.skillId }));
  }).sort((a, b) => Number(b.isFocusArea) - Number(a.isFocusArea) || b.delta - a.delta);
  const improvement = improvements[0] ?? null;
  const baselineCount = (baseline?.report?.sections ?? []).reduce((sum, section) => sum + (section.questions ?? 0), 0);
  const recentSessions = history.filter((session) => session.kind !== 'assessment');
  const building = recentSessions.length > 0 || (baselineCount > 0 && profile?.freshQuestions > baselineCount);
  const stage = improvement ? 'improving' : building ? 'building' : 'starting';
  const strength = profile?.strengths?.find((skill) => !skill.stale);
  let coachNote;
  if (strength) {
    coachNote = `${strength.label} is ${strength.confidence === 'established' ? 'a strength to build on' : 'an encouraging early signal'} in ${sectionName(strength.section)}.`;
  } else if (improvement) {
    coachNote = `You’re making headway in ${improvement.skill.label.toLowerCase()}. Let’s keep building on that with fresh questions.`;
  } else {
    coachNote = 'Your mini mock has given us a starting point. We’ll build a clearer picture as you practise.';
  }
  if (focus) coachNote += ` Next, we’ll ${focus.skill?.questions ? 'work on' : 'explore'} ${focus.title.toLowerCase()} in ${focus.sectionTitle}.`;
  return {
    stage, plan, focus, improvement, improvements, coachNote, recentSessions,
  };
}

export function resumeSummary(session, active) {
  if (!active) return null;
  const section = session?.questions?.[0]?.section ?? COACH_SECTIONS.find((item) => active.title?.startsWith(item.title))?.id;
  const title = (session?.title ?? active.title ?? 'Saved practice').split(' · ').slice(1).join(' · ');
  const questions = session?.questions ?? [];
  const answered = questions.filter((question) => {
    const answer = session.progress?.answers?.[question.id];
    if (answer == null || answer === '') return false;
    if (question.dm?.statements?.length) return question.dm.statements.every((_, index) => answer[index] != null);
    return typeof answer !== 'object' || Object.keys(answer).length > 0;
  }).length;
  return { section, kind: active.kind, sectionTitle: active.kind === 'assessment' ? 'All four UCAT sections' : sectionName(section), title: active.kind === 'assessment' ? 'Your mini mock' : title || 'Your saved questions',
    detail: questions.length ? `${answered} of ${questions.length} questions answered` : 'Your answers are saved. Pick up where you left off.' };
}
