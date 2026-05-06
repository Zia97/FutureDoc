import { useCallback } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { usePaywallNavigation } from './usePaywallNavigation';

/**
 * Returns a gate function that checks if an item is accessible.
 * If not, opens the paywall (or prompts anonymous users to sign up).
 *
 * @param {(item: any) => boolean} getIsFree - returns true if the item is free content
 */
export function usePremiumGate(getIsFree) {
  const { isPro } = useSubscription();
  const openPaywall = usePaywallNavigation();

  const canAccess = useCallback(
    (item) => {
      if (isPro) return true;
      if (getIsFree && getIsFree(item)) return true;
      openPaywall();
      return false;
    },
    [isPro, getIsFree, openPaywall],
  );

  return { canAccess, isPro };
}
