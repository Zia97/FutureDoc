import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Polygon, Polyline } from 'react-native-svg';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba, premiumColors } from '../../theme/premiumTheme';
import PremiumIcon from './PremiumIcon';

export function useFadeSlide(delay = 0, distance = 20) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 460, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 460, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, opacity, translateY]);

  return { opacity, transform: [{ translateY }] };
}

export function useStaggeredFade(count, startDelay = 90, step = 70) {
  const values = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    })),
  ).current;

  useEffect(() => {
    const animations = values.map(({ opacity, translateY }, index) => (
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 460,
          delay: startDelay + index * step,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 460,
          delay: startDelay + index * step,
          useNativeDriver: true,
        }),
      ])
    ));

    Animated.stagger(30, animations).start();
  }, [startDelay, step, values]);

  return values.map(({ opacity, translateY }) => ({ opacity, transform: [{ translateY }] }));
}

export function MedicalBackgroundPattern({ colors = premiumColors, isDark = true }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
        <Circle cx="314" cy="236" r="126" stroke={colors.blue} strokeWidth="1.1" opacity={isDark ? 0.11 : 0.16} />
        <Circle cx="318" cy="236" r="86" stroke={colors.cyan} strokeWidth="1.8" opacity={isDark ? 0.12 : 0.14} />
        <Path
          d="M250 252c28-37 74-57 122-51"
          stroke={colors.blue}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={isDark ? 0.18 : 0.16}
        />
        <Polyline
          points="18 190 58 190 72 164 91 226 112 184 130 190 176 190"
          stroke={colors.cyan}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isDark ? 0.07 : 0.1}
        />
        <Polyline
          points="218 676 246 676 258 654 272 704 288 672 302 676 350 676"
          stroke={colors.blue}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isDark ? 0.07 : 0.1}
        />
        <G opacity={isDark ? 0.075 : 0.12} stroke={colors.cyan} strokeWidth="1.4" fill="none">
          <Polygon points="322 92 344 104 344 129 322 141 300 129 300 104" />
          <Polygon points="44 690 63 701 63 723 44 734 25 723 25 701" />
          <Line x1="334" y1="116" x2="358" y2="116" />
          <Line x1="52" y1="711" x2="77" y2="711" />
        </G>
        <G opacity={isDark ? 0.075 : 0.12} stroke={colors.blue} strokeWidth="1.5" strokeLinecap="round">
          <Line x1="54" y1="92" x2="54" y2="112" />
          <Line x1="44" y1="102" x2="64" y2="102" />
          <Line x1="337" y1="543" x2="337" y2="564" />
          <Line x1="326.5" y1="553.5" x2="347.5" y2="553.5" />
        </G>
        <G opacity={isDark ? 0.06 : 0.1} stroke={colors.cyan} strokeWidth="1.35" fill="none">
          <Path d="M74 322c-16-10-13-34 6-35 4-14 24-15 31-4 14-2 24 13 18 26 12 8 7 27-8 29H88c-5 0-10-7-14-16Z" />
          <Path d="M90 288v49M110 287v50M77 306h49M82 324h40" />
        </G>
      </Svg>
    </View>
  );
}

export function PremiumScreen({ children, style, applyBottomInset = false }) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.bgBottom },
        applyBottomInset && { paddingBottom: insets.bottom },
        style,
      ]}
    >
      <LinearGradient colors={gradients.screen} style={StyleSheet.absoluteFill} />
      <MedicalBackgroundPattern colors={colors} isDark={isDark} />
      {children}
    </View>
  );
}

