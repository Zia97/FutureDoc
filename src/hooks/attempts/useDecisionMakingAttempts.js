import { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportError } from '../../lib/reportError';
import { recordActivity } from '../../services/streakService';
import { setLastActivity } from '../../services/lastActivityService';
import { recordPracticeAttempt } from '../../lib/userTelemetry';

export const DM_ATTEMPTS_KEY = 'dm_attempts';
const ATTEMPTS_KEY = DM_ATTEMPTS_KEY;

// DM has no parent grouping — questions are standalone.
// answer is either a string (MCQ) or an object (Yes/No statements).
// Only submitted answers are stored.
//
// Local attempts shape: { [questionId]: { answer, attemptedAt, timeSpentMs } }
// localAnswers shape:   { [questionId]: answer }
// localSubmitted shape: { [questionId]: true }
// localTimesMs shape:   { [questionId]: timeSpentMs }

export function useDecisionMakingAttempts() {
  const submitting = useRef(new Set());

  const [localAnswers, setLocalAnswers]   = useState({});
  const [localSubmitted, setLocalSubmitted] = useState({});
  const [localTimesMs, setLocalTimesMs]   = useState({});
  const [cacheLoading, setCacheLoading]   = useState(true);

  useEffect(() => {
    loadCache().finally(() => setCacheLoading(false));
  }, []);

  async function loadCache() {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      if (raw) {
        const attempts = JSON.parse(raw);
        const answers   = {};
        const submitted = {};
        const timesMs   = {};
        for (const [questionId, { answer, timeSpentMs }] of Object.entries(attempts)) {
          answers[questionId]   = answer;
          submitted[questionId] = true;
          if (timeSpentMs != null) timesMs[questionId] = timeSpentMs;
        }
        setLocalAnswers(answers);
        setLocalSubmitted(submitted);
        setLocalTimesMs(timesMs);
      }
    } catch (err) {
      reportError('useDecisionMakingAttempts', err, { level: 'warning', extra: { note: 'loadCache failed' } });
    }
  }

  async function saveToCache(questionId, answer, timeSpentMs) {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      const attempts = raw ? JSON.parse(raw) : {};
      attempts[questionId] = { answer, attemptedAt: new Date().toISOString(), timeSpentMs: timeSpentMs ?? null };
      await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

      setLocalAnswers((prev) => ({ ...prev, [questionId]: answer }));
      setLocalSubmitted((prev) => ({ ...prev, [questionId]: true }));
      if (timeSpentMs != null) setLocalTimesMs((prev) => ({ ...prev, [questionId]: timeSpentMs }));
    } catch (err) {
      reportError('useDecisionMakingAttempts', err, { level: 'warning', extra: { note: 'saveToCache failed' } });
    }
  }

  async function submitAttempt({
    questionId,
    answer,
    timeSpentMs = null,
    statementCorrectness = null,
  }) {
    if (submitting.current.has(questionId)) return;
    submitting.current.add(questionId);

    try {
      await saveToCache(questionId, answer, timeSpentMs);
      recordActivity();
      setLastActivity({ kind: 'practice', section: 'DM' });

      // DM Yes/No questions: emit one telemetry row per statement.
      if (answer && typeof answer === 'object') {
        for (const [key, value] of Object.entries(answer)) {
          const idx = Number(key);
          if (!Number.isInteger(idx)) continue;
          const correct = statementCorrectness?.[idx];
          recordPracticeAttempt({
            section: 'dm',
            questionId,
            statementIndex: idx,
            selectedAnswer: value == null ? null : String(value),
            isCorrect: correct == null ? null : !!correct,
            timeSpentMs,
          });
        }
      } else {
        recordPracticeAttempt({
          section: 'dm',
          questionId,
          selectedAnswer: answer,
          isCorrect: statementCorrectness == null ? null : !!statementCorrectness,
          timeSpentMs,
        });
      }
    } finally {
      submitting.current.delete(questionId);
    }
  }

  return { submitAttempt, localAnswers, localSubmitted, localTimesMs, cacheLoading };
}
