import { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../lib/dbQueries';
import { useAuth } from '../../context/AuthContext';

export const DM_ATTEMPTS_KEY = 'dm_attempts';
const ATTEMPTS_KEY = DM_ATTEMPTS_KEY;
const PENDING_KEY  = 'dm_pending_sync';

// DM has no parent grouping — questions are standalone.
// answer is either a string (MCQ) or an object (Yes/No statements).
// Only submitted answers are stored.
//
// Local attempts shape: { [questionId]: { answer, attemptedAt } }
// localAnswers shape:   { [questionId]: answer }
// localSubmitted shape: { [questionId]: true }

export function useDecisionMakingAttempts() {
  const { user } = useAuth();
  const submitting = useRef(new Set());

  const [localAnswers, setLocalAnswers]   = useState({});
  const [localSubmitted, setLocalSubmitted] = useState({});
  const [cacheLoading, setCacheLoading]   = useState(true);

  useEffect(() => {
    loadCache().finally(() => setCacheLoading(false));
    if (user) flushPendingQueue();
  }, [user]);

  async function loadCache() {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      if (!raw) return;

      const attempts = JSON.parse(raw);
      const answers   = {};
      const submitted = {};
      for (const [questionId, { answer }] of Object.entries(attempts)) {
        answers[questionId]   = answer;
        submitted[questionId] = true;
      }
      setLocalAnswers(answers);
      setLocalSubmitted(submitted);
    } catch (err) {
      console.error('[useDecisionMakingAttempts] loadCache failed:', err);
    }
  }

  async function saveToCache(questionId, answer) {
    try {
      const raw = await AsyncStorage.getItem(ATTEMPTS_KEY);
      const attempts = raw ? JSON.parse(raw) : {};
      attempts[questionId] = { answer, attemptedAt: new Date().toISOString() };
      await AsyncStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));

      setLocalAnswers((prev) => ({ ...prev, [questionId]: answer }));
      setLocalSubmitted((prev) => ({ ...prev, [questionId]: true }));
    } catch (err) {
      console.error('[useDecisionMakingAttempts] saveToCache failed:', err);
    }
  }

  async function addToPendingQueue(item) {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push(item);
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('[useDecisionMakingAttempts] addToPendingQueue failed:', err);
    }
  }

  async function writeAttemptToDB(userId, { questionId, answer }) {
    await db.insertDMAttempt(userId, questionId, answer);
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
      console.error('[useDecisionMakingAttempts] flushPendingQueue failed:', err);
    }
  }

  async function submitAttempt({ questionId, answer }) {
    if (!user) {
      console.warn('[useDecisionMakingAttempts] submitAttempt called with no logged-in user');
      return;
    }
    if (submitting.current.has(questionId)) return;
    submitting.current.add(questionId);

    try {
      await saveToCache(questionId, answer);

      try {
        await writeAttemptToDB(user.id, { questionId, answer });
        await flushPendingQueue();
      } catch (dbErr) {
        console.error('[useDecisionMakingAttempts] DB write failed, queuing:', dbErr);
        await addToPendingQueue({ questionId, answer });
      }
    } finally {
      submitting.current.delete(questionId);
    }
  }

  return { submitAttempt, localAnswers, localSubmitted, cacheLoading };
}
