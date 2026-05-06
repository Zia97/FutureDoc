import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { clearLocalUserData, DISPLAY_NAME_CACHE_KEY } from '../services/localUserData';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

// A user is "usable" (session-ready) once their email is verified —
// prevents an unverified-email bypass after sign-up.
const isUsable = (u) => !!u && !!u.email_confirmed_at;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [displayName, setDisplayNameState] = useState(null);
  const [displayNameLoading, setDisplayNameLoading] = useState(false);
  // Suspension state — null while we're still resolving on first load so the
  // app can hold on the loader rather than briefly flashing the home stack
  // before the gate kicks in.
  const [suspension, setSuspension] = useState({ loading: true, isSuspended: false, reason: null, suspendedAt: null });
  // True while the Google OAuth flow is exchanging the code inline. The deep-link
  // listener must skip auth/callback URLs in that window or both code paths race
  // to redeem the same PKCE verifier and the loser sees "code verifier not found".
  const oauthInFlight = useRef(false);

  // Mirror every display_name change to AsyncStorage so cold-start renders
  // can show the name immediately, before the network fetch resolves. The
  // cache is keyed by user.id to prevent leakage across accounts on the
  // same device.
  const setDisplayName = (name, userId) => {
    setDisplayNameState(name);
    const id = userId ?? user?.id;
    if (!id) return;
    if (name) {
      AsyncStorage.setItem(DISPLAY_NAME_CACHE_KEY, JSON.stringify({ userId: id, name })).catch(() => {});
    } else {
      AsyncStorage.removeItem(DISPLAY_NAME_CACHE_KEY).catch(() => {});
    }
  };

  // Fetch display_name + suspension whenever the signed-in user changes.
  // Hydrates display_name from AsyncStorage first so cold starts don't
  // flash the gate screen, then verifies against the DB and updates if it
  // has changed.
  const refreshDisplayName = async (u) => {
    const target = u ?? user;
    if (!target) {
      setDisplayName(null);
      setSuspension({ loading: false, isSuspended: false, reason: null, suspendedAt: null });
      return null;
    }
    setDisplayNameLoading(true);
    try {
      const cached = await AsyncStorage.getItem(DISPLAY_NAME_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.userId === target.id && parsed?.name) {
          setDisplayNameState(parsed.name);
        }
      }
    } catch {}
    const { data, error } = await supabase
      .from('user_profiles')
      .select('display_name, is_suspended, suspended_at, suspension_reason')
      .eq('user_id', target.id)
      .maybeSingle();
    setDisplayNameLoading(false);
    if (error) {
      // Fail-open on suspension so a transient outage doesn't lock users out.
      setSuspension({ loading: false, isSuspended: false, reason: null, suspendedAt: null });
      return null;
    }
    setSuspension({
      loading: false,
      isSuspended: !!data?.is_suspended,
      reason: data?.suspension_reason ?? null,
      suspendedAt: data?.suspended_at ?? null,
    });
    const name = data?.display_name ?? null;
    setDisplayName(name, target.id);
    return name;
  };

  useEffect(() => {
    (async () => {
      const name = await refreshDisplayName(user);
      // Promote a name staged at signup into user_profiles on first verified sign-in.
      if (user && !name) {
        const pending = user.user_metadata?.pending_display_name;
        if (pending && pending.trim()) {
          await supabase
            .from('user_profiles')
            .update({ display_name: pending.trim() })
            .eq('user_id', user.id);
          setDisplayName(pending.trim());
        }
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(isUsable(session?.user) ? session.user : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setDisplayNameState(null);
        setSuspension({ loading: false, isSuspended: false, reason: null, suspendedAt: null });
        return;
      }
      setUser(isUsable(session?.user) ? session.user : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle OAuth deep link callback — covers the case where Android kills
  // the app while the browser is open and relaunches it via the deep link,
  // and email verification / password recovery links.
  useEffect(() => {
    const handleUrl = async ({ url }) => {
      if (url.includes('auth/callback')) {
        if (oauthInFlight.current) return;
        const { queryParams } = Linking.parse(url);
        const code = queryParams?.code;
        const type = queryParams?.type;

        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        if (type === 'recovery') {
          setPasswordRecovery(true);
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

  // pendingDisplayName is staged in user_metadata so we can persist it to
  // user_profiles after the user verifies their email and signs in.
  const signUp = (email, password, pendingDisplayName) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { pending_display_name: pendingDisplayName } },
    });

  const saveDisplayName = async (name) => {
    const trimmed = (name ?? '').trim();
    if (!trimmed) return { error: new Error('Display name cannot be blank.') };
    if (!user?.id) return { error: new Error('Not signed in.') };
    // Upsert in case the auto-trigger row is missing for any reason; select
    // the result back so we can confirm the value was actually written
    // before flipping the gate state.
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: user.id, display_name: trimmed }, { onConflict: 'user_id' })
      .select('display_name')
      .single();
    if (error) return { error };
    setDisplayName(data?.display_name ?? trimmed);
    return { error: null };
  };

  const resendVerificationEmail = (email) =>
    supabase.auth.resend({ type: 'signup', email });

  const signIn = async (email, password) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) return result;
    const u = result.data?.user;
    if (u && !u.email_confirmed_at) {
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

    oauthInFlight.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error) return { error };

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type !== 'success') return { error: new Error('Sign-in cancelled') };

      const { queryParams } = Linking.parse(result.url);
      const code = queryParams?.code;
      if (!code) {
        const desc = queryParams?.error_description || queryParams?.error || 'No code in redirect URL';
        return { error: new Error(decodeURIComponent(String(desc))) };
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) return { error: exchangeError };
      return { error: null };
    } finally {
      oauthInFlight.current = false;
    }
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
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, deleteAccount, signInWithGoogle, signInWithApple, resetPassword, updatePassword, passwordRecovery, setPasswordRecovery, displayName, displayNameLoading, refreshDisplayName, saveDisplayName, resendVerificationEmail, suspension }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
