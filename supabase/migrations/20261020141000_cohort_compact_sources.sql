set lock_timeout = '3s';
set statement_timeout = '60s';

-- Avoid reconstructing the entire JSON snapshot for every JSON field referenced
-- by the aggregate query. The compatibility view remains for API consumers.
do $$
declare definition text;
begin
  select pg_get_functiondef('public.refresh_performance_cohort()'::regprocedure) into definition;
  if position('FROM public.coach_evidence e' in definition)=0 then
    raise exception 'unexpected_cohort_definition';
  end if;
  definition := replace(definition,'e.payload->''tag''','e.snapshot');
  definition := replace(definition,'FROM public.coach_evidence e',
    'FROM (SELECT r.id,r.user_id,r.payload,
      CASE WHEN t.id IS NULL THEN r.payload->''tag'' ELSE t.payload END AS snapshot
      FROM public.coach_evidence_records r LEFT JOIN public.coach_evidence_tags t ON t.id=r.tag_id) e');
  execute definition;
end $$;
