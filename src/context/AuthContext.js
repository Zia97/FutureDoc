import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { clearLocalUserData } from '../services/localUserData';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

// A user is "usable" (session-ready) if they have a session at all.
// Anonymous users have no email; real users must have a verified email
// before we treat them as signed in (prevents unverified-email bypass).
const isUsable = (u) => {
  if (!u) return false;
  if (u.is_anonymous) return true;
  return !!u.email_confirmed_at;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    // Anonymous-by-default: if there's no session on startup, silently create
    // an anonymous one so the app always lands on Home with a usable user.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (isUsable(session?.user)) {
        setUser(session.user);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error) setUser(isUsable(data?.user) ? data.user : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error) setUser(isUsable(data?.user) ? data.user : null);
        return;
      }
      setUser(isUsable(session?.user) ? session.user : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle OAuth deep link callback — covers the case where Android kills
  // the app while the browser is open and relaunches it via the deep link.
  useEffect(() => {
    const handleUrl = async ({ url }) => {
      if (url.includes('auth/callback')) {
        const hash = url.split('#')[1];
        if (hash) {
          const params = new URLSearchParams(hash);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          const type = params.get('type');

          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }

          // Email verification — session is set, user is now confirmed
          if (type === 'signup') {
            // Session already set above, user will be logged in automatically
          }

          // Password recovery — session is set, user can now call updateUser
          if (type === 'recovery') {
            setPasswordRecovery(true);
          }
        }
        const { data: { session } } = await supabase.auth.getSession();
        setUser(isUsable(session?.user) ? session.user : null);
      }
    };

    // App was running in background when deep link fired
    const subscription = Linking.addEventListener('url', handleUrl);

    // App was killed and restarted by the deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, []);

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password });

  const signInAnonymously = () => supabase.auth.signInAnonymously();

  // Upgrades the current anonymous user into a real account. Preserves user_id,
  // so AI usage count, struggles, and progress all carry over.
  const linkAccount = (email, password) =>
    supabase.auth.updateUser({ email, password });

  const signIn = async (email, password) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) return result;
    const u = result.data?.user;
    if (u && !u.is_anonymous && !u.email_confirmed_at) {
      await supabase.auth.signOut();
      return {
        data: null,
        error: new Error('Please verify your email before signing in. Check your inbox for the confirmation link.'),
      };
    }
    return result;
  };

  const signOut = () => supabase.auth.signOut();

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'ucatgeniusai://auth/callback',
    });

  const deleteAccount = async () => {
    const { error } = await supabase.rpc('delete_user_account');
    if (error) throw error;
    await clearLocalUserData();
    await supabase.auth.signOut();
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) setPasswordRecovery(false);
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectTo = AuthSession.makeRedirectUri({ scheme: 'ucatgeniusai', path: 'auth/callback' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    
    if (error) return { error };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type === 'success') {
      const hash = result.url.split('#')[1];
      if (!hash) return { error: new Error('No token in redirect URL') };
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (!access_token || !refresh_token) return { error: new Error('Missing tokens in redirect URL') };
      const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
      if (sessionError) return { error: sessionError };
    }

    return { error: null };
  };

  const signInWithApple = async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    return { data, error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAnonymous: !!user?.is_anonymous, signUp, signIn, signInAnonymously, linkAccount, signOut, deleteAccount, signInWithGoogle, signInWithApple, resetPassword, updatePassword, passwordRecovery, setPasswordRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
