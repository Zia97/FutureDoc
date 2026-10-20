set lock_timeout = '3s';
set statement_timeout = '60s';

-- Durable receipts are intentionally retained: deleting them would permit an
-- old offline upload to overwrite a newer retake.
create table public.timed_submission_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id text not null check (length(submission_id) between 1 and 100),
  section text not null,
  test_id smallint not null,
  attempt_id uuid not null,
  created_at timestamptz not null default now(),
  primary key(user_id, submission_id)
);
alter table public.timed_submission_receipts enable row level security;
revoke all on public.timed_submission_receipts from public, anon, authenticated;

create function public.submit_timed_exam_v2(
  p_submission_id text, p_section text, p_test_id smallint,
  p_score_percent smallint, p_correct_count smallint, p_time_taken_seconds integer,
  p_flags jsonb default '[]', p_answers jsonb default '[]', p_analytics jsonb default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); receipt public.timed_submission_receipts; result uuid;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if p_section not in ('vr','dm','qr','sj') or p_section is null
    or p_submission_id is null or length(p_submission_id) not between 1 and 100
    or p_test_id is null or p_score_percent not between 0 and 100
    or p_correct_count < 0 or p_time_taken_seconds < 0
    or jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) > 100
    or octet_length(p_answers::text) > 100000 or octet_length(p_analytics::text) > 100000
  then raise exception 'invalid_submission'; end if;
  -- Lock the account so concurrent receipt IDs cannot race a retake.
  perform pg_advisory_xact_lock(hashtextextended(uid::text || ':timed-submit', 0));
  select * into receipt from public.timed_submission_receipts
    where user_id = uid and submission_id = p_submission_id;
  if found then
    if receipt.section <> p_section or receipt.test_id <> p_test_id then
      raise exception 'submission_id_reused';
    end if;
    return receipt.attempt_id;
  end if;
  execute format('select public.%I($1,$2,$3,$4,$5,$6,$7)', 'submit_timed_' || p_section || '_exam')
    into result using p_test_id, p_score_percent, p_correct_count, p_time_taken_seconds,
      p_flags, p_answers, p_analytics;
  insert into public.timed_submission_receipts values(uid,p_submission_id,p_section,p_test_id,result,now());
  return result;
end $$;
revoke all on function public.submit_timed_exam_v2(text,text,smallint,smallint,smallint,integer,jsonb,jsonb,jsonb) from public, anon;
grant execute on function public.submit_timed_exam_v2(text,text,smallint,smallint,smallint,integer,jsonb,jsonb,jsonb) to authenticated;

-- Preserve existing published aggregate values. Seed participation for all
-- historic attempts, including ungradable ones, matching the old guard.
-- Future participation is claimed once, independently of raw-row retention.
create table public.question_stat_participants (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null,
  statement_index smallint not null,
  primary key(user_id,question_id,statement_index)
);
alter table public.question_stat_participants enable row level security;
revoke all on public.question_stat_participants from public, anon, authenticated;
insert into public.question_stat_participants
select distinct user_id,question_id,coalesce(statement_index,-1)
from public.practice_question_attempts on conflict do nothing;

create or replace function public.roll_up_question_stats()
returns trigger language plpgsql security definer set search_path = '' as $$
declare claimed integer;
begin
  insert into public.question_stat_participants values
    (new.user_id,new.question_id,coalesce(new.statement_index,-1))
    on conflict do nothing;
  get diagnostics claimed = row_count;
  if claimed = 0 or new.is_correct is null or new.time_spent_ms is null
    or new.time_spent_ms not between 500 and 600000 then return new; end if;
  insert into public.question_stats(question_id,statement_index,section,
    total_first_attempts,total_correct_first_attempts,sum_time_ms,updated_at)
  values(new.question_id,coalesce(new.statement_index,-1),new.section,
    1,new.is_correct::int,new.time_spent_ms,now())
  on conflict(question_id,statement_index) do update set
    total_first_attempts = public.question_stats.total_first_attempts + 1,
    total_correct_first_attempts = public.question_stats.total_correct_first_attempts + excluded.total_correct_first_attempts,
    sum_time_ms = public.question_stats.sum_time_ms + excluded.sum_time_ms,
    updated_at = now();
  return new;
end $$;

create function public.upload_practice_attempts(p_attempts jsonb)
returns integer language plpgsql security invoker set search_path = '' as $$
declare item jsonb; n integer := 0; added integer; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if jsonb_typeof(p_attempts) <> 'array' or jsonb_array_length(p_attempts) > 50
    or octet_length(p_attempts::text) > 100000 then raise exception 'invalid_batch'; end if;
  -- Stable chronological order within a batch. Across devices the first
  -- accepted event retains the existing statistics' arrival-order semantics.
  for item in select value from jsonb_array_elements(p_attempts)
    order by value->>'answered_at',value->>'id'
  loop
    if (item->>'user_id')::uuid is distinct from uid
      or length(item->>'selected_answer') > 4000
      or length(item->>'platform') > 40 or length(item->>'app_version') > 80
    then raise exception 'invalid_attempt'; end if;
    insert into public.practice_question_attempts
      (id,user_id,section,question_id,statement_index,selected_answer,is_correct,time_spent_ms,answered_at,platform,app_version)
    values((item->>'id')::uuid,uid,item->>'section',(item->>'question_id')::uuid,
      (item->>'statement_index')::smallint,item->>'selected_answer',(item->>'is_correct')::boolean,
      (item->>'time_spent_ms')::integer,(item->>'answered_at')::timestamptz,item->>'platform',item->>'app_version')
    on conflict(id) do nothing;
    get diagnostics added = row_count;
    n := n + added;
  end loop;
  return n;
end $$;
revoke all on function public.upload_practice_attempts(jsonb) from public, anon;
grant execute on function public.upload_practice_attempts(jsonb) to authenticated;
