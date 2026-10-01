import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useSubscription } from '../../context/SubscriptionContext';

const FREE_LIMIT = 5;

/**
 * Returns the number of free AI tutor credits remaining.
 * Premium / admin users always get `null` (unlimited).
 */
export function useAICredits() {
  const { isPro } = useSubscription();
  const [creditsRemaining, setCreditsRemaining] = useState(isPro ? null : FREE_LIMIT);

  const refresh = useCallback(async () => {
    if (isPro) {
      setCreditsRemaining(null);
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check admin flag directly — SubscriptionContext may not have resolved yet
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();
      if (profile?.is_admin) {
        setCreditsRemaining(null);
        return;
      }

      const { data } = await supabase
        .from('user_ai_usage')
        .select('lifetime_count')
        .eq('user_id', user.id)
        .single();
      const used = data?.lifetime_count ?? 0;
      setCreditsRemaining(Math.max(0, FREE_LIMIT - used));
    } catch {
      // Keep current value on error
    }
  }, [isPro]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Call after a successful AI tutor message to decrement locally */
  const decrement = useCallback(() => {
    if (isPro) return;
    setCreditsRemaining((prev) => (prev != null ? Math.max(0, prev - 1) : prev));
  }, [isPro]);

  return { creditsRemaining, isPro, refresh, decrement };
}
