// Shared server/client tests. RevenueCat is authoritative; the profile mirror
// is only a fallback when the RevenueCat server secret is not configured.
export function profileHasPro(profile, now = Date.now()) {
  if (profile?.is_admin === true) return true;
  if (profile?.is_premium !== true) return false;
  return !profile.premium_expires_at || Date.parse(profile.premium_expires_at) > now;
}

export function revenueCatHasPro(subscriber, now = Date.now()) {
  const entitlement = subscriber?.entitlements?.['UCAT Genius AI Pro'];
  if (!entitlement) return false;
  return !entitlement.expires_date || Date.parse(entitlement.expires_date) > now;
}
