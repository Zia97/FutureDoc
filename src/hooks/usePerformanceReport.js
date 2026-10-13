import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { loadPerformanceReport } from '../services/performanceService';
import { reportError } from '../lib/reportError';

export function usePerformanceReport(mode) {
  const { user } = useAuth();
  const { isPro, loading: subscriptionLoading } = useSubscription();
  const [state, setState] = useState({ key: null, report: null, error: null, loading: true });
  const sequence = useRef(0);
  const key = `${user?.id ?? ''}:${mode}:${isPro}`;
  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    if (subscriptionLoading) return;
    setState((prev) => ({ key, report: prev.key === key ? prev.report : null, loading: true, error: null }));
    try {
      const report = await loadPerformanceReport({ mode, includeDetails: isPro });
      if (request === sequence.current) setState({ key, report, loading: false, error: null });
    } catch (error) {
      reportError('performance-analysis', error, { level: 'warning' });
      if (request === sequence.current) setState({ key, report: null, loading: false, error: error.message });
    }
  }, [key, mode, isPro, subscriptionLoading]);
  useFocusEffect(useCallback(() => {
    refresh();
    return () => { sequence.current++; };
  }, [refresh]));
  // A logout or entitlement change hides stale detailed data synchronously.
  const current = state.key === key ? state : { report: null, error: null, loading: true };
  return { ...current, refresh, isPro, canAnalyse: isPro && current.report?.access === 'pro' };
}
