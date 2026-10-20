import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import { reportError } from './reportError';
import { queuePracticeAttempt } from '../services/practiceAttemptQueue';
import { queueLessonCheckpoint, flushLessonCheckpoints } from '../services/lessonCheckpointQueue';

const APP_VERSION = Constants.expoConfig?.version ?? null;

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

  let userId;
  try { const { data: { session } } = await supabase.auth.getSession(); userId = session?.user?.id; }
  catch { return; }
  if (!userId) return;

  try { await queuePracticeAttempt({
    user_id: userId,
    section,
    question_id: questionId,
    statement_index: statementIndex,
    selected_answer: selectedAnswer == null ? null : String(selectedAnswer),
    is_correct: isCorrect == null ? null : !!isCorrect,
    time_spent_ms: Math.round(timeSpentMs),
    platform: Platform.OS,
    app_version: APP_VERSION,
  }); } catch (error) {
    reportError('recordPracticeAttempt', error, { extra: { section, questionId } });
  }
}

// The local checkpoint is durable before its network upload starts.
async function saveLesson({ userId, section, lessonId, deltaSeconds = 0, complete = false, upload = true }) {
  if (!section || !lessonId) return;
  if (!userId) return;
  await queueLessonCheckpoint(userId, { section, lessonId, deltaSeconds, complete,
    platform: Platform.OS, appVersion: APP_VERSION });
  if (upload) void flushLessonCheckpoints(userId).catch((error) => reportError('lessonCheckpoint', error));
}
export const recordLessonStart = (args) => saveLesson(args);
export const recordLessonHeartbeat = (args) => saveLesson(args);
export const recordLessonComplete = (args) => saveLesson({ ...args, complete: true });
