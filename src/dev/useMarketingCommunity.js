import { useSyncExternalStore } from 'react';
import { useMarketingDemo } from './useMarketingDemo';
import { createMarketingCommunity } from './marketingCommunityData';
import { useAuth } from '../context/AuthContext';

let community;
let communityOwner;
const noopSubscribe = () => () => {};
const emptySnapshot = () => null;
export function useMarketingCommunity() {
  const { user } = useAuth();
  const marketingDemo = useMarketingDemo();
  const owner = user?.id ?? 'device';
  if (marketingDemo && (!community || communityOwner !== owner)) {
    community = createMarketingCommunity(); communityOwner = owner;
  }
  const snapshot = useSyncExternalStore(marketingDemo ? community.subscribe : noopSubscribe,
    marketingDemo ? community.getSnapshot : emptySnapshot, marketingDemo ? community.getSnapshot : emptySnapshot);
  return { marketingDemo, community: marketingDemo ? community : null, snapshot };
}
