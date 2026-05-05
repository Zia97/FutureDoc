import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  MedicalBackgroundPattern,
  PremiumIcon,
  hexToRgba,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';

const APP_LOGO = require('../../../assets/icon.png');

const FEATURES = [
  'All mock tests unlocked',
  'Full practice bank across VR, DM, QR, and SJ',
  'Unlimited AI Tutor explanations',
  'Performance analytics dashboard',
  'Strategy lessons, exam traps, and worked examples',
];

// Maps RevenueCat package identifiers to display metadata.
// Prices come from the store via pkg.product.priceString — never hardcoded.
const PLAN_META = {
  '$rc_monthly': {
    id: 'monthly',
    label: 'Monthly',
    description: 'Flexible access',
    tag: null,
    order: 0,
  },
  '$rc_three_month': {
    id: 'season',
    label: 'Season Pass (3 Months)',
    description: '3 months of prep',
    tag: 'BEST VALUE',
    order: 1,
  },
  '$rc_lifetime': {
    id: 'lifetime',
    label: 'Full Access',
    description: 'One-time purchase',
    tag: null,
    order: 2,
  },
};

function getPeriodLabel(pkg) {
  const id = pkg.packageType;
  if (id === 'LIFETIME' || id === '$rc_lifetime') return ' one-time';
  if (id === 'THREE_MONTH' || id === '$rc_three_month') return '/3 months';
  if (id === 'MONTHLY' || id === '$rc_monthly') return '/month';
  return '';
}

function LogoMark({ colors, isDark, size = 74 }) {
  return (
    <View style={[styles.logoShadow, { shadowColor: colors.blue }]}>
      <LinearGradient
        colors={[
          hexToRgba(colors.cyan, isDark ? 0.2 : 0.13),
          isDark ? 'rgba(7, 19, 38, 0.96)' : 'rgba(255, 255, 255, 0.96)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.logoFrame,
          {
            width: size,
            height: size,
            borderRadius: Math.max(18, size * 0.28),
            borderColor: hexToRgba(colors.cyan, 0.42),
          },
        ]}
      >
        <Image source={APP_LOGO} style={styles.logoImage} resizeMode="contain" />
      </LinearGradient>
    </View>
  );
}

function FeatureRow({ text, colors }) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIcon, { backgroundColor: hexToRgba(colors.mint, 0.12), borderColor: hexToRgba(colors.mint, 0.32) }]}>
        <PremiumIcon name="check" size={15} color={colors.mint} strokeWidth={2.7} />
      </View>
      <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

