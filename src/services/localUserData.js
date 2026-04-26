import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAllContentCaches } from './contentCache';

const USER_DATA_KEYS = [
  // Practice attempts
  'vr_attempts',
  'dm_attempts',
  'qr_attempts',
  'sj_attempts',
  // Progress caches
  'vr_passage_progress',
  'qr_set_progress',
  'sj_scenario_progress',
  // Timed exam completions
  'timed_vr_completed_attempts',
  'timed_dm_completed_attempts',
  'timed_qr_completed_attempts',
  'timed_sj_completed_attempts',
  // Pending sync queue
  'timed_exam_sync_queue',
  // Profile cache (cleared on account deletion so a different user
  // signing in on the same device doesn't see the old name flash).
  'display_name_cache',
];

export const DISPLAY_NAME_CACHE_KEY = 'display_name_cache';

// Wipes all user-scoped local data. Called on account deletion so a
// subsequent sign-in on the same device doesn't inherit the deleted
// user's attempts/progress. UI prefs like theme are intentionally kept.
export async function clearLocalUserData() {
  await Promise.all([
    AsyncStorage.multiRemove(USER_DATA_KEYS),
    clearAllContentCaches(),
  ]);
}
