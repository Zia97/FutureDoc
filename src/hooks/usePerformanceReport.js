import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { performanceCache } from '../services/performanceService';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useMarketingDemo, getMarketingDemo } from '../dev/useMarketingDemo';

export function usePerformanceReport(mode) {
  const marketingDemo = useMarketingDemo();
  const { user } = useAuth();
  const { isPro, loading: subscriptionLoading } = useSubscription();
  const userId = user?.id;
  const subscribe = useCallback((listener) => performanceCache.subscribe(userId, listener), [userId]);
  const getState = useCallback(() => performanceCache.getState(userId), [userId]);
  const state = useSyncExternalStore(subscribe, getState, getState);
  const [refreshing, setRefreshing] = useState(false);
  const refreshTask = useRef(null);
  const generation = useRef(0);
  const focused = useIsFocused();
  useEffect(() => {
    if (!marketingDemo && focused && state.needsRefresh && userId && !subscriptionLoading) void performanceCache.ensure(userId, isPro);
  }, [marketingDemo, focused, state.needsRefresh, userId, isPro, subscriptionLoading]);
  useFocusEffect(useCallback(() => {
    if (!marketingDemo && userId && !subscriptionLoading) void performanceCache.ensure(userId, isPro);
  }, [marketingDemo, userId, isPro, subscriptionLoading]));
  useEffect(() => {
    generation.current++;
    setRefreshing(false);
    refreshTask.current = null;
    if (!marketingDemo && userId && !subscriptionLoading) performanceCache.ensure(userId, isPro);
    return () => { generation.current++; };
  }, [marketingDemo, userId, isPro, subscriptionLoading]);

  const refresh = useCallback(() => {
    if (marketingDemo || !userId || subscriptionLoading) return Promise.resolve();
    if (refreshTask.current) return refreshTask.current;
    const current = generation.current;
    setRefreshing(true);
    // Acknowledge a cache hit with the normal pull animation, without changing
    // the report timestamp or claiming new data was downloaded.
    const task = Promise.all([
      performanceCache.refresh(userId, isPro),
      new Promise((resolve) => setTimeout(resolve, 350)),
    ]).finally(() => {
      if (current === generation.current) { setRefreshing(false); refreshTask.current = null; }
    });
    refreshTask.current = task;
    return task;
  }, [marketingDemo, userId, isPro, subscriptionLoading]);

  const report = state.snapshot?.reports[mode] ?? null;
  if (marketingDemo) return { report: getMarketingDemo().reports[mode], loading: false, error: null, refreshing: false,
    refresh, isPro: true, canAnalyse: true, completePractice: () => {} };
  return { report, loading: !report && (subscriptionLoading || state.loading), error: state.error,
    refreshing, refresh, isPro, canAnalyse: !subscriptionLoading && isPro && report?.access === 'pro',
    completePractice: (section, questionIds) => performanceCache.completePractice(userId, section, questionIds) };
}
