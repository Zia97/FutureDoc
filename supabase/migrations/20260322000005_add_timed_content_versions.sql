-- Add version tracking rows for the four timed practice sections.
-- IMPORTANT: To push content updates to users, increment the version number:
--   UPDATE content_versions SET version = version + 1, updated_at = now()
--   WHERE section = 'timed_situational_judgement';
--
-- Always UPDATE existing questions in-place (never DELETE + re-INSERT).
-- Question IDs are the keys used to preserve user answers across content updates.

INSERT INTO content_versions (section, version) VALUES
  ('timed_verbal_reasoning', 1),
  ('timed_decision_making', 1),
  ('timed_quantitative_reasoning', 1),
  ('timed_situational_judgement', 1);
