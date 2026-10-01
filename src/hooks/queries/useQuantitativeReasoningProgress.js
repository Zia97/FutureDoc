import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QR_PROGRESS_CACHE_KEY } from '../attempts/useQuantitativeReasoningAttempts';

/**
 * Returns { [setId]: 'in_progress' | 'completed' } for the current user.
 * No entry = not attempted.
 * Local cache is the single source of truth.
 */
export function useQuantitativeReasoningProgress() {
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(QR_PROGRESS_CACHE_KEY);
      setProgressMap(raw ? JSON.parse(raw) : {});
    } catch {
      // ignore cache errors
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { progressMap, loading, reload: load };
}
