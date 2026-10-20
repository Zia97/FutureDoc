set lock_timeout = '3s';
set statement_timeout = '60s';

-- The compatibility view keeps the JSON API and historical marking snapshots
-- unchanged. Identical question snapshots are stored once, not per answer.
create table public.coach_evidence_tags (
  id uuid primary key,
  payload jsonb not null
);
alter table public.coach_evidence_tags enable row level security;
revoke all on public.coach_evidence_tags from public, anon, authenticated;
grant select,insert on public.coach_evidence_tags to service_role;

alter table public.coach_evidence rename to coach_evidence_records;
alter table public.coach_evidence_records add column tag_id uuid references public.coach_evidence_tags(id);
create index coach_evidence_tag_id on public.coach_evidence_records(tag_id) where tag_id is not null;
create index coach_evidence_recorded_at on public.coach_evidence_records(recorded_at);
create index coach_evidence_pending_compaction on public.coach_evidence_records(id)
  where payload ? 'tag';

create function public.compact_evidence_tag() returns trigger
language plpgsql security definer set search_path = '' as $$
declare snapshot jsonb; fingerprint uuid;
begin
  snapshot := new.payload->'tag';
  if snapshot is null then return new; end if;
  fingerprint := md5(snapshot::text)::uuid;
  insert into public.coach_evidence_tags values(fingerprint,snapshot) on conflict do nothing;
  if not exists(select 1 from public.coach_evidence_tags where id=fingerprint and payload=snapshot) then
    raise exception 'evidence_snapshot_hash_collision';
  end if;
  new.tag_id := fingerprint;
  new.payload := new.payload - 'tag';
  return new;
end $$;
create trigger compact_evidence_tag before insert or update of payload
on public.coach_evidence_records for each row execute function public.compact_evidence_tag();

create view public.coach_evidence with (security_invoker = true) as
select e.id,e.user_id,e.source_key,
  case when t.id is null then e.payload else e.payload || jsonb_build_object('tag',t.payload) end as payload,
  e.recorded_at
from public.coach_evidence_records e left join public.coach_evidence_tags t on t.id=e.tag_id;
revoke all on public.coach_evidence from public,anon,authenticated;
grant select on public.coach_evidence to service_role;

-- Known writer functions must target the physical table for ON CONFLICT.
-- Readers continue using the hydrated compatibility view.
do $$
declare fn regprocedure; definition text;
begin
  for fn in select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in ('coach_save_session','coach_archive_attempt','coach_reset_progress')
  loop
    select pg_get_functiondef(fn) into definition;
    definition := replace(definition,'insert into public.coach_evidence','insert into public.coach_evidence_records');
    definition := replace(definition,'delete from public.coach_evidence','delete from public.coach_evidence_records');
    execute definition;
  end loop;
end $$;

-- One short transaction per invocation; maintenance drains the backlog over
-- time. Updating in place leaves freed pages reusable without a blocking rewrite.
create function public.compact_evidence_batch(p_limit integer default 500)
returns integer language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  with batch as (
    select id from public.coach_evidence_records where payload ? 'tag'
    order by id limit least(greatest(p_limit,1),1000) for update skip locked
  )
  update public.coach_evidence_records e set payload=e.payload from batch where e.id=batch.id;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.compact_evidence_batch(integer) from public,anon,authenticated;
grant execute on function public.compact_evidence_batch(integer) to service_role;
revoke all on function public.compact_evidence_tag() from public,anon,authenticated;
