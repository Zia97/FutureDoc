import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const responseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: responseHeaders });
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: responseHeaders });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: { user }, error: authError } = await admin.auth.getUser(authHeader.replace('Bearer ', ''));
  if (authError || !user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: responseHeaders });
  let body: { reportId?: string };
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400, headers: responseHeaders }); }
  const { data: report } = await admin.from('forum_reports').select('id,reporter_user_id,target_type,target_id,reason,details,created_at').eq('id', body.reportId).maybeSingle();
  if (!report || report.reporter_user_id !== user.id) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: responseHeaders });

  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return new Response(JSON.stringify({ ok: true, emailed: false }), { status: 200, headers: responseHeaders });
  const to = Deno.env.get('SUPPORT_EMAIL_TO') ?? 'ucatgenius@gmail.com';
  const from = Deno.env.get('SUPPORT_EMAIL_FROM') ?? 'UCAT Genius Moderation <onboarding@resend.dev>';
  const send = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `[UCAT Genius forum] New ${report.reason} report`,
      text: `Target: ${report.target_type} ${report.target_id}\nReason: ${report.reason}\nDetails: ${report.details ?? '(none)'}\nReport ID: ${report.id}`,
    }),
  });
  return new Response(JSON.stringify({ ok: true, emailed: send.ok }), { status: 200, headers: responseHeaders });
});
