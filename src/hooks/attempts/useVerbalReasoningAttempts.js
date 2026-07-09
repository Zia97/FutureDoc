import { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportError } from '../../lib/reportError';
import { recordActivity } from '../../services/streakService';
import { setLastActivity } from '../../services/lastActivityService';
import { recordPracticeAttempt } from '../../lib/userTelemetry';

const ATTEMPTS_KEY  = 'vr_attempts';
export const VR_PROGRESS_CACHE_KEY = 'vr_passage_progress';


// Local attempts shape:  { [questionId]: { passageId, selectedAnswer, answeredAt, timeSpentMs } }
// localAnswers shape:    { [passageId]:  { [questionId]: selectedAnswer } }  ← matches useAnswers
// localTimesMs shape:    { [questionId]: timeSpentMs }

export function useVerbalReasoningAttempts() {
  const submitting = useRef(new Set());

  const [localAnswers, setLocalAnswers]   = useState({});
  const [localTimesMs, setLocalTimesMs]   = useState({});
  const [cacheLoading, setCacheLoading]   = useState(true);

  useEffect(() => {
    loadCache().finally(() => setCacheLoading(false));
  }, []);

  // ── Cache helpers ────────────────────────────────────────────────────────────

  async function loadCache() {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      if (raw) {
        const attempts = JSON.parse(raw);
        const mapped = {};
        const timesMs = {};
        for (const [questionId, { passageId, selectedAnswer, timeSpentMs }] of Object.entries(attempts)) {
          if (!mapped[passageId]) mapped[passageId] = {};
          mapped[passageId][questionId] = selectedAnswer;
          if (timeSpentMs != null) timesMs[questionId] = timeSpentMs;
        }
        setLocalAnswers(mapped);
        setLocalTimesMs(timesMs);
      }
    } catch (err) {
      reportError('useVerbalReasoningAttempts', err, { level: 'warning', extra: { note: 'loadCache failed' } });
    }
  }

  async function saveToCache(questionId, passageId, selectedAnswer, timeSpentMs) {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      const attempts = raw ? JSON.parse(raw) : {};
      attempts[questionId] = { passageId, selectedAnswer, answeredAt: new Date().toISOString(), timeSpentMs: timeSpentMs ?? null };
      await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

      setLocalAnswers((prev) => ({
        ...prev,
        [passageId]: { ...prev[passageId], [questionId]: selectedAnswer },
      }));
      if (timeSpentMs != null) setLocalTimesMs((prev) => ({ ...prev, [questionId]: timeSpentMs }));

      return attempts;
    } catch (err) {
      reportError('useVerbalReasoningAttempts', err, { level: 'warning', extra: { note: 'saveToCache failed' } });
      return null;
    }
  }

  async function updateProgressCache(passageId, totalQuestions, attempts) {
    try {
      const answeredCount = Object.values(attempts).filter((a) => a.passageId === passageId).length;
      const status = answeredCount >= totalQuestions ? 'completed' : 'in_progress';

      const progressRaw = await AsyncStorage.getItem(VR_PROGRESS_CACHE_KEY);
      const progressMap = progressRaw ? JSON.parse(progressRaw) : {};
      progressMap[passageId] = status;
      await AsyncStorage.setItem(VR_PROGRESS_CACHE_KEY, JSON.stringify(progressMap));
    } catch (err) {
      reportError('useVerbalReasoningAttempts', err, { level: 'warning', extra: { note: 'updateProgressCache failed' } });
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  async function submitAttempt({
    questionId,
    passageId,
    selectedAnswer,
    totalQuestions,
    timeSpentMs = null,
    isCorrect = null,
  }) {
    if (submitting.current.has(questionId)) return;
    submitting.current.add(questionId);

    try {
      const attempts = await saveToCache(questionId, passageId, selectedAnswer, timeSpentMs);
      if (attempts) await updateProgressCache(passageId, totalQuestions, attempts);
      recordActivity();
      setLastActivity({ kind: 'practice', section: 'VR' });
      recordPracticeAttempt({
        section: 'vr',
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
