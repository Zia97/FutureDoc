-- Clarify that this SJT importance item asks about disclosing a financial interest.
-- Keep the existing question ID, answer, placement, and student attempt history.
-- The existing question UPDATE trigger increments the practice SJT content version.
BEGIN;
DO $revision$
DECLARE
  previous_version integer;
  changed integer;
BEGIN
  SELECT version INTO STRICT previous_version FROM public.content_versions
  WHERE section = 'situational_judgement' FOR UPDATE;

  UPDATE public.situational_judgement_questions AS q
  SET question_text = 'How important is it for Dr Byrne to disclose his financial connection with the private centre to the patient when discussing treatment options?',
      answer_reason = 'It is very important for Dr Byrne to disclose his paid work for the private centre so the patient can assess his advice with knowledge of this potential conflict of interest. GMC guidance requires doctors to be open about financial interests that could affect, or be seen to affect, their advice. Disclosure supports an informed choice between the NHS and private options. His clinical recommendation must remain based on the patient''s needs and must not be influenced by personal financial gain.'
  WHERE q.id = 'c6830a34-70b1-4944-9b42-d4f645f6b0fa'::uuid
    AND to_jsonb(q) = '{"id":"c6830a34-70b1-4944-9b42-d4f645f6b0fa","label_set":1,"created_at":"2026-09-29T22:09:45.471524+00:00","difficulty":"normal","order_index":0,"scenario_id":"1be908f0-fc43-4b8f-a67a-ba7280bcb64a","answer_reason":"The fee creates an interest that could affect, or appear to affect, his recommendation, so openness is central to an informed choice. It is very important rather than just important because the patient is directly asking whether the paid option is needed and must be able to judge the advice in light of that interest.","question_text":"How important is Dr Byrne''s financial connection with the private centre when he advises the patient?","correct_answer":"Very important"}'::jsonb;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Dr Byrne question changed or is missing; review current content before release';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.content_versions
    WHERE section = 'situational_judgement' AND version > previous_version) THEN
    RAISE EXCEPTION 'SJT content version did not increment; rolling back correction';
  END IF;

  -- The source-change trigger excludes tags until review. This revision has been
  -- independently reviewed and retains its existing skill classification.
  UPDATE public.performance_question_tags
  SET metadata = jsonb_set(jsonb_set(
        CASE WHEN metadata->>'excludedReason' = 'Source content changed; metadata requires review.'
             THEN metadata - 'excludedReason' ELSE metadata END,
        '{rationale}', '"Tests disclosure of financial conflicts of interest when discussing treatment options with a patient."'::jsonb),
        '{contentHash}', '"aabe656f4ea92f5c1c7bd9539941a9729d74a5715d120ba20df6f58907964c9d"'::jsonb),
      reviewed_at = now()
  WHERE section = 'sj' AND mode = 'practice'
    AND question_id = 'c6830a34-70b1-4944-9b42-d4f645f6b0fa'::uuid;
END;
$revision$;
COMMIT;
