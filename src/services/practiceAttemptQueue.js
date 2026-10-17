import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { newCoachRequestId } from './coachingService';

const PREFIX = 'practice_upload_v1:';
const inFlight = new Map();
export async function queuePracticeAttempt(payload) {
  const id = newCoachRequestId();
  await AsyncStorage.setItem(`${PREFIX}${payload.user_id}:${id}`, JSON.stringify({ ...payload, id, answered_at: new Date().toISOString() }));
  return flushPracticeAttempts(payload.user_id);
}
export function flushPracticeAttempts(userId) {
  if (!userId) return Promise.resolve();
  if (inFlight.has(userId)) return inFlight.get(userId);
  const work = (async () => {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(`${PREFIX}${userId}:`));
    for (const key of keys) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== userId) return;
      const raw = await AsyncStorage.getItem(key); if (!raw) continue;
      const row = JSON.parse(raw); if (row.user_id !== userId) continue;
      const { error } = await supabase.from('practice_question_attempts').insert(row);
      // An acknowledgement can be lost after Postgres commits the insert.
      if (error && error.code !== '23505') throw error;
      await AsyncStorage.removeItem(key);
    }
  })();
  inFlight.set(userId, work);
  work.finally(() => { if (inFlight.get(userId) === work) inFlight.delete(userId); }).catch(() => {});
  return work;
}
export async function clearPracticeQueue() {
  await Promise.allSettled([...inFlight.values()]);
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
  if (keys.length) await AsyncStorage.multiRemove(keys);
}
