import { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../lib/dbQueries';
import { useAuth } from '../../context/AuthContext';

const ATTEMPTS_KEY  = 'vr_attempts';
const PENDING_KEY   = 'vr_pending_sync';
export const VR_PROGRESS_CACHE_KEY = 'vr_passage_progress';


// Local attempts shape:  { [questionId]: { passageId, selectedAnswer, answeredAt } }
// localAnswers shape:    { [passageId]:  { [questionId]: selectedAnswer } }  ← matches useAnswers

export function useVerbalReasoningAttempts() {
  const { user } = useAuth();
  const submitting = useRef(new Set());

  const [localAnswers, setLocalAnswers]   = useState({});
  const [cacheLoading, setCacheLoading]   = useState(true);

  useEffect(() => {
    loadCache().finally(() => setCacheLoading(false));
    if (user) flushPendingQueue();
  }, [user]);

  // ── Cache helpers ────────────────────────────────────────────────────────────

  async function loadCache() {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      if (!raw) return;

      const attempts = JSON.parse(raw);
      const mapped = {};
      for (const [questionId, { passageId, selectedAnswer }] of Object.entries(attempts)) {
        if (!mapped[passageId]) mapped[passageId] = {};
        mapped[passageId][questionId] = selectedAnswer;
      }
      setLocalAnswers(mapped);
    } catch (err) {
      console.error('[useVerbalReasoningAttempts] loadCache failed:', err);
    }
  }

  async function saveToCache(questionId, passageId, selectedAnswer) {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      const attempts = raw ? JSON.parse(raw) : {};
      attempts[questionId] = { passageId, selectedAnswer, answeredAt: new Date().toISOString() };
      await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

      setLocalAnswers((prev) => ({
        ...prev,
        [passageId]: { ...prev[passageId], [questionId]: selectedAnswer },
      }));

      return attempts;
    } catch (err) {
      console.error('[useVerbalReasoningAttempts] saveToCache failed:', err);
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
      console.error('[useVerbalReasoningAttempts] updateProgressCache failed:', err);
    }
  }

  async function addToPendingQueue(item) {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push(item);
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('[useVerbalReasoningAttempts] addToPendingQueue failed:', err);
    }
  }

  // ── DB helpers ───────────────────────────────────────────────────────────────

  async function writeAttemptToDB(userId, { questionId, passageId, selectedAnswer, totalQuestions }) {
    await db.insertVRAttempt(userId, questionId, passageId, selectedAnswer);
    const answeredCount = await db.countVRAttemptsForPassage(userId, passageId);
    const status = answeredCount >= totalQuestions ? 'completed' : 'in_progress';
    await db.upsertVRPassageProgress(userId, passageId, status, answeredCount, totalQuestions);
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
      console.error('[useVerbalReasoningAttempts] flushPendingQueue failed:', err);
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  async function submitAttempt({ questionId, passageId, selectedAnswer, totalQuestions }) {
    if (!user) {
      console.warn('[useVerbalReasoningAttempts] submitAttempt called with no logged-in user');
      return;
    }
    if (submitting.current.has(questionId)) return;
    submitting.current.add(questionId);

    try {
      // 1. Always persist locally first — works offline
      const attempts = await saveToCache(questionId, passageId, selectedAnswer);
      if (attempts) await updateProgressCache(passageId, totalQuestions, attempts);

      // 2. Attempt DB write
      try {
        await writeAttemptToDB(user.id, { questionId, passageId, selectedAnswer, totalQuestions });
        // 3. DB succeeded — try to clear any previously queued items
        await flushPendingQueue();
      } catch (dbErr) {
        // 4. Offline / DB error — queue for next opportunity
        console.error('[useVerbalReasoningAttempts] DB write failed, queuing:', dbErr);
        await addToPendingQueue({ questionId, passageId, selectedAnswer, totalQuestions });
      }
    } finally {
      submitting.current.delete(questionId);
    }
  }

  return { submitAttempt, localAnswers, cacheLoading };
}
