import { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const ATTEMPTS_KEY = 'qr_attempts';
export const QR_PROGRESS_CACHE_KEY = 'qr_set_progress';

// Local attempts shape:  { [questionId]: { setId, selectedAnswer, answeredAt } }
// localAnswers shape:    { [setId]:      { [questionId]: selectedAnswer } }

export function useQuantitativeReasoningAttempts() {
  const { user } = useAuth();
  const submitting = useRef(new Set());

  const [localAnswers, setLocalAnswers] = useState({});
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
        for (const [questionId, { setId, selectedAnswer }] of Object.entries(attempts)) {
          if (!mapped[setId]) mapped[setId] = {};
          mapped[setId][questionId] = selectedAnswer;
        }
        setLocalAnswers(mapped);
      }
    } catch (err) {
      console.error('[useQuantitativeReasoningAttempts] loadCache failed:', err);
    }
  }

  async function saveToCache(questionId, setId, selectedAnswer) {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      const attempts = raw ? JSON.parse(raw) : {};
      attempts[questionId] = { setId, selectedAnswer, answeredAt: new Date().toISOString() };
      await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

      setLocalAnswers((prev) => ({
        ...prev,
        [setId]: { ...prev[setId], [questionId]: selectedAnswer },
      }));

      return attempts;
    } catch (err) {
      console.error('[useQuantitativeReasoningAttempts] saveToCache failed:', err);
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
      console.error('[useQuantitativeReasoningAttempts] updateProgressCache failed:', err);
    }
  }

  async function submitAttempt({ questionId, setId, selectedAnswer, totalQuestions }) {
    if (!user) {
      console.warn('[useQuantitativeReasoningAttempts] submitAttempt called with no logged-in user');
      return;
    }
    if (submitting.current.has(questionId)) return;
    submitting.current.add(questionId);

    try {
      const attempts = await saveToCache(questionId, setId, selectedAnswer);
      if (attempts) await updateProgressCache(setId, totalQuestions, attempts);
    } finally {
      submitting.current.delete(questionId);
    }
  }

  return { submitAttempt, localAnswers, cacheLoading };
}
