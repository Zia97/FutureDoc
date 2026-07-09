import { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportError } from '../../lib/reportError';
import { recordActivity } from '../../services/streakService';
import { setLastActivity } from '../../services/lastActivityService';
import { recordPracticeAttempt } from '../../lib/userTelemetry';

const ATTEMPTS_KEY = 'qr_attempts';
export const QR_PROGRESS_CACHE_KEY = 'qr_set_progress';

// Local attempts shape:  { [questionId]: { setId, selectedAnswer, answeredAt } }
// localAnswers shape:    { [setId]:      { [questionId]: selectedAnswer } }

export function useQuantitativeReasoningAttempts() {
  const submitting = useRef(new Set());

  const [localAnswers, setLocalAnswers] = useState({});
  const [localTimesMs, setLocalTimesMs] = useState({});
  const [cacheLoading, setCacheLoading] = useState(true);

  useEffect(() => {
    loadCache().finally(() => setCacheLoading(false));
  }, []);

  async function loadCache() {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      if (raw) {
        const attempts = JSON.parse(raw);
        const mapped = {};
        const timesMs = {};
        for (const [questionId, { setId, selectedAnswer, timeSpentMs }] of Object.entries(attempts)) {
          if (!mapped[setId]) mapped[setId] = {};
          mapped[setId][questionId] = selectedAnswer;
          if (timeSpentMs != null) timesMs[questionId] = timeSpentMs;
        }
        setLocalAnswers(mapped);
        setLocalTimesMs(timesMs);
      }
    } catch (err) {
      reportError('useQuantitativeReasoningAttempts', err, { level: 'warning', extra: { note: 'loadCache failed' } });
    }
  }

  async function saveToCache(questionId, setId, selectedAnswer, timeSpentMs) {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      const attempts = raw ? JSON.parse(raw) : {};
      attempts[questionId] = { setId, selectedAnswer, answeredAt: new Date().toISOString(), timeSpentMs: timeSpentMs ?? null };
      await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

      setLocalAnswers((prev) => ({
        ...prev,
        [setId]: { ...prev[setId], [questionId]: selectedAnswer },
      }));
      if (timeSpentMs != null) setLocalTimesMs((prev) => ({ ...prev, [questionId]: timeSpentMs }));

      return attempts;
    } catch (err) {
      reportError('useQuantitativeReasoningAttempts', err, { level: 'warning', extra: { note: 'saveToCache failed' } });
      return null;
    }
  }

  async function updateProgressCache(setId, totalQuestions, attempts) {
    try {
      const answeredCount = Object.values(attempts).filter((a) => a.setId === setId).length;
      const status = answeredCount >= totalQuestions ? 'completed' : 'in_progress';

      const progressRaw = await AsyncStorage.getItem(QR_PROGRESS_CACHE_KEY);
      const progressMap = progressRaw ? JSON.parse(progressRaw) : {};
      progressMap[setId] = status;
      await AsyncStorage.setItem(QR_PROGRESS_CACHE_KEY, JSON.stringify(progressMap));
    } catch (err) {
      reportError('useQuantitativeReasoningAttempts', err, { level: 'warning', extra: { note: 'updateProgressCache failed' } });
    }
  }

  async function submitAttempt({
    questionId,
    setId,
    selectedAnswer,
    totalQuestions,
    timeSpentMs = null,
    isCorrect = null,
  }) {
    if (submitting.current.has(questionId)) return;
    submitting.current.add(questionId);

    try {
      const attempts = await saveToCache(questionId, setId, selectedAnswer, timeSpentMs);
      if (attempts) await updateProgressCache(setId, totalQuestions, attempts);
      recordActivity();
      setLastActivity({ kind: 'practice', section: 'QR' });
      recordPracticeAttempt({
        section: 'qr',
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpentMs,
      });
    } finally {
      submitting.current.delete(questionId);
    }
  }

  return { submitAttempt, localAnswers, localTimesMs, cacheLoading };
}
