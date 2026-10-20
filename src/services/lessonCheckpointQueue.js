import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { newCoachRequestId } from './coachingService';

const PREFIX = 'lesson_checkpoint_v1:';
let mutations = Promise.resolve();
const flights = new Map();
const serial = (fn) => {
  const work = mutations.then(fn);
  mutations = work.catch(() => {});
  return work;
};

export async function queueLessonCheckpoint(userId, { lessonId, section, deltaSeconds = 0, complete = false, platform, appVersion }) {
  await serial(async () => {
    const key = `${PREFIX}${userId}:${lessonId}`;
    const previous = JSON.parse(await AsyncStorage.getItem(key) || 'null');
    const entry = previous ?? { deviceId: newCoachRequestId(), seconds: 0, complete: false, revision: 0 };
    await AsyncStorage.setItem(key, JSON.stringify({ ...entry, userId, lessonId, section, platform, appVersion,
      seconds: entry.seconds + Math.max(0, Math.round(deltaSeconds)),
      complete: entry.complete || complete, revision: entry.revision + 1, dirty: true }));
  });
}

export function flushLessonCheckpoints(userId) {
  if (!userId) return Promise.resolve();
  if (flights.has(userId)) return flights.get(userId);
  const work = (async () => {
    for (;;) {
      let uploaded = false;
      const entries = await serial(async () => {
        const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(`${PREFIX}${userId}:`));
        return keys.length ? AsyncStorage.multiGet(keys) : [];
      });
      for (const [key, raw] of entries) {
        const entry = JSON.parse(raw || 'null');
        if (!entry?.dirty) continue;
        uploaded = true;
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id !== userId) return;
        const { error } = await supabase.rpc('save_lesson_checkpoint', {
          p_device_id: entry.deviceId, p_lesson_id: entry.lessonId, p_section: entry.section,
          p_seconds: entry.seconds, p_complete: entry.complete, p_platform: entry.platform, p_app_version: entry.appVersion,
        }).setHeader('Authorization', `Bearer ${session.access_token}`);
        if (error) throw error;
        await serial(async () => {
          const current = JSON.parse(await AsyncStorage.getItem(key) || 'null');
          if (current?.revision === entry.revision) await AsyncStorage.setItem(key, JSON.stringify({ ...current, dirty: false }));
        });
      }
      if (!uploaded) return;
    }
  })();
  flights.set(userId, work);
  work.finally(() => { if (flights.get(userId) === work) flights.delete(userId); }).catch(() => {});
  return work;
}

export async function clearLessonCheckpoints() {
  await Promise.allSettled([...flights.values()]);
  await serial(async () => {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    if (keys.length) await AsyncStorage.multiRemove(keys);
  });
}
