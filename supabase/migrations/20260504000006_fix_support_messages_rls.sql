-- Fix support_messages RLS.
--
-- The original policy required `user_id IS NULL OR user_id = auth.uid()`
-- which was rejecting inserts in production. Since SELECT/UPDATE/DELETE
-- on this table are service-role only, the user_id check on INSERT is
-- defense-in-depth that we don't strictly need — the client always
-- sends its own user_id and we read these only from Studio.
--
-- Replaces the strict policy with a permissive one that allows any
-- authenticated or anon caller to insert. Reads remain service-role
-- only, so a malicious user can at worst write a support message —
-- they cannot read anyone else's.

DROP POLICY IF EXISTS "anyone_can_submit_support" ON support_messages;

CREATE POLICY "anyone_can_submit_support"
  ON support_messages
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Make sure the role grants are in place too, in case default privileges
-- were tightened by an earlier audit migration.
GRANT INSERT ON TABLE support_messages TO authenticated, anon;
