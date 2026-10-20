set lock_timeout = '3s';
set statement_timeout = '60s';

-- Bound user-supplied telemetry even for older apps which insert directly.
alter table public.practice_question_attempts add constraint practice_payload_bounds
  check(length(selected_answer)<=4000 and length(platform)<=40 and length(app_version)<=80) not valid;
-- NOT VALID avoids a blocking historic scan; the bound applies to new writes.

-- Legacy and v2 submissions take the same lock when different device versions
-- submit a retake concurrently.
do $$
declare section text; signature regprocedure; definition text;
begin
  foreach section in array array['vr','dm','qr','sj'] loop
    signature := to_regprocedure('public.submit_timed_'||section||'_exam(smallint,smallint,smallint,integer,jsonb,jsonb,jsonb)');
    select pg_get_functiondef(signature) into definition;
    definition := replace(definition, E'BEGIN\n', E'BEGIN\n  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text || '':timed-submit'',0));\n');
    execute definition;
  end loop;
end $$;
