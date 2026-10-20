-- Remember the introduction per assessment and account, including across
-- devices. Deleting coaching sessions also clears the introduction on reset.
alter table public.coach_profiles
  add column plan_intro_session_id uuid references public.coach_sessions(id) on delete set null;
