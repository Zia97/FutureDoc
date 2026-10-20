import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  } });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return respond({ ok: true });
  if (request.method !== 'POST') return respond({ error: 'method_not_allowed' }, 405);
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const client = createClient(Deno.env.get('SUPABASE_URL')!, key);
  const bearer = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
  if (!bearer) return respond({ error: 'unauthorized' }, 401);
  const serviceCall = bearer === key;
  const { data: { user } } = serviceCall ? { data: { user: null } } : await client.auth.getUser(bearer);
  if (!serviceCall && !user) return respond({ error: 'unauthorized' }, 401);

  let replyId: string;
  try { replyId = (await request.json()).replyId; } catch { return respond({ error: 'invalid_json' }, 400); }
  if (!/^[0-9a-f-]{36}$/i.test(replyId ?? '')) return respond({ error: 'invalid_reply_id' }, 400);
  const { data: reply, error: replyError } = await client.from('forum_replies')
    .select('id,post_id,parent_reply_id,author_user_id,status,created_at').eq('id', replyId).maybeSingle();
  if (replyError || !reply || reply.status !== 'published') return respond({ skipped: 'not_published' });
  if (Date.parse(reply.created_at) < Date.now() - 48 * 60 * 60 * 1000) return respond({ skipped: 'expired' });
  if (!serviceCall) {
    const { data: profile } = await client.from('user_profiles').select('is_admin').eq('user_id', user!.id).maybeSingle();
    if (user!.id !== reply.author_user_id && !profile?.is_admin) return respond({ error: 'forbidden' }, 403);
  }

  const { data: post } = await client.from('forum_posts').select('author_user_id,status').eq('id', reply.post_id).maybeSingle();
  if (post?.status !== 'published') return respond({ skipped: 'post_not_published' });
  let recipient = post.author_user_id;
  if (reply.parent_reply_id) {
    const { data: parent } = await client.from('forum_replies').select('author_user_id').eq('id', reply.parent_reply_id).maybeSingle();
    recipient = parent?.author_user_id ?? recipient;
  }
  if (!recipient || recipient === reply.author_user_id) return respond({ skipped: 'own_reply' });
  const { data: preference } = await client.from('notification_preferences')
    .select('forum_replies').eq('user_id', recipient).maybeSingle();
  if (!preference?.forum_replies) return respond({ skipped: 'disabled' });
  const { data: devices } = await client.from('notification_devices').select('token').eq('user_id', recipient);
  if (!devices?.length) return respond({ skipped: 'no_devices' });

  const { error: claimError } = await client.from('forum_reply_notifications')
    .insert({ reply_id: replyId, recipient_id: recipient });
  if (claimError) {
    if (claimError.code === '23505') return respond({ skipped: 'already_sent' });
    return respond({ error: 'claim_failed' }, 500);
  }
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(devices.map(device => ({
        to: device.token, title: 'New forum reply', body: 'Someone replied to you in the community.',
        data: { type: 'forum_reply', postId: reply.post_id }, sound: 'default',
      }))),
    });
    if (!response.ok) throw new Error(`expo_${response.status}`);
    const result = await response.json();
    const tickets = Array.isArray(result.data) ? result.data : [result.data];
    await Promise.all(tickets.map(async (ticket, index) => {
      if (ticket?.details?.error === 'DeviceNotRegistered' && devices[index]) {
        await client.from('notification_devices').delete().eq('token', devices[index].token);
      }
    }));
    if (!tickets.some(ticket => ticket?.status === 'ok')) throw new Error('expo_no_successful_ticket');
    return respond({ sent: true });
  } catch (error) {
    await client.from('forum_reply_notifications').delete().eq('reply_id', replyId).eq('recipient_id', recipient);
    console.error('Forum reply push failed', error);
    return respond({ error: 'push_failed' }, 502);
  }
});
