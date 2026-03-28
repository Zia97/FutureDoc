import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLETED_KEY = 'timed_dm_completed_attempts';

const YES_NO_TYPES = ['syllogism', 'passage_syllogism', 'interpreting_info'];

// Score 1 per correct question.
// MCQ/Venn: correct if selectedAnswer === question.answer
// Yes/No: correct if ALL statements answered correctly
function computeScores(questions, answers) {
  const answerList = [];
  let correctCount = 0;

  for (const q of questions) {
    const selected = answers[q.questionId];
    const isYesNo = YES_NO_TYPES.includes(q.type);
    let isCorrect = false;

    if (isYesNo) {
      if (selected && typeof selected === 'object' && q.statements?.length > 0) {
        isCorrect = q.statements.every((s, i) => selected[i] === s.answer);
      }
    } else {
      isCorrect = !!selected && selected === q.answer;
    }

    if (isCorrect) correctCount++;

    answerList.push({
      questionId: q.questionId,
      selectedAnswer: selected ?? '',
      isCorrect,
    });
  }

  const total = questions.length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  return { answerList, correctCount, scorePercent };
}

export function useTimedDMExamProgress() {
  const [completedAttempts, setCompletedAttempts] = useState({});

  useEffect(() => {
    loadLocalAttempts();
  }, []);

  async function loadLocalAttempts() {
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      if (raw) setCompletedAttempts(JSON.parse(raw));
    } catch (err) {
      console.error('[useTimedDMExamProgress] loadLocalAttempts failed:', err);
    }
  }

  async function submitExam({ test, answers, secondsLeft }) {
    const timeTakenSeconds = test.timeMinutes * 60 - (secondsLeft ?? 0);
    const { answerList, correctCount, scorePercent } = computeScores(test.questions, answers);

    const attemptData = {
      scorePercent,
      correctCount,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds,
      answerMap: answers,
    };

    // ── 1. Save to local storage (fast, device-first) ───────────────────────
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      current[test.id] = attemptData;
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts(current);
    } catch (err) {
      console.error('[useTimedDMExamProgress] local save failed:', err);
    }

  }

  async function deleteAttempt(testId) {
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      delete current[testId];
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts({ ...current });
    } catch (err) {
      console.error('[useTimedDMExamProgress] local delete failed:', err);
    }
  }

  return { completedAttempts, submitExam, deleteAttempt, reload: loadLocalAttempts };
}
