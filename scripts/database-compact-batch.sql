set statement_timeout = '10s';
set lock_timeout = '2s';
select public.compact_evidence_batch(200) as compacted;
