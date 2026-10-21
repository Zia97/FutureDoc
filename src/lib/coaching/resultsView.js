import { SECTION_NAMES } from './engine.js';

const choiceLabel = (question, value) => question.choices.find((choice) => choice.value === value)?.label ?? value;
const options = (question) => question.choices.map(({ value, label }) => ({ label: value,
  text: label.startsWith(`${value}.`) ? label.slice(String(value).length + 1).trim() : label }));

// Adapt frozen coaching snapshots to the completed timed-test result screens.
// Review reads only these snapshots and never loads or saves timed attempts.
export function coachResultsSection(session, section) {
  const questions = session.questions.filter((q) => q.section === section);
  const byId = new Map(questions.map((q) => [q.id, q]));
  const groups = new Map();
  for (const q of questions) {
    const id = q.parentId ?? q.id;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(q);
  }
  const result = {
    test: { id: session.id, title: session.kind === 'assessment' ? SECTION_NAMES[section] : session.title },
    flags: new Set(Object.keys(session.progress.flags).filter((id) => session.progress.flags[id])),
    scoreSummary: session.report?.sections.find((row) => row.section === section),
    answers: session.progress.answers,
    getAnswer: (_parentId, id) => {
      const answer = session.progress.answers[id] ?? null;
      return answer != null && ['vr', 'sj'].includes(section) ? choiceLabel(byId.get(id), answer) : answer;
    },
  };
  if (section === 'vr') result.passages = [...groups].map(([id, group]) => ({ id, title: group[0].title,
    resource: group[0].context, questions: group.map((q) => ({ questionId: q.id, questionText: q.text,
      options: q.choices.map((choice) => choice.label), answer: choiceLabel(q, q.answer), answeringReason: q.explanation })) }));
  if (section === 'qr') result.sets = [...groups].map(([setId, group]) => ({ setId, title: group[0].title,
    stimulus: group[0].stimulus, questions: group.map((q) => ({ questionId: q.id, stem: q.text,
      options: options(q), answer: q.answer, answeringReason: q.explanation })) }));
  if (section === 'sj') result.scenarios = [...groups].map(([scenarioId, group]) => ({ scenarioId, stem: group[0].context,
    items: group.map((q) => ({ itemId: q.id, text: q.text, options: q.choices.map((choice) => choice.label),
      answer: choiceLabel(q, q.answer), answeringReason: q.explanation })) }));
  if (section === 'dm') result.questions = questions.map((q) => ({ ...q.dm, id: q.id, questionId: q.id, title: q.title,
    answer: Array.isArray(q.answer) ? undefined : q.answer, options: q.dm?.options ?? options(q),
    statements: (q.dm?.statements ?? []).map((statement, i) => ({ ...statement, answer: q.answer?.[i], reason: q.statementReasons?.[i] })),
    answeringReason: q.explanation, grade: q.grade }));
  return result;
}
