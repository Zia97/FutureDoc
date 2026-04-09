import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLETED_KEY = 'timed_vr_completed_attempts';

// Extracts the numeric test_id from test.id e.g. "timed-vr-test-001" → 1
function getNumericTestId(testId) {
  return Number(testId.replace(/\D+/g, '').replace(/^0+/, '') || '0');
}

// Computes VR scores: 1 mark per correct answer.
function computeScores(passages, getAnswer) {
  const answers = [];
  let correctCount = 0;

  for (const passage of passages) {
    for (const q of passage.questions) {
      const selected = getAnswer(passage.id, q.questionId);
      if (selected && selected === q.answer) correctCount++;

      answers.push({
        questionId: q.questionId,
        passageId: passage.id,
        selectedAnswer: selected ?? '',
      });
    }
  }

  const scorePercent = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

  return { answers, correctCount, scorePercent };
}

export function useTimedVRExamProgress() {
  const [completedAttempts, setCompletedAttempts] = useState({});

  useEffect(() => {
    loadLocalAttempts();
  }, []);

  async function loadLocalAttempts() {
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      if (raw) setCompletedAttempts(JSON.parse(raw));
    } catch (err) {
      console.error('[useTimedVRExamProgress] loadLocalAttempts failed:', err);
    }
  }

  // Called when the exam ends (user ends it or timer expires).
  // Saves locally first, then writes to DB in background (non-blocking).
  async function submitExam({ test, getAnswer, secondsLeft, flags }) {
    const numericTestId = getNumericTestId(test.id);
    const timeTakenSeconds = test.timeMinutes * 60 - (secondsLeft ?? 0);
    const { answers, correctCount, scorePercent } = computeScores(
      test.passages,
      getAnswer,
    );

    // Build answer map for review: { [passageId]: { [questionId]: selectedAnswer } }
    const answerMap = {};
    for (const passage of test.passages) {
      for (const q of passage.questions) {
        const ans = getAnswer(passage.id, q.questionId);
        if (ans) {
          if (!answerMap[passage.id]) answerMap[passage.id] = {};
          answerMap[passage.id][q.questionId] = ans;
        }
      }
    }

    // ── 1. Save to local storage (fast, device-first) ───────────────────────
    const attemptData = {
      scorePercent,
      correctCount,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds,
      answerMap,
      flags: flags ? Array.from(flags) : [],
    };
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      current[test.id] = attemptData;
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts(current);
    } catch (err) {
      console.error('[useTimedVRExamProgress] local save failed:', err);
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
      console.error('[useTimedVRExamProgress] local delete failed:', err);
    }
  }

  return { completedAttempts, submitExam, deleteAttempt, reload: loadLocalAttempts };
}
