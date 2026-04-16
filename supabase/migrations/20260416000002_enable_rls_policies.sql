-- Row Level Security for every table the client touches.
--
-- Model:
--   • Content tables (questions, passages, scenarios, sets, options,
--     statements, content_versions, app_version_requirements) — public read
--     for anon + authenticated. No client-side write policy, so writes are
--     only possible from the service role (seed migrations, admin tools).
--   • User-owned tables (exam attempts, answers, profile, AI usage,
--     question reports) — full CRUD restricted to the row owner via
--     auth.uid() = user_id.
--
-- Pattern: enable RLS, drop any prior policy with the same name (idempotent
-- re-run), then create the policy.

-- ─── Content (public read) ──────────────────────────────────────────────────

do $$
declare
  t text;
  content_tables text[] := array[
    'content_versions',
    'app_version_requirements',
    'verbal_reasoning_passages',
    'verbal_reasoning_questions',
    'decision_making_questions',
    'decision_making_question_options',
    'decision_making_question_statements',
    'quantitative_reasoning_sets',
    'quantitative_reasoning_questions',
    'situational_judgement_scenarios',
    'situational_judgement_questions',
    'timed_verbal_reasoning_tests',
    'timed_verbal_reasoning_passages',
    'timed_verbal_reasoning_questions',
    'timed_decision_making_tests',
    'timed_decision_making_questions',
    'timed_decision_making_question_options',
    'timed_decision_making_question_statements',
    'timed_quantitative_reasoning_tests',
    'timed_quantitative_reasoning_sets',
    'timed_quantitative_reasoning_questions',
    'timed_situational_judgement_tests',
    'timed_situational_judgement_questions'
  ];
begin
  foreach t in array content_tables loop
    if to_regclass('public.' || t) is null then
      raise notice 'skipping missing table %', t;
      continue;
    end if;
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public_read" on public.%I', t);
    execute format(
      'create policy "public_read" on public.%I for select to anon, authenticated using (true)',
      t
    );
  end loop;
end$$;

-- ─── User-owned (owner-only CRUD via auth.uid() = user_id) ──────────────────

do $$
declare
  t text;
  user_tables text[] := array[
    'user_profiles',
    'user_ai_usage',
    'ai_tutor_logs',
    'question_reports',
    'timed_verbal_reasoning_exam_attempts',
    'timed_verbal_reasoning_question_answers',
    'timed_decision_making_exam_attempts',
    'timed_decision_making_question_answers',
    'timed_quantitative_reasoning_exam_attempts',
    'timed_quantitative_reasoning_question_answers',
    'timed_situational_judgement_exam_attempts',
    'timed_situational_judgement_question_answers'
  ];
begin
  foreach t in array user_tables loop
    if to_regclass('public.' || t) is null then
      raise notice 'skipping missing table %', t;
      continue;
    end if;
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "owner_select" on public.%I', t);
    execute format(
      'create policy "owner_select" on public.%I for select to authenticated using (auth.uid() = user_id)',
      t
    );

    execute format('drop policy if exists "owner_insert" on public.%I', t);
    execute format(
      'create policy "owner_insert" on public.%I for insert to authenticated with check (auth.uid() = user_id)',
      t
    );

    execute format('drop policy if exists "owner_update" on public.%I', t);
    execute format(
      'create policy "owner_update" on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t
    );

    execute format('drop policy if exists "owner_delete" on public.%I', t);
    execute format(
      'create policy "owner_delete" on public.%I for delete to authenticated using (auth.uid() = user_id)',
      t
    );
  end loop;
end$$;
