import { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportError } from '../../lib/reportError';
import { recordActivity } from '../../services/streakService';
import { setLastActivity } from '../../services/lastActivityService';

const ATTEMPTS_KEY = 'sj_attempts';
export const SJ_PROGRESS_CACHE_KEY = 'sj_scenario_progress';

// Local attempts shape:  { [questionId]: { scenarioId, selectedAnswer, answeredAt } }
// localAnswers shape:    { [scenarioId]: { [questionId]: selectedAnswer } }

export function useSituationalJudgementAttempts() {
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
        for (const [questionId, { scenarioId, selectedAnswer }] of Object.entries(attempts)) {
          if (!mapped[scenarioId]) mapped[scenarioId] = {};
          mapped[scenarioId][questionId] = selectedAnswer;
        }
        setLocalAnswers(mapped);
      }
    } catch (err) {
      reportError('useSituationalJudgementAttempts', err, { level: 'warning', extra: { note: 'loadCache failed' } });
    }
  }

  async function saveToCache(questionId, scenarioId, selectedAnswer) {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      const attempts = raw ? JSON.parse(raw) : {};
      attempts[questionId] = { scenarioId, selectedAnswer, answeredAt: new Date().toISOString() };
      await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

      setLocalAnswers((prev) => ({
        ...prev,
        [scenarioId]: { ...prev[scenarioId], [questionId]: selectedAnswer },
      }));

      return attempts;
    } catch (err) {
      reportError('useSituationalJudgementAttempts', err, { level: 'warning', extra: { note: 'saveToCache failed' } });
      return null;
    }
  }

  async function updateProgressCache(scenarioId, totalQuestions, attempts) {
    try {
      const answeredCount = Object.values(attempts).filter((a) => a.scenarioId === scenarioId).length;
      const status = answeredCount >= totalQuestions ? 'completed' : 'in_progress';

      const progressRaw = await AsyncStorage.getItem(SJ_PROGRESS_CACHE_KEY);
      const progressMap = progressRaw ? JSON.parse(progressRaw) : {};
      progressMap[scenarioId] = status;
      await AsyncStorage.setItem(SJ_PROGRESS_CACHE_KEY, JSON.stringify(progressMap));
    } catch (err) {
      reportError('useSituationalJudgementAttempts', err, { level: 'warning', extra: { note: 'updateProgressCache failed' } });
    }
  }

  async function submitAttempt({ questionId, scenarioId, selectedAnswer, totalQuestions }) {
    if (submitting.current.has(questionId)) return;
    submitting.current.add(questionId);

    try {
      const attempts = await saveToCache(questionId, scenarioId, selectedAnswer);
      if (attempts) await updateProgressCache(scenarioId, totalQuestions, attempts);
      recordActivity();
      setLastActivity({ kind: 'practice', section: 'SJ' });
    } finally {
      submitting.current.delete(questionId);
    }
  }

  return { submitAttempt, localAnswers, cacheLoading };
}
