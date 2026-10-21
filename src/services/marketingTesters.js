import { supabase } from '../lib/supabase';

export async function manageMarketingTester(action, email, options = {}) {
  const { data, error } = await supabase.functions.invoke('marketing-testers', { body: { action, email, ...options } });
  if (error || data?.error) {
    let failure = data;
    if (!failure?.message && error?.context?.json) {
      try { failure = await error.context.json(); } catch {}
    }
    throw new Error(failure?.message || (failure?.error === 'forbidden' ? 'Only administrators can manage marketing testers.' : 'Tester access could not be updated. Please try again.'));
  }
  return data;
}
