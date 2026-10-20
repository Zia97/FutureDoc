import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { performanceCache } from './performanceService';

const PREFIX = 'coach_checkpoint_v1:';
const HUB_PREFIX = 'coach_hub_v1:';
const PREFERENCES = 'coach_preferences_v1:';
const writes = new Map();
const preferenceWrites = new Map();
const preferenceSync = new Map();
const hubCache = new Map();
const activeSessions = new Set(), backgroundSync = new Map(), resettingUsers = new Set();
const keyFor = (userId, id) => `${PREFIX}${userId}:${id}`;
const hubKeyFor = (userId) => `${HUB_PREFIX}${userId}`;
const canonical = (value) => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])])) : value;
const messages = {
  forbidden: 'Developer sample results are available to admin accounts only.',
  pro_required: 'Your free coaching preview is complete. Pro unlocks ongoing coaching.',
  assessment_required: 'Complete your starting assessment first.',
  version_conflict: 'This session was updated on another device. Reload the saved session to continue.',
  question_pool_exhausted: 'There are no eligible questions for this focus right now. Try another skill or review your mistakes.',
  assessment_content_unavailable: 'The assessment is being updated. Please try again later.',
  content_changed: 'These questions have been updated. Please try another focus.',
  daily_limit: 'You have reached today’s chat limit. Your practice and saved plan are still available.',
  message_in_progress: 'Your coach is still replying. Try again in a moment.',
  message_already_completed: 'That reply finished before it reached your chat. Send the message again to get a fresh reply.',
  session_not_found: 'This session could not be found for your account.',
};
export async function coachRequest(userId, action, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.id !== userId) { const error = new Error('Please sign in to use your coach.'); error.code = 'unauthorized'; throw error; }
  const { data, error } = await supabase.functions.invoke('ai-coach', {
    body: { ...payload, action }, headers: { Authorization: `Bearer ${session.access_token}` },
  });
  let code = data?.error;
  if (error?.context?.json) { try { code = (await error.context.json()).error ?? code; } catch { /* Transport failure. */ } }
  if (error || code) {
    const failure = new Error(messages[code] ?? 'Your coach could not connect. Your saved progress is safe; check your connection and retry.');
    failure.code = code; throw failure;
  }
  if (action === 'reset_progress' || (action === 'save' && data?.session?.status === 'completed')) performanceCache.invalidate(userId);
  return data;
}
export function saveCoachCheckpoint(userId, session, dirty = true) {
  const key = keyFor(userId, session.id);
  const value = JSON.stringify({ session, dirty });
  const pending = (writes.get(key) ?? Promise.resolve()).catch(() => {}).then(() => AsyncStorage.setItem(key, value));
  writes.set(key, pending);
  pending.finally(() => { if (writes.get(key) === pending) writes.delete(key); }).catch(() => {});
  return pending;
}
export async function readCoachSessionCache(userId, id) {
  const key = keyFor(userId, id);
  await writes.get(key);
  try {
    return JSON.parse(await AsyncStorage.getItem(key));
  } catch { return null; }
}
export async function loadCoachHubCache(userId) {
  if (hubCache.has(userId)) return hubCache.get(userId);
  try {
    const cached = JSON.parse(await AsyncStorage.getItem(hubKeyFor(userId)));
    if (cached) hubCache.set(userId, cached);
    return cached;
  } catch { return null; }
}
export async function saveCoachHubCache(userId, data) {
  hubCache.set(userId, data);
  await AsyncStorage.setItem(hubKeyFor(userId), JSON.stringify(data));
}
export async function clearCoachHubCache(userId) {
  hubCache.delete(userId);
  await AsyncStorage.removeItem(hubKeyFor(userId));
}
export async function loadCoachSession(userId, id, discardLocal = false) {
  const key = keyFor(userId, id);
  await backgroundSync.get(key)?.catch(() => {});
  await writes.get(key);
  const local = await readCoachSessionCache(userId, id);
  let remote;
  try { remote = (await coachRequest(userId, 'session', { id })).session; }
  catch (error) {
    if (error.code === 'session_not_found') await AsyncStorage.removeItem(key);
    if (!local || discardLocal || ['session_not_found', 'unauthorized'].includes(error.code)) throw error;
    return { ...local, offline: true };
  }
  if (remote.status === 'completed' || discardLocal || !local?.dirty) {
    await saveCoachCheckpoint(userId, remote, false); return { session: remote, dirty: false };
  }
  if (remote.version !== local.session.version && JSON.stringify(canonical(remote.progress)) === JSON.stringify(canonical(local.session.progress))) {
    await saveCoachCheckpoint(userId, remote, false); return { session: remote, dirty: false };
  }
  if (remote.version !== local.session.version) {
    // A lost completion acknowledgement is resolved above; other divergent
    // edits need an explicit reload, rather than silently losing either copy.
    const error = new Error(messages.version_conflict); error.code = 'version_conflict'; throw error;
  }
  return local;
}
export async function clearCoachData() {
  await Promise.allSettled([...backgroundSync.values()]);
  await Promise.allSettled([...writes.values()]);
  await Promise.allSettled([...preferenceWrites.values()]);
  await Promise.allSettled([...preferenceSync.values()]);
  hubCache.clear();
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX) || k.startsWith(PREFERENCES) || k.startsWith(HUB_PREFIX));
  if (keys.length) await AsyncStorage.multiRemove(keys);
}

