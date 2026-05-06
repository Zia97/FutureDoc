-- Allow Supabase Studio Table Editor / SQL editor to edit privileged
-- user_profiles columns again.
--
-- The two existing triggers only bypass for `service_role`, but the
-- Studio Table Editor connects over a direct DB connection as the
-- `postgres` superuser (no JWT). That left is_admin / ai_banned /
-- is_premium silently reverted, and is_suspended / suspended_at /
-- suspension_reason raising an exception.
--
-- This migration adds a `current_user IN ('postgres','supabase_admin')`
-- bypass to both triggers so Studio works while the client-side
-- protections remain in place for anon/authenticated tokens.

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
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION prevent_self_suspension_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR auth.role() = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF (NEW.is_suspended      IS DISTINCT FROM OLD.is_suspended)
  OR (NEW.suspended_at      IS DISTINCT FROM OLD.suspended_at)
  OR (NEW.suspension_reason IS DISTINCT FROM OLD.suspension_reason) THEN
    RAISE EXCEPTION 'suspension fields are admin-only';
  END IF;
  RETURN NEW;
END;
$$;
