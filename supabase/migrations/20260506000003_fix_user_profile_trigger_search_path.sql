-- Fix "relation user_profiles does not exist" on Google OAuth sign-up.
--
-- The new-user trigger fires from auth.users. SECURITY DEFINER functions
-- inherit the definer's search_path, which on hosted Supabase does not
-- include `public` for triggers attached to auth.users — so an unqualified
-- reference to `user_profiles` fails to resolve.
--
-- Pin search_path on both auth-side trigger functions and schema-qualify
-- their table references.

CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_user_profile_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.user_profiles
       SET email = NEW.email
     WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
