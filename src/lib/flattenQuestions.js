/**
 * Flatten grouped question structures into a single ordered array.
 * Each flat item carries its stem data so the UI can render stem + question
 * from a single index, with no inner cycling.
 */

// VR passages: [{ id, title, resource, questions: [{ questionId, questionText, options, answer, answeringReason }] }]
export function flattenVRPassages(passages) {
  const flat = [];
  passages.forEach((passage, stemIndex) => {
    const stemFirstFlatIndex = flat.length;
    const stemQuestionCount = passage.questions.length;
    passage.questions.forEach((q) => {
      flat.push({
        flatIndex: flat.length,
        stemIndex,
        stemId: passage.id,
        stemTitle: passage.title,
        resource: passage.resource,
        stemFirstFlatIndex,
        stemQuestionCount,
        question: q,
      });
    });
  });
  return flat;
}

// QR sets (practice): [{ id, setId, title, stimulus, questions: [{ questionId, questionText, options, answer, answeringReason }] }]
export function flattenQRSets(sets) {
  const flat = [];
  sets.forEach((set, stemIndex) => {
    const stemFirstFlatIndex = flat.length;
    const stemQuestionCount = set.questions.length;
    set.questions.forEach((q) => {
      flat.push({
        flatIndex: flat.length,
        stemIndex,
        stemId: set.setId ?? set.id,
        stemTitle: set.title,
        stimulus: set.stimulus,
        stemFirstFlatIndex,
        stemQuestionCount,
        question: q,
      });
    });
  });
  return flat;
}

// SJ scenarios: [{ id, scenarioId, labelSet, resource, questions: [{ questionId, questionText, answer, answeringReason }] }]
export function flattenSJScenarios(scenarios) {
  const flat = [];
  scenarios.forEach((scenario, stemIndex) => {
    const stemFirstFlatIndex = flat.length;
    const stemId = scenario.id ?? scenario.scenarioId;
    const stemQuestionCount = scenario.questions.length;
    scenario.questions.forEach((q) => {
      flat.push({
        flatIndex: flat.length,
        stemIndex,
        stemId,
        labelSet: scenario.labelSet,
        resource: scenario.resource,
        stemFirstFlatIndex,
        stemQuestionCount,
        question: q,
      });
    });
  });
  return flat;
}

// VR timed passages — same shape as practice passages
export function flattenTimedVRPassages(passages) {
  return flattenVRPassages(passages);
}

// QR timed sets: questions use `stem` instead of `questionText`
export function flattenTimedQRSets(sets) {
  const flat = [];
  sets.forEach((set, stemIndex) => {
    const stemFirstFlatIndex = flat.length;
    const stemId = set.setId ?? set.id;
    const stemQuestionCount = set.questions.length;
    set.questions.forEach((q) => {
      flat.push({
        flatIndex: flat.length,
        stemIndex,
        stemId,
        stemTitle: set.title,
        stimulus: set.stimulus,
        stemFirstFlatIndex,
        stemQuestionCount,
        question: q,
      });
    });
  });
  return flat;
}

// SJ timed scenarios: questions use `itemId` and `text`, stem field is `stem` not `resource`
export function flattenTimedSJScenarios(scenarios) {
  const flat = [];
  scenarios.forEach((scenario, stemIndex) => {
    const stemFirstFlatIndex = flat.length;
    const stemId = scenario.scenarioId ?? scenario.id;
    const items = scenario.items ?? scenario.questions ?? [];
    const stemQuestionCount = items.length;
    items.forEach((item) => {
      flat.push({
        flatIndex: flat.length,
        stemIndex,
        stemId,
        stem: scenario.stem,
        labelSet: item.type === 'importance' ? 1 : 2,
        stemFirstFlatIndex,
        stemQuestionCount,
        question: item,
      });
    });
  });
  return flat;
}

/**
 * Find the flat index to navigate to when a stem is tapped in the list screen.
 * Returns the first unanswered question's flat index, or the stem's first question
 * if all are answered.
 *
 * @param {string} stemId
 * @param {Array} flatQuestions
 * @param {Object} localAnswers  — shape: { [stemId]: { [questionId]: selectedAnswer } }
 * @param {Function} getQuestionId  — (question) => id string
 */
export function getTargetFlatIndex(stemId, flatQuestions, localAnswers, getQuestionId = (q) => q.questionId ?? q.itemId) {
  const stemItems = flatQuestions.filter((fq) => fq.stemId === stemId);
  if (stemItems.length === 0) return 0;

  const stemAnswers = localAnswers[stemId] ?? {};
  const firstUnanswered = stemItems.find((fq) => !stemAnswers[getQuestionId(fq.question)]);
  return firstUnanswered ? firstUnanswered.flatIndex : stemItems[0].flatIndex;
}
