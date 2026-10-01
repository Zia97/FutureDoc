// RevenueCat → Supabase premium sync (server-authoritative source of truth).
//
// RevenueCat posts every subscription lifecycle event here. We map the
// event's App User ID → user_profiles.user_id and stamp is_premium plus
// the premium_* visibility columns using the service role (which bypasses
// the privileged-columns trigger).
//
// Why this exists: the client write in SubscriptionContext.js can't set
// is_premium — the protect-privileged-columns trigger reverts it because
// the app connects as `authenticated`. Only a service-role writer (this
// function / Studio) can change the flag, so RevenueCat must drive it.
//
// Setup:
//   1. supabase functions deploy revenuecat-webhook --no-verify-jwt
//      (RevenueCat does NOT send a Supabase JWT — we authenticate with a
//       shared secret header instead, so JWT verification must be off.)
//   2. supabase secrets set REVENUECAT_WEBHOOK_AUTH=<a long random string>
//   3. RevenueCat dashboard → Integrations → Webhooks:
//        URL    = https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook
//        Header = Authorization: <same value as REVENUECAT_WEBHOOK_AUTH>
//
// Env vars:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — provided by the platform
//   REVENUECAT_WEBHOOK_AUTH                  — shared secret, required

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Event types that should GRANT premium. Anything that leaves the user
// with an active entitlement.
const GRANT_TYPES = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'NON_RENEWING_PURCHASE',
  'SUBSCRIPTION_EXTENDED',
  'TEMPORARY_ENTITLEMENT_GRANT',
]);

// Event types that should REVOKE premium immediately.
//   - EXPIRATION: access period ended.
//   - REFUND: purchase reversed.
//   - TRANSFER: entitlement moved to another App User ID (this one loses it).
// NOTE: CANCELLATION is intentionally NOT here — it only means auto-renew
// was switched off; the user keeps access until EXPIRATION fires.
const REVOKE_TYPES = new Set(['EXPIRATION', 'REFUND', 'TRANSFER']);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// RevenueCat sends the App User ID we set via Purchases.logIn(user.id),
// but a purchase made before login can arrive under an anonymous RC id
// ($RCAnonymousID:...) with the real id in original_app_user_id / aliases.
// Pick the first candidate that looks like a Supabase UUID.
function pickUserId(event: any): string | null {
  const candidates: unknown[] = [
    event?.app_user_id,
    event?.original_app_user_id,
    ...(Array.isArray(event?.aliases) ? event.aliases : []),
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && UUID_RE.test(c)) return c;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // 1. Authenticate the caller against the shared secret.
  const expected = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');
  if (!expected) return json({ error: 'webhook_not_configured' }, 500);
  if (req.headers.get('Authorization') !== expected) {
    return json({ error: 'unauthorized' }, 401);
  }

  // 2. Parse body.
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const event = payload?.event;
  const type = event?.type as string | undefined;
  if (!type) return json({ error: 'missing_event_type' }, 400);

  // RevenueCat sends a TEST event when you hit "Send test" in the dashboard.
  if (type === 'TEST') return json({ ok: true, test: true }, 200);

  // 3. Decide the resulting premium state. Events that are neither grant
  // nor revoke (e.g. CANCELLATION, BILLING_ISSUE, SUBSCRIPTION_PAUSED) are
  // acknowledged without flipping the flag.
  let isPremium: boolean;
  if (GRANT_TYPES.has(type)) isPremium = true;
  else if (REVOKE_TYPES.has(type)) isPremium = false;
  else return json({ ok: true, ignored: type }, 200);

  // 4. Resolve the Supabase user.
  const userId = pickUserId(event);
  if (!userId) {
    // Not fatal — RevenueCat retries on non-2xx, but a missing/anonymous
    // id will never resolve, so ack to stop the retry loop and log it.
    console.warn('revenuecat-webhook: no UUID app_user_id', {
      type,
      app_user_id: event?.app_user_id,
    });
    return json({ ok: true, skipped: 'no_uuid_user_id' }, 200);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const eventAtMs = Number(event?.event_timestamp_ms);
  const expiresMs = Number(event?.expiration_at_ms);
  const update: Record<string, unknown> = {
    is_premium: isPremium,
    premium_product_id: event?.product_id ?? null,
    premium_store: event?.store ?? null,
    premium_event_at: Number.isFinite(eventAtMs)
      ? new Date(eventAtMs).toISOString()
      : null,
    premium_expires_at:
      isPremium && Number.isFinite(expiresMs)
        ? new Date(expiresMs).toISOString()
        : null,
    rc_app_user_id: event?.app_user_id ?? userId,
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .update(update)
    .eq('user_id', userId)
    .select('user_id');

  if (error) {
    // Return 500 so RevenueCat retries the delivery.
    console.error('revenuecat-webhook: update failed', error);
    return json({ error: 'db_update_failed', detail: error.message }, 500);
  }
  if (!data || data.length === 0) {
    // No matching profile (e.g. user deleted). Ack to stop retries.
    console.warn('revenuecat-webhook: no profile for user', userId);
    return json({ ok: true, skipped: 'no_profile' }, 200);
  }

  return json({ ok: true, user_id: userId, is_premium: isPremium, type }, 200);
});
