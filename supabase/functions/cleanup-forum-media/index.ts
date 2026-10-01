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

  let body: { postId?: string };
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400, headers: responseHeaders }); }
  if (typeof body.postId !== 'string') return new Response(JSON.stringify({ error: 'invalid_post' }), { status: 400, headers: responseHeaders });

  const [{ data: post }, { data: profile }] = await Promise.all([
    admin.from('forum_posts').select('author_user_id,status').eq('id', body.postId).maybeSingle(),
    admin.from('user_profiles').select('is_admin').eq('user_id', user.id).maybeSingle(),
  ]);
  if (!post || (post.author_user_id !== user.id && !profile?.is_admin)) {
    return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: responseHeaders });
  }
  if (!['deleted', 'rejected'].includes(post.status)) {
    return new Response(JSON.stringify({ error: 'content_not_removed' }), { status: 409, headers: responseHeaders });
  }
  const { data: attachments } = await admin.from('forum_attachments').select('storage_path').eq('post_id', body.postId);
  const paths = (attachments ?? []).map((item) => item.storage_path);
  if (paths.length) {
    const { error } = await admin.storage.from('forum-media').remove(paths);
    if (error) return new Response(JSON.stringify({ error: 'storage_delete_failed' }), { status: 500, headers: responseHeaders });
    await admin.from('forum_attachments').update({ removed_at: new Date().toISOString() }).eq('post_id', body.postId);
  }
  return new Response(JSON.stringify({ ok: true, removed: paths.length }), { status: 200, headers: responseHeaders });
});