export async function resetCoachProgress(userId) {
  if (resettingUsers.has(userId)) throw new Error('Coaching reset is already in progress.');
  resettingUsers.add(userId);
  let accountDeleted = false;
  try {
    // Erase the account first. A failed network request must not discard the
    // only copy of an unfinished assessment stored on this device.
    await coachRequest(userId, 'reset_progress', { confirm: 'DELETE_COACHING_DATA' });
    accountDeleted = true;
    hubCache.delete(userId);
    const prefix = `${PREFIX}${userId}:`;
    await Promise.allSettled([...backgroundSync].filter(([key]) => key.startsWith(prefix)).map(([, pending]) => pending));
    await Promise.allSettled([...writes].filter(([key]) => key.startsWith(prefix)).map(([, pending]) => pending));
    await Promise.allSettled([...preferenceWrites].filter(([key]) => key === `${PREFERENCES}${userId}`).map(([, pending]) => pending));
    await Promise.allSettled([...preferenceSync].filter(([key]) => key === `${PREFERENCES}${userId}`).map(([, pending]) => pending));
    const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(prefix) || key === `${PREFERENCES}${userId}` || key === hubKeyFor(userId));
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch (error) {
    if (accountDeleted) {
      const failure = new Error('Your coaching data was deleted from your account, but this device could not clear its saved copy. Reopen Coaching to retry.');
      failure.code = 'local_cleanup_failed';
      throw failure;
    }
    throw error;
  } finally {
    resettingUsers.delete(userId);
  }
}

export function registerCoachSession(userId, id) {
  const key = keyFor(userId, id); activeSessions.add(key);
  return () => activeSessions.delete(key);
}
export async function flushCoachCheckpoints(userId) {
  if (!userId || resettingUsers.has(userId)) return;
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(`${PREFIX}${userId}:`));
  for (const key of keys) {
    if (resettingUsers.has(userId)) return;
    if (activeSessions.has(key) || backgroundSync.has(key)) continue;
    await writes.get(key);
    const raw = await AsyncStorage.getItem(key);
    if (!raw || activeSessions.has(key)) continue;
    const checkpoint = JSON.parse(raw);
    if (!checkpoint.dirty || checkpoint.session.status === 'completed') continue;
    const work = (async () => {
      const s = checkpoint.session;
      const progress = s.progress.phase === 'running' ? { ...s.progress, phase: 'paused', interrupted: true } : s.progress;
      try {
        const { session } = await coachRequest(userId, 'save', { id: s.id, version: s.version, progress });
        if (await AsyncStorage.getItem(key) === raw) await saveCoachCheckpoint(userId, session, false);
      } catch (error) {
        if (error.code === 'session_not_found') {
          if (await AsyncStorage.getItem(key) === raw) await AsyncStorage.removeItem(key);
          return;
        }
        // Keep conflicting/offline progress for explicit recovery in the runner.
        if (error.code !== 'version_conflict') throw error;
      }
    })();
    backgroundSync.set(key, work);
    try { await work; } finally { backgroundSync.delete(key); }
  }
}

export async function queueCoachExamDate(examDate) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return;
  await queueCoachPreferences(session.user.id, { examDate });
}
export async function queueCoachPreferences(userId, preferences) {
  const key = `${PREFERENCES}${userId}`;
  const pending = (preferenceWrites.get(key) ?? Promise.resolve()).catch(() => {}).then(async () => {
    let previous = {};
    try { previous = JSON.parse(await AsyncStorage.getItem(key)) ?? {}; } catch { /* Replace damaged draft. */ }
    await AsyncStorage.setItem(key, JSON.stringify({ ...previous, ...preferences }));
  });
  preferenceWrites.set(key, pending);
  try { await pending; } finally { if (preferenceWrites.get(key) === pending) preferenceWrites.delete(key); }
  // The local preference is committed; network sync cannot delay the settings screen.
  void flushCoachPreferences(userId).catch(() => {});
}
export async function flushCoachPreferences(userId) {
  if (!userId) return;
  const key = `${PREFERENCES}${userId}`;
  if (preferenceSync.has(key)) return preferenceSync.get(key);
  const work = (async () => {
    while (true) {
      await preferenceWrites.get(key);
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return;
      await coachRequest(userId, 'settings', JSON.parse(raw));
      // Serialize deletion with new edits so an in-flight sync cannot erase them.
      const clear = (preferenceWrites.get(key) ?? Promise.resolve()).catch(() => {}).then(async () => {
        if (await AsyncStorage.getItem(key) === raw) await AsyncStorage.removeItem(key);
      });
      preferenceWrites.set(key, clear);
      try { await clear; } finally { if (preferenceWrites.get(key) === clear) preferenceWrites.delete(key); }
    }
  })();
  preferenceSync.set(key, work);
  try { await work; } finally { if (preferenceSync.get(key) === work) preferenceSync.delete(key); }
}

export function newCoachRequestId() {
  // UUID v4 idempotency key, not a security token. Works on native Hermes too.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16); return (c === 'x' ? r : (r & 3) | 8).toString(16);
  });
}
