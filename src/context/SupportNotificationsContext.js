import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import { getSupportCounts } from '../lib/supportTickets';
import { createSupportNotificationMonitor } from '../services/supportNotificationMonitor';

const EMPTY_COUNTS = { unread: 0, admin_unread: 0, is_admin: false };
const SupportNotificationsContext = createContext({
  counts: EMPTY_COUNTS, profileUnread: 0, refreshCounts: async () => {},
});

export function SupportNotificationsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [snapshot, setSnapshot] = useState(null);
  const monitorRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    const monitor = createSupportNotificationMonitor({
      load: getSupportCounts,
      onChange: counts => setSnapshot(previous => previous?.userId === userId &&
        previous.counts.unread === counts.unread &&
        previous.counts.admin_unread === counts.admin_unread &&
        previous.counts.is_admin === counts.is_admin ? previous : { userId, counts }),
    });
    monitorRef.current = monitor;
    const refreshIfActive = () => {
      if (AppState.currentState !== 'background' && AppState.currentState !== 'inactive') monitor.refresh();
    };
    refreshIfActive();
    const timer = setInterval(refreshIfActive, 12000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') monitor.refresh(); });
    return () => {
      monitor.stop();
      monitorRef.current = null;
      clearInterval(timer);
      subscription.remove();
    };
  }, [userId]);

  const refreshCounts = useCallback(() => monitorRef.current?.refresh() ?? Promise.resolve(), []);
  // Never render a previous account's unread state, even before effect cleanup.
  const counts = userId && snapshot?.userId === userId ? snapshot.counts : EMPTY_COUNTS;
  const value = useMemo(() => ({
    counts, refreshCounts,
    profileUnread: counts.unread + (counts.is_admin ? counts.admin_unread : 0),
  }), [counts, refreshCounts]);

  return <SupportNotificationsContext.Provider value={value}>{children}</SupportNotificationsContext.Provider>;
}

export const useSupportNotifications = () => useContext(SupportNotificationsContext);
