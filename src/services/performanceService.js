import { supabase } from '../lib/supabase';

export async function loadPerformanceReport({ mode, includeDetails }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Please sign in to see your performance.');
  const { data, error } = await supabase.functions.invoke('performance-analysis', {
    body: { mode, includeDetails: includeDetails === true },
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (error || data?.error || data?.schemaVersion !== 1) {
    throw new Error('Your analysis could not be loaded. Check your connection and try again.');
  }
  return data;
}
