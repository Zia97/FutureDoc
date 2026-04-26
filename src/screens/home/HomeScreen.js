import React, { useCallback, useState } from 'react';
import {
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
import { useFocusEffect } from '@react-navigation/native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Polyline,
  Stop,
} from 'react-native-svg';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { getDisplayStreak } from '../../services/streakService';
import {
  getLastActivity,
  getResumeNavTarget,
  getSectionVisuals,
} from '../../services/lastActivityService';
import { refreshDailyReminder } from '../../services/notificationService';
import {
  GlassMenuCard,
  PremiumFooter,
  PremiumIcon,
  PremiumScreen,
  PremiumScrollView,
  RichIconBox,
  hexToRgba,
  premiumColors,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getDisplayName(user, profileDisplayName) {
  const name = profileDisplayName || user?.user_metadata?.full_name || user?.email?.split('@')[0];
  if (!name) return 'Alex';
  return name.split(/[ ._-]/)[0] || 'Alex';
}

function DoctorHeroArt({ colors = premiumColors, isDark = true }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 245 320" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <SvgLinearGradient id="coat" x1="48" y1="134" x2="201" y2="292" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#C9D7FF" stopOpacity="0.85" />
          <Stop offset="0.56" stopColor="#45537D" stopOpacity="0.62" />
          <Stop offset="1" stopColor="#111B35" stopOpacity="0.92" />
        </SvgLinearGradient>
        <SvgLinearGradient id="skin" x1="94" y1="56" x2="148" y2="125" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#D7A18E" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#7B5362" stopOpacity="0.78" />
        </SvgLinearGradient>
        <SvgLinearGradient id="tablet" x1="68" y1="186" x2="165" y2="267" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#173B73" stopOpacity="0.92" />
          <Stop offset="1" stopColor="#081529" stopOpacity="0.98" />
        </SvgLinearGradient>
      </Defs>

      <Circle cx="134" cy="154" r="102" stroke={colors.blue} strokeWidth="2" opacity={isDark ? 0.22 : 0.18} fill="none" />
      <Circle cx="134" cy="154" r="78" stroke={colors.cyan} strokeWidth="1.4" opacity={isDark ? 0.09 : 0.14} fill="none" />
      <Path d="M54 155c25-53 78-82 141-76" stroke={colors.blue} strokeWidth="4" strokeLinecap="round" opacity={isDark ? 0.38 : 0.22} fill="none" />
      <Polyline
        points="25 165 50 165 61 143 76 188 93 157 108 165 135 165"
        stroke={colors.cyan}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.12"
      />
      <G opacity={isDark ? 0.12 : 0.16} stroke={colors.blue} strokeWidth="1.5" fill="none">
        <Path d="M66 86c-10-8-8-24 6-26 4-12 20-11 25-2 11-1 18 10 15 20 9 6 5 21-7 23H77c-4 0-8-5-11-15Z" />
        <Path d="M82 61v39M97 61v38M69 76h42M73 91h35" />
      </G>

      <G opacity="0.9">
        <Path
          d="M72 310c4-63 16-121 50-134 23-9 53 2 69 25 17 26 24 65 27 109H72Z"
          fill="url(#coat)"
        />
        <Path d="M124 174l13 55 16-55c-8 4-18 4-29 0Z" fill="#0D1830" opacity="0.96" />
        <Path d="M109 189c8 23 13 61 13 121M171 194c-15 27-21 66-21 116" stroke="#DCE8FF" strokeWidth="2" opacity="0.2" fill="none" />

        <Path d="M88 190c-16 25-23 58-25 98" stroke="#B8D6FF" strokeWidth="8" strokeLinecap="round" opacity="0.35" fill="none" />
        <Path d="M183 193c11 28 17 59 20 95" stroke="#B8D6FF" strokeWidth="8" strokeLinecap="round" opacity="0.32" fill="none" />

        <Path d="M120 113c-9 20-8 48 5 59 11 10 32 4 42-11 9-14 12-39 3-55-12-21-40-17-50 7Z" fill="url(#skin)" />
        <Path d="M113 112c1-24 23-48 54-34 22 10 27 33 14 50-6-16-20-21-35-26-15-4-24 0-33 10Z" fill="#172340" />
        <Path d="M145 103c14 3 26 9 36 23-1-19-9-36-30-44-18-6-32 2-39 16 9-2 19 1 33 5Z" fill="#0B1428" opacity="0.86" />
        <Ellipse cx="138" cy="131" rx="2.4" ry="3.2" fill="#162037" />
        <Ellipse cx="166" cy="130" rx="2.4" ry="3.2" fill="#162037" />
        <Path d="M145 151c6 5 15 5 22 0" stroke="#2B3454" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

        <Path d="M102 187c2-20 15-31 26-34" stroke="#09203D" strokeWidth="5" strokeLinecap="round" fill="none" />
        <Path d="M176 181c-5-20-14-28-26-30" stroke="#09203D" strokeWidth="5" strokeLinecap="round" fill="none" />
        <Circle cx="101" cy="190" r="8" stroke="#16223D" strokeWidth="4" fill="#0A1528" />
        <Circle cx="178" cy="184" r="9" stroke="#16223D" strokeWidth="4" fill="#0A1528" />

        <Path
          d="M63 205c0-6 5-10 11-9l94 16c6 1 9 6 7 12l-16 69c-1 6-6 9-12 8L55 282c-6-1-9-6-8-12l16-65Z"
          fill="url(#tablet)"
          stroke={hexToRgba(colors.blue, 0.45)}
          strokeWidth="2"
        />
        <Circle cx="112" cy="249" r="9" fill={hexToRgba(colors.blue, 0.1)} />
        <Path d="M87 213c-18-4-31 6-35 20" stroke="#9FB8E8" strokeWidth="8" strokeLinecap="round" opacity="0.55" fill="none" />
        <Path d="M72 214c-9 2-13 9-12 17" stroke="#D6E6FF" strokeWidth="6" strokeLinecap="round" opacity="0.45" fill="none" />
      </G>
    </Svg>
  );
}

