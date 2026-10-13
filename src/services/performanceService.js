import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPerformanceCache, isPerformanceSnapshot } from '../lib/performance/cache';

async function loadPerformanceSnapshot({ userId, includeDetails }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || session.user.id !== userId) throw new Error('Please sign in to see your performance.');
  const { data, error } = await supabase.functions.invoke('performance-analysis', {
    body: { mode: 'all', includeDetails: includeDetails === true },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error || data?.error || !isPerformanceSnapshot(data)) {
    throw new Error('Your analysis could not be loaded. Check your connection and try again.');
  }
  return data;
}

export const performanceCache = createPerformanceCache({ storage: AsyncStorage, fetchSnapshot: loadPerformanceSnapshot });
export const clearPerformanceCache = () => performanceCache.clearAll();
