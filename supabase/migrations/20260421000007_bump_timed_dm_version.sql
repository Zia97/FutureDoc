-- Force a content_versions bump for timed DM so clients refetch and pick up
-- the new venn questions + geometry for tests 3 and 4.
UPDATE content_versions
SET version = version + 1, updated_at = now()
WHERE section = 'timed_decision_making';
