-- Fetch only the question attached to an authorised ticket. This never creates
-- attempts, writes answers or returns the rest of a timed test.
create function public.support_get_question(p_ticket uuid,p_admin boolean default false)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  t public.support_tickets; base text; q jsonb; parent jsonb;
  options jsonb := '[]'; statements jsonb := '[]'; suffix text; fk text;
  reveal boolean; actual_test integer;
begin
  t := support_private.require_ticket(p_ticket,p_admin);
  if t.kind<>'question' or t.section not in ('vr','dm','qr','sj')
    or t.question_id is null or t.question_id !~* '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$' then
    return jsonb_build_object('available',false,'reason','This question is no longer available.');
  end if;
  base := case when t.is_timed then 'timed_' else '' end ||
    case t.section when 'vr' then 'verbal_reasoning' when 'dm' then 'decision_making'
      when 'qr' then 'quantitative_reasoning' else 'situational_judgement' end;
  execute format('select to_jsonb(q) from public.%I q where id=$1',base || '_questions') into q using t.question_id::uuid;
  if q is null then return jsonb_build_object('available',false,'reason','This question is no longer available.'); end if;
  if t.section<>'dm' then
    suffix := case t.section when 'vr' then 'passages' when 'qr' then 'sets' else 'scenarios' end;
    fk := case t.section when 'vr' then 'passage_id' when 'qr' then 'set_id' else 'scenario_id' end;
    execute format('select to_jsonb(p) from public.%I p where id=$1',base || '_' || suffix)
      into parent using (q->>fk)::uuid;
  end if;
  -- Trust the current question's test, not the test number supplied in a report.
  actual_test := coalesce(q->>'test_id',parent->>'test_id')::integer;
  reveal := p_admin or not t.is_timed;
  if t.is_timed and not p_admin and actual_test is not null then
    execute format('select exists(select 1 from public.%I where user_id=$1 and test_id=$2)',base || '_exam_attempts')
      into reveal using auth.uid(),actual_test;
  end if;
  if t.section='dm' then
    execute format('select coalesce(jsonb_agg(jsonb_build_object(''label'',label,''text'',option_text,
      ''vennConfig'',option_data,''vennGeometry'',to_jsonb(o)->''venn_geometry'') order by order_index,id),''[]''::jsonb)
      from public.%I o where question_id=$1',base || '_question_options') into options using t.question_id::uuid;
    execute format('select coalesce(jsonb_agg(jsonb_build_object(''text'',statement_text,
      ''answer'',case when $2 then correct_answer end,''reason'',case when $2 then answer_reason end)
      order by order_index,id),''[]''::jsonb) from public.%I where question_id=$1',base || '_question_statements')
      into statements using t.question_id::uuid,reveal;
  else
    options := coalesce(q->'options','[]'::jsonb);
  end if;
  return jsonb_build_object('available',true,'answers_visible',reveal,
    'parent_missing',t.section<>'dm' and parent is null,
    'question',jsonb_build_object('id',t.question_id,'section',t.section,'isTimed',t.is_timed,
      'testId',actual_test,'title',coalesce(q->>'title',parent->>'title'),'type',q->>'type',
      'stem',coalesce(q->>'stem',q->>'question_text'),'context',parent->>'body',
      'stimulus',parent->'stimulus','tableData',q->'table_data','stimulusDiagram',q->'stimulus_diagram',
      'stimulusVennGeometry',q->'venn_geometry','hideLabels',coalesce((q->>'hide_labels')::boolean,false),
      'labelSet',coalesce(q->'label_set',parent->'label_set','1'::jsonb),'options',options,'statements',statements,
      'answer',case when reveal then q->'correct_answer' end,
      'answeringReason',case when reveal then q->'answer_reason' end));
end $$;
revoke all on function public.support_get_question(uuid,boolean) from public,anon;
grant execute on function public.support_get_question(uuid,boolean) to authenticated;
notify pgrst, 'reload schema';
