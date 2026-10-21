import { useCallback } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Poll only the visible screen, stop in the background, refresh on foreground.
// RPC reads work without enabling public table access or Realtime replication.
export function useSupportRefresh(refresh) {
  useFocusEffect(useCallback(() => {
    let active = true;
    let running = false;
    const run = async () => {
      if (!active || running || AppState.currentState === 'background' || AppState.currentState === 'inactive') return;
      running = true;
      try { await refresh(() => active); } finally { running = false; }
    };
    run();
    const timer = setInterval(run, 12000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') run(); });
    return () => { active = false; clearInterval(timer); subscription.remove(); };
  }, [refresh]));
}
