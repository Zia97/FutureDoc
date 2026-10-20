set lock_timeout = '3s';
set statement_timeout = '60s';

-- Smaller writes suit the production instance's observed I/O budget.
-- Verify each locked batch before commit, even while other users add/reset data.
create or replace function public.compact_evidence_batch(p_limit integer default 200)
returns integer language plpgsql security definer set search_path = '' as $$
declare ids uuid[]; before_hash numeric; after_hash numeric; n integer;
begin
  select array_agg(id),sum(hashtextextended(payload::text,0)::numeric)
    into ids,before_hash from (
      select id,payload from public.coach_evidence_records where payload ? 'tag'
      order by id limit least(greatest(p_limit,1),200) for update skip locked
    ) batch;
  if ids is null then return 0; end if;
  update public.coach_evidence_records set payload=payload where id=any(ids);
  get diagnostics n=row_count;
  select sum(hashtextextended(payload::text,0)::numeric) into after_hash
    from public.coach_evidence where id=any(ids);
  if before_hash is distinct from after_hash then raise exception 'evidence_compaction_integrity_failed'; end if;
  return n;
end $$;
