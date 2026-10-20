import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { newCoachRequestId } from './coachingService';
import { performanceCache } from './performanceService';

const PREFIX = 'practice_upload_v1:';
const inFlight = new Map();
export async function queuePracticeAttempt(payload) {
  const id = newCoachRequestId();
  await AsyncStorage.setItem(`${PREFIX}${payload.user_id}:${id}`, JSON.stringify({ ...payload, id, answered_at: new Date().toISOString() }));
  await flushPracticeAttempts(payload.user_id);
  // Close the small race between a drain's final empty scan and its completion.
  if (await AsyncStorage.getItem(`${PREFIX}${payload.user_id}:${id}`)) return flushPracticeAttempts(payload.user_id);
}
export function flushPracticeAttempts(userId) {
  if (!userId) return Promise.resolve();
  if (inFlight.has(userId)) return inFlight.get(userId);
  const work = (async () => {
    for (;;) {
      const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(`${PREFIX}${userId}:`)).slice(0, 50);
      if (!keys.length) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== userId) return;
      const rows = (await AsyncStorage.multiGet(keys)).filter(([, raw]) => raw).map(([, raw]) => JSON.parse(raw));
      if (rows.some((row) => row.user_id !== userId)) throw new Error('Practice upload account mismatch');
      const { error } = await supabase.rpc('upload_practice_attempts', { p_attempts: rows })
        .setHeader('Authorization', `Bearer ${session.access_token}`);
      if (error) throw error;
      performanceCache.invalidate(userId);
      await AsyncStorage.multiRemove(keys);
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
