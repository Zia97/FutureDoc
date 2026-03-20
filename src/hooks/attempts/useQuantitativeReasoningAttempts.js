import { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../lib/dbQueries';
import { useAuth } from '../../context/AuthContext';

const ATTEMPTS_KEY = 'qr_attempts';
const PENDING_KEY  = 'qr_pending_sync';
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
    if (user) flushPendingQueue();
  }, [user]);

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
        return;
      }

      // No local data — hydrate from DB if logged in
      if (!user) return;
      const rows = await db.fetchQRAttempts(user.id);
      if (!rows || rows.length === 0) return;

      const attempts = {};
      const mapped = {};
      for (const { question_id, set_id, selected_answer } of rows) {
        attempts[question_id] = { setId: set_id, selectedAnswer: selected_answer, answeredAt: new Date().toISOString() };
        if (!mapped[set_id]) mapped[set_id] = {};
        mapped[set_id][question_id] = selected_answer;
      }
      await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
      setLocalAnswers(mapped);
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

  async function addToPendingQueue(item) {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push(item);
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('[useQuantitativeReasoningAttempts] addToPendingQueue failed:', err);
    }
  }

  async function writeAttemptToDB(userId, { questionId, setId, selectedAnswer, totalQuestions }) {
    await db.insertQRAttempt(userId, questionId, setId, selectedAnswer);
    const answeredCount = await db.countQRAttemptsForSet(userId, setId);
    const status = answeredCount >= totalQuestions ? 'completed' : 'in_progress';
    await db.upsertQRSetProgress(userId, setId, status, answeredCount, totalQuestions);
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
      console.error('[useQuantitativeReasoningAttempts] flushPendingQueue failed:', err);
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

      try {
        await writeAttemptToDB(user.id, { questionId, setId, selectedAnswer, totalQuestions });
        await flushPendingQueue();
      } catch (dbErr) {
        console.error('[useQuantitativeReasoningAttempts] DB write failed, queuing:', dbErr);
        await addToPendingQueue({ questionId, setId, selectedAnswer, totalQuestions });
      }
    } finally {
      submitting.current.delete(questionId);
    }
  }

  return { submitAttempt, localAnswers, cacheLoading };
}
