import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../lib/dbQueries';
import { supabase } from '../lib/supabase';
import { reportError, reportMessage } from '../lib/reportError';
import { createTimedExamQueue } from './timedExamQueueCore';

const QUEUE_KEY = 'timed_exam_sync_queue';
const SUBMIT_FN = { vr: 'submitTimedVRExam', dm: 'submitTimedDMExam', qr: 'submitTimedQRExam', sj: 'submitTimedSJExam' };
const DELETE_FN = { vr: 'deleteTimedVRAttempt', dm: 'deleteTimedDMAttempt', qr: 'deleteTimedQRAttempt', sj: 'deleteTimedSJAttempt' };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const queue = createTimedExamQueue({
  async read() {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const entries = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(entries)) throw new Error('Invalid saved exam queue');
    return entries;
  },
  write: (entries) => AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(entries)),
  isValid(entry) {
    if (!SUBMIT_FN[entry.section] || !['submit', 'delete'].includes(entry.op)) return false;
    if (entry.op !== 'submit' || entry.section !== 'qr') return true;
    return (entry.payload?.answers ?? []).every((a) =>
      (a.set_id == null || UUID_RE.test(String(a.set_id))) &&
      (a.question_id == null || UUID_RE.test(String(a.question_id))));
  },
  async execute(entry) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session || session.user.id !== entry.userId) throw new Error('Exam upload account changed');
    // Bind the request to this account even if sign-out/sign-in occurs during upload.
    return entry.op === 'submit'
      ? db[SUBMIT_FN[entry.section]]({ ...entry.payload, accessToken: session.access_token })
      : db[DELETE_FN[entry.section]](entry.testId, session.access_token);
  },
  onError: (error) => reportError('timedExamSyncQueue', error, { extra: { note: 'Upload retained for retry' } }),
  onDrop: (entry) => reportMessage('timedExamSyncQueue', 'Invalid legacy operation', { level: 'warning', extra: { section: entry.section, op: entry.op } }),
});

export const enqueue = queue.enqueue;
export const removePending = queue.removePending;
export const getPendingKeys = queue.pendingKeys;
export const flush = queue.flush;

// Only start after the attempt and upload entry are durably saved.
export function syncInBackground(user) {
  void flush(user).catch((error) => reportError('timedExamSyncQueue', error));
}
