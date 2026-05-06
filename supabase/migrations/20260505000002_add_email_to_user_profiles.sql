-- Add an email column to user_profiles so the operator can see who's who
-- without joining auth.users in Supabase Studio.
--
-- Email is sourced from auth.users:
--   - Backfill: copy current values for existing rows.
--   - New users: the on_auth_user_created trigger now writes email at the
--     same time it creates the profile row.
--   - Email changes / verification: a second trigger on auth.users keeps
--     user_profiles.email in sync whenever auth.users.email is updated.
--
-- Anonymous users have no email, so the column is nullable. It's also
-- protected by the existing privileged-columns trigger so end users can't
-- change it from the client (the value is server-driven).

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill for any rows that already exist.
UPDATE user_profiles p
   SET email = u.email
  FROM auth.users u
 WHERE u.id = p.user_id
   AND p.email IS DISTINCT FROM u.email;

-- ── New-user trigger: include email at insert time ────────────────────────
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- ── Sync trigger: keep email up to date when auth.users.email changes ─────
-- Fires on every auth.users update; cheap no-op when email is unchanged.
CREATE OR REPLACE FUNCTION sync_user_profile_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE user_profiles
       SET email = NEW.email
     WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_profile_email();

-- ── Lock email down on the client ─────────────────────────────────────────
-- Add `email` to the privileged-columns trigger so authenticated users
-- can't overwrite it via the REST API. Service role / Studio still can.
CREATE OR REPLACE FUNCTION public.user_profiles_protect_privileged_columns()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR auth.role() = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  NEW.is_premium := OLD.is_premium;
  NEW.is_admin   := OLD.is_admin;
  NEW.ai_banned  := OLD.ai_banned;
  NEW.email      := OLD.email;
  RETURN NEW;
END;
$$;
