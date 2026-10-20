import React, { useEffect, useRef, useState } from 'react';
import { AppState, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { supabase } from '../lib/supabase';
import { createAnnouncementQueue, announcementSafeRoute } from '../services/announcementQueue';
import AnnouncementCard from './AnnouncementCard';

export default function AnnouncementHost({ routeName, blocked }) {
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const [current, setCurrent] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [active, setActive] = useState(AppState.currentState === 'active');
  const queue = useRef(null), allowed = useRef(false);
  allowed.current = active && isOnline && !blocked && announcementSafeRoute(routeName);
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => sub.remove();
  }, []);
  useEffect(() => {
    setCurrent(null);
    if (!user?.id) return;
    const userId = user.id;
    const instance = createAnnouncementQueue({
      userId, storage: AsyncStorage, canDisplay: () => allowed.current,
      onChange: setCurrent,
      rpc: async (action, id) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id !== userId) throw new Error('Account changed');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        try {
          const { data, error: rpcError } = await supabase.rpc('student_announcements', { p_action: action, p_id: id || null })
            .setHeader('Authorization', `Bearer ${session.access_token}`).abortSignal(controller.signal);
          if (rpcError) throw rpcError;
          return data;
        } finally { clearTimeout(timeout); }
      },
    });
    queue.current = instance;
    // Initial mount after authenticated/onboarded access; foreground and reconnect below.
    instance.poll().catch(() => {});
    const interval = setInterval(() => { if (allowed.current) instance.poll().catch(() => {}); }, 30000);
    return () => { clearInterval(interval); instance.stop(); queue.current = null; };
  }, [user?.id]);
  useEffect(() => {
    if (active && isOnline) queue.current?.poll().catch(() => {});
  }, [active, isOnline, routeName, blocked]);
  async function dismiss() {
    setBusy(true); setError('');
    try { await queue.current?.dismiss(); }
    catch { setError('Could not save. Tap Dismiss to retry.'); }
    finally { setBusy(false); }
  }
  // A visible message can be dismissed offline; only NEW displays require connectivity.
  const visible = !!current && active && !blocked && announcementSafeRoute(routeName);
  return <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={dismiss}>
    {current && <AnnouncementCard title={current.title} message={current.message} onDismiss={dismiss} busy={busy} error={error}/>}
  </Modal>;
}
