import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../context/AuthContext';
import { flush } from '../services/timedExamSyncQueue';

// ============================================================
// Drains the timed-exam offline write queue whenever the app
// becomes active, so submissions made while offline get pushed
// the moment connectivity returns (or the moment the user opens
// the app on a new network).
//
// Mounted once inside AppStack so it only runs while the user is
// signed in. The individual useTimed*ExamProgress hooks already
// flush on their own mount + on user change; this covers the
// "app went to background mid-session, came back later" gap.
// ============================================================

export function useTimedExamSyncOnForeground() {
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;
  // Tracks the last reachability we saw so we only flush on the
  // false → true edge (NetInfo emits multiple events while online).
  const wasOnlineRef = useRef(true);

  useEffect(() => {
    if (!user) return;

    // Flush immediately on mount as well — covers cold-start
    // when the app was killed while items were still queued.
    flush(user).catch(() => {});

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && userRef.current) {
        flush(userRef.current).catch(() => {});
      }
    });

    // Reconnect listener — covers the user-keeps-app-open-on-flaky-wifi
    // case that AppState alone misses.
    const netSub = NetInfo.addEventListener((s) => {
      const isOnline = s.isInternetReachable !== false && s.isConnected !== false;
      if (isOnline && !wasOnlineRef.current && userRef.current) {
        flush(userRef.current).catch(() => {});
      }
      wasOnlineRef.current = isOnline;
    });

    return () => {
      appStateSub.remove();
      netSub();
    };
  }, [user]);
}
