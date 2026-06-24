-- ============================================================
-- RevenueCat → Supabase premium sync (server-authoritative)
--
-- Background: is_premium was previously written from the client
-- in SubscriptionContext.js. That write is silently reverted by
-- user_profiles_protect_privileged_columns (the client connects
-- as `authenticated`, not service_role), so the flag never stuck
-- — premium content RLS and the AI-tutor cap kept treating
-- genuine subscribers as free users.
--
-- Fix: the `revenuecat-webhook` edge function (service role)
-- becomes the single source of truth for is_premium. It maps a
-- RevenueCat App User ID → user_profiles.user_id (the app calls
-- Purchases.logIn(user.id), so they're equal) and stamps the
-- columns added below.
--
-- This migration:
--   1. Adds operator-visibility columns to user_profiles.
--   2. Extends the privileged-columns trigger to freeze them on
--      the client (only service_role / Studio may write them).
-- ============================================================

-- ─── 1: Visibility columns ───────────────────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS premium_expires_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS premium_product_id  TEXT,
  ADD COLUMN IF NOT EXISTS premium_store       TEXT,
  ADD COLUMN IF NOT EXISTS premium_event_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rc_app_user_id      TEXT;

COMMENT ON COLUMN public.user_profiles.premium_expires_at IS
  'Subscription expiry from the latest RevenueCat event (NULL for lifetime / non-expiring).';
COMMENT ON COLUMN public.user_profiles.premium_product_id IS
  'RevenueCat product_id from the latest event, e.g. ucat_genius_pro_3m.';
COMMENT ON COLUMN public.user_profiles.premium_store IS
  'Store from the latest event: APP_STORE / PLAY_STORE / STRIPE / etc.';
COMMENT ON COLUMN public.user_profiles.premium_event_at IS
  'When the webhook last updated this row (event_timestamp_ms).';
COMMENT ON COLUMN public.user_profiles.rc_app_user_id IS
  'RevenueCat App User ID that matched this profile (normally == user_id).';

-- ─── 2: Freeze the new columns on the client ─────────────────
-- Same allow-list as before (service_role / postgres / supabase_admin),
-- now also reverting the premium_* columns for end-user writes.
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
  RETURN NEW;
END;
$$;
