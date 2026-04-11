-- Bump the timed QR content version so all client caches re-fetch.
--
-- Background: src/hooks/queries/useTimedQRTests.js mapDBTests() previously
-- used s.set_ref (the human-readable text label like "qr1-set-01") as the
-- client-side setId. The DB column timed_quantitative_reasoning_question_answers.set_id
-- is a UUID FK to timed_quantitative_reasoning_sets.id, so any submission
-- using set_ref was rejected with `22P02 invalid input syntax for type uuid`
-- and silently queued in the offline retry queue forever.
--
-- The mapping is now fixed to use s.id (the UUID). Bumping the content
-- version forces clients with stale caches to re-fetch the test data with
-- the corrected mapping.

UPDATE content_versions
   SET version    = version + 1,
       updated_at = now()
 WHERE section = 'timed_quantitative_reasoning';
