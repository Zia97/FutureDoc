import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DM_ATTEMPTS_KEY } from '../attempts/useDecisionMakingAttempts';

/**
 * Returns { [questionId]: 'completed' } for the current user.
 * No entry = not attempted. No 'in_progress' — DM questions are standalone.
 * Derived entirely from local cache; no DB call needed.
 */
export function useDecisionMakingProgress() {
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(DM_ATTEMPTS_KEY);
      if (raw) {
        const attempts = JSON.parse(raw);
        const map = {};
        for (const questionId of Object.keys(attempts)) {
          map[questionId] = 'completed';
        }
        setProgressMap(map);
      }
    } catch (err) {
      console.error('[useDecisionMakingProgress] load failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { progressMap, loading, reload: load };
}
