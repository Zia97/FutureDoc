import { PRO_ENTITLEMENT, premiumProfile, revenueCatSubscriber } from '../_shared/revenuecat-pro.js';

const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
const publicProfile = (profile) => ({ userId: profile.user_id, email: profile.email, displayName: profile.display_name,
  testerExpiresAt: profile.marketing_tester_expires_at, isPro: profile.is_premium,
  proExpiresAt: profile.premium_expires_at });

export function createHandler({ client, revenueCatSecret, request = fetch, now = Date.now }) {
  return async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    const token = /^Bearer\s+(.+)$/i.exec(req.headers.get('Authorization') ?? '')?.[1];
    if (!token) return json({ error: 'not_authenticated' }, 401);
    try {
      const { data: auth, error: authError } = await client.auth.getUser(token);
      if (authError || !auth?.user) return json({ error: 'not_authenticated' }, 401);
      const { data: actor, error: actorError } = await client.from('user_profiles').select('is_admin').eq('user_id', auth.user.id).maybeSingle();
      if (actorError) return json({ error: 'access_check_failed' }, 503);
      if (actor?.is_admin !== true) return json({ error: 'forbidden' }, 403);
      let body;
      try { body = await req.json(); } catch { return json({ error: 'invalid_request' }, 400); }
      if (!body || !['lookup', 'grant', 'revoke'].includes(body.action)) return json({ error: 'invalid_action' }, 400);
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'invalid_email' }, 400);
      const { data: target, error: targetError } = await client.from('user_profiles')
        .select('user_id,email,display_name,is_admin,is_premium,premium_expires_at,marketing_tester_expires_at').eq('email', email).maybeSingle();
      if (targetError) return json({ error: 'lookup_failed' }, 503);
      if (!target) return json({ error: 'account_not_found', message: 'Ask this person to create an account first.' }, 404);
      if (body.action === 'lookup') return json({ user: publicProfile(target), isAdmin: target.is_admin === true });
      if (target.is_admin !== false) return json({ error: 'target_is_admin', message: 'Choose a normal student account for marketing testing.' }, 400);
      if (!revenueCatSecret) return json({ error: 'not_configured', message: 'The RevenueCat server key is not configured.' }, 503);

      const setAccess = async (until) => {
        const { error } = await client.rpc('set_marketing_tester_access', { p_actor: auth.user.id, p_user: target.user_id, p_until: until });
        return !error;
      };
      const endpoint = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(target.user_id)}/entitlements/${encodeURIComponent(PRO_ENTITLEMENT)}`;
      let expiresAt = null;
      if (body.action === 'grant') {
        const days = body.days ?? 90;
        if (!Number.isInteger(days) || days < 1 || days > 365) return json({ error: 'invalid_duration' }, 400);
        const until = now() + days * 86400000;
        const response = await request(`${endpoint}/promotional`, { method: 'POST',
          headers: { Authorization: `Bearer ${revenueCatSecret}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ end_time_ms: until }), signal: AbortSignal.timeout(15000) });
        if (!response.ok) return json({ error: 'grant_failed', message: 'Complimentary Pro could not be granted. No tester permission was added.' }, 502);
        // Verify the resulting entitlement rather than trusting a purchase event.
        const subscriber = await revenueCatSubscriber(target.user_id, revenueCatSecret, request);
        const premium = premiumProfile(subscriber, now());
        if (!premium.is_premium) return json({ error: 'grant_not_active', message: 'RevenueCat has not activated Pro yet. Retry the grant.' }, 502);
        expiresAt = new Date(Math.min(until, premium.premium_expires_at ? Date.parse(premium.premium_expires_at) : until)).toISOString();
        if (!await setAccess(expiresAt)) return json({ error: 'access_update_failed', message: 'Pro was granted, but tester permission could not be saved. Retry the grant.' }, 503);
        const { error } = await client.from('user_profiles').update({ ...premium, rc_app_user_id: target.user_id }).eq('user_id', target.user_id);
        if (error) return json({ error: 'premium_sync_failed', message: 'Tester access was granted. The Pro profile sync needs a retry.' }, 503);
        return json({ user: publicProfile({ ...target, ...premium, marketing_tester_expires_at: expiresAt }) });
      }

      // A revoke is safe to retry after a partial failure: disable the demo first.
      // Only promotional Pro grants are revoked; paid store subscriptions stay intact.
      if (!target.marketing_tester_expires_at && body.confirmRevoke !== true) return json({ error: 'no_tester_grant' }, 409);
      if (body.confirmRevoke !== true) return json({ error: 'confirmation_required' }, 400);
      if (!await setAccess(null)) return json({ error: 'access_update_failed' }, 503);
      const response = await request(`${endpoint}/revoke_promotionals`, { method: 'POST',
        headers: { Authorization: `Bearer ${revenueCatSecret}`, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000) });
      if (!response.ok) return json({ error: 'revoke_failed', message: 'Marketing permission was removed, but complimentary Pro could not be revoked. Retry the revoke.' }, 502);
      const subscriber = await revenueCatSubscriber(target.user_id, revenueCatSecret, request);
      const premium = premiumProfile(subscriber, now());
      const { error } = await client.from('user_profiles').update({ ...premium, rc_app_user_id: target.user_id }).eq('user_id', target.user_id);
      if (error) return json({ error: 'premium_sync_failed', message: 'Tester access was revoked. The Pro profile sync needs a retry.' }, 503);
      return json({ user: publicProfile({ ...target, ...premium, marketing_tester_expires_at: null }) });
    } catch {
      return json({ error: 'tester_access_unavailable', message: 'The request could not be completed. Check the account status before retrying.' }, 503);
    }
  };
}
