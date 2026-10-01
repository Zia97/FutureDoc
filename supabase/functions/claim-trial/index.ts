// claim-trial — grants a free trial via RevenueCat's promotional
// entitlement API, then records the claim so it can't be repeated.
//
// Called by the authenticated app user (JWT required).
//
// Abuse guard (one trial per person, not per account):
//   The user's email is normalised and salted-hashed, then checked
//   against the trial_claims ledger. That ledger has no FK to
//   auth.users, so it survives account deletion — a user can't delete
//   and recreate their account to claim the trial again with the same
//   email. trial_claimed_at on user_profiles is also stamped, but that
//   only drives the in-app trial UI for the current account.
//
// Setup:
//   supabase functions deploy claim-trial
//   supabase secrets set REVENUECAT_SECRET_KEY=<sk_...>
//   supabase secrets set TRIAL_EMAIL_SALT=<long random string, set once, never change>
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

function normaliseEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  const at = email.lastIndexOf('@');
  if (at === -1) return email;

  let local = email.slice(0, at);
  const domain = email.slice(at + 1);

  const plus = local.indexOf('+');
  if (plus !== -1) local = local.slice(0, plus);

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
  }

  return `${local}@${domain}`;
}

// SHA-256 of (normalised email + shared secret salt), hex-encoded. The salt is
// a single fixed secret (not per-row) so the same email always yields the same
// hash — that's what makes the ledger lookup work. Set TRIAL_EMAIL_SALT once
// and never change it, or existing ledger rows would stop matching.
async function hashEmail(normalised: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(normalised + salt);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // 1. Authenticate the caller — extract user_id + email from their JWT.
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

  // 2. Service-role client for privileged reads/writes.
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // 3. Compute the email-hash guard key up front. An email is required — the
  // ledger is what enforces one trial per person across account deletion.
  const salt = Deno.env.get('TRIAL_EMAIL_SALT');
  if (!salt) {
    console.error('claim-trial: TRIAL_EMAIL_SALT not set');
    return json({ error: 'not_configured' }, 500);
  }
  if (!user.email) {
    console.error('claim-trial: user has no email', userId);
    return json({ error: 'no_email' }, 400);
  }
  const emailHash = await hashEmail(normaliseEmail(user.email), salt);

  // 4. Ledger check: has this email ever claimed a trial? Survives account
  // deletion, so this is the real one-trial-per-person gate.
  const { data: priorClaim, error: ledgerError } = await supabaseAdmin
    .from('trial_claims')
    .select('email_hash')
    .eq('email_hash', emailHash)
    .maybeSingle();

  if (ledgerError) {
    console.error('claim-trial: ledger check failed', ledgerError);
    return json({ error: 'ledger_check_failed' }, 500);
  }
  if (priorClaim) {
    return json({ error: 'trial_already_claimed' }, 409);
  }

  // 5. Per-account guards (cheap, and keep the current account consistent).
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

  // 6. Call RevenueCat REST API to grant the promotional entitlement.
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

  // 7. Record the claim in the ledger FIRST — this is the durable guard. Use
  // upsert so a retry after a partial failure can't 500 on a duplicate key.
  const { error: ledgerWriteError } = await supabaseAdmin
    .from('trial_claims')
    .upsert({ email_hash: emailHash }, { onConflict: 'email_hash' });

  if (ledgerWriteError) {
    // The grant already succeeded, so don't fail the request — but this is
    // important to know about, since the guard row didn't persist.
    console.error('claim-trial: failed to write trial_claims ledger', ledgerWriteError);
  }

  // 8. Stamp trial_claimed_at so the current account's in-app trial UI works.
  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({ trial_claimed_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (updateError) {
    console.error('claim-trial: failed to stamp trial_claimed_at', updateError);
  }

  return json({ ok: true });
});
