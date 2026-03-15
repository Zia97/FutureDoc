import { useState } from 'react';

export function useItemNavigation(items, initialIndex = 0) {
  const [itemIndex, setItemIndex] = useState(initialIndex);
  const [questionIndex, setQuestionIndex] = useState(0);

  const item = items[itemIndex];
  const question = item.questions[questionIndex];

  const isFirstItem = itemIndex === 0;
  const isLastItem = itemIndex === items.length - 1;
  const isFirstQuestion = questionIndex === 0;
  const isLastQuestion = questionIndex === item.questions.length - 1;

  function goToItem(index) {
    setItemIndex(index);
    setQuestionIndex(0);
  }

  function goToNextQuestion() {
    if (!isLastQuestion) setQuestionIndex((i) => i + 1);
  }

  function goToPrevQuestion() {
    if (!isFirstQuestion) setQuestionIndex((i) => i - 1);
  }

  return {
    itemIndex,
    questionIndex,
    item,
    question,
    isFirstItem,
    isLastItem,
    isFirstQuestion,
    isLastQuestion,
    goToItem,
    goToNextQuestion,
    goToPrevQuestion,
  };
}
