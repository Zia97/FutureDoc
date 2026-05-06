import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { reportError } from '../lib/reportError';

const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
}) ?? '';

// Must match the entitlement identifier created in RevenueCat dashboard
const ENTITLEMENT_ID = 'UCAT Genius AI Pro';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [adminOverride, setAdminOverride] = useState(false);
  const [offerings, setOfferings] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derive premium status from customer info
  const checkEntitlement = useCallback(
    (info) => {
      const entitlement = info?.entitlements?.active?.[ENTITLEMENT_ID];
      return !!entitlement;
    },
    [],
  );

  // Sync is_premium flag to Supabase user_profiles
  async function syncPremiumToSupabase(isPremium) {
    if (!user?.id) return;
    try {
      await supabase
        .from('user_profiles')
        .update({ is_premium: isPremium })
        .eq('user_id', user.id);
    } catch (err) {
      reportError('SubscriptionContext', err, { level: 'error', extra: { note: 'syncPremiumToSupabase failed' } });
    }
  }

  // Initialise RevenueCat SDK
  useEffect(() => {
    async function init() {
      if (!REVENUECAT_API_KEY) {
        reportError('SubscriptionContext', new Error('Missing EXPO_PUBLIC_REVENUECAT_API_KEY'), {
          level: 'fatal',
          extra: { note: 'RevenueCat not configured — purchases disabled' },
        });
        setLoading(false);
        return;
      }

      try {
        Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      } catch (err) {
        reportError('SubscriptionContext', err, { level: 'warning', extra: { note: 'configure failed' } });
        setLoading(false);
        return;
      }

      await loadOfferings();
      setLoading(false);
    }
    init();
  }, []);

  // Listen for real-time purchase updates (e.g. renewals, cancellations, family sharing)
  useEffect(() => {
    if (!REVENUECAT_API_KEY) return;

    const listener = (info) => {
      setCustomerInfo(info);
      const premium = checkEntitlement(info);
      setIsPro(premium || adminOverride);
      syncPremiumToSupabase(premium);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [adminOverride, checkEntitlement]);

  // Re-check subscription when app returns to foreground
  useEffect(() => {
    if (!REVENUECAT_API_KEY || !user?.id) return;

    const appStateRef = { current: AppState.currentState };
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        checkSubscription();
      }
      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [user?.id, adminOverride]);

  // Identify user and check subscription + admin status when auth state changes
  useEffect(() => {
    async function identify() {
      if (!user?.id) return;

      // 1. Check RevenueCat subscription
      let premium = false;
      try {
        await Purchases.logIn(user.id);
      } catch (err) {
        reportError('SubscriptionContext', err, { level: 'warning', extra: { note: 'logIn failed' } });
      }
      try {
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
        premium = checkEntitlement(info);
      } catch (err) {
        reportError('SubscriptionContext', err, { level: 'warning', extra: { note: 'getCustomerInfo failed' } });
      }

      // 2. Check admin override from Supabase
      let isAdmin = false;
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();
        isAdmin = !!data?.is_admin;
      } catch (err) {
        reportError('SubscriptionContext', err, { level: 'warning', extra: { note: 'checkAdmin failed' } });
      }

      // 3. User is pro if RevenueCat subscriber OR admin
      setAdminOverride(isAdmin);
      setIsPro(premium || isAdmin);
      syncPremiumToSupabase(premium);
    }
    identify();
  }, [user?.id]);

  async function checkSubscription() {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      const premium = checkEntitlement(info);
      setIsPro(premium || adminOverride);
      syncPremiumToSupabase(premium);
    } catch (err) {
      reportError('SubscriptionContext', err, { level: 'error', extra: { note: 'checkSubscription failed' } });
    }
  }

  async function loadOfferings() {
    try {
      const offeringsResult = await Purchases.getOfferings();
      setOfferings(offeringsResult.current);
    } catch (err) {
      reportError('SubscriptionContext', err, { level: 'error', extra: { note: 'loadOfferings failed' } });
    }
  }

  async function purchasePackage(pkg) {
    const { customerInfo: info } = await Purchases.purchasePackage(pkg);
    setCustomerInfo(info);
    const premium = checkEntitlement(info);
    setIsPro(premium || adminOverride);
    if (premium) syncPremiumToSupabase(true);
    return premium;
  }

  async function restorePurchases() {
    const info = await Purchases.restorePurchases();
    setCustomerInfo(info);
    const premium = checkEntitlement(info);
    setIsPro(premium || adminOverride);
    syncPremiumToSupabase(premium);
    return premium;
  }

  // Present RevenueCat's native paywall UI
  async function presentPaywall() {
    const result = await RevenueCatUI.presentPaywall();
    // After paywall dismisses, refresh subscription state
    await checkSubscription();
    return result;
  }

  // Present RevenueCat's native paywall if the user is not subscribed
  async function presentPaywallIfNeeded() {
    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
    });
    await checkSubscription();
    return result;
  }

  // Present RevenueCat Customer Center (manage/cancel subscription)
  async function presentCustomerCenter() {
    await RevenueCatUI.presentCustomerCenter();
    await checkSubscription();
  }

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        offerings,
        customerInfo,
        loading,
        purchasePackage,
        restorePurchases,
        checkSubscription,
        presentPaywall,
        presentPaywallIfNeeded,
        presentCustomerCenter,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
