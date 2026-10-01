import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';

const CACHE_KEY = '@futuredoc/ai_tutor_availability';
const CACHE_TTL_MS = 90_000;

const KEYS = ['ai_tutor_enabled', 'ai_tutor_demo_enabled'];

const DEFAULTS = {
  ai_tutor_enabled: true,
  ai_tutor_demo_enabled: true,
};

async function readCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.fetchedAt || Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeCache(values) {
  try {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ values, fetchedAt: Date.now() }),
    );
  } catch {
    // ignore — cache is best-effort
  }
}

async function fetchSwitches() {
  const { data, error } = await supabase
    .from('app_kill_switches')
    .select('key, enabled')
    .in('key', KEYS);
  if (error || !data) {
    // Fail-open: if the lookup fails, behave as if everything is enabled.
    // The edge function is the source of truth and will reject if needed.
    return { ...DEFAULTS };
  }
  const map = { ...DEFAULTS };
  for (const row of data) {
    map[row.key] = !!row.enabled;
  }
  return map;
}

/**
 * Returns the live state of the AI tutor kill switches.
 * Cached in AsyncStorage for 90s; refreshes when the app foregrounds.
 *
 * @returns {{ tutorEnabled: boolean, demoEnabled: boolean, loading: boolean, refresh: () => Promise<void> }}
 */
export function useAITutorAvailability() {
  const [values, setValues] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  async function refresh() {
    const fresh = await fetchSwitches();
    if (!mountedRef.current) return;
    setValues(fresh);
    setLoading(false);
    writeCache(fresh);
  }

  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      const cached = await readCache();
      if (cached?.values && mountedRef.current) {
        setValues({ ...DEFAULTS, ...cached.values });
        setLoading(false);
      }
      await refresh();
    })();

    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') refresh();
    });

    return () => {
      mountedRef.current = false;
      sub.remove();
    };
  }, []);

  return {
    tutorEnabled: values.ai_tutor_enabled,
    demoEnabled: values.ai_tutor_demo_enabled && values.ai_tutor_enabled,
    loading,
    refresh,
  };
}
