import { useState } from 'react';

export function useAnswers() {
  const [answers, setAnswers] = useState({});

  function handleAnswer(itemId, questionId, option) {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [questionId]: option },
    }));
  }

  function getAnswer(itemId, questionId) {
    return answers[itemId]?.[questionId] ?? null;
  }

  return { handleAnswer, getAnswer };
}
