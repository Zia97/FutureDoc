set lock_timeout = '3s';
set statement_timeout = '60s';
-- Storage creation has its own quota, separate from attachment registration.
alter table public.forum_rate_limit_events drop constraint forum_rate_limit_events_action_check;
alter table public.forum_rate_limit_events add constraint forum_rate_limit_events_action_check
  check(action in ('post','reply','report','upload','storage_upload'));
