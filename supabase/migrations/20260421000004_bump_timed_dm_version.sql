-- Force a content_versions bump for timed DM so clients with stale
-- AsyncStorage caches (saved pre-bake) refetch and pick up venn_geometry.
UPDATE content_versions
SET version = version + 1, updated_at = now()
WHERE section = 'timed_decision_making';
