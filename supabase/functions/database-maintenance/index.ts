import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Scheduled via pg_net with a dedicated Vault secret, not a user JWT.
Deno.serve(async (req) => {
  const key = Deno.env.get('DATABASE_MAINTENANCE_KEY');
  if (req.method !== 'POST' || !key || req.headers.get('x-maintenance-key') !== key) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: candidates, error } = await client.rpc('forum_media_cleanup_candidates', { p_limit: 100 });
  if (error) return Response.json({ error: 'candidate_lookup_failed' }, { status: 503 });
  const paths = (candidates ?? []).map((row: any) => row.path);
  if (!paths.length) return Response.json({ removed: 0 });
  const { error: removalError } = await client.storage.from('forum-media').remove(paths);
  if (removalError) return Response.json({ error: 'storage_removal_failed' }, { status: 503 });
  const { error: markerError } = await client.from('forum_attachments')
    .update({ removed_at: new Date().toISOString() }).in('storage_path', paths);
  if (markerError) return Response.json({ error: 'marker_update_failed' }, { status: 503 });
  return Response.json({ removed: paths.length });
});
