import { SECTIONS } from './engine.js';

export const sessionSections = (session) => SECTIONS.filter((s) => session.questions.some((q) => q.section === s));
export function advanceSection(session, progress) {
  const sections = sessionSections(session);
  const next = progress.sectionIndex + 1;
  if (next >= sections.length) return { ...progress, phase: 'finished', closedSections: sections };
  return { ...progress, phase: 'instructions', sectionIndex: next,
    index: session.questions.findIndex((q) => q.section === sections[next]), closedSections: sections.slice(0, next) };
}
export function tickProgress(session, deltaMs, trackQuestionTime = true) {
  const p = session.progress;
  if (p.phase !== 'running') return p;
  const section = sessionSections(session)[p.sectionIndex];
  const elapsed = p.elapsed[section] ?? 0;
  const budget = session.budgets[section] == null ? Infinity : session.budgets[section] * 1000;
  const delta = Math.min(Math.max(0, deltaMs), Math.max(0, budget - elapsed));
  const id = session.questions[p.index].id;
  const next = { ...p, elapsed: { ...p.elapsed, [section]: elapsed + delta },
    times: trackQuestionTime ? { ...p.times, [id]: (p.times[id] ?? 0) + delta } : p.times };
  return elapsed + delta >= budget ? advanceSection(session, next) : next;
}
export function pauseProgress(progress) {
  return progress.phase === 'finished' ? progress : { ...progress, phase: 'paused', interrupted: true };
}
