export function assessmentSectionItems(session) {
  const sections = ['vr', 'dm', 'qr', 'sj'].filter((section) => session.questions.some((q) => q.section === section));
  const section = sections[session.progress.sectionIndex];
  const parents = [];
  return session.questions.flatMap((question, sessionIndex) => {
    if (question.section !== section) return [];
    if (!parents.includes(question.parentId)) parents.push(question.parentId);
    return [{ questionId: question.id, question: { questionId: question.id, itemId: question.id }, sessionIndex,
      stemIndex: parents.indexOf(question.parentId), parentId: question.parentId }];
  }).map((item, flatIndex) => ({ ...item, flatIndex, globalIndex: flatIndex }));
}

export function assessmentQuestionStatus(question, progress, seen) {
  const answer = progress.answers[question.id];
  if (question.dm?.statements?.length) {
    if (question.dm.statements.every((_, index) => ['Yes', 'No'].includes(answer?.[index]))) return 'Answered';
  } else if (answer != null && answer !== '') return 'Answered';
  return seen.has(question.id) || progress.times[question.id] > 0 || answer != null ? 'Incomplete' : 'Unseen';
}
