// Sends a support_messages row to the support inbox via Resend.
//
// Flow:
//   1. Client inserts a row into support_messages (RLS allows it).
//   2. Client invokes this function with { messageId }.
//   3. Function loads the row using the service role, formats an email, and
//      delivers it via the Resend HTTP API.
//   4. On success: stamps email_sent_at on the row.
//      On failure : stamps email_error so the operator can see why.
//
// Env vars (set with `supabase secrets set ...`):
//   RESEND_API_KEY     — required, Resend API key
//   SUPPORT_EMAIL_TO   — recipient (defaults to ucatgenius@gmail.com)
//   SUPPORT_EMAIL_FROM — sender, must be a verified Resend domain (defaults
//                        to onboarding@resend.dev which is fine for testing)
//
// Why a separate function instead of a DB trigger / webhook? The trigger
// approach requires either pg_net or a Supabase webhook, both of which add
// complexity and obscure errors. A direct invoke from the client gives the
// user immediate feedback and a clear failure path.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DEFAULT_TO   = 'ucatgenius@gmail.com';
const DEFAULT_FROM = 'UCAT Genius Support <onboarding@resend.dev>';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-app-version, x-platform',
  };
}

function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  // 1. Auth — must be a real (or anon) Supabase JWT.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', ''),
  );
  if (authError || !user) return json({ error: 'Unauthorized' }, 401);

  // 2. Body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const messageId = body?.messageId;
  if (typeof messageId !== 'string' || messageId.length < 8) {
    return json({ error: 'missing_message_id' }, 400);
  }

  // 3. Load the message row. We restrict to rows owned by this user (or
  // anon-submitted with no user_id) so a logged-in user cannot trigger
  // delivery of someone else's message.
  const { data: row, error: loadErr } = await supabase
    .from('support_messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (loadErr || !row) {
    return json({ error: 'message_not_found' }, 404);
  }
  if (row.user_id && row.user_id !== user.id) {
    return json({ error: 'forbidden' }, 403);
  }

  // 4. Build & send the email via Resend.
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    // Row is preserved in the DB; mark the error so it's visible.
    await supabase
      .from('support_messages')
      .update({ email_error: 'RESEND_API_KEY not configured' })
      .eq('id', messageId);
    return json({ error: 'email_not_configured', stored: true }, 200);
  }

  const to   = Deno.env.get('SUPPORT_EMAIL_TO')   ?? DEFAULT_TO;
  const from = Deno.env.get('SUPPORT_EMAIL_FROM') ?? DEFAULT_FROM;

  const subjectLine = `[UCAT Genius support] ${row.subject ?? '(no subject)'}`;
  const replyTo     = row.user_email && /@/.test(row.user_email) ? row.user_email : undefined;

  const messageHtml = escapeHtml(row.message ?? '').replace(/\n/g, '<br>');
  const htmlBody = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; font-size: 14px; line-height: 1.5; color: #111;">
      <p><strong>From:</strong> ${escapeHtml(row.display_name ?? '(no name)')}
        &lt;${escapeHtml(row.user_email ?? 'no email')}&gt;</p>
      <p><strong>User ID:</strong> ${escapeHtml(row.user_id ?? '(anonymous)')}</p>
      <p><strong>Platform:</strong> ${escapeHtml(row.platform ?? '?')}
        &nbsp;<strong>App version:</strong> ${escapeHtml(row.app_version ?? '?')}
        &nbsp;<strong>Premium:</strong> ${row.is_premium ? 'yes' : 'no'}
        &nbsp;<strong>Anonymous:</strong> ${row.is_anonymous ? 'yes' : 'no'}</p>
      <hr>
      <p><strong>Subject:</strong> ${escapeHtml(row.subject ?? '')}</p>
      <p>${messageHtml}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">Support message id: ${row.id}</p>
    </div>
  `;
  const textBody = [
    `From: ${row.display_name ?? '(no name)'} <${row.user_email ?? 'no email'}>`,
    `User ID: ${row.user_id ?? '(anonymous)'}`,
    `Platform: ${row.platform ?? '?'}    App version: ${row.app_version ?? '?'}`,
    `Premium: ${row.is_premium ? 'yes' : 'no'}    Anonymous: ${row.is_anonymous ? 'yes' : 'no'}`,
    '',
    `Subject: ${row.subject ?? ''}`,
    '',
    row.message ?? '',
    '',
    `--- support message id: ${row.id} ---`,
  ].join('\n');

  const payload: Record<string, unknown> = {
    from,
    to: [to],
    subject: subjectLine,
    html: htmlBody,
    text: textBody,
  };
  if (replyTo) payload.reply_to = replyTo;

  let resendStatus = 0;
  let resendBody = '';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    resendStatus = res.status;
    resendBody = await res.text();
  } catch (e) {
    await supabase
      .from('support_messages')
      .update({ email_error: `network: ${e instanceof Error ? e.message : 'unknown'}` })
      .eq('id', messageId);
    return json({ error: 'email_send_failed', stored: true }, 200);
  }

  if (resendStatus >= 200 && resendStatus < 300) {
    await supabase
      .from('support_messages')
      .update({ email_sent_at: new Date().toISOString(), email_error: null })
      .eq('id', messageId);
    return json({ ok: true, stored: true, emailed: true }, 200);
  }

  await supabase
    .from('support_messages')
    .update({ email_error: `resend ${resendStatus}: ${resendBody.slice(0, 500)}` })
    .eq('id', messageId);
  return json({ error: 'email_send_failed', stored: true, resendStatus }, 200);
});
