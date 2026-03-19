import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VR_PROGRESS_CACHE_KEY } from '../attempts/useVerbalReasoningAttempts';

/**
 * Returns a map of { [passageId]: 'in_progress' | 'completed' } for the current user.
 * No entry = not attempted.
 *
 * Local AsyncStorage is the golden source of truth.
 * DB is only consulted when no local cache exists (e.g. fresh install).
 */
export function useVerbalReasoningProgress() {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // 1. Check local cache first — golden source of truth
    try {
      const raw = await AsyncStorage.getItem(VR_PROGRESS_CACHE_KEY);
      if (raw) {
        setProgressMap(JSON.parse(raw));
        setLoading(false);
        return;
      }
    } catch {
      // ignore cache errors, fall through to DB
    }

    // 2. No local cache — fall back to DB (e.g. fresh install)
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('verbal_reasoning_passage_progress')
        .select('passage_id, status')
        .eq('user_id', user.id);

      if (error) throw error;

      const map = {};
      for (const row of data) {
        map[row.passage_id] = row.status;
      }
      setProgressMap(map);
      await AsyncStorage.setItem(VR_PROGRESS_CACHE_KEY, JSON.stringify(map));
    } catch (err) {
      console.error('[useVerbalReasoningProgress] DB fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { progressMap, loading, reload: load };
}
