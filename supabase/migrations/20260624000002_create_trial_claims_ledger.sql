-- ============================================================
-- Trial abuse guard: trial_claims ledger
--
-- Problem: trial eligibility was tracked only by user_profiles.
-- trial_claimed_at, which is keyed to auth.users and CASCADE-deleted
-- when an account is deleted. A user could delete their account and
-- sign up again to claim the free trial repeatedly, getting unlimited
-- premium access without ever paying.
--
-- Fix: record each claim in this standalone ledger keyed by a salted
-- hash of the user's normalised email. It has NO foreign key to
-- auth.users, so deleting the account does NOT remove the row — the
-- email remains "already claimed" forever.
--
-- We store a salted SHA-256 hash, not the plaintext email, so we don't
-- retain the email addresses of deleted accounts. The same email always
-- hashes to the same value (single shared salt held in the
-- TRIAL_EMAIL_SALT secret), which is what lets us dedupe.
--
-- RLS is enabled with NO policies, so only the service role (the
-- claim-trial edge function) can read or write it.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.trial_claims (
  email_hash TEXT PRIMARY KEY,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.trial_claims IS
  'Lifetime ledger of free-trial claims, keyed by a salted hash of the normalised email. Intentionally has no FK to auth.users so it survives account deletion and blocks delete-and-recreate trial abuse.';

COMMENT ON COLUMN public.trial_claims.email_hash IS
  'SHA-256 of (normalised_email + TRIAL_EMAIL_SALT). Normalisation: lowercase; for gmail/googlemail strip dots in the local part and anything after a +.';

ALTER TABLE public.trial_claims ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (edge function) may touch this table.
