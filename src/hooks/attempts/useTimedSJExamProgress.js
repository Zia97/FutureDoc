import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LABEL_SETS } from '../../constants/sjLabelSets';

// Local storage key — stores completed exam results keyed by test.id string
const COMPLETED_KEY = 'timed_sj_completed_attempts';

// Extracts the numeric test_id from test.id e.g. "timed-sj-test-1" → 1
function getNumericTestId(testId) {
  return Number(testId.split('-').pop());
}

// Computes UCAT SJ marks and builds the answers array for DB insertion.
// Mark scheme: 4 marks (exact), 2 marks (1 position off), 0 marks (2+ off or unanswered)
function computeScores(scenarios, getAnswer) {
  const answers = [];
  let totalMarks = 0;
  let correctCount = 0;

  for (const scenario of scenarios) {
    for (const item of scenario.items) {
      const selected = getAnswer(scenario.scenarioId, item.itemId);
      const labelSet = LABEL_SETS[item.type === 'importance' ? 1 : 2];
      const si = selected ? labelSet.indexOf(selected) : -1;
      const ci = labelSet.indexOf(item.answer);
      const diff = si === -1 || ci === -1 ? 99 : Math.abs(si - ci);
      const marks = diff === 0 ? 4 : diff === 1 ? 2 : 0;

      totalMarks += marks;
      if (diff === 0) correctCount++;

      answers.push({
        questionId: item.itemId,
        scenarioId: scenario.scenarioId,
        selectedAnswer: selected ?? '',
      });
    }
  }

  const maxMarks = answers.length * 4;
  const scorePercent = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;

  return { answers, correctCount, scorePercent };
}

export function useTimedSJExamProgress() {
  // { [testId]: { scorePercent, correctCount, totalQuestions, submittedAt, timeTakenSeconds } }
  const [completedAttempts, setCompletedAttempts] = useState({});

  useEffect(() => {
    loadLocalAttempts();
  }, []);

  async function loadLocalAttempts() {
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      if (raw) setCompletedAttempts(JSON.parse(raw));
    } catch (err) {
      console.error('[useTimedSJExamProgress] loadLocalAttempts failed:', err);
    }
  }

  // Called when the exam ends (user ends it or timer expires).
  // Saves locally first, then writes to DB in background (non-blocking).
  async function submitExam({ test, getAnswer, secondsLeft, flags }) {
    const numericTestId = getNumericTestId(test.id);
    const timeTakenSeconds = test.timeMinutes * 60 - (secondsLeft ?? 0);
    const { answers, correctCount, scorePercent } = computeScores(
      test.scenarios,
      getAnswer,
    );

    // Build answer map for review: { [scenarioId]: { [itemId]: selectedAnswer } }
    const answerMap = {};
    for (const scenario of test.scenarios) {
      for (const item of scenario.items) {
        const ans = getAnswer(scenario.scenarioId, item.itemId);
        if (ans) {
          if (!answerMap[scenario.scenarioId]) answerMap[scenario.scenarioId] = {};
          answerMap[scenario.scenarioId][item.itemId] = ans;
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
      console.error('[useTimedSJExamProgress] local save failed:', err);
    }

  }

  // Removes a completed attempt from local storage and DB.
  async function deleteAttempt(testId) {
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      delete current[testId];
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts({ ...current });
    } catch (err) {
      console.error('[useTimedSJExamProgress] local delete failed:', err);
    }
  }

  return { completedAttempts, submitExam, deleteAttempt, reload: loadLocalAttempts };
}
