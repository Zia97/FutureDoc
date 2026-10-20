-- Explicit, previewed hard deletion of report/log rows only.
-- Store identifiers and revisions, not copies of deleted complaint content.
create table admin.report_deletions (
  id uuid primary key default gen_random_uuid(),
  actor uuid not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '15 minutes',
  items jsonb not null,
  summary jsonb not null,
  completed_at timestamptz,
  result jsonb
);
alter table admin.report_deletions enable row level security;
revoke all on admin.report_deletions from public,anon,authenticated;

create function public.admin_reports_delete_preview(p_actor uuid,p_issues jsonb default null,p_filter jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare keys text[]; page_data jsonb; page_number int:=1; snapshot jsonb; summary jsonb; request_id uuid;
begin
  perform admin.require_report_admin(p_actor);
  if (p_issues is null) = (p_filter is null) then
    raise exception 'choose_selection_or_filter' using errcode='22023';
  end if;
  if p_issues is not null then
    if jsonb_typeof(p_issues)<>'array' or jsonb_array_length(p_issues) not between 1 and 1000
      then raise exception 'invalid_selection' using errcode='22023'; end if;
    select array_agg(distinct value) into keys from jsonb_array_elements_text(p_issues);
  else
    if jsonb_typeof(p_filter)<>'object' then raise exception 'invalid_filter' using errcode='22023'; end if;
    keys:=array[]::text[];
    loop
      page_data:=public.admin_reports_list(p_actor,p_filter||jsonb_build_object('page',page_number,'pageSize',100));
      if (page_data->>'total')::int>10000 then raise exception 'narrow_selection' using errcode='22023'; end if;
      keys:=keys||array(select item->>'issue_key' from jsonb_array_elements(page_data->'items') item);
      exit when page_number*100 >= (page_data->>'total')::int;
      page_number:=page_number+1;
    end loop;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('source',source,'source_id',source_id,'issue_key',issue_key,
    'revision',revision) order by source,source_id),'[]') into snapshot
    from admin.report_evidence where issue_key=any(keys);
  if jsonb_array_length(snapshot) not between 1 and 10000 then
    raise exception 'empty_or_large_selection' using errcode='22023';
  end if;
  select jsonb_build_object('issues',count(distinct item->>'issue_key'),'records',count(*),
    'sources',(select jsonb_object_agg(source,n) from (
      select value->>'source' source,count(*) n from jsonb_array_elements(snapshot) group by 1
    ) counts)) into summary from jsonb_array_elements(snapshot) item;
  insert into admin.report_deletions(actor,items,summary) values(p_actor,snapshot,summary) returning id into request_id;
  return summary||jsonb_build_object('id',request_id);
end $$;

create function public.admin_reports_delete(p_actor uuid,p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare request admin.report_deletions; item jsonb; evidence record; source_table text; issue text; removed int:=0; affected int;
begin
  perform admin.require_report_admin(p_actor);
  select * into request from admin.report_deletions where id=p_id and actor=p_actor for update;
  if not found then raise exception 'invalid_preview' using errcode='22023'; end if;
  if request.completed_at is not null then return request.result; end if;
  if request.expires_at<now() then raise exception 'expired_preview' using errcode='40001'; end if;
  -- Same locks as triage. Lock groups in a stable order to avoid deadlocks.
  for issue in select distinct value->>'issue_key' from jsonb_array_elements(request.items) order by 1 loop
    perform pg_advisory_xact_lock(hashtextextended(issue,0));
  end loop;
  for item in select value from jsonb_array_elements(request.items) order by value->>'source',value->>'source_id' loop
    source_table:=case item->>'source' when 'question' then 'question_reports' when 'lesson' then 'lesson_reports'
      when 'support' then 'support_messages' when 'forum' then 'forum_reports' when 'ai' then 'ai_tutor_logs' end;
    if source_table is null then raise exception 'invalid_source' using errcode='22023'; end if;
    execute format('select id from public.%I where id::text=$1 for update',source_table) using item->>'source_id';
    select * into evidence from admin.report_evidence where source=item->>'source' and source_id=item->>'source_id';
    if not found or evidence.revision is distinct from item->>'revision' then
      raise exception 'stale_evidence' using errcode='40001';
    end if;
    execute format('delete from public.%I where id::text=$1',source_table) using item->>'source_id';
    get diagnostics affected = row_count;
    if affected<>1 then raise exception 'stale_evidence' using errcode='40001'; end if;
    delete from admin.report_reviews where source=item->>'source' and source_id=item->>'source_id';
    insert into admin.report_audit(issue_key,source,source_id,actor,action,old_state,new_state,conclusion,note)
      values(evidence.issue_key,evidence.source,evidence.source_id,p_actor,'delete',evidence.state,'deleted',evidence.conclusion,'Report source row permanently deleted.');
    removed:=removed+1;
  end loop;
  update admin.report_deletions set completed_at=clock_timestamp(),result=jsonb_build_object('deleted',removed)
    where id=p_id;
  return jsonb_build_object('deleted',removed);
end $$;
revoke all on function public.admin_reports_delete_preview(uuid,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.admin_reports_delete(uuid,uuid) from public,anon,authenticated;
grant execute on function public.admin_reports_delete_preview(uuid,jsonb,jsonb) to service_role;
grant execute on function public.admin_reports_delete(uuid,uuid) to service_role;
