import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

function parseVersion(v) {
  if (typeof v !== 'string') return null;
  const parts = v.trim().split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n) || n < 0)) return null;
  return parts;
}

// Returns true when a < b.
export function isVersionLower(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return false;
  for (let i = 0; i < 3; i++) {
    if (pa[i] < pb[i]) return true;
    if (pa[i] > pb[i]) return false;
  }
  return false;
}

export function getCurrentAppVersion() {
  return Constants.expoConfig?.version ?? Constants.manifest?.version ?? null;
}

// Fetches the min supported version for this platform. Fails open: on any
// error (offline, Supabase down, malformed row) we return null so the app
// does not lock users out because of a network blip.
export async function fetchVersionRequirement() {
  try {
    const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : null;
    if (!platform) return null;

    const { data, error } = await supabase
      .from('app_version_requirements')
      .select('min_supported_version, store_url')
      .eq('platform', platform)
      .maybeSingle();

    if (error || !data) return null;
    return {
      minSupportedVersion: data.min_supported_version,
      storeUrl: data.store_url,
    };
  } catch {
    return null;
  }
}

export async function checkForceUpdate() {
  const current = getCurrentAppVersion();
  const req = await fetchVersionRequirement();
  if (!current || !req) return { updateRequired: false, storeUrl: null };
  const updateRequired = isVersionLower(current, req.minSupportedVersion);
  return { updateRequired, storeUrl: req.storeUrl };
}
