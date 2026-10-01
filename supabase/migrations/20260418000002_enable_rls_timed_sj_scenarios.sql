-- Fix: timed_situational_judgement_scenarios was omitted from the
-- RLS content_tables list in 20260416000002, so the nested select
-- (tests → scenarios → questions) in fetchTimedSJTests returned no
-- scenarios and the timed SJ test screen crashed on empty flatQuestions.

alter table public.timed_situational_judgement_scenarios enable row level security;

drop policy if exists "public_read" on public.timed_situational_judgement_scenarios;

create policy "public_read"
  on public.timed_situational_judgement_scenarios
  for select
  to anon, authenticated
  using (true);
