-- Add display_name to user_profiles. Nullable in DB so OAuth users can be
-- created by the auth trigger before they pick a name; the app gates on this
-- field being non-null before letting the user into the main flow.
ALTER TABLE user_profiles
  ADD COLUMN display_name TEXT;
