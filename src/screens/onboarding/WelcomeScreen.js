import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import {
  PremiumIcon,
  PremiumScreen,
  PremiumScrollView,
  hexToRgba,
  premiumColors,
  useFadeSlide,
  useStaggeredFade,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { setWelcomeSeen } from '../../services/onboardingFlags';

const FEATURES = [
  {
    icon: 'book',
    accent: 'cyan',
    title: 'Learn UCAT techniques',
    body: 'Bite-sized lessons across all four sections — strategies, worked examples, and shortcuts.',
  },
  {
    icon: 'target',
    accent: 'blue',
    title: 'Adaptive practice',
    body: 'Practise VR, DM, QR, and SJ at your own pace. Question banks tuned to the 2026 UCAT.',
  },
  {
    icon: 'timer',
    accent: 'purple',
    title: 'Timed mock tests',
    body: 'Full-length, exam-conditions tests with realistic timing and instant scaled-score feedback.',
  },
  {
    icon: 'sparkles',
    accent: 'amber',
    title: 'AI tutor on demand',
    body: 'Stuck on a question? Get a friendly, focused explanation from your built-in tutor.',
    highlight: true,
  },
  {
    icon: 'chart',
    accent: 'teal',
    title: 'Performance analytics',
    body: 'See your strengths, the topics to revisit, and progress trending over time.',
  },
];

export default function WelcomeScreen({ onComplete }) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const insets = useSafeAreaInsets();

  const [finishing, setFinishing] = useState(false);

  const heroAnim = useFadeSlide(0);
  const featureAnims = useStaggeredFade(FEATURES.length, 120, 80);
  const noteAnim = useFadeSlide(120 + FEATURES.length * 80);

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await setWelcomeSeen();
      onComplete?.();
    } catch (e) {
      Alert.alert('Something went wrong', e.message ?? 'Please try again.');
      setFinishing(false);
    }
  };

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />

      <View style={[styles.brandHeader, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <View style={[styles.brandBadge, { borderColor: hexToRgba(colors.blue, 0.42) }]}>
          <LinearGradient
            colors={[hexToRgba(colors.blue, isDark ? 0.22 : 0.16), isDark ? 'rgba(8, 17, 33, 0.92)' : 'rgba(255, 255, 255, 0.96)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandFill}
          >
            <PremiumIcon name="caduceus" size={28} color={colors.blue} secondaryColor={colors.cyan} />
          </LinearGradient>
        </View>
        <View style={styles.brandText}>
          <Text style={[styles.brandTitle, { color: colors.text }]}>UCAT Genius</Text>
          <Text style={[styles.brandTagline, { color: colors.cyan }]}>YOU'RE ALL SET</Text>
        </View>
      </View>

      <PremiumScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.hero, heroAnim]}>
          <Text style={[styles.heading, { color: colors.text }]}>
            Welcome to UCAT Genius!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Here's a quick tour of what's inside
          </Text>
        </Animated.View>

        <View style={styles.featuresList}>
          {FEATURES.map((feature, index) => {
            const accentColor = colors[feature.accent] ?? colors.blue;
            return (
              <Animated.View key={feature.title} style={featureAnims[index]}>
                <LinearGradient
                  colors={gradients.glass}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.featureCard,
                    {
                      borderColor: feature.highlight ? hexToRgba(accentColor, 0.6) : colors.border,
                      borderWidth: feature.highlight ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={[styles.featureAccent, { backgroundColor: accentColor }]} />
                  <View style={[styles.featureIconBox, { borderColor: hexToRgba(accentColor, 0.42) }]}>
                    <LinearGradient
                      colors={[hexToRgba(accentColor, isDark ? 0.18 : 0.12), isDark ? 'rgba(8, 17, 33, 0.92)' : 'rgba(255, 255, 255, 0.96)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.featureIconFill}
                    >
                      <PremiumIcon name={feature.icon} size={24} color={accentColor} secondaryColor={colors.text} />
                    </LinearGradient>
                  </View>
                  <View style={styles.featureBody}>
                    <View style={styles.featureTitleRow}>
                      <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                      {feature.highlight ? (
                        <View style={[styles.newBadge, { borderColor: hexToRgba(accentColor, 0.6), backgroundColor: hexToRgba(accentColor, 0.18) }]}>
                          <Text style={[styles.newBadgeText, { color: accentColor }]}>NEW</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feature.body}</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View style={noteAnim}>
        </Animated.View>
      </PremiumScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopColor: hexToRgba(colors.blue, 0.18),
            backgroundColor: isDark ? 'rgba(4, 11, 25, 0.92)' : 'rgba(248, 251, 255, 0.92)',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleFinish}
          disabled={finishing}
          style={styles.primaryButtonShadow}
        >
          <LinearGradient
            colors={[colors.blue, colors.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            {finishing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Let's get started</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  brandBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  brandFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandText: { flex: 1 },
  brandTitle: {
    color: premiumColors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  brandTagline: {
    color: premiumColors.cyan,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginTop: 2,
  },
  scroll: { paddingBottom: 24 },
  hero: { paddingTop: 4, paddingBottom: 22 },
  heading: {
    color: premiumColors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: premiumColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 360,
  },
  featuresList: { gap: 12 },
  featureCard: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingLeft: 18,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  featureAccent: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  featureIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  featureIconFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBody: { flex: 1, minWidth: 0 },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: premiumColors.text,
  },
  featureText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    color: premiumColors.textSecondary,
  },
  newBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 18,
    paddingHorizontal: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  primaryButtonShadow: {
    borderRadius: 16,
    shadowColor: premiumColors.blue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'ios' ? 0.32 : 0,
    shadowRadius: 18,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
