import { sectionName } from './dashboard.js';

// Only the initial assessment profile is used here, never later practice.
export function buildInitialPlan(profile, report) {
  const observed = (profile?.skills ?? []).filter((skill) => skill.questions > 0 && Number.isFinite(skill.accuracy));
  const toPractise = observed.filter((skill) => skill.accuracy < 100)
    .sort((a, b) => a.accuracy - b.accuracy || b.questions - a.questions);
  const recommendations = profile?.plan?.length ? profile.plan
    : toPractise.map((skill) => ({ skillId: skill.id, title: skill.label, section: skill.section }));
  const priorities = recommendations.slice(0, 3).map((item) => {
    const skill = observed.find((candidate) => candidate.id === item.skillId);
    const why = !skill ? "We'll explore this question type next."
      : skill.accuracy < 100 ? 'You dropped marks on these questions in the mini mock.'
        : 'You did well on these questions. Next, build more consistency.';
    return { id: item.skillId, title: item.title, section: sectionName(item.section),
      reason: `${why}${skill?.tip || item.tip ? ` ${skill?.tip || item.tip}` : ''}` };
  });
  const strongSkill = observed.filter((skill) => skill.accuracy >= 75 && skill.questions >= 3)
    .sort((a, b) => b.accuracy - a.accuracy || b.questions - a.questions)[0];
  const bestSection = (report?.sections ?? []).filter((section) => Number.isFinite(section.accuracy) && section.accuracy > 0)
    .sort((a, b) => b.accuracy - a.accuracy)[0];
  const strength = strongSkill ? { heading: 'A strength to build on', title: strongSkill.label, section: sectionName(strongSkill.section),
    description: 'You handled these questions well in your mini mock. We can build on that as you practise.' }
    : bestSection ? { heading: 'Your strongest section so far', title: sectionName(bestSection.section),
      description: 'This was your strongest section in the mini mock. More practice will help you build on that result.' } : null;
  const pace = !report?.interrupted && (report?.sections ?? []).find((section) => section.answered < section.questions
    && section.budgetSeconds > 0 && section.seconds >= section.budgetSeconds);
  return { priorities, strength, pace: pace ? {
    section: sectionName(pace.section),
    description: `There were questions left unanswered when time ran out in ${sectionName(pace.section)}. Start by getting comfortable with the approach, then build up your pace.`,
  } : null };
}
