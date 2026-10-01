-- ============================================================
-- Account deletion: delete_user_account RPC
--
-- Deleting the row in auth.users cascades to every user-owned
-- table (user_profiles, user_ai_usage, user_ai_context, all
-- *_progress / *_attempts / *_answers tables), since each
-- declares REFERENCES auth.users(id) ON DELETE CASCADE.
--
-- Exceptions before this migration:
--   ai_tutor_logs          — had no ON DELETE action, which
--                            would block auth.users deletion.
--                            Altered below to cascade.
--   question_reports       — ON DELETE SET NULL (intentional:
--                            keep the report row for moderation,
--                            anonymise the submitter).
-- ============================================================

ALTER TABLE ai_tutor_logs
  DROP CONSTRAINT ai_tutor_logs_user_id_fkey;

ALTER TABLE ai_tutor_logs
  ADD CONSTRAINT ai_tutor_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
