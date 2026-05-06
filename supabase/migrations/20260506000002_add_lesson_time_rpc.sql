-- Race-safe accumulator for lesson_progress.time_spent_seconds.
--
-- The client emits heartbeat deltas (15s while foregrounded) plus a final
-- delta on lesson completion. Doing the increment client-side via a
-- read-modify-write pattern races (e.g. a heartbeat firing while the user
-- taps "complete"), so we centralise the bump in a SECURITY DEFINER RPC
-- that updates atomically and gates on auth.uid().
--
-- p_complete = true sets completed_at to now() unless already non-null
-- (so re-completing a lesson keeps the original completion timestamp).
-- last_seen_at is always bumped to now().

CREATE OR REPLACE FUNCTION bump_lesson_time(
  p_lesson_id      TEXT,
  p_delta_seconds  INTEGER,
  p_complete       BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_delta INTEGER := GREATEST(COALESCE(p_delta_seconds, 0), 0);
BEGIN
  IF v_uid IS NULL THEN
    RETURN;
  END IF;

  UPDATE lesson_progress
     SET time_spent_seconds = time_spent_seconds + v_delta,
         last_seen_at       = now(),
         completed_at       = CASE
                                WHEN p_complete THEN COALESCE(completed_at, now())
                                ELSE completed_at
                              END
   WHERE user_id   = v_uid
     AND lesson_id = p_lesson_id;
END;
$$;

REVOKE ALL ON FUNCTION bump_lesson_time(TEXT, INTEGER, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION bump_lesson_time(TEXT, INTEGER, BOOLEAN) TO authenticated;
