-- Bump non-timed practice content versions to invalidate the local content cache
-- so clients refetch with the new free-first ordering applied in dbQueries.js.
UPDATE content_versions
SET version = version + 1, updated_at = now()
WHERE section IN (
  'verbal_reasoning',
  'decision_making',
  'quantitative_reasoning',
  'situational_judgement'
);
