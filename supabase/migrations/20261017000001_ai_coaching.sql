-- Coaching is accessed through the authenticated edge service. Answer keys,
-- quotas and lifecycle transitions must never be writable by mobile clients.
create table public.coach_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  exam_date date,
  time_multiplier numeric not null default 1 check (time_multiplier in (1, 1.25, 1.5)),
  baseline_session_id uuid,
  preview_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.coach_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('assessment','practice','review','timed_check')),
  title text not null,
  status text not null default 'active' check (status in ('active','completed')),
  form_version text not null,
  time_multiplier numeric not null,
  questions jsonb not null,
  budgets jsonb not null,
  progress jsonb not null,
  report jsonb,
  version integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create unique index coach_one_active_session on public.coach_sessions(user_id) where status = 'active';
create unique index coach_one_baseline on public.coach_sessions(user_id) where kind = 'assessment';
create index coach_session_history on public.coach_sessions(user_id, created_at desc);
create table public.coach_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_key text not null,
  payload jsonb not null,
  recorded_at timestamptz not null default now(),
  unique(user_id, source_key)
);
create index coach_evidence_user on public.coach_evidence(user_id, id);
create table public.coach_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  evidence_count integer not null,
  plan_key text not null,
  profile jsonb not null,
  created_at timestamptz not null default now(),
  unique(user_id, evidence_count, plan_key)
);
create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  status text not null default 'pending' check (status in ('pending','completed')),
  user_text text not null,
  assistant_text text,
  free_credit_used boolean not null default true,
  evidence jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, request_id)
);
create index coach_messages_history on public.coach_messages(user_id, created_at desc);
create table public.coach_milestones (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  label text not null,
  earned_at timestamptz not null default now(),
  primary key(user_id, key)
);

alter table public.coach_profiles enable row level security;
alter table public.coach_sessions enable row level security;
alter table public.coach_evidence enable row level security;
alter table public.coach_plans enable row level security;
alter table public.coach_messages enable row level security;
alter table public.coach_milestones enable row level security;
revoke all on public.coach_profiles, public.coach_sessions, public.coach_evidence, public.coach_plans, public.coach_messages, public.coach_milestones from anon, authenticated;
grant all on public.coach_profiles, public.coach_sessions, public.coach_evidence, public.coach_plans, public.coach_messages, public.coach_milestones to service_role;

