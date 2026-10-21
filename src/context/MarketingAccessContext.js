import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { hasMarketingAccess } from '../lib/marketingAccess';
import { marketingDemoStore } from '../dev/marketingDemoState';

const CACHE_KEY = 'marketing_access_cache';
const MarketingAccessContext = createContext({ canUseMarketingDemo: false, testerExpiresAt: null, refreshMarketingAccess: async () => {} });

export function MarketingAccessProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [access, setAccess] = useState(null);
  const [now, setNow] = useState(Date.now());
  const version = useRef(0);
  const currentUser = useRef(userId);
  currentUser.current = userId;
  const refreshMarketingAccess = useCallback(async () => {
    if (!userId) return;
    const request = ++version.current;
    try {
      const { data, error } = await supabase.from('user_profiles').select('marketing_tester_expires_at').eq('user_id', userId).maybeSingle();
      if (error || request !== version.current || currentUser.current !== userId) return;
      const next = { userId, expiresAt: data?.marketing_tester_expires_at ?? null };
      setAccess(next); setNow(Date.now());
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch { /* Keep this account's unexpired device permission when offline. */ }
  }, [userId]);

  useEffect(() => {
    let active = true;
    const started = version.current;
    if (!userId) { version.current++; setAccess(null); return; }
    void AsyncStorage.getItem(CACHE_KEY).then((raw) => {
      if (!active || version.current !== started) return;
      const cached = raw ? JSON.parse(raw) : null;
      if (cached?.userId === userId && hasMarketingAccess(cached.expiresAt)) setAccess(cached);
    }).catch(() => {}).finally(() => { if (active) void refreshMarketingAccess(); });
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') { setNow(Date.now()); void refreshMarketingAccess(); }
    });
    const timer = setInterval(() => {
      setNow(Date.now());
      if (AppState.currentState === 'active') void refreshMarketingAccess();
    }, 60000);
    return () => { active = false; version.current++; clearInterval(timer); subscription.remove(); };
  }, [userId, refreshMarketingAccess]);

  const testerExpiresAt = userId && access?.userId === userId ? access.expiresAt : null;
  const canUseMarketingDemo = __DEV__ || hasMarketingAccess(testerExpiresAt, now);
  useEffect(() => {
    if (!hasMarketingAccess(testerExpiresAt)) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.max(0, Math.min(2147483647, Date.parse(testerExpiresAt) - Date.now() + 1)));
    return () => clearTimeout(timer);
  }, [testerExpiresAt, now]);
  useEffect(() => {
    marketingDemoStore.setAccess({ scope: userId ?? null, available: canUseMarketingDemo });
    void marketingDemoStore.hydrate();
  }, [userId, canUseMarketingDemo]);

  return <MarketingAccessContext.Provider value={{ canUseMarketingDemo, testerExpiresAt, refreshMarketingAccess }}>{children}</MarketingAccessContext.Provider>;
}
export const useMarketingAccess = () => useContext(MarketingAccessContext);
