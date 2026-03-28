import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VR_PROGRESS_CACHE_KEY } from '../attempts/useVerbalReasoningAttempts';

/**
 * Returns a map of { [passageId]: 'in_progress' | 'completed' } for the current user.
 * No entry = not attempted.
 *
 * Local AsyncStorage is the single source of truth.
 */
export function useVerbalReasoningProgress() {
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(VR_PROGRESS_CACHE_KEY);
      if (raw) {
        setProgressMap(JSON.parse(raw));
      }
    } catch {
      // ignore cache errors
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { progressMap, loading, reload: load };
}
