import { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../lib/dbQueries';
import { useAuth } from '../../context/AuthContext';

const ATTEMPTS_KEY = 'sj_attempts';
const PENDING_KEY  = 'sj_pending_sync';
export const SJ_PROGRESS_CACHE_KEY = 'sj_scenario_progress';

// Local attempts shape:  { [questionId]: { scenarioId, selectedAnswer, answeredAt } }
// localAnswers shape:    { [scenarioId]: { [questionId]: selectedAnswer } }

export function useSituationalJudgementAttempts() {
  const { user } = useAuth();
  const submitting = useRef(new Set());

  const [localAnswers, setLocalAnswers] = useState({});
  const [cacheLoading, setCacheLoading] = useState(true);

  useEffect(() => {
    loadCache().finally(() => setCacheLoading(false));
    if (user) flushPendingQueue();
  }, [user]);

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
        return;
      }

      // No local data — hydrate from DB if logged in
      if (!user) return;
      const rows = await db.fetchSJAttempts(user.id);
      if (!rows || rows.length === 0) return;

      const attempts = {};
      const mapped = {};
      for (const { question_id, scenario_id, selected_answer } of rows) {
        attempts[question_id] = { scenarioId: scenario_id, selectedAnswer: selected_answer, answeredAt: new Date().toISOString() };
        if (!mapped[scenario_id]) mapped[scenario_id] = {};
        mapped[scenario_id][question_id] = selected_answer;
      }
      await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
      setLocalAnswers(mapped);
    } catch (err) {
      console.error('[useSituationalJudgementAttempts] loadCache failed:', err);
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
      console.error('[useSituationalJudgementAttempts] saveToCache failed:', err);
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
      console.error('[useSituationalJudgementAttempts] updateProgressCache failed:', err);
    }
  }

  async function addToPendingQueue(item) {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push(item);
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('[useSituationalJudgementAttempts] addToPendingQueue failed:', err);
    }
  }

  async function writeAttemptToDB(userId, { questionId, scenarioId, selectedAnswer, totalQuestions }) {
    await db.insertSJAttempt(userId, questionId, scenarioId, selectedAnswer);
    const answeredCount = await db.countSJAttemptsForScenario(userId, scenarioId);
    const status = answeredCount >= totalQuestions ? 'completed' : 'in_progress';
    await db.upsertSJScenarioProgress(userId, scenarioId, status, answeredCount, totalQuestions);
  }

  async function flushPendingQueue() {
    if (!user) return;
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      if (!raw) return;
      const queue = JSON.parse(raw);
      if (queue.length === 0) return;

      const failed = [];
      for (const item of queue) {
        try {
          await writeAttemptToDB(user.id, item);
        } catch {
          failed.push(item);
        }
      }

      if (failed.length === 0) {
        await AsyncStorage.removeItem(PENDING_KEY);
      } else {
        await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(failed));
      }
    } catch (err) {
      console.error('[useSituationalJudgementAttempts] flushPendingQueue failed:', err);
    }
  }

  async function submitAttempt({ questionId, scenarioId, selectedAnswer, totalQuestions }) {
    if (!user) {
      console.warn('[useSituationalJudgementAttempts] submitAttempt called with no logged-in user');
      return;
    }
    if (submitting.current.has(questionId)) return;
    submitting.current.add(questionId);

    try {
      const attempts = await saveToCache(questionId, scenarioId, selectedAnswer);
      if (attempts) await updateProgressCache(scenarioId, totalQuestions, attempts);

      try {
        await writeAttemptToDB(user.id, { questionId, scenarioId, selectedAnswer, totalQuestions });
        await flushPendingQueue();
      } catch (dbErr) {
        console.error('[useSituationalJudgementAttempts] DB write failed, queuing:', dbErr);
        await addToPendingQueue({ questionId, scenarioId, selectedAnswer, totalQuestions });
      }
    } finally {
      submitting.current.delete(questionId);
    }
  }

  return { submitAttempt, localAnswers, cacheLoading };
}
