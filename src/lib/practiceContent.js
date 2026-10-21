// Shared practice-bank mapping for practice screens and coaching downloads.

export function mapPassages(data, isPreview = false) {
  return data.map((p) => ({
    id: p.id,
    title: p.title,
    isFree: isPreview ? true : (p.is_free ?? p.isFree ?? false),
    isPreview,
    resource: p.body,
    questions: [...p.verbal_reasoning_questions]
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        questionId: q.id,
        questionText: q.question_text,
        options: q.options,
        answer: q.correct_answer,
        answeringReason: q.answer_reason,
        difficulty: q.difficulty ?? 'normal',
      })),
  }));
}

function mapOptions(q) {
  const rawOptions = q.decision_making_question_options ?? q.options ?? [];
  return [...rawOptions]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((o) => ({
      label: o.label,
      text: o.option_text ?? o.text ?? '',
      option_text: o.option_text ?? o.text ?? '',
      vennConfig: o.option_data ?? o.vennConfig ?? null,
      option_data: o.option_data ?? o.vennConfig ?? null,
      vennGeometry: o.venn_geometry ?? o.vennGeometry ?? null,
      order_index: o.order_index,
    }));
}

export function mapQuestions(data, isPreview = false) {
  return data.map((q) => ({
    id: q.id,
    title: q.title,
    type: q.type,
    difficulty: q.difficulty ?? null,
    stem: q.stem,
    isFree: isPreview ? true : (q.is_free ?? q.isFree ?? false),
    isPreview,
    tableData: q.table_data,
    stimulusDiagram: q.stimulus_diagram ?? q.stimulusDiagram,
    stimulusVennGeometry: q.venn_geometry ?? null,
    hideLabels: q.hideLabels ?? q.hide_labels ?? false,
    answer: q.correct_answer,
    answeringReason: q.answer_reason,
    subtype: (q.stimulus_diagram ?? q.stimulusDiagram)
      ? 'interpret_diagram'
      : (q.decision_making_question_options?.some((o) => o.option_data)
        || q.options?.some((o) => o.option_data ?? o.vennConfig))
      ? 'select_diagram'
      : null,
    options: mapOptions(q),
    statements: [...(q.decision_making_question_statements || [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((s) => ({
        text: s.statement_text,
        answer: s.correct_answer,
        reason: s.answer_reason ?? null,
      })),
  }));
}

export function mapSets(data, isPreview = false) {
  const seen = new Set();
  const unique = [];
  for (const s of data) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    unique.push(s);
  }
  return unique.map((s) => ({
    id: s.id,
    setId: s.id,
    title: s.title,
    isFree: isPreview ? true : (s.is_free ?? s.isFree ?? false),
    isPreview,
    stimulus: s.stimulus,
    questions: [...s.quantitative_reasoning_questions]
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        questionId: q.id,
        questionText: q.question_text,
        options: q.options,
        answer: q.correct_answer,
        answeringReason: q.answer_reason,
        difficulty: q.difficulty ?? 'normal',
      })),
  }));
}

export function mapScenarios(data, isPreview = false) {
  return data.map((s) => ({
    id: s.id,
    scenarioId: s.id,
    isFree: isPreview ? true : (s.is_free ?? s.isFree ?? false),
    isPreview,
    resource: s.body,
    questions: [...s.situational_judgement_questions]
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        questionId: q.id,
        questionText: q.question_text,
        answer: q.correct_answer,
        answeringReason: q.answer_reason,
        labelSet: q.label_set ?? s.label_set,
        difficulty: q.difficulty ?? 'normal',
      })),
  }));
}
