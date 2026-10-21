import { LABEL_SETS } from '../../constants/sjLabelSets.js';

const sections = { vr: 'verbal_reasoning', dm: 'decision_making', qr: 'quantitative_reasoning', sj: 'situational_judgement' };

// Keep server-selected IDs, scoring and frozen sessions authoritative. Omit the
// question body only when the device has the exact bank used by that snapshot.
export function compactCoachSession(session, snapshots, versions = {}) {
  if (session.kind === 'assessment' || session.status === 'completed') return session;
  return { ...session, questions: session.questions.map((question, index) => {
    const bank = sections[question.section], version = snapshots[index]?.bankVersion;
    // Older practice caches did not include parent-level Venn geometry. Keep
    // those uncommon stimuli in the frozen response so no diagram is lost.
    return version != null && versions[bank] === version && !question.dm?.stimulusVennGeometry
      ? { id: question.id, section: question.section, parentId: question.parentId, contentRef: { bank, version } }
      : question;
  }) };
}

function cachedQuestion(question, cache) {
  const { section, parentId, id } = question;
  const parent = cache.data.find((entry) => entry.id === parentId);
  const child = section === 'dm' ? parent : parent?.questions?.find((entry) => entry.questionId === id);
  if (!child || (section === 'dm' && child.id !== id)) return null;
  const options = section === 'sj' ? LABEL_SETS[child.labelSet] : child.options;
  const dm = section === 'dm' ? {
    id: child.id, type: child.type, stem: child.stem, tableData: child.tableData,
    stimulusDiagram: child.stimulusDiagram, stimulusVennGeometry: child.stimulusVennGeometry,
    hideLabels: child.hideLabels,
    options: (options ?? []).map((o) => ({ label: o.label, text: o.text, vennConfig: o.vennConfig, vennGeometry: o.vennGeometry })),
    statements: (child.statements ?? []).map((s) => ({ text: s.text })),
  } : null;
  return { id, section, parentId, title: parent.title ?? '',
    context: section === 'vr' || section === 'sj' ? parent.resource : null,
    text: child.questionText ?? '', stimulus: section === 'qr' ? parent.stimulus : null, dm,
    choices: (options ?? []).map((o) => typeof o === 'string' ? { value: o, label: o }
      : { value: o.label, label: `${o.label}. ${o.text ?? o.option_text ?? ''}` }),
  };
}

export function hydrateCoachSession(session, banks) {
  if (!session?.questions?.some((question) => question.contentRef)) return session;
  return { ...session, questions: session.questions.map((question) => {
    if (!question.contentRef) return question;
    const { bank, version } = question.contentRef, cache = banks[bank];
    const hydrated = bank === sections[question.section] && cache?.version === version && cachedQuestion(question, cache);
    if (!hydrated) throw new Error('content_cache_miss');
    return hydrated;
  }) };
}