export default function PaywallScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const { isAnonymous } = useAuth();
  const { offerings, purchasePackage, restorePurchases, isPro } = useSubscription();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState('season');
  const [loading, setLoading] = useState(false);

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

  const plans = useMemo(() => {
    if (!offerings?.availablePackages?.length) return [];

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

  const plansLoading = plans.length === 0;

  const selectedPlan = plans.find((p) => p.id === selected) ?? plans[0];
  const selectedCtaLabel = selectedPlan?.id === 'season' ? 'Season Pass' : selectedPlan?.label ?? 'Premium';
  const accent = colors.cyan;

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
        Alert.alert('No Purchases Found', "We couldn't find any previous purchases for this account.");
      }
    } catch (err) {
      Alert.alert('Restore Failed', err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAnonymous) return null;

  if (isPro) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBottom }]} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
        <LinearGradient colors={gradients.screen} style={StyleSheet.absoluteFill} />
        <MedicalBackgroundPattern colors={colors} isDark={isDark} />
        <View style={styles.proActiveContainer}>
          <LogoMark colors={colors} isDark={isDark} size={82} />
          <Text style={[styles.proActiveTitle, { color: colors.text }]}>You're Premium</Text>
          <Text style={[styles.proActiveSubtitle, { color: colors.textSecondary }]}>
            Full access is active on this account.
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, { shadowColor: accent }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.86}
          >
            <LinearGradient colors={[colors.blue, colors.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
              <Text style={styles.ctaText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBottom }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <LinearGradient colors={gradients.screen} style={StyleSheet.absoluteFill} />
      <MedicalBackgroundPattern colors={colors} isDark={isDark} />
      <LinearGradient
        pointerEvents="none"
        colors={[hexToRgba(colors.cyan, isDark ? 0.24 : 0.13), hexToRgba(colors.blue, 0), hexToRgba(colors.purple, isDark ? 0.1 : 0.06)]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity
        style={[
          styles.closeButton,
          {
            backgroundColor: isDark ? 'rgba(17, 31, 55, 0.88)' : 'rgba(255, 255, 255, 0.86)',
            borderColor: colors.border,
          },
        ]}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <PremiumIcon name="x" size={21} color={colors.text} strokeWidth={2.3} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: styles.scroll.paddingBottom + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LogoMark colors={colors} isDark={isDark} />
          <Text style={[styles.eyebrow, { color: accent }]}>UCAT GENIUS PREMIUM</Text>
          <Text style={[styles.title, { color: colors.text }]}>Unlock full access</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Everything you need to learn, practise, review, and improve across all UCAT sections.
          </Text>
        </View>

        <View
          style={[
            styles.featuresCard,
            {
              backgroundColor: isDark ? 'rgba(8, 20, 38, 0.76)' : 'rgba(255, 255, 255, 0.82)',
              borderColor: colors.border,
            },
          ]}
        >
          {FEATURES.map((feature) => (
            <FeatureRow key={feature} text={feature} colors={colors} />
          ))}
        </View>

        <Text style={[styles.plansHeading, { color: colors.textMuted }]}>CHOOSE YOUR PLAN</Text>

        <View style={styles.planList}>
          {plansLoading ? (
            <View style={styles.plansLoading}>
              <ActivityIndicator color={accent} />
            </View>
          ) : null}
          {plans.map((plan) => {
            const isSelected = selected === plan.id;
            const cardAccent = plan.id === 'season' ? colors.mint : isSelected ? accent : colors.blue;

            return (
              <TouchableOpacity
                key={plan.id}
                style={styles.planTouch}
                onPress={() => setSelected(plan.id)}
                activeOpacity={0.84}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                {plan.tag ? (
                  <View style={[styles.planTag, { backgroundColor: cardAccent }]}>
                    <Text style={styles.planTagText}>{plan.tag}</Text>
                  </View>
                ) : null}

                <LinearGradient
                  colors={isSelected
                    ? [
                      hexToRgba(cardAccent, isDark ? 0.18 : 0.1),
                      isDark ? 'rgba(10, 27, 52, 0.94)' : 'rgba(255, 255, 255, 0.94)',
                    ]
                    : [
                      isDark ? 'rgba(8, 20, 38, 0.78)' : 'rgba(255, 255, 255, 0.84)',
                      isDark ? 'rgba(5, 13, 29, 0.88)' : 'rgba(241, 247, 255, 0.9)',
                    ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.planCard,
                    {
                      borderColor: isSelected ? hexToRgba(cardAccent, 0.62) : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.accentStripe, { backgroundColor: cardAccent }]} />
                  <View style={[styles.radio, { borderColor: isSelected ? cardAccent : colors.border }]}>
                    {isSelected ? <View style={[styles.radioFill, { backgroundColor: cardAccent }]} /> : null}
                  </View>

                  <View style={styles.planInfo}>
                    <Text style={[styles.planLabel, { color: colors.text }]}>{plan.label}</Text>
                    <Text style={[styles.planDescription, { color: colors.textSecondary }]}>{plan.description}</Text>
                  </View>

                  <View style={styles.planPriceBlock}>
                    <Text style={[styles.planPrice, { color: colors.text }]}>{plan.priceString}</Text>
                    <Text style={[styles.planPeriod, { color: colors.textMuted }]}>{plan.period}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.ctaButton, { shadowColor: accent }, loading && styles.disabledButton]}
          onPress={handleSubscribe}
          activeOpacity={0.86}
          disabled={loading}
          accessibilityRole="button"
        >
          <LinearGradient colors={[colors.blue, colors.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <PremiumIcon name="lock" size={18} color="#ffffff" strokeWidth={2.4} />
                <Text style={styles.ctaText}>Continue with {selectedCtaLabel}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton} disabled={loading}>
          <Text style={[styles.restoreText, { color: accent }]}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={[styles.finePrint, { color: colors.textMuted }]}>
          Payment is charged to your Apple ID or Google Play account at confirmation of purchase.
          Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current
          period. Manage or cancel anytime in your device account settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.18 : 0,
    shadowRadius: 16,
    elevation: 0,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 20,
  },
  logoShadow: {
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0,
    shadowRadius: 22,
    elevation: 0,
  },
  logoFrame: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '72%',
    height: '72%',
    borderRadius: 16,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 6,
  },
  subtitle: {
    maxWidth: 330,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
  },
  featuresCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginBottom: 22,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  plansHeading: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },
  planList: {
    gap: 11,
  },
  plansLoading: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTouch: {
    borderRadius: 20,
  },
  planCard: {
    minHeight: 82,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 15,
    paddingLeft: 18,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  accentStripe: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  planTag: {
    position: 'absolute',
    right: 16,
    top: -8,
    zIndex: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  planTagText: {
    color: '#ffffff',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioFill: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  planInfo: {
    flex: 1,
    minWidth: 0,
  },
  planLabel: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  planDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  planPriceBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  planPrice: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  planPeriod: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
    fontWeight: '700',
  },
  ctaButton: {
    borderRadius: 17,
    marginTop: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 22,
    elevation: 0,
  },
  disabledButton: {
    opacity: 0.72,
  },
  ctaGradient: {
    minHeight: 54,
    borderRadius: 17,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  restoreButton: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 9,
  },
  restoreText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
  finePrint: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  proActiveContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  proActiveTitle: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '900',
    marginTop: 20,
  },
  proActiveSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 22,
    textAlign: 'center',
  },
});
