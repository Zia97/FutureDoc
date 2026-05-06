import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import { reportError } from './reportError';

const APP_VERSION = Constants.expoConfig?.version ?? null;

async function getUserId() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  } catch (_) {
    return null;
  }
}

/**
 * Insert a single practice attempt row. Fire-and-forget; silent if anonymous.
 * @param {object} args
 * @param {'vr'|'dm'|'qr'|'sj'} args.section
 * @param {string} args.questionId
 * @param {number|null} [args.statementIndex]
 * @param {string|null} args.selectedAnswer
 * @param {boolean|null} args.isCorrect
 * @param {number} args.timeSpentMs
 */
export async function recordPracticeAttempt({
  section,
  questionId,
  statementIndex = null,
  selectedAnswer,
  isCorrect,
  timeSpentMs,
}) {
  if (!section || !questionId) return;
  if (timeSpentMs == null || Number.isNaN(timeSpentMs) || timeSpentMs < 0) return;

  const userId = await getUserId();
  if (!userId) return;

  const { error } = await supabase.from('practice_question_attempts').insert({
    user_id: userId,
    section,
    question_id: questionId,
    statement_index: statementIndex,
    selected_answer: selectedAnswer == null ? null : String(selectedAnswer),
    is_correct: isCorrect == null ? null : !!isCorrect,
    time_spent_ms: Math.round(timeSpentMs),
    platform: Platform.OS,
    app_version: APP_VERSION,
  });

  if (error) {
    reportError('recordPracticeAttempt', error, { extra: { section, questionId } });
  }
}

/**
 * Seed (or refresh last_seen_at on) a lesson_progress row.
 * Started_at, completed_at, time_spent_seconds are NOT touched if the row exists.
 */
export async function recordLessonStart({ section, lessonId }) {
  if (!section || !lessonId) return;

  const userId = await getUserId();
  if (!userId) return;

  const seedRes = await supabase
    .from('lesson_progress')
    .upsert(
      {
        user_id: userId,
        section,
        lesson_id: lessonId,
        platform: Platform.OS,
        app_version: APP_VERSION,
      },
      { onConflict: 'user_id,lesson_id', ignoreDuplicates: true },
    );

  if (seedRes.error) {
    reportError('recordLessonStart.seed', seedRes.error, { extra: { section, lessonId } });
    return;
  }

  const bumpRes = await supabase
    .from('lesson_progress')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('lesson_id', lessonId);

  if (bumpRes.error) {
    reportError('recordLessonStart.bump', bumpRes.error, { extra: { section, lessonId } });
  }
}

/**
 * Atomically add `deltaSeconds` to lesson_progress.time_spent_seconds via the
 * `bump_lesson_time` RPC. No-op if delta <= 0.
 */
export async function recordLessonHeartbeat({ section, lessonId, deltaSeconds }) {
  if (!section || !lessonId) return;
  if (!deltaSeconds || deltaSeconds <= 0) return;

  const userId = await getUserId();
  if (!userId) return;

  const { error } = await supabase.rpc('bump_lesson_time', {
    p_lesson_id: lessonId,
    p_delta_seconds: Math.round(deltaSeconds),
    p_complete: false,
  });

  if (error) {
    reportError('recordLessonHeartbeat', error, { extra: { section, lessonId } });
  }
}

/**
 * Atomically mark a lesson complete + flush a final time delta.
 * `completed_at` is only set once; subsequent calls don't overwrite it.
 */
export async function recordLessonComplete({ section, lessonId, deltaSeconds = 0 }) {
  if (!section || !lessonId) return;

  const userId = await getUserId();
  if (!userId) return;

  const safeDelta = Math.max(0, Math.round(deltaSeconds || 0));

  const { error } = await supabase.rpc('bump_lesson_time', {
    p_lesson_id: lessonId,
    p_delta_seconds: safeDelta,
    p_complete: true,
  });

  if (error) {
    reportError('recordLessonComplete', error, { extra: { section, lessonId } });
  }
}