create function public.coach_start_session(p_user uuid, p_session jsonb, p_pro boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare profile public.coach_profiles; existing public.coach_sessions; created public.coach_sessions;
begin
  insert into public.coach_profiles(user_id) values(p_user) on conflict do nothing;
  select * into profile from public.coach_profiles where user_id = p_user for update;
  select * into existing from public.coach_sessions where user_id = p_user and status = 'active';
  if found then return to_jsonb(existing); end if;
  if p_session->>'kind' = 'assessment' and profile.baseline_session_id is not null then
    select * into existing from public.coach_sessions where id = profile.baseline_session_id and user_id = p_user;
    return to_jsonb(existing);
  end if;
  if p_session->>'kind' <> 'assessment' then
    if profile.baseline_session_id is null then raise exception 'assessment_required'; end if;
    if not p_pro and profile.preview_session_id is not null then raise exception 'pro_required'; end if;
  end if;
  insert into public.coach_sessions(user_id, kind, title, form_version, time_multiplier, questions, budgets, progress)
  values(p_user, p_session->>'kind', p_session->>'title', p_session->>'form_version',
    (p_session->>'time_multiplier')::numeric, p_session->'questions', p_session->'budgets', p_session->'progress') returning * into created;
  if created.kind <> 'assessment' and not p_pro then
    update public.coach_profiles set preview_session_id = created.id, updated_at = now() where user_id = p_user;
  end if;
  return to_jsonb(created);
end $$;

create function public.coach_save_session(p_user uuid, p_id uuid, p_version integer, p_progress jsonb, p_report jsonb default null, p_evidence jsonb default '[]')
returns jsonb language plpgsql security definer set search_path = public as $$
declare existing public.coach_sessions; item jsonb;
begin
  -- Same lock order as start_session; serialises completion and a new session.
  perform 1 from public.coach_profiles where user_id = p_user for update;
  select * into existing from public.coach_sessions where id = p_id and user_id = p_user for update;
  if not found then raise exception 'session_not_found'; end if;
  if existing.status = 'completed' then return to_jsonb(existing); end if;
  if existing.version <> p_version then raise exception 'version_conflict'; end if;
  if p_report is not null and p_progress->>'phase' <> 'finished' then raise exception 'incomplete_assessment'; end if;
  update public.coach_sessions set progress = p_progress, version = version + 1, updated_at = now(),
    status = case when p_report is not null then 'completed' else 'active' end,
    report = p_report, completed_at = case when p_report is not null then now() else null end
    where id = p_id returning * into existing;
  if p_report is not null then
    if existing.kind = 'assessment' then
      update public.coach_profiles set baseline_session_id = p_id, updated_at = now() where user_id = p_user;
    end if;
    for item in select value from jsonb_array_elements(p_evidence) loop
      insert into public.coach_evidence(user_id, source_key, payload)
      values(p_user, 'coach:' || p_id || ':' || (item->>'questionId'), item)
      on conflict(user_id, source_key) do nothing;
    end loop;
  end if;
  return to_jsonb(existing);
end $$;

-- An idempotency key plus account lock prevents duplicate billed model calls
-- and simultaneous requests spending the same preview allowance.
create function public.coach_reserve_message(p_user uuid, p_request uuid, p_text text, p_pro boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare profile public.coach_profiles; existing public.coach_messages; count_today integer; count_all integer;
begin
  select * into profile from public.coach_profiles where user_id = p_user for update;
  if not found or profile.baseline_session_id is null then raise exception 'assessment_required'; end if;
  select * into existing from public.coach_messages where user_id = p_user and request_id = p_request;
  if found then return jsonb_build_object('reserved', false, 'message', to_jsonb(existing)); end if;
  select count(*) filter (where free_credit_used), count(*) filter (where created_at >= date_trunc('day', now())) into count_all, count_today
    from public.coach_messages where user_id = p_user;
  if not p_pro and count_all >= 5 then raise exception 'pro_required'; end if;
  if count_today >= 100 then raise exception 'daily_limit'; end if;
  if exists(select 1 from public.coach_messages where user_id = p_user and status = 'pending' and created_at > now() - interval '2 minutes') then
    raise exception 'message_in_progress';
  end if;
  insert into public.coach_messages(user_id, request_id, user_text, free_credit_used) values(p_user, p_request, p_text, not p_pro) returning * into existing;
  return jsonb_build_object('reserved', true, 'message', to_jsonb(existing));
end $$;

revoke all on function public.coach_start_session(uuid,jsonb,boolean) from public, anon, authenticated;
revoke all on function public.coach_save_session(uuid,uuid,integer,jsonb,jsonb,jsonb) from public, anon, authenticated;
revoke all on function public.coach_reserve_message(uuid,uuid,text,boolean) from public, anon, authenticated;
grant execute on function public.coach_start_session(uuid,jsonb,boolean) to service_role;
grant execute on function public.coach_save_session(uuid,uuid,integer,jsonb,jsonb,jsonb) to service_role;
grant execute on function public.coach_reserve_message(uuid,uuid,text,boolean) to service_role;

-- Preserve outside-coach activity at write time, even after a timed test reset.
-- These rows intentionally have no FK to the replaceable exam attempt.
create function public.coach_archive_attempt() returns trigger language plpgsql security definer set search_path = public as $$
declare v_sec text; v_mode text; payload jsonb; tag jsonb; exam jsonb;
begin
  if tg_table_name = 'practice_question_attempts' then
    v_sec := new.section; v_mode := 'practice';
    payload := jsonb_build_object('id',new.id, 'questionId',new.question_id,'section',v_sec,'mode',v_mode,
      'statementIndex',new.statement_index,'selectedAnswer',new.selected_answer,'timeMs',new.time_spent_ms,'answeredAt',new.answered_at);
  else
    v_sec := tg_argv[0]; v_mode := 'timed';
    execute format('select to_jsonb(e) from public.%I e where id = $1 and user_id = $2', tg_argv[1]) into exam using new.exam_attempt_id, new.user_id;
    payload := jsonb_build_object('id',new.id,'questionId',new.question_id,'section',v_sec,'mode',v_mode,
      'selectedAnswer',new.selected_answer,'timeMs',new.time_ms,'answeredAt',exam->>'submitted_at','testId',exam->'test_id','examId',new.exam_attempt_id);
  end if;
  select t.metadata || jsonb_build_object('id', t.question_id, 'section', v_sec, 'mode', v_mode) into tag
    from public.performance_question_tags t where t.question_id = new.question_id and t.section = v_sec and t.mode = v_mode;
  insert into public.coach_evidence(user_id, source_key, payload)
    values(new.user_id, tg_table_name || ':' || new.id, payload || jsonb_build_object('tag',tag)) on conflict do nothing;
  return new;
end $$;
revoke all on function public.coach_archive_attempt() from public, anon, authenticated;
create trigger coach_archive_practice after insert on public.practice_question_attempts for each row execute function public.coach_archive_attempt();
create trigger coach_archive_vr after insert on public.timed_verbal_reasoning_question_answers for each row execute function public.coach_archive_attempt('vr','timed_verbal_reasoning_exam_attempts');
create trigger coach_archive_dm after insert on public.timed_decision_making_question_answers for each row execute function public.coach_archive_attempt('dm','timed_decision_making_exam_attempts');
create trigger coach_archive_qr after insert on public.timed_quantitative_reasoning_question_answers for each row execute function public.coach_archive_attempt('qr','timed_quantitative_reasoning_exam_attempts');
create trigger coach_archive_sj after insert on public.timed_situational_judgement_question_answers for each row execute function public.coach_archive_attempt('sj','timed_situational_judgement_exam_attempts');

insert into public.coach_evidence(user_id,source_key,payload)
select a.user_id, 'practice_question_attempts:' || a.id,
  jsonb_build_object('id',a.id,'questionId',a.question_id,'section',a.section,'mode','practice','statementIndex',a.statement_index,
    'selectedAnswer',a.selected_answer,'timeMs',a.time_spent_ms,'answeredAt',a.answered_at,
    'tag',t.metadata || jsonb_build_object('id',a.question_id,'section',a.section,'mode','practice'))
from public.practice_question_attempts a left join public.performance_question_tags t on t.question_id = a.question_id and t.section = a.section and t.mode = 'practice'
on conflict do nothing;
do $$
declare sec text; base text;
begin
  for sec,base in select * from (values ('vr','verbal_reasoning'),('dm','decision_making'),('qr','quantitative_reasoning'),('sj','situational_judgement')) v(s,b) loop
    execute format($sql$
      insert into public.coach_evidence(user_id,source_key,payload)
      select a.user_id, %L || ':' || a.id, jsonb_build_object('id',a.id,'questionId',a.question_id,'section',%L,'mode','timed',
        'selectedAnswer',a.selected_answer,'timeMs',a.time_ms,'answeredAt',e.submitted_at,'testId',e.test_id,'examId',e.id,
        'tag',t.metadata || jsonb_build_object('id',a.question_id,'section',%L,'mode','timed'))
      from public.%I a join public.%I e on e.id = a.exam_attempt_id and e.user_id = a.user_id
      left join public.performance_question_tags t on t.question_id = a.question_id and t.section = %L and t.mode = 'timed'
      on conflict do nothing
    $sql$, 'timed_'||base||'_question_answers',sec,sec,'timed_'||base||'_question_answers','timed_'||base||'_exam_attempts',sec);
  end loop;
end $$;
