-- Create timed_situational_judgement_tests table.
-- DM and VR both have equivalent parent test tables; SJ was missing one.
-- test_id on scenarios and exam_attempts was a bare SMALLINT with no FK —
-- this migration adds the parent table, seeds existing tests, and adds the FKs.

CREATE TABLE timed_situational_judgement_tests (
  id            SMALLINT    PRIMARY KEY,
  title         TEXT        NOT NULL,
  time_minutes  SMALLINT    NOT NULL DEFAULT 26,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE timed_situational_judgement_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read timed sj tests"
  ON timed_situational_judgement_tests FOR SELECT
  TO authenticated
  USING (true);

-- Seed the 4 existing tests (all 26 minutes — UCAT SJ standard)
INSERT INTO timed_situational_judgement_tests (id, title, time_minutes) VALUES
  (1, 'SJ Timed Test 1', 26),
  (2, 'SJ Timed Test 2', 26),
  (3, 'SJ Timed Test 3', 26),
  (4, 'SJ Timed Test 4', 26);

-- Add FK from scenarios to the new parent table
ALTER TABLE timed_situational_judgement_scenarios
  ADD CONSTRAINT fk_timed_sj_scenarios_test
  FOREIGN KEY (test_id) REFERENCES timed_situational_judgement_tests(id);

-- Add FK from exam attempts to the new parent table
ALTER TABLE timed_situational_judgement_exam_attempts
  ADD CONSTRAINT fk_timed_sj_exam_attempts_test
  FOREIGN KEY (test_id) REFERENCES timed_situational_judgement_tests(id);
