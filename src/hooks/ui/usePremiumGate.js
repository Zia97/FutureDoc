import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../../context/SubscriptionContext';

/**
 * Returns a gate function that checks if an item is accessible.
 * If not, navigates to Paywall and returns false.
 *
 * @param {(item: any) => boolean} getIsFree - returns true if the item is free content
 */
export function usePremiumGate(getIsFree) {
  const { isPro } = useSubscription();
  const navigation = useNavigation();

  const canAccess = useCallback(
    (item) => {
      if (isPro) return true;
      if (getIsFree && getIsFree(item)) return true;
      navigation.navigate('Paywall');
      return false;
    },
    [isPro, getIsFree, navigation],
  );

  return { canAccess, isPro };
}
