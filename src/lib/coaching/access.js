const ENTITLEMENT = 'UCAT Genius AI Pro';

// Use the account's live subscription state, never a cached coaching dashboard.
// Check the date on each tap too: an offline SDK cache may outlive its expiry.
export function hasCoachProAccess(subscription, now = Date.now()) {
  if (subscription?.loading || subscription?.isPro !== true) return false;
  if (subscription.adminOverride === true) return true;
  const entitlement = subscription.customerInfo?.entitlements?.active?.[ENTITLEMENT];
  if (!entitlement) return false;
  return entitlement.expirationDate == null || Date.parse(entitlement.expirationDate) > now;
}

export function assertCoachProAccess(subscription) {
  if (hasCoachProAccess(subscription)) return;
  const error = new Error('Pro unlocks ongoing coaching.');
  error.code = 'pro_required';
  throw error;
}

export function assertCoachSessionAccess(session, subscription) {
  // Only unstarted reservations need fresh access. Already-started sessions,
  // the free assessment/preview and saved reports remain available.
  if (session.previousSessionId && !session.localOrigin && session.status !== 'completed' && session.progress.phase === 'instructions') {
    assertCoachProAccess(subscription);
  }
}
