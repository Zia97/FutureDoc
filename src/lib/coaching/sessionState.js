import { SECTIONS } from './engine.js';

export const sessionSections = (session) => SECTIONS.filter((s) => session.questions.some((q) => q.section === s));
// Resolve concurrent saves internally. The active device keeps its answers in
// open sections; completed sections and reports remain authoritative.
export function reconcileCoachSession(remote, local) {
  if (remote.status === 'completed') return remote;
  const prior = remote.progress, draft = local.progress, sections = sessionSections(remote);
  const sectionIndex = Math.max(prior.sectionIndex, draft.sectionIndex);
  const position = draft.sectionIndex >= prior.sectionIndex ? draft : prior;
  const progress = { ...position, sectionIndex, interrupted: !!(prior.interrupted || draft.interrupted),
    closedSections: sections.slice(0, position.phase === 'finished' ? sectionIndex + 1 : sectionIndex),
    answers: {}, flags: {}, times: {}, elapsed: {} };
  for (const [i, section] of sections.entries()) {
    const questions = remote.questions.filter((q) => q.section === section);
    const closed = prior.closedSections.includes(section), future = i > sectionIndex;
    const elapsed = closed ? prior.elapsed[section] ?? 0 : future ? 0
      : Math.min(remote.budgets[section] == null ? 86400000 : remote.budgets[section] * 1000,
        Math.max(prior.elapsed[section] ?? 0, draft.elapsed[section] ?? 0));
    progress.elapsed[section] = elapsed;
    const baseTime = questions.reduce((sum, q) => sum + (prior.times[q.id] ?? 0), 0);
    const addedTime = questions.reduce((sum, q) => sum + Math.max(0, (draft.times[q.id] ?? 0) - (prior.times[q.id] ?? 0)), 0);
    const scale = addedTime ? Math.min(1, Math.max(0, elapsed - baseTime) / addedTime) : 0;
    for (const q of questions) {
      progress.answers[q.id] = future ? null : closed ? prior.answers[q.id] ?? null : draft.answers[q.id] ?? prior.answers[q.id] ?? null;
      progress.flags[q.id] = future ? false : closed ? !!prior.flags[q.id] : draft.flags[q.id] ?? prior.flags[q.id] ?? false;
      const base = prior.times[q.id] ?? 0;
      progress.times[q.id] = future ? 0 : closed ? base : base + Math.floor(Math.max(0, (draft.times[q.id] ?? 0) - base) * scale);
    }
  }
  return { ...remote, progress };
}
export function isUntimedSession(session) {
  return ['practice', 'review'].includes(session.kind)
    && session.budgets[sessionSections(session)[session.progress.sectionIndex]] == null;
}
export function resumeUntimedSession(session) {
  if (session.status === 'completed' || !isUntimedSession(session)
    || !['instructions', 'paused'].includes(session.progress.phase)) return session;
  return { ...session, progress: { ...session.progress, phase: 'running' } };
}
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
