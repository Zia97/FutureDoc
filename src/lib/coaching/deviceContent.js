import vr from '../../data/performance/vr-tags.json';
import dm from '../../data/performance/dm-tags.json';
import qr from '../../data/performance/qr-tags.json';
import sj from '../../data/performance/sj-tags.json';
import assessment from '../../../supabase/functions/ai-coach/assessment-v2.json';
import { buildCoachProfile, initialProgress, normaliseEvidence, publicSession, selectGroups, sessionEvidence, SECTION_NAMES, SECTION_SECONDS } from './engine.js';
import { hydrateCoachSession } from './contentTransport.js';

const banksBySection = { vr: 'verbal_reasoning', dm: 'decision_making', qr: 'quantitative_reasoning', sj: 'situational_judgement' };
const catalogue = {
  skills: [vr, dm, qr, sj].flatMap((bank) => bank.skills.map((skill) => ({ ...skill, section: bank.section }))),
  questions: [vr, dm, qr, sj].flatMap((bank) => bank.questions.map((tag) => ({ ...tag, section: bank.section }))),
};
const tagsById = new Map([...catalogue.questions.filter((q) => q.mode === 'practice'), ...assessment.questions.map((q) => q.tag)].map((tag) => [`${tag.section}:${tag.id}`, tag]));

export function deviceSessionEvidence(session) {
  return sessionEvidence({ ...session, completed_at: session.completedAt,
    questions: session.questions.map((q) => ({ ...q, tag: {
      ...tagsById.get(`${q.section}:${q.id}`), ...session.offlineScoring?.[q.id]?.tag,
      ...(q.answer !== undefined ? { [q.dm?.statements?.length ? 'statementAnswers' : 'answer']: q.answer } : {}),
    } })) });
}

export function deviceCoachProfile(sessions, examDate = null) {
  const baseline = sessions.find((s) => s.kind === 'assessment' && s.report);
  return buildCoachProfile({ catalogue, rawEvidence: sessions.filter((s) => s.report).flatMap(deviceSessionEvidence),
    examDate, baselineCompletedAt: baseline?.completedAt });
}

// Use the same frozen grading data and selection rules as the server. Missing
// banks are downloaded separately; opening saved questions never needs them.
export function createDeviceCoachSession({ id, kind, focus = {}, banks, sessions, settings = {}, profile }) {
  const timeMultiplier = Number(settings.time_multiplier) || 1;
  let questions, formVersion, title;
  if (kind === 'assessment') {
    questions = JSON.parse(JSON.stringify(assessment.questions));
    formVersion = assessment.id; title = assessment.title;
  } else {
    const skill = catalogue.skills.find((s) => s.id === focus.skillId);
    const section = skill?.section ?? focus.section ?? profile?.plan?.[0]?.section ?? 'vr';
    const available = catalogue.questions.filter((tag) => {
      if (tag.section !== section || tag.mode !== 'practice') return false;
      const bank = banks[banksBySection[section]];
      const parent = bank?.data.find((item) => item.id === tag.parentId);
      const child = section === 'dm' ? parent : parent?.questions?.find((q) => q.questionId === tag.id);
      return !!child && JSON.stringify(tag.statementAnswers ?? []) === JSON.stringify((child.statements ?? []).map((s) => s.answer))
        && (tag.answer ?? null) === (child.answer ?? null);
    });
    // Never split a parent group if a cache/tag update has removed a child.
    const complete = available.filter((tag) => catalogue.questions.filter((q) => q.section === section && q.mode === 'practice' && q.parentId === tag.parentId).length
      === available.filter((q) => q.parentId === tag.parentId).length);
    const rawEvidence = sessions.filter((s) => s.report).flatMap(deviceSessionEvidence);
    const selected = selectGroups({ catalogue: { ...catalogue, questions: complete }, section,
      evidence: normaliseEvidence(rawEvidence, catalogue), skillId: skill?.id, review: kind === 'review', seed: rawEvidence.length });
    const hydrated = hydrateCoachSession({ questions: selected.map((tag) => ({ id: tag.id, section, parentId: tag.parentId,
      contentRef: { bank: banksBySection[section], version: banks[banksBySection[section]].version } })) }, banks);
    questions = hydrated.questions.map((q, index) => {
      const parent = banks[banksBySection[section]].data.find((item) => item.id === q.parentId);
      const child = section === 'dm' ? parent : parent.questions.find((item) => item.questionId === q.id);
      return { ...q, tag: selected[index], explanation: child.answeringReason,
        statementReasons: child.statements?.map((statement) => statement.reason) };
    });
    formVersion = 'practice-v1';
    title = `${SECTION_NAMES[section]} · ${kind === 'review' ? 'Mistake review' : kind === 'timed_check' ? 'Timed check' : skill?.label ?? 'Coached practice'}`;
  }
  const budgets = Object.fromEntries([...new Set(questions.map((q) => q.section))].map((section) => [section,
    kind === 'assessment' ? Math.round(SECTION_SECONDS[section] * timeMultiplier)
      : kind === 'timed_check' ? Math.round(SECTION_SECONDS[section] / 12 * questions.length * timeMultiplier) : null]));
  return { ...publicSession({ id, kind, status: 'active', version: 0, title, form_version: formVersion,
    time_multiplier: timeMultiplier, questions, budgets, progress: initialProgress() }),
    localOrigin: { kind, questionIds: questions.map((q) => q.id),
      contentHashes: questions.map((q) => q.tag.contentHash), formVersion, timeMultiplier } };
}
