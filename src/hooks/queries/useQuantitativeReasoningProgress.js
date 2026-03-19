import { useState, useEffect, useCallback } from 'react';
import { db } from '../../lib/dbQueries';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QR_PROGRESS_CACHE_KEY } from '../attempts/useQuantitativeReasoningAttempts';

/**
 * Returns { [setId]: 'in_progress' | 'completed' } for the current user.
 * No entry = not attempted.
 * Local cache is golden source of truth; DB is fallback on fresh install.
 */
export function useQuantitativeReasoningProgress() {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(QR_PROGRESS_CACHE_KEY);
      if (raw) {
        setProgressMap(JSON.parse(raw));
        setLoading(false);
        return;
      }
    } catch {
      // fall through to DB
    }

    if (!user) { setLoading(false); return; }

    try {
      const { data, error } = await supabase
        .from('quantitative_reasoning_set_progress')
        .select('set_id, status')
        .eq('user_id', user.id);

      if (error) throw error;

      const map = {};
      for (const row of data) map[row.set_id] = row.status;
      setProgressMap(map);
      await AsyncStorage.setItem(QR_PROGRESS_CACHE_KEY, JSON.stringify(map));
    } catch (err) {
      console.error('[useQuantitativeReasoningProgress] DB fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { progressMap, loading, reload: load };
}
