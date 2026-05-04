-- submit_support_message RPC.
--
-- Direct INSERTs from the client kept failing (42501 — permission denied)
-- regardless of RLS state and table grants in this project. Rather than
-- chase the underlying role-mapping issue, we route writes through a
-- SECURITY DEFINER function: it runs as the function owner (postgres),
-- which always has INSERT on public.support_messages, and we only need
-- to grant EXECUTE on the function to anon + authenticated.
--
-- The function records the calling user's id and email from auth.uid()
-- on the server side, so the client cannot spoof someone else's user_id.

CREATE OR REPLACE FUNCTION public.submit_support_message(
  p_subject       TEXT,
  p_message       TEXT,
  p_display_name  TEXT  DEFAULT NULL,
  p_platform      TEXT  DEFAULT NULL,
  p_app_version   TEXT  DEFAULT NULL,
  p_is_premium    BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid          UUID;
  v_email        TEXT;
  v_is_anonymous BOOLEAN;
  v_subject      TEXT := nullif(btrim(p_subject), '');
  v_message      TEXT := nullif(btrim(p_message), '');
  v_id           UUID;
BEGIN
  IF v_subject IS NULL THEN
    RAISE EXCEPTION 'subject_required' USING ERRCODE = '22023';
  END IF;
  IF v_message IS NULL THEN
    RAISE EXCEPTION 'message_required' USING ERRCODE = '22023';
  END IF;
  IF char_length(v_message) > 4000 THEN
    RAISE EXCEPTION 'message_too_long' USING ERRCODE = '22023';
  END IF;

  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_signed_in' USING ERRCODE = '28000';
  END IF;

  -- Pull the caller's email + anonymous flag straight from auth.users so
  -- the client cannot lie about who they are.
  SELECT u.email,
         COALESCE(u.is_anonymous, FALSE)
    INTO v_email, v_is_anonymous
    FROM auth.users u
   WHERE u.id = v_uid;

  INSERT INTO public.support_messages (
    user_id, user_email, display_name,
    subject, message,
    platform, app_version,
    is_premium, is_anonymous
  ) VALUES (
    v_uid, v_email, p_display_name,
    left(v_subject, 200), v_message,
    p_platform, p_app_version,
    COALESCE(p_is_premium, FALSE), v_is_anonymous
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_support_message(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_support_message(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated, anon;

NOTIFY pgrst, 'reload schema';
