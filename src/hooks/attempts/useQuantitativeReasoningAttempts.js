import { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const ATTEMPTS_KEY = 'qr_attempts';
const PENDING_KEY  = 'qr_pending_sync';

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
      if (!raw) return;

      const attempts = JSON.parse(raw);
      const mapped = {};
      for (const [questionId, { setId, selectedAnswer }] of Object.entries(attempts)) {
        if (!mapped[setId]) mapped[setId] = {};
        mapped[setId][questionId] = selectedAnswer;
      }
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
    } catch (err) {
      console.error('[useQuantitativeReasoningAttempts] saveToCache failed:', err);
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
    const { error: attemptError } = await supabase
      .from('quantitative_reasoning_question_attempts')
      .insert({
        user_id: userId,
        question_id: questionId,
        set_id: setId,
        selected_answer: selectedAnswer,
      });

    if (attemptError && attemptError.code !== '23505') throw attemptError;

    const { count: answeredCount, error: countError } = await supabase
      .from('quantitative_reasoning_question_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('set_id', setId);

    if (countError) throw countError;

    const status = answeredCount >= totalQuestions ? 'completed' : 'in_progress';

    const { error: progressError } = await supabase
      .from('quantitative_reasoning_set_progress')
      .upsert(
        {
          user_id: userId,
          set_id: setId,
          status,
          answered_count: answeredCount,
          total_questions: totalQuestions,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,set_id' },
      );

    if (progressError) throw progressError;
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
      await saveToCache(questionId, setId, selectedAnswer);

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
