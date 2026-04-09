import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

// Must match the entitlement identifier you create in RevenueCat dashboard
const ENTITLEMENT_ID = 'premium';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [adminOverride, setAdminOverride] = useState(false);
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync is_premium flag to Supabase user_profiles
  async function syncPremiumToSupabase(isPremium) {
    if (!user?.id) return;
    try {
      await supabase
        .from('user_profiles')
        .update({ is_premium: isPremium })
        .eq('user_id', user.id);
    } catch (err) {
      console.error('[SubscriptionContext] syncPremiumToSupabase failed:', err);
    }
  }

  // Check if user is admin from Supabase
  async function checkAdmin() {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();
      if (data?.is_admin) {
        setAdminOverride(true);
        setIsPro(true); // Admin gets full access
      }
    } catch (err) {
      console.error('[SubscriptionContext] checkAdmin failed:', err);
    }
  }

  // Initialise RevenueCat SDK
  useEffect(() => {
    async function init() {
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
      if (!apiKey) {
        console.warn('[SubscriptionContext] No RevenueCat API key for', Platform.OS);
        setLoading(false);
        return;
      }

      await Purchases.configure({ apiKey });
      await checkSubscription();
      await loadOfferings();
      setLoading(false);
    }
    init();
  }, []);

  // Check admin status and identify user in RevenueCat when auth state changes
  useEffect(() => {
    async function identify() {
      if (!user?.id) return;
      await checkAdmin();
      try {
        await Purchases.logIn(user.id);
        await checkSubscription();
      } catch (err) {
        console.error('[SubscriptionContext] logIn failed:', err);
      }
    }
    identify();
  }, [user?.id]);

  async function checkSubscription() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
      const premium = !!entitlement;
      // Don't downgrade if user is admin
      if (premium || !adminOverride) setIsPro(premium || adminOverride);
      syncPremiumToSupabase(premium);
    } catch (err) {
      console.error('[SubscriptionContext] checkSubscription failed:', err);
    }
  }

  async function loadOfferings() {
    try {
      const offeringsResult = await Purchases.getOfferings();
      setOfferings(offeringsResult.current);
    } catch (err) {
      console.error('[SubscriptionContext] loadOfferings failed:', err);
    }
  }

  async function purchasePackage(pkg) {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    const premium = !!entitlement;
    setIsPro(premium);
    if (premium) syncPremiumToSupabase(true);
    return premium;
  }

  async function restorePurchases() {
    const customerInfo = await Purchases.restorePurchases();
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    const premium = !!entitlement;
    setIsPro(premium);
    syncPremiumToSupabase(premium);
    return premium;
  }

  return (
    <SubscriptionContext.Provider
      value={{ isPro, offerings, loading, purchasePackage, restorePurchases, checkSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
