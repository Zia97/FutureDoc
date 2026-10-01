-- AI tutor v2 observability and learner-memory fields.
-- Existing rows remain valid; new fields are populated by the upgraded Edge Function.

ALTER TABLE public.ai_tutor_logs
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS response_id TEXT,
  ADD COLUMN IF NOT EXISTS assistant_response TEXT,
  ADD COLUMN IF NOT EXISTS teaching_skill TEXT,
  ADD COLUMN IF NOT EXISTS misconception TEXT,
  ADD COLUMN IF NOT EXISTS record_status TEXT,
  ADD COLUMN IF NOT EXISTS record_concern TEXT,
  ADD COLUMN IF NOT EXISTS input_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS cached_input_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS cache_write_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS output_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS reasoning_tokens INTEGER,
  ADD COLUMN IF NOT EXISTS estimated_cost_usd NUMERIC(12, 8),
  ADD COLUMN IF NOT EXISTS latency_ms INTEGER,
  ADD COLUMN IF NOT EXISTS tool_calls INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prompt_version TEXT,
  ADD COLUMN IF NOT EXISTS success BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS error_code TEXT,
  ADD COLUMN IF NOT EXISTS feedback TEXT,
  ADD COLUMN IF NOT EXISTS feedback_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ai_tutor_logs_record_status_check'
  ) THEN
    ALTER TABLE public.ai_tutor_logs
      ADD CONSTRAINT ai_tutor_logs_record_status_check
      CHECK (record_status IS NULL OR record_status IN ('consistent', 'possible_error'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ai_tutor_logs_feedback_check'
  ) THEN
    ALTER TABLE public.ai_tutor_logs
      ADD CONSTRAINT ai_tutor_logs_feedback_check
      CHECK (feedback IS NULL OR feedback IN ('helpful', 'not_helpful'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_tutor_logs_model_created
  ON public.ai_tutor_logs (model, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_tutor_logs_possible_errors
  ON public.ai_tutor_logs (created_at DESC)
  WHERE record_status = 'possible_error';

ALTER TABLE public.user_ai_context
  ADD COLUMN IF NOT EXISTS misconceptions JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_ai_context.misconceptions IS
  'Model-labelled misconception counts used to personalise future tutor explanations.';

-- Atomically record both the broad help topic and the more useful model-labelled
-- misconception. This avoids lost updates when a student opens two tutor calls
-- close together.
CREATE OR REPLACE FUNCTION public.record_ai_tutor_insight(
  p_user_id UUID,
  p_question_type TEXT,
  p_misconception TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_question_type TEXT := NULLIF(LEFT(TRIM(p_question_type), 80), '');
  v_misconception TEXT := NULLIF(LEFT(TRIM(p_misconception), 120), '');
BEGIN
  IF v_question_type IS NULL THEN
    v_question_type := 'unspecified';
  END IF;

  INSERT INTO public.user_ai_context (
    user_id,
    struggles,
    misconceptions,
    updated_at
  )
  VALUES (
    p_user_id,
    jsonb_build_object(v_question_type, 1),
    CASE
      WHEN v_misconception IS NULL THEN '{}'::jsonb
      ELSE jsonb_build_object(v_misconception, 1)
    END,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET struggles = jsonb_set(
        COALESCE(user_ai_context.struggles, '{}'::jsonb),
        ARRAY[v_question_type],
        to_jsonb(COALESCE((user_ai_context.struggles ->> v_question_type)::INTEGER, 0) + 1),
        true
      ),
      misconceptions = CASE
        WHEN v_misconception IS NULL THEN COALESCE(user_ai_context.misconceptions, '{}'::jsonb)
        ELSE jsonb_set(
          COALESCE(user_ai_context.misconceptions, '{}'::jsonb),
          ARRAY[v_misconception],
          to_jsonb(COALESCE((user_ai_context.misconceptions ->> v_misconception)::INTEGER, 0) + 1),
          true
        )
      END,
      updated_at = NOW();
END;
$$;

REVOKE ALL ON FUNCTION public.record_ai_tutor_insight(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_ai_tutor_insight(UUID, TEXT, TEXT) TO service_role;
