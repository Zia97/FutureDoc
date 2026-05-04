-- User suspension / ban
--
-- Lets the operator block a user from using the app entirely. The client
-- reads is_suspended on launch and renders a SuspendedScreen instead of
-- the normal stack when it's true.
--
-- Columns are admin-only writable: existing security hardening on
-- user_profiles already restricts UPDATE to the row owner via RLS, but the
-- owner cannot lift their own suspension because the trigger below
-- prevents the user from clearing these fields. Only the service role
-- (SQL editor / Supabase Studio / future admin RPC) can flip them.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_suspended       BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS suspended_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspension_reason  TEXT;

CREATE INDEX IF NOT EXISTS idx_user_profiles_is_suspended
  ON user_profiles(is_suspended)
  WHERE is_suspended = TRUE;

-- Prevent users from clearing or setting any suspension field via the
-- client. Only the service role bypasses RLS / triggers, so
-- Supabase Studio remains the single source of truth.
CREATE OR REPLACE FUNCTION prevent_self_suspension_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (NEW.is_suspended      IS DISTINCT FROM OLD.is_suspended)
  OR (NEW.suspended_at      IS DISTINCT FROM OLD.suspended_at)
  OR (NEW.suspension_reason IS DISTINCT FROM OLD.suspension_reason) THEN
    RAISE EXCEPTION 'suspension fields are admin-only';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_suspension_change ON user_profiles;
CREATE TRIGGER trg_prevent_self_suspension_change
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_suspension_change();

-- ── Admin helpers (run from Supabase Studio SQL editor) ────────────────────
-- Suspend a user by email. Pass NULL for reason if you don't want to set one.
--   SELECT admin_suspend_user('badactor@example.com', 'Spamming reports');
CREATE OR REPLACE FUNCTION admin_suspend_user(p_email TEXT, p_reason TEXT DEFAULT NULL)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_row     user_profiles;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'no auth.users row with email %', p_email;
  END IF;

  UPDATE user_profiles
     SET is_suspended      = TRUE,
         suspended_at      = COALESCE(suspended_at, now()),
         suspension_reason = p_reason
   WHERE user_id = v_user_id
   RETURNING * INTO v_row;

  IF v_row IS NULL THEN
    RAISE EXCEPTION 'no user_profiles row for user_id %', v_user_id;
  END IF;
  RETURN v_row;
END;
$$;

-- Lift a suspension by email.
--   SELECT admin_unsuspend_user('user@example.com');
CREATE OR REPLACE FUNCTION admin_unsuspend_user(p_email TEXT)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_row     user_profiles;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'no auth.users row with email %', p_email;
  END IF;

  UPDATE user_profiles
     SET is_suspended      = FALSE,
         suspended_at      = NULL,
         suspension_reason = NULL
   WHERE user_id = v_user_id
   RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Limit who can call the admin helpers. service_role only.
REVOKE ALL ON FUNCTION admin_suspend_user(TEXT, TEXT)   FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_unsuspend_user(TEXT)       FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_suspend_user(TEXT, TEXT)   FROM authenticated, anon;
REVOKE ALL ON FUNCTION admin_unsuspend_user(TEXT)       FROM authenticated, anon;
GRANT EXECUTE ON FUNCTION admin_suspend_user(TEXT, TEXT)   TO service_role;
GRANT EXECUTE ON FUNCTION admin_unsuspend_user(TEXT)       TO service_role;
