-- Reviewed metadata is released separately from the original question bank.
-- The edge function reads it with service role; clients get only the report
-- their verified entitlement allows. No student answers are stored here.
CREATE TABLE public.performance_skills (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL CHECK (section IN ('vr', 'dm', 'qr', 'sj')),
  metadata JSONB NOT NULL CHECK (jsonb_typeof(metadata) = 'object'),
  UNIQUE (id, section)
);
CREATE TABLE public.performance_question_tags (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL CHECK (section IN ('vr', 'dm', 'qr', 'sj')),
  mode TEXT NOT NULL CHECK (mode IN ('practice', 'timed')),
  question_id UUID NOT NULL,
  primary_skill_id TEXT NOT NULL,
  metadata JSONB NOT NULL CHECK (jsonb_typeof(metadata) = 'object'),
  taxonomy_version INTEGER NOT NULL DEFAULT 1,
  corpus_run_id TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (section, mode, question_id),
  FOREIGN KEY (primary_skill_id, section) REFERENCES public.performance_skills(id, section),
  CHECK (metadata->>'primarySkillId' = primary_skill_id)
);
CREATE INDEX performance_tags_parent ON public.performance_question_tags(section, mode, (metadata->>'parentId'));
ALTER TABLE public.performance_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_question_tags ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.performance_skills, public.performance_question_tags FROM anon, authenticated;
GRANT ALL ON public.performance_skills, public.performance_question_tags TO service_role;

-- Once source content changes, old labels/answer metadata must not continue
-- diagnosing students. Re-review and the next metadata upsert clear this flag.
CREATE FUNCTION public.invalidate_performance_question_tags()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  ref_id UUID;
BEGIN
  IF TG_OP = 'UPDATE' AND to_jsonb(OLD) = to_jsonb(NEW) THEN RETURN NEW; END IF;
  IF TG_ARGV[2] = 'child' THEN
    ref_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.question_id ELSE NEW.question_id END;
  ELSE
    ref_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END;
  END IF;
  UPDATE public.performance_question_tags
    SET metadata = jsonb_set(metadata, '{excludedReason}', '"Source content changed; metadata requires review."'::jsonb)
    WHERE section = TG_ARGV[0] AND mode = TG_ARGV[1]
      AND (CASE WHEN TG_ARGV[2] = 'parent' THEN metadata->>'parentId' = ref_id::text ELSE question_id = ref_id END);
  IF TG_OP = 'UPDATE' AND TG_ARGV[2] = 'child' THEN
    IF OLD.question_id IS DISTINCT FROM NEW.question_id THEN
      UPDATE public.performance_question_tags
      SET metadata = jsonb_set(metadata, '{excludedReason}', '"Source content changed; metadata requires review."'::jsonb)
      WHERE section = TG_ARGV[0] AND mode = TG_ARGV[1] AND question_id = OLD.question_id;
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.invalidate_performance_question_tags() FROM PUBLIC;

DO $$
DECLARE
  entry RECORD;
BEGIN
  FOR entry IN SELECT * FROM (VALUES
    ('vr','practice','verbal_reasoning_questions','question'),
    ('vr','timed','timed_verbal_reasoning_questions','question'),
    ('dm','practice','decision_making_questions','question'),
    ('dm','timed','timed_decision_making_questions','question'),
    ('qr','practice','quantitative_reasoning_questions','question'),
    ('qr','timed','timed_quantitative_reasoning_questions','question'),
    ('sj','practice','situational_judgement_questions','question'),
    ('sj','timed','timed_situational_judgement_questions','question'),
    ('vr','practice','verbal_reasoning_passages','parent'),
    ('vr','timed','timed_verbal_reasoning_passages','parent'),
    ('qr','practice','quantitative_reasoning_sets','parent'),
    ('qr','timed','timed_quantitative_reasoning_sets','parent'),
    ('sj','practice','situational_judgement_scenarios','parent'),
    ('sj','timed','timed_situational_judgement_scenarios','parent'),
    ('dm','practice','decision_making_question_options','child'),
    ('dm','practice','decision_making_question_statements','child'),
    ('dm','timed','timed_decision_making_question_options','child'),
    ('dm','timed','timed_decision_making_question_statements','child')
  ) AS sources(section, mode, table_name, kind)
  LOOP
    EXECUTE format('CREATE TRIGGER invalidate_performance_tags AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.invalidate_performance_question_tags(%L,%L,%L)', entry.table_name, entry.section, entry.mode, entry.kind);
  END LOOP;
END;
$$;
