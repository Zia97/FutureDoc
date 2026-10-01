-- Support messages
--
-- Persists every in-app "Contact Support" submission. The client inserts
-- a row directly (RLS allows authenticated + anon inserts), then invokes
-- the `send-support-email` edge function which forwards the message to
-- the support inbox via Resend. The DB row is the source of truth — even
-- if the email send fails the message is preserved and visible via the
-- Supabase Studio table editor.

CREATE TABLE IF NOT EXISTS support_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reporter. Nullable so we never lose the message if the user deletes
  -- their account. user_email is captured at submission time too, so
  -- we still know who to reply to even after deletion.
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email      TEXT,
  display_name    TEXT,

  -- Message body
  subject         TEXT NOT NULL,
  message         TEXT NOT NULL,

  -- Triage workflow
  status          TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'reviewing', 'resolved', 'dismissed')),
  reviewed_at     TIMESTAMPTZ,
  reviewer_notes  TEXT,

  -- Email delivery audit (set by the edge function)
  email_sent_at   TIMESTAMPTZ,
  email_error     TEXT,

  -- Debugging context
  platform        TEXT,
  app_version     TEXT,
  is_premium      BOOLEAN,
  is_anonymous    BOOLEAN,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_user_id    ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_status     ON support_messages(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at DESC);

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (signed-in or anonymous) can submit a support message. If they're
-- signed in, the user_id on the row must match auth.uid().
DROP POLICY IF EXISTS "anyone_can_submit_support" ON support_messages;
CREATE POLICY "anyone_can_submit_support"
  ON support_messages
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- No SELECT/UPDATE/DELETE policies → service role only. Read messages via
-- the Supabase Studio table editor.

-- ── Triage view (with reporter contact info) ───────────────────────────────
CREATE OR REPLACE VIEW support_messages_with_user AS
SELECT
  m.id,
  m.created_at,
  m.status,
  m.subject,
  m.message,
  m.reviewer_notes,
  m.reviewed_at,
  m.email_sent_at,
  m.email_error,
  m.platform,
  m.app_version,
  m.is_premium,
  m.is_anonymous,
  m.display_name,
  COALESCE(m.user_email, u.email) AS user_email,
  m.user_id,
  u.last_sign_in_at  AS user_last_sign_in,
  u.created_at       AS user_signed_up_at
FROM support_messages m
LEFT JOIN auth.users u ON u.id = m.user_id
ORDER BY m.created_at DESC;
