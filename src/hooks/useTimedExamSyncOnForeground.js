import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
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

  useEffect(() => {
    if (!user) return;

    // Flush immediately on mount as well — covers cold-start
    // when the app was killed while items were still queued.
    flush(user).catch(() => {});

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && userRef.current) {
        flush(userRef.current).catch(() => {});
      }
    });

    return () => sub.remove();
  }, [user]);
}
