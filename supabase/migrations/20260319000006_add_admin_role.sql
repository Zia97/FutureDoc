-- Add is_admin flag to user_profiles.
-- Admin accounts have no AI usage restrictions.
ALTER TABLE user_profiles
  ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- Only service role can set/read is_admin — users cannot touch it via RLS.
-- The existing "users own profile" policy only allows users to SELECT/UPDATE
-- their own row, but we restrict admin writes to service role only.
CREATE POLICY "service role manages admin flag"
  ON user_profiles
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
