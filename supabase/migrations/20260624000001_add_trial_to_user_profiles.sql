-- ============================================================
-- Free trial tracking
--
-- Adds trial_claimed_at to user_profiles so we can enforce
-- one trial per user. The claim-trial edge function stamps this
-- via service role after calling the RevenueCat promotional
-- entitlement API.  The protect trigger is extended to prevent
-- the client from resetting or spoofing the column.
-- ============================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS trial_claimed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.user_profiles.trial_claimed_at IS
  'Timestamp when the user claimed their free trial via the claim-trial edge function. NULL = not yet claimed. Non-null = trial used (one per lifetime).';

-- Extend the protect trigger to freeze trial_claimed_at for
-- non-service-role writers (same allow-list as the existing columns).
CREATE OR REPLACE FUNCTION public.user_profiles_protect_privileged_columns()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR auth.role() = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  NEW.is_premium         := OLD.is_premium;
  NEW.is_admin           := OLD.is_admin;
  NEW.ai_banned          := OLD.ai_banned;
  NEW.email              := OLD.email;
  NEW.premium_expires_at := OLD.premium_expires_at;
  NEW.premium_product_id := OLD.premium_product_id;
  NEW.premium_store      := OLD.premium_store;
  NEW.premium_event_at   := OLD.premium_event_at;
  NEW.rc_app_user_id     := OLD.rc_app_user_id;
  NEW.trial_claimed_at   := OLD.trial_claimed_at;
  RETURN NEW;
END;
$$;
