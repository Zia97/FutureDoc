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
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import AppLogo from '../../components/AppLogo';

export const TOS_FLAG_KEY = 'tos_accepted_v1';

const KEY_POINTS = [
  {
    icon: 'person-cog',
    accent: 'blue',
    title: '16 or older',
    body: 'You must be at least 16 years old to use UCAT Genius.',
  },
  {
    icon: 'book',
    accent: 'cyan',
    title: 'Independent study tool',
    body: 'Not affiliated with the UCAT Consortium or Pearson VUE. Practice questions are original content, not past exam questions.',
  },
  {
    icon: 'chart',
    accent: 'purple',
    title: 'Estimated scores',
    body: 'Scaled scores and SJ bands shown in the app are estimates only — rough indicators of progress, not predictions of your result.',
  },
  {
    icon: 'lock',
    accent: 'mint',
    title: 'Minimal data',
    body: 'We only store your account email, your test performance, and AI tutor questions needed to protect the service. We do not process, sell, or use your data for unrelated purposes.',
  },
  {
    icon: 'shield-heart',
    accent: 'blue',
    title: 'Subscriptions',
    body: 'Subscriptions are managed through the App Store or Google Play.',
  },
];

export default function ToSAcceptanceScreen({ onAccepted }) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const insets = useSafeAreaInsets();

  const [accepting, setAccepting] = useState(false);

  const heroAnim = useFadeSlide(0);
  const pointAnims = useStaggeredFade(KEY_POINTS.length, 120, 80);
  const noteAnim = useFadeSlide(120 + KEY_POINTS.length * 80);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await AsyncStorage.setItem(TOS_FLAG_KEY, 'true');
      onAccepted?.();
    } catch (e) {
      Alert.alert('Something went wrong', e.message ?? 'Please try again.');
      setAccepting(false);
    }
  };

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />

      <View style={[styles.brandHeader, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <AppLogo
          size={48}
          radius={16}
          shadowColor={colors.blue}
          borderColor={hexToRgba(colors.blue, 0.42)}
        />
        <View style={styles.brandText}>
          <Text style={[styles.brandTitle, { color: colors.text }]}>UCAT Genius</Text>
          <Text style={[styles.brandTagline, { color: colors.cyan }]}>PREP SMARTER</Text>
        </View>
      </View>

      <PremiumScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.hero, heroAnim]}>
          <Text style={[styles.heading, { color: colors.text }]}>Welcome aboard</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Before you start, please review a few important points.
          </Text>
        </Animated.View>

        <View style={styles.pointsList}>
          {KEY_POINTS.map((point, index) => {
            const accentColor = colors[point.accent] ?? colors.blue;
            return (
              <Animated.View key={point.title} style={pointAnims[index]}>
                <LinearGradient
                  colors={gradients.glass}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.pointCard, { borderColor: colors.border }]}
                >
                  <View style={[styles.pointAccent, { backgroundColor: accentColor }]} />
                  <View style={[styles.pointIconBox, { borderColor: hexToRgba(accentColor, 0.42) }]}>
                    <LinearGradient
                      colors={[hexToRgba(accentColor, isDark ? 0.18 : 0.12), isDark ? 'rgba(8, 17, 33, 0.92)' : 'rgba(255, 255, 255, 0.96)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.pointIconFill}
                    >
                      <PremiumIcon name={point.icon} size={22} color={accentColor} secondaryColor={colors.text} />
                    </LinearGradient>
                  </View>
                  <View style={styles.pointBody}>
                    <Text style={[styles.pointTitle, { color: colors.text }]}>{point.title}</Text>
                    <Text style={[styles.pointText, { color: colors.textSecondary }]}>{point.body}</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View style={noteAnim}>
          <Text style={[styles.note, { color: colors.textMuted }]}>
            By tapping Accept &amp; Continue, you agree to our Terms of Service and Privacy Policy. You can review the full versions from Profile → Settings at any time.
          </Text>
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
          onPress={handleAccept}
          disabled={accepting}
          style={styles.primaryButtonShadow}
        >
          <LinearGradient
            colors={[colors.blue, colors.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            {accepting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Accept &amp; Continue</Text>
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
  hero: {
    paddingTop: 8,
    paddingBottom: 22,
  },
  heading: {
    color: premiumColors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  subtitle: {
    color: premiumColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 340,
  },
  pointsList: { gap: 12 },
  pointCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingLeft: 18,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  pointAccent: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  pointIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pointIconFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointBody: { flex: 1, minWidth: 0 },
  pointTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: premiumColors.text,
  },
  pointText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    color: premiumColors.textSecondary,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 18,
    paddingHorizontal: 4,
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
