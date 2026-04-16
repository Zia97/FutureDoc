-- Auto-bump content_versions whenever practice or timed content is modified.
-- This ensures users get fresh data without manual version bumps.

-- ─────────────────────────────────────────────────────────────────────────────
-- Generic bump function (reusable across all sections)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION bump_content_version()
RETURNS trigger AS $$
BEGIN
  UPDATE content_versions
  SET version = version + 1, updated_at = now()
  WHERE section = TG_ARGV[0];
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- Practice sections
-- ─────────────────────────────────────────────────────────────────────────────

-- Verbal Reasoning
CREATE TRIGGER trg_bump_vr_passages
AFTER INSERT OR UPDATE OR DELETE ON verbal_reasoning_passages
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('verbal_reasoning');

CREATE TRIGGER trg_bump_vr_questions
AFTER INSERT OR UPDATE OR DELETE ON verbal_reasoning_questions
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('verbal_reasoning');

-- Decision Making
CREATE TRIGGER trg_bump_dm_questions
AFTER INSERT OR UPDATE OR DELETE ON decision_making_questions
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('decision_making');

CREATE TRIGGER trg_bump_dm_options
AFTER INSERT OR UPDATE OR DELETE ON decision_making_question_options
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('decision_making');

CREATE TRIGGER trg_bump_dm_statements
AFTER INSERT OR UPDATE OR DELETE ON decision_making_question_statements
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('decision_making');

-- Quantitative Reasoning
CREATE TRIGGER trg_bump_qr_sets
AFTER INSERT OR UPDATE OR DELETE ON quantitative_reasoning_sets
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('quantitative_reasoning');

CREATE TRIGGER trg_bump_qr_questions
AFTER INSERT OR UPDATE OR DELETE ON quantitative_reasoning_questions
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('quantitative_reasoning');

-- Situational Judgement
CREATE TRIGGER trg_bump_sj_scenarios
AFTER INSERT OR UPDATE OR DELETE ON situational_judgement_scenarios
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('situational_judgement');

CREATE TRIGGER trg_bump_sj_questions
AFTER INSERT OR UPDATE OR DELETE ON situational_judgement_questions
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('situational_judgement');

-- ─────────────────────────────────────────────────────────────────────────────
-- Timed sections
-- ─────────────────────────────────────────────────────────────────────────────

-- Timed VR
CREATE TRIGGER trg_bump_timed_vr_tests
AFTER INSERT OR UPDATE OR DELETE ON timed_verbal_reasoning_tests
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_verbal_reasoning');

CREATE TRIGGER trg_bump_timed_vr_passages
AFTER INSERT OR UPDATE OR DELETE ON timed_verbal_reasoning_passages
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_verbal_reasoning');

CREATE TRIGGER trg_bump_timed_vr_questions
AFTER INSERT OR UPDATE OR DELETE ON timed_verbal_reasoning_questions
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_verbal_reasoning');

-- Timed DM
CREATE TRIGGER trg_bump_timed_dm_tests
AFTER INSERT OR UPDATE OR DELETE ON timed_decision_making_tests
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_decision_making');

CREATE TRIGGER trg_bump_timed_dm_questions
AFTER INSERT OR UPDATE OR DELETE ON timed_decision_making_questions
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_decision_making');

CREATE TRIGGER trg_bump_timed_dm_options
AFTER INSERT OR UPDATE OR DELETE ON timed_decision_making_question_options
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_decision_making');

CREATE TRIGGER trg_bump_timed_dm_statements
AFTER INSERT OR UPDATE OR DELETE ON timed_decision_making_question_statements
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_decision_making');

-- Timed QR
CREATE TRIGGER trg_bump_timed_qr_tests
AFTER INSERT OR UPDATE OR DELETE ON timed_quantitative_reasoning_tests
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_quantitative_reasoning');

CREATE TRIGGER trg_bump_timed_qr_sets
AFTER INSERT OR UPDATE OR DELETE ON timed_quantitative_reasoning_sets
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_quantitative_reasoning');

CREATE TRIGGER trg_bump_timed_qr_questions
AFTER INSERT OR UPDATE OR DELETE ON timed_quantitative_reasoning_questions
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_quantitative_reasoning');

-- Timed SJ
CREATE TRIGGER trg_bump_timed_sj_tests
AFTER INSERT OR UPDATE OR DELETE ON timed_situational_judgement_tests
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_situational_judgement');

CREATE TRIGGER trg_bump_timed_sj_scenarios
AFTER INSERT OR UPDATE OR DELETE ON timed_situational_judgement_scenarios
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_situational_judgement');

CREATE TRIGGER trg_bump_timed_sj_questions
AFTER INSERT OR UPDATE OR DELETE ON timed_situational_judgement_questions
FOR EACH STATEMENT EXECUTE FUNCTION bump_content_version('timed_situational_judgement');
