import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLETED_KEY = 'timed_qr_completed_attempts';

// Score 1 mark per correct answer (matched by option label).
function computeScores(sets, answers) {
  const answerList = [];
  let correctCount = 0;

  for (const set of sets) {
    for (const q of set.questions) {
      const selected = answers[q.questionId];
      const isCorrect = !!selected && selected === q.answer;
      if (isCorrect) correctCount++;

      answerList.push({
        questionId: q.questionId,
        setId: set.setId,
        selectedAnswer: selected ?? '',
        isCorrect,
      });
    }
  }

  const total = answerList.length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  return { answerList, correctCount, scorePercent };
}

export function useTimedQRExamProgress() {
  const [completedAttempts, setCompletedAttempts] = useState({});

  useEffect(() => {
    loadLocalAttempts();
  }, []);

  async function loadLocalAttempts() {
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      if (raw) setCompletedAttempts(JSON.parse(raw));
    } catch (err) {
      console.error('[useTimedQRExamProgress] loadLocalAttempts failed:', err);
    }
  }

  // Called when the exam ends (user ends it or timer expires).
  async function submitExam({ test, answers, secondsLeft }) {
    const timeTakenSeconds = test.timeMinutes * 60 - (secondsLeft ?? 0);
    const { correctCount, scorePercent } = computeScores(test.sets, answers);

    // Build answer map for review: { [setId]: { [questionId]: selectedAnswer } }
    const answerMap = {};
    for (const set of test.sets) {
      for (const q of set.questions) {
        const ans = answers[q.questionId];
        if (ans) {
          if (!answerMap[set.setId]) answerMap[set.setId] = {};
          answerMap[set.setId][q.questionId] = ans;
        }
      }
    }

    const attemptData = {
      scorePercent,
      correctCount,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds,
      answerMap,
    };

    // ── Save to local storage (fast, device-first) ──────────────────────
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      current[test.id] = attemptData;
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts(current);
    } catch (err) {
      console.error('[useTimedQRExamProgress] local save failed:', err);
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
      console.error('[useTimedQRExamProgress] local delete failed:', err);
    }
  }

  return { completedAttempts, submitExam, deleteAttempt, reload: loadLocalAttempts };
}
