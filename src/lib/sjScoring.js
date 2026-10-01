import { LABEL_SETS } from '../constants/sjLabelSets.js';

export const SJ_FULL_MARK = 1;
export const SJ_PARTIAL_MARK = 0.5;

export function getSJLabelSet(labelSetOrItem) {
  if (Array.isArray(labelSetOrItem)) return labelSetOrItem;

  if (labelSetOrItem && typeof labelSetOrItem === 'object') {
    if (Array.isArray(labelSetOrItem.options)) return labelSetOrItem.options;
    if (LABEL_SETS[labelSetOrItem.labelSet]) return LABEL_SETS[labelSetOrItem.labelSet];
    if (labelSetOrItem.type === 'importance') return LABEL_SETS[1];
    if (labelSetOrItem.type === 'appropriateness') return LABEL_SETS[2];
    return null;
  }

  return LABEL_SETS[labelSetOrItem] ?? null;
}

// UCAT SJ rating questions award a full mark for an exact match, half a mark
// for an adjacent response on the four-point scale, and no mark otherwise.
export function getSJMark(selectedAnswer, correctAnswer, labelSetOrItem) {
  if (!selectedAnswer || !correctAnswer) return 0;

  const labelSet = getSJLabelSet(labelSetOrItem);
  if (!labelSet) return 0;

  const selectedIndex = labelSet.indexOf(selectedAnswer);
  const correctIndex = labelSet.indexOf(correctAnswer);
  if (selectedIndex === -1 || correctIndex === -1) return 0;

  const distance = Math.abs(selectedIndex - correctIndex);
  if (distance === 0) return SJ_FULL_MARK;
  if (distance === 1) return SJ_PARTIAL_MARK;
  return 0;
}

export function getSJResult(selectedAnswer, correctAnswer, labelSetOrItem) {
  if (!selectedAnswer) return 'unanswered';

  const mark = getSJMark(selectedAnswer, correctAnswer, labelSetOrItem);
  if (mark === SJ_FULL_MARK) return 'correct';
  if (mark === SJ_PARTIAL_MARK) return 'partial';
  return 'incorrect';
}

export function formatSJMark(mark) {
  return Number.isInteger(mark) ? String(mark) : mark.toFixed(1);
}