export function PremiumScrollView({ children, contentContainerStyle, ...props }) {
  const insets = useSafeAreaInsets();
  const flat = StyleSheet.flatten(contentContainerStyle) || {};
  const basePaddingBottom = flat.paddingBottom ?? styles.scrollContent.paddingBottom ?? 0;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        contentContainerStyle,
        { paddingBottom: basePaddingBottom + insets.bottom },
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

export function AppHeader({ navigation, title, showBack = true }) {
  const insets = useSafeAreaInsets();
  const { user, displayName } = useAuth();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const initialSource = displayName || user?.user_metadata?.full_name || user?.email;
  const initial = initialSource?.trim()?.[0]?.toUpperCase() ?? '?';

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation?.navigate?.('Home');
  };

  return (
    <View style={[styles.appHeader, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={handleBack}
        disabled={!showBack}
        style={[
          styles.headerIconButton,
          {
            backgroundColor: isDark ? 'rgba(17, 31, 55, 0.82)' : 'rgba(255, 255, 255, 0.78)',
            borderColor: isDark ? 'rgba(122, 158, 214, 0.2)' : 'rgba(69, 94, 140, 0.22)',
          },
          !showBack && styles.invisible,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <PremiumIcon name="arrow-left" size={22} color={colors.text} />
      </TouchableOpacity>

      <Text style={[styles.appHeaderTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>

      {user ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation?.navigate?.('Profile')}
          style={[
            styles.headerAvatar,
            {
              backgroundColor: isDark ? 'rgba(17, 31, 55, 0.82)' : '#DBEAFE',
              borderColor: isDark ? 'rgba(122, 158, 214, 0.2)' : hexToRgba(colors.blue, 0.28),
              shadowColor: colors.blue,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Text style={[styles.headerAvatarText, { color: isDark ? '#C5E4FF' : colors.blue }]}>{initial}</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.headerAvatar, styles.invisible]} />
      )}
    </View>
  );
}

export function RichIconBox({ icon, accent, size = 64, iconSize = 30, style }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  return (
    <View style={[styles.iconOuter, { shadowColor: accent }, style]}>
      <LinearGradient
        colors={[hexToRgba(accent, isDark ? 0.18 : 0.12), isDark ? 'rgba(8, 17, 33, 0.92)' : 'rgba(255, 255, 255, 0.96)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.iconBox,
          {
            width: size,
            height: size,
            borderRadius: Math.max(16, size * 0.28),
            borderColor: hexToRgba(accent, 0.42),
          },
        ]}
      >
        <PremiumIcon name={icon} size={iconSize} color={accent} secondaryColor={colors.text} />
      </LinearGradient>
    </View>
  );
}

export function GlassMenuCard({
  title,
  description,
  icon,
  accent = premiumColors.blue,
  onPress,
  badge,
  highlighted = false,
  style,
  iconSize = 66,
  iconGlyphSize = 32,
  showChevron = true,
}) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);

  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress
    ? { activeOpacity: 0.86, onPress, accessibilityRole: 'button' }
    : {};

  return (
    <Container
      {...containerProps}
      style={[styles.cardTouch, style]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[
          hexToRgba(accent, 0),
          hexToRgba(accent, highlighted ? 0.34 : 0.22),
          hexToRgba(accent, 0),
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.bottomGlow}
      />

      <LinearGradient
        colors={[
          highlighted
            ? (isDark ? 'rgba(14, 29, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)')
            : gradients.glass[0],
          gradients.glass[1],
          gradients.glass[2],
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.glassCard,
          {
            borderColor: highlighted ? hexToRgba(accent, isDark ? 0.72 : 0.42) : colors.border,
            shadowColor: accent,
          },
        ]}
      >
        <View style={[styles.accentStripe, { backgroundColor: accent, shadowColor: accent }]} />

        <RichIconBox icon={icon} accent={accent} size={iconSize} iconSize={iconGlyphSize} />

        <View style={styles.cardCopy}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{title}</Text>
            {badge ? (
              <View style={[styles.badge, { borderColor: hexToRgba(accent, 0.36), backgroundColor: hexToRgba(accent, 0.1) }]}>
                <Text style={[styles.badgeText, { color: accent }]}>{badge}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{description}</Text>
        </View>

        {showChevron ? (
          <View style={[styles.chevronWrap, { borderColor: hexToRgba(accent, 0.25), backgroundColor: isDark ? 'rgba(8, 15, 30, 0.45)' : 'rgba(255, 255, 255, 0.72)' }]}>
            <PremiumIcon name="chevron-right" size={24} color={accent} strokeWidth={2.4} />
          </View>
        ) : null}
      </LinearGradient>
    </Container>
  );
}

export function PracticeModeCard(props) {
  return <GlassMenuCard iconSize={70} iconGlyphSize={34} style={styles.practiceModeCard} {...props} />;
}

export function SectionSelectionCard(props) {
  return <GlassMenuCard iconSize={60} iconGlyphSize={29} style={styles.sectionCard} {...props} />;
}

export function PremiumFooter() {
  return null;
}

export { PremiumIcon, premiumColors, hexToRgba };

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: premiumColors.bgBottom,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    flexGrow: 1,
  },
  appHeader: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 31, 55, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 214, 0.2)',
  },
  invisible: {
    opacity: 0,
  },
  appHeaderTitle: {
    flex: 1,
    color: premiumColors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#172D68',
    borderWidth: 1,
    borderColor: 'rgba(92, 140, 255, 0.34)',
    shadowColor: premiumColors.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 16,
    elevation: 6,
  },
  headerAvatarText: {
    color: '#C5E4FF',
    fontSize: 18,
    fontWeight: '900',
  },
  iconOuter: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'ios' ? 0.32 : 0,
    shadowRadius: 18,
    elevation: 0,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardTouch: {
    borderRadius: 24,
    position: 'relative',
  },
  bottomGlow: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: -8,
    height: 26,
    borderRadius: 999,
  },
  glassCard: {
    minHeight: 118,
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 20,
    paddingLeft: 22,
    paddingRight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 22,
    elevation: 0,
  },
  accentStripe: {
    position: 'absolute',
    left: 0,
    top: 18,
    bottom: 18,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.9 : 0,
    shadowRadius: 12,
    elevation: 0,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTitle: {
    color: premiumColors.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
  },
  cardDescription: {
    color: premiumColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(8, 15, 30, 0.45)',
  },
  practiceModeCard: {
    marginBottom: 16,
  },
  sectionCard: {
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(116, 154, 209, 0.22)',
  },
  footerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 275,
  },
  footerTextBlock: {
    flexShrink: 1,
  },
  footerMuted: {
    color: premiumColors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  footerAccent: {
    color: premiumColors.blue,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
