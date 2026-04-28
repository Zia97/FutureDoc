import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSubscription } from '../../context/SubscriptionContext';

const FEATURES = [
  'All mock tests unlocked',
  'Full practice question bank across all sections',
  'Unlimited AI Tutor explanations',
  'Performance analytics dashboard',
  'Strategy lessons, exam traps & worked examples',
];

// Maps RevenueCat package identifiers to display metadata.
// RevenueCat package types: $rc_monthly, $rc_three_month, $rc_lifetime
const PLAN_META = {
  '$rc_monthly': { id: 'monthly', label: 'Monthly', description: 'Cancel anytime', tag: null, order: 0 },
  '$rc_three_month': { id: 'season', label: 'Season Pass (3 Months)', description: 'Save 25%', tag: 'BEST VALUE', order: 1 },
  '$rc_lifetime': { id: 'lifetime', label: 'Full Access', description: 'Keep forever', tag: null, order: 2 },
};

// Fallback plans shown when RevenueCat offerings aren't loaded yet
const FALLBACK_PLANS = [
  { id: 'monthly', label: 'Monthly', priceString: '\u00a33.99', period: '/month', description: 'Cancel anytime', tag: null, pkg: null },
  { id: 'season', label: 'Season Pass (3 Months)', priceString: '\u00a38.99', period: '/3 months', description: 'Save 25%', tag: 'BEST VALUE', pkg: null },
  { id: 'lifetime', label: 'Full Access', priceString: '\u00a324.99', period: ' one-time', description: 'Keep forever', tag: null, pkg: null },
];

function getPeriodLabel(pkg) {
  const id = pkg.packageType;
  if (id === 'LIFETIME' || id === '$rc_lifetime') return ' one-time';
  if (id === 'THREE_MONTH' || id === '$rc_three_month') return '/3 months';
  if (id === 'MONTHLY' || id === '$rc_monthly') return '/month';
  return '';
}

export default function PaywallScreen({ navigation }) {
  const { theme: t } = useTheme();
  const { isAnonymous } = useAuth();
  const { offerings, purchasePackage, restorePurchases, isPro } = useSubscription();
  const [selected, setSelected] = useState('season');
  const [loading, setLoading] = useState(false);

  // Anonymous users must create an account before purchasing — RevenueCat
  // can't reliably persist an entitlement against a throwaway anonymous id
  // (reinstall = lost purchase).
  useEffect(() => {
    if (!isAnonymous) return;
    Alert.alert(
      'Create an account',
      'You need an account to subscribe so your purchase is saved and restorable across devices.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
        { text: 'Create account', onPress: () => navigation.replace('SignUp') },
      ],
    );
  }, [isAnonymous, navigation]);

  if (isAnonymous) return null;

  // Build plans from RevenueCat offerings or fall back to hardcoded
  const plans = useMemo(() => {
    if (!offerings?.availablePackages?.length) return FALLBACK_PLANS;

    return offerings.availablePackages
      .filter((pkg) => PLAN_META[pkg.identifier])
      .map((pkg) => {
        const meta = PLAN_META[pkg.identifier];
        return {
          ...meta,
          priceString: pkg.product.priceString,
          period: getPeriodLabel(pkg),
          pkg,
        };
      })
      .sort((a, b) => a.order - b.order);
  }, [offerings]);

  const selectedPlan = plans.find((p) => p.id === selected) ?? plans[0];

  const handleSubscribe = async () => {
    if (!selectedPlan?.pkg) {
      Alert.alert('Not Available', 'Subscriptions are not available yet. Please try again later.');
      return;
    }

    setLoading(true);
    try {
      const success = await purchasePackage(selectedPlan.pkg);
      if (success) {
        Alert.alert('Welcome to Premium!', 'You now have full access to all features.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      if (!err.userCancelled) {
        Alert.alert('Purchase Failed', err.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert('Restored!', 'Your Premium access has been restored.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'We couldn\u2019t find any previous purchases for this account.');
      }
    } catch (err) {
      Alert.alert('Restore Failed', err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If already pro, show confirmation instead
  if (isPro) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} edges={['top']}>
        <View style={styles.proActiveContainer}>
          <Text style={styles.proActiveEmoji}>{'🎉'}</Text>
          <Text style={[styles.proActiveTitle, { color: t.text }]}>You're Premium!</Text>
          <Text style={[styles.proActiveSubtitle, { color: t.textMuted }]}>
            You have full access to all features.
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: t.accent }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} edges={['top']}>
      <LinearGradient
        colors={[t.accent + '18', t.bg, t.bg]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Close button \u2014 fixed top-right so it's always reachable */}
      <TouchableOpacity
        style={[
          styles.closeButton,
          {
            backgroundColor: t.bgCard,
            borderColor: t.border,
          },
        ]}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Text style={[styles.closeText, { color: t.text }]}>{'\u2715'}</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.emoji]}>{'🚀'}</Text>
          <Text style={[styles.title, { color: t.text }]}>Unlock Full Access</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>
            Get everything you need to ace the UCAT
          </Text>
        </View>

        {/* Features */}
        <View style={[styles.featuresCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          {FEATURES.map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={[styles.featureCheck, { color: t.accent }]}>{'\u2713'}</Text>
              <Text style={[styles.featureText, { color: t.text }]}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <Text style={[styles.plansHeading, { color: t.textMuted }]}>CHOOSE YOUR PLAN</Text>

        {plans.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: t.bgCard,
                  borderColor: isSelected ? t.accent : t.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setSelected(plan.id)}
              activeOpacity={0.8}
            >
              {plan.tag && (
                <View style={[styles.planTag, { backgroundColor: t.accent }]}>
                  <Text style={styles.planTagText}>{plan.tag}</Text>
                </View>
              )}

              <View style={styles.planRow}>
                {/* Radio */}
                <View
                  style={[
                    styles.radio,
                    { borderColor: isSelected ? t.accent : t.border },
                  ]}
                >
                  {isSelected && <View style={[styles.radioFill, { backgroundColor: t.accent }]} />}
                </View>

                {/* Label + description */}
                <View style={styles.planInfo}>
                  <Text style={[styles.planLabel, { color: t.text }]}>{plan.label}</Text>
                  <Text style={[styles.planDescription, { color: t.textMuted }]}>
                    {plan.description}
                  </Text>
                </View>

                {/* Price */}
                <View style={styles.planPriceBlock}>
                  <Text style={[styles.planPrice, { color: t.text }]}>{plan.priceString}</Text>
                  <Text style={[styles.planPeriod, { color: t.textMuted }]}>{plan.period}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: t.accent }]}
          onPress={handleSubscribe}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.ctaText}>
              Continue with {selectedPlan?.label ?? 'Plan'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Restore + fine print */}
        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton} disabled={loading}>
          <Text style={[styles.restoreText, { color: t.accent }]}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={[styles.finePrint, { color: t.textMuted }]}>
          Payment is charged to your Apple ID or Google Play account at confirmation of purchase.
          Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current
          period. Manage or cancel anytime in your device's account settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowColor: '#000',
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Features
  featuresCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    marginBottom: 28,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureCheck: {
    fontSize: 16,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },

  // Plans
  plansHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  planCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  planTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  planTagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  planDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  planPriceBlock: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  planPeriod: {
    fontSize: 11,
  },

  // CTA
  ctaButton: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 14,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Restore
  restoreButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  finePrint: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.7,
  },

  // Pro active state
  proActiveContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  proActiveEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  proActiveTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  proActiveSubtitle: {
    fontSize: 15,
    marginBottom: 32,
    textAlign: 'center',
  },
});
