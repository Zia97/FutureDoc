set lock_timeout = '3s';
set statement_timeout = '60s';

-- Coaching reset removes coaching work only. The archive also holds the
-- student's separate practice and timed-test attempts, including timed tests
-- that have since been reset. Retain those records and their frozen marks.
do $$
declare definition text;
begin
  select pg_get_functiondef('public.coach_reset_progress(uuid)'::regprocedure) into definition;
  if position('delete from public.coach_evidence_records where user_id = p_user;' in definition) = 0 then
    raise exception 'unexpected_coach_reset_definition';
  end if;
  definition := replace(definition,
    'delete from public.coach_evidence_records where user_id = p_user;',
    'delete from public.coach_evidence_records where user_id = p_user and source_key like ''coach:%'';');
  execute definition;
end $$;

-- Repair archives erased by earlier coaching resets using the surviving
-- source records. ON CONFLICT leaves existing answer/tag snapshots untouched.
insert into public.coach_evidence_records(user_id, source_key, payload)
select a.user_id, 'practice_question_attempts:' || a.id,
  jsonb_build_object('id', a.id, 'questionId', a.question_id, 'section', a.section, 'mode', 'practice',
    'statementIndex', a.statement_index, 'selectedAnswer', a.selected_answer,
    'timeMs', a.time_spent_ms, 'answeredAt', a.answered_at,
    'tag', t.metadata || jsonb_build_object('id', a.question_id, 'section', a.section, 'mode', 'practice'))
from public.practice_question_attempts a
left join public.performance_question_tags t
  on t.question_id = a.question_id and t.section = a.section and t.mode = 'practice'
where not exists (select 1 from public.coach_evidence_records e
  where e.user_id = a.user_id and e.source_key = 'practice_question_attempts:' || a.id)
on conflict do nothing;

do $$
declare sec text; base text;
begin
  for sec, base in select * from (values
    ('vr', 'verbal_reasoning'), ('dm', 'decision_making'),
    ('qr', 'quantitative_reasoning'), ('sj', 'situational_judgement')) v(s, b)
  loop
    execute format($sql$
      insert into public.coach_evidence_records(user_id, source_key, payload)
      select a.user_id, %L || ':' || a.id,
        jsonb_build_object('id', a.id, 'questionId', a.question_id, 'section', %L, 'mode', 'timed',
          'selectedAnswer', a.selected_answer, 'timeMs', a.time_ms, 'answeredAt', e.submitted_at,
          'testId', e.test_id, 'examId', e.id,
          'tag', t.metadata || jsonb_build_object('id', a.question_id, 'section', %L, 'mode', 'timed'))
      from public.%I a
      join public.%I e on e.id = a.exam_attempt_id and e.user_id = a.user_id
      left join public.performance_question_tags t
        on t.question_id = a.question_id and t.section = %L and t.mode = 'timed'
      where not exists (select 1 from public.coach_evidence_records r
        where r.user_id = a.user_id and r.source_key = %L || ':' || a.id)
      on conflict do nothing
    $sql$, 'timed_' || base || '_question_answers', sec, sec,
      'timed_' || base || '_question_answers', 'timed_' || base || '_exam_attempts', sec,
      'timed_' || base || '_question_answers');
  end loop;
end $$;