function HomeHeader({ navigation, isDark, toggleDark, initial, showProfile, colors }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
      <View style={styles.logoRow}>
        <PremiumIcon name="caduceus" size={48} color={colors.blue} />
        <View style={styles.logoCopy}>
          <Text style={[styles.logoTitle, { color: colors.text }]} numberOfLines={1}>UCAT Genius</Text>
          <Text style={[styles.logoSubtitle, { color: colors.textMuted }]} numberOfLines={1}>PREP SMARTER</Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          activeOpacity={0.84}
          onPress={toggleDark}
          style={[
            styles.headerCircle,
            {
              backgroundColor: isDark ? 'rgba(18, 33, 58, 0.92)' : 'rgba(255, 255, 255, 0.86)',
              borderColor: isDark ? 'rgba(113, 146, 199, 0.2)' : 'rgba(69, 94, 140, 0.18)',
              shadowColor: colors.blue,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Toggle theme"
        >
          <PremiumIcon name={isDark ? 'moon' : 'sun'} size={23} color={isDark ? '#DDEAFF' : colors.amber} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() => navigation.navigate(showProfile ? 'Profile' : 'Login')}
          style={[
            styles.headerCircle,
            styles.avatarCircle,
            {
              backgroundColor: isDark ? '#172E71' : '#DBEAFE',
              borderColor: hexToRgba(colors.blue, isDark ? 0.34 : 0.28),
              shadowColor: colors.blue,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={showProfile ? 'Open profile' : 'Log in'}
        >
          <Text style={[styles.avatarText, { color: isDark ? '#BDE2FF' : colors.blue }]}>{initial}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user, isAnonymous, displayName: profileDisplayName } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const { isPro } = useSubscription();
  const { colors, gradients } = getPremiumTheme(isDark);

  const showProfile = !!user && !isAnonymous;
  const initial = showProfile ? user?.email?.[0]?.toUpperCase() ?? 'A' : 'A';
  const displayName = getDisplayName(user, profileDisplayName);

  const headerAnim = useFadeSlide(0, 12);
  const heroAnim = useFadeSlide(90, 18);
  const action1Anim = useFadeSlide(190, 18);
  const action2Anim = useFadeSlide(260, 18);
  const action3Anim = useFadeSlide(330, 18);
  const footerAnim = useFadeSlide(410, 18);

  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [lastActivity, setLastActivityState] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [s, a] = await Promise.all([getDisplayStreak(), getLastActivity()]);
        if (cancelled) return;
        setStreak(s);
        setLastActivityState(a);
        refreshDailyReminder();
      })();
      return () => { cancelled = true; };
    }, []),
  );

  const resumeTarget = getResumeNavTarget(lastActivity);
  const resumeVisuals = lastActivity ? getSectionVisuals(lastActivity.section) : null;
  const resumeAccent = resumeVisuals ? (colors[resumeVisuals.accentKey] ?? colors.blue) : colors.blue;
  const handleResume = () => {
    if (resumeTarget) {
      navigation.navigate(resumeTarget.screen, resumeTarget.params);
    } else {
      navigation.navigate('PracticeMode');
    }
  };
  const streakLabel = `${streak.currentStreak} Day Streak`;

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <Animated.View style={headerAnim}>
        <HomeHeader
          navigation={navigation}
          isDark={isDark}
          toggleDark={toggleDark}
          initial={initial}
          showProfile={showProfile}
          colors={colors}
        />
      </Animated.View>

      <PremiumScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={heroAnim}>
          <LinearGradient
            colors={gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, { borderColor: colors.border, shadowColor: colors.blue }]}
          >
            <View style={styles.heroArt}>
              <DoctorHeroArt colors={colors} isDark={isDark} />
            </View>

            <View style={[styles.heroCopy, { minHeight: resumeVisuals ? 240 : 200 }]}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}, {displayName}</Text>

              <View style={[styles.streakRow, { borderColor: isDark ? 'rgba(116, 154, 209, 0.18)' : 'rgba(69, 94, 140, 0.18)', backgroundColor: isDark ? 'rgba(5, 12, 26, 0.5)' : 'rgba(255, 255, 255, 0.64)' }]}>
                <View style={styles.streakPill}>
                  <PremiumIcon name="refresh" size={21} color={colors.teal} strokeWidth={2.4} />
                  <Text style={[styles.streakText, { color: colors.teal }]}>{streakLabel}</Text>
                </View>
                <View style={[styles.firePill, { borderLeftColor: isDark ? 'rgba(116, 154, 209, 0.18)' : 'rgba(69, 94, 140, 0.18)' }]}>
                  <PremiumIcon name="flame" size={20} color={colors.amber} />
                  <Text style={[styles.fireText, { color: colors.text }]}>{streak.currentStreak}</Text>
                </View>
              </View>

              {resumeVisuals ? (
                <TouchableOpacity
                  activeOpacity={0.86}
                  onPress={handleResume}
                  style={[styles.continuePanel, { borderColor: isDark ? 'rgba(88, 126, 184, 0.18)' : 'rgba(69, 94, 140, 0.16)', backgroundColor: isDark ? 'rgba(5, 12, 25, 0.58)' : 'rgba(255, 255, 255, 0.72)' }]}
                  accessibilityRole="button"
                >
                  <RichIconBox icon={resumeVisuals.icon} accent={resumeAccent} size={42} iconSize={22} />
                  <Text style={[styles.continueTitle, { color: colors.text }]} numberOfLines={2}>
                    Continue where you left off
                  </Text>
                  <PremiumIcon name="chevron-right" size={20} color={resumeAccent} strokeWidth={2.4} />
                </TouchableOpacity>
              ) : null}
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={action1Anim}>
          <GlassMenuCard
            title="Start Practising"
            description="Adaptive practice across all UCAT subtests."
            icon="target"
            accent={colors.blue}
            highlighted
            onPress={() => navigation.navigate('PracticeMode')}
            style={styles.actionCard}
          />
        </Animated.View>

        <Animated.View style={action2Anim}>
          <GlassMenuCard
            title="Performance Analytics"
            description="Track progress, strengths, and areas to improve."
            icon="chart"
            accent={colors.teal}
            onPress={() => (isPro ? navigation.navigate('PerformanceAnalytics') : navigation.navigate('Paywall'))}
            style={styles.actionCard}
          />
        </Animated.View>

        <Animated.View style={action3Anim}>
          <GlassMenuCard
            title="About the UCAT"
            description="Understand the exam and prepare with confidence."
            icon="book"
            accent={colors.purple}
            onPress={() => navigation.navigate('AboutUCAT')}
            style={styles.actionCard}
          />
        </Animated.View>

        <Animated.View style={footerAnim}>
          <PremiumFooter style={styles.footer} />
        </Animated.View>
      </PremiumScrollView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
    flexShrink: 1,
  },
  logoCopy: {
    flexShrink: 1,
  },
  logoTitle: {
    color: premiumColors.text,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
  },
  logoSubtitle: {
    color: premiumColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
    flexShrink: 0,
  },
  headerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 33, 58, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(113, 146, 199, 0.2)',
    shadowColor: premiumColors.blue,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: Platform.OS === 'ios' ? 0.16 : 0,
    shadowRadius: 20,
    elevation: 6,
  },
  avatarCircle: {
    backgroundColor: '#172E71',
    borderColor: 'rgba(95, 139, 255, 0.34)',
  },
  avatarText: {
    color: '#BDE2FF',
    fontSize: 26,
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: premiumColors.border,
    overflow: 'hidden',
    padding: 24,
    marginBottom: 26,
    shadowColor: premiumColors.blue,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: Platform.OS === 'ios' ? 0.18 : 0,
    shadowRadius: 30,
    elevation: 8,
  },
  heroArt: {
    position: 'absolute',
    right: -26,
    top: 54,
    width: 218,
    height: 292,
    opacity: 0.9,
  },
  heroCopy: {
    justifyContent: 'flex-start',
  },
  greeting: {
    color: premiumColors.textSecondary,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 22,
    maxWidth: 240,
  },
  heroTitle: {
    color: premiumColors.text,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '900',
    maxWidth: 310,
  },
  heroTitleAccent: {
    color: premiumColors.cyan,
  },
  heroSubtitle: {
    color: premiumColors.textSecondary,
    fontSize: 18,
    lineHeight: 28,
    marginTop: 22,
    maxWidth: 260,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(116, 154, 209, 0.18)',
    borderRadius: 999,
    backgroundColor: 'rgba(5, 12, 26, 0.5)',
    marginTop: 24,
    overflow: 'hidden',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  firePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(116, 154, 209, 0.18)',
  },
  streakText: {
    color: premiumColors.teal,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  fireText: {
    color: premiumColors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  continuePanel: {
    alignSelf: 'flex-start',
    maxWidth: 250,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(88, 126, 184, 0.18)',
    backgroundColor: 'rgba(5, 12, 25, 0.58)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 18,
  },
  continueTitle: {
    flex: 1,
    color: premiumColors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  continueMeta: {
    color: premiumColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  continueChevron: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressColumn: {
    width: 118,
    alignItems: 'flex-end',
    gap: 13,
  },
  progressText: {
    color: premiumColors.blue,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  progressTrack: {
    width: 112,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(72, 98, 151, 0.33)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '82%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: premiumColors.blue,
  },
  actionCard: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 22,
  },
});
