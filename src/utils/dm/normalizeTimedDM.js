export function normalizeTimedDMOptions(options = []) {
  return [...options]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((o) => ({
      label: o.label,
      text: o.option_text ?? o.text ?? '',
      option_text: o.option_text ?? o.text ?? '',
      option_data: o.option_data ?? o.vennConfig ?? null,
      vennConfig: o.option_data ?? o.vennConfig ?? null,
      vennGeometry: o.venn_geometry ?? o.vennGeometry ?? null,
      order_index: o.order_index,
    }));
}

export function mapTimedDMQuestion(q) {
  const rawOptions = q.timed_decision_making_question_options
    ?? q.decision_making_question_options
    ?? q.options
    ?? [];

  return {
    questionId: q.id,
    title: q.title,
    type: q.type,
    subtype: q.subtype ?? null,
    stem: q.stem,
    options: normalizeTimedDMOptions(rawOptions),
    statements: q.timed_decision_making_question_statements
      ? [...q.timed_decision_making_question_statements]
          .sort((a, b) => a.order_index - b.order_index)
          .map((s) => ({ text: s.statement_text, answer: s.correct_answer, reason: s.answer_reason ?? null }))
      : (q.decision_making_question_statements
          ? [...q.decision_making_question_statements]
              .sort((a, b) => a.order_index - b.order_index)
              .map((s) => ({ text: s.statement_text, answer: s.correct_answer, reason: s.answer_reason ?? null }))
          : []),
    tableData: q.table_data,
    stimulusDiagram: q.stimulus_diagram ?? q.stimulusDiagram,
    stimulusVennGeometry: q.venn_geometry ?? null,
    hideLabels: q.hideLabels ?? q.hide_labels ?? false,
    answer: q.correct_answer,
    answeringReason: q.answer_reason,
    difficulty: q.difficulty ?? 'normal',
  };
}

export function mapTimedDMTests(data, isPreview = false) {
  return data.map((test) => {
    const questions = test.timed_decision_making_questions ?? test.questions ?? [];
    return {
      id: test.id,
      title: test.title,
      isFree: isPreview ? true : (test.is_free ?? test.isFree ?? false),
      isPreview,
      passageCount: 0,
      questionCount: test.question_count ?? questions.length,
      timeMinutes: test.time_minutes,
      questions: [...questions]
        .sort((a, b) => a.order_index - b.order_index)
        .map(mapTimedDMQuestion),
    };
  });
}
