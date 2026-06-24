// claim-trial — grants a 3-day free trial via RevenueCat's promotional
// entitlement API, then stamps trial_claimed_at on the user's profile.
//
// Called by the authenticated app user (JWT required).
// Enforces one trial per lifetime: if trial_claimed_at is already set,
// returns 409.
//
// Setup:
//   supabase functions deploy claim-trial
//   supabase secrets set REVENUECAT_SECRET_KEY=<sk_...>
//   (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are provided by the platform)
//
// RevenueCat secret key: dashboard → API Keys → Secret keys (sk_...)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ENTITLEMENT_ID = 'UCAT Genius AI Pro';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // 1. Authenticate the caller — extract user_id from their JWT.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'unauthorized' }, 401);

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) return json({ error: 'unauthorized' }, 401);

  const userId = user.id;

  // 2. Service-role client for privileged writes.
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // 3. Enforce one trial per user.
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('trial_claimed_at, is_premium')
    .eq('user_id', userId)
    .single();

  if (profileError) {
    console.error('claim-trial: profile fetch failed', profileError);
    return json({ error: 'profile_fetch_failed' }, 500);
  }
  if (profile.trial_claimed_at !== null) {
    return json({ error: 'trial_already_claimed' }, 409);
  }
  if (profile.is_premium) {
    return json({ error: 'already_premium' }, 409);
  }

  // 4. Call RevenueCat REST API to grant the promotional entitlement.
  const rcSecretKey = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (!rcSecretKey) {
    console.error('claim-trial: REVENUECAT_SECRET_KEY not set');
    return json({ error: 'not_configured' }, 500);
  }

  const rcUrl = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}/entitlements/${encodeURIComponent(ENTITLEMENT_ID)}/promotional`;

  let rcRes: Response;
  try {
    rcRes = await fetch(rcUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rcSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ duration: 'daily' }),
    });
  } catch (err) {
    console.error('claim-trial: RC API network error', err);
    return json({ error: 'rc_api_unreachable' }, 502);
  }

  if (!rcRes.ok) {
    const body = await rcRes.text().catch(() => '');
    console.error('claim-trial: RC API error', rcRes.status, body);
    return json({ error: 'rc_api_failed', status: rcRes.status }, 502);
  }

  // 5. Stamp trial_claimed_at so this user can't claim again.
  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({ trial_claimed_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (updateError) {
    // RC grant succeeded — trial is live. Log the failure but don't error-out
    // so the app can refresh and show the active entitlement.
    console.error('claim-trial: failed to stamp trial_claimed_at', updateError);
  }

  return json({ ok: true });
});
