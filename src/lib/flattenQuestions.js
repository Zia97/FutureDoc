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
        isFree: passage.isFree ?? false,
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
        isFree: set.isFree ?? false,
        stemFirstFlatIndex,
        stemQuestionCount,
        question: q,
      });
    });
  });
  return flat;
}

// SJ scenarios: [{ id, scenarioId, resource, questions: [{ questionId, questionText, answer, answeringReason, labelSet }] }]
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
        labelSet: q.labelSet,
        resource: scenario.resource,
        isFree: scenario.isFree ?? false,
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
 * Returns the flat index of the first question in a stem.
 * Used by non-timed practice list screens so tapping a stem always opens
 * its first question rather than jumping to the first unanswered one.
 */
export function getFirstFlatIndex(stemId, flatQuestions) {
  const first = flatQuestions.find((fq) => fq.stemId === stemId);
  return first ? first.flatIndex : 0;
}
