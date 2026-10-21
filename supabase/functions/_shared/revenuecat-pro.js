export const PRO_ENTITLEMENT = 'UCAT Genius AI Pro';

export async function revenueCatSubscriber(userId, secret, request = fetch) {
  const response = await request(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' }, signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('revenuecat_unavailable');
  const data = await response.json();
  const subscriber = data.subscriber ?? data.value?.subscriber;
  if (!subscriber || !subscriber.entitlements) throw new Error('invalid_revenuecat_response');
  return subscriber;
}

export function premiumProfile(subscriber, now = Date.now()) {
  const entitlement = subscriber.entitlements?.[PRO_ENTITLEMENT];
  const active = !!entitlement && (entitlement.expires_date == null || Date.parse(entitlement.expires_date) > now);
  return { is_premium: active, premium_expires_at: active ? entitlement.expires_date ?? null : null,
    premium_product_id: active ? entitlement.product_identifier ?? null : null };
}
