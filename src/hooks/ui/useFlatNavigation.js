import { useState } from 'react';

/**
 * Single-index navigation over a flat question array.
 * Replaces useItemNavigation for all sections.
 */
export function useFlatNavigation(flatQuestions, initialIndex = 0) {
  const [index, setIndex] = useState(initialIndex);

  const item = flatQuestions[index] ?? flatQuestions[0];

  return {
    index,
    item,
    isFirst: index === 0,
    isLast: index === flatQuestions.length - 1,
    goTo: (i) => setIndex(Math.max(0, Math.min(i, flatQuestions.length - 1))),
    goNext: () => setIndex((i) => Math.min(i + 1, flatQuestions.length - 1)),
    goPrev: () => setIndex((i) => Math.max(i - 1, 0)),
  };
}
