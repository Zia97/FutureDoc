import { useEffect, useSyncExternalStore } from 'react';
import { marketingDemoStore as store } from './marketingDemoState';
import { useMarketingAccess } from '../context/MarketingAccessContext';
import { buildMarketingDemo } from './marketingDemoData';
import skills from './marketingDemoSkills';

let sample;
export function getMarketingDemo() {
  if (!sample) sample = buildMarketingDemo(skills);
  return sample;
}
export const setMarketingDemoEnabled = (enabled) => store.setEnabled(enabled);
export function useMarketingDemo() {
  const { canUseMarketingDemo } = useMarketingAccess();
  const enabled = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => { void store.hydrate(); }, []);
  return canUseMarketingDemo && enabled;
}
