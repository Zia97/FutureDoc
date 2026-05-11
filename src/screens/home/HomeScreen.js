import React, { useCallback, useEffect, useState } from 'react';
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

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getDisplayStreak } from '../../services/streakService';
import {
  getLastActivity,
  getResumeNavTarget,
  getSectionVisuals,
} from '../../services/lastActivityService';
import { refreshDailyReminder } from '../../services/notificationService';
import { getExamDate, NOT_BOOKED } from '../../services/onboardingFlags';
import { LEARN_FEATURE_ICON } from '../../constants/sectionVisuals';
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
import AppLogo from '../../components/AppLogo';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getDisplayName(user, profileDisplayName) {
  const name = profileDisplayName || user?.user_metadata?.full_name || user?.email?.split('@')[0];
  return name ? (name.split(/[ ._-]/)[0] || name) : '';
}

function getInitial(user, profileDisplayName) {
  const source = profileDisplayName || user?.user_metadata?.full_name || user?.email;
  return source?.trim()?.[0]?.toUpperCase() ?? '?';
}

// Parses a YYYY-MM-DD date and returns the millisecond timestamp at the
// END of that local day. The exam runs through the day, so the countdown
// shouldn't tick to "Exam day" the moment local midnight strikes.
function parseExamEndOfDay(iso) {
  if (!iso || iso === NOT_BOOKED) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59, 999);
  return d.getTime();
}

function isExamToday(iso) {
  if (!iso || iso === NOT_BOOKED) return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const today = new Date();
  return today.getFullYear() === Number(m[1])
    && today.getMonth() + 1 === Number(m[2])
    && today.getDate() === Number(m[3]);
}

const pad2 = (n) => String(Math.max(0, n | 0)).padStart(2, '0');

function ExamCountdownClock({ examDate, isDark, colors, onPress }) {
  const isSet = !!examDate && examDate !== NOT_BOOKED;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isSet) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isSet]);

  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let headline = 'TIME UNTIL YOUR UCAT EXAM';
  let helper = 'Tap to set your exam date';
  let active = false;

  if (isSet) {
    const target = parseExamEndOfDay(examDate);
    const diff = target ? target - now : 0;

    if (isExamToday(examDate)) {
      headline = "EXAM DAY — YOU'VE GOT THIS";
      helper = 'Tap to change date';
    } else if (diff <= 0) {
      headline = 'UCAT COMPLETE';
      helper = 'Tap to change date';
    } else {
      const totalSeconds = Math.floor(diff / 1000);
      days = Math.floor(totalSeconds / 86400);
      hours = Math.floor((totalSeconds % 86400) / 3600);
      minutes = Math.floor((totalSeconds % 3600) / 60);
      seconds = totalSeconds % 60;
      helper = 'Tap to change date';
      active = true;
    }
  }

  const digits = active
    ? `${pad2(days)}:${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
    : '--:--:--:--';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isSet ? 'Change exam date' : 'Set exam date'}
      style={[
        styles.clockCard,
        {
          borderColor: hexToRgba(colors.cyan, isDark ? 0.34 : 0.32),
          backgroundColor: isDark ? 'rgba(5, 12, 26, 0.55)' : 'rgba(255, 255, 255, 0.7)',
        },
      ]}
    >
      <Text style={[styles.clockHeadline, { color: colors.textSecondary }]} numberOfLines={1}>
        {headline}
      </Text>
      <Text style={[styles.clockDigits, { color: colors.text }]} numberOfLines={1}>
        {digits}
      </Text>
      <View style={styles.clockUnitsRow}>
        <Text style={[styles.clockUnit, { color: colors.textMuted }]}>days</Text>
        <Text style={[styles.clockUnit, { color: colors.textMuted }]}>hrs</Text>
        <Text style={[styles.clockUnit, { color: colors.textMuted }]}>min</Text>
        <Text style={[styles.clockUnit, { color: colors.textMuted }]}>sec</Text>
      </View>
      <Text style={[styles.clockHelper, { color: colors.textMuted }]} numberOfLines={1}>
        {helper}
      </Text>
    </TouchableOpacity>
  );
}

function HomeHeader({ navigation, isDark, toggleDark, initial, colors }) {
  const avatarTint = isDark ? '#BDE2FF' : colors.blue;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
      <View style={styles.logoRow}>
        <AppLogo
          size={48}
          radius={16}
          shadowColor={colors.blue}
          borderColor={hexToRgba(colors.blue, 0.34)}
        />
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
          onPress={() => navigation.navigate('Profile')}
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
          accessibilityLabel="Open profile"
        >
          <Text style={[styles.avatarText, { color: avatarTint }]}>{initial}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { user, displayName: profileDisplayName } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);

  const initial = getInitial(user, profileDisplayName);
  const displayName = getDisplayName(user, profileDisplayName);

  const headerAnim = useFadeSlide(0, 12);
  const heroAnim = useFadeSlide(90, 18);
  const action1Anim = useFadeSlide(190, 18);
  const action2Anim = useFadeSlide(260, 18);
  const action3Anim = useFadeSlide(330, 18);
  const action4Anim = useFadeSlide(400, 18);
  const footerAnim = useFadeSlide(480, 18);

  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [lastActivity, setLastActivityState] = useState(null);
  const [examDate, setExamDateState] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [s, a, e] = await Promise.all([getDisplayStreak(), getLastActivity(), getExamDate()]);
        if (cancelled) return;
        setStreak(s);
        setLastActivityState(a);
        setExamDateState(e);
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
            <View style={[styles.heroCopy, { minHeight: resumeVisuals ? 150 : 112 }]}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}, {displayName}</Text>

              <ExamCountdownClock
                examDate={examDate}
                isDark={isDark}
                colors={colors}
                onPress={() => navigation.navigate('ExamDate')}
              />

              <View style={[styles.streakRow, { borderColor: isDark ? 'rgba(116, 154, 209, 0.18)' : 'rgba(69, 94, 140, 0.18)', backgroundColor: isDark ? 'rgba(5, 12, 26, 0.5)' : 'rgba(255, 255, 255, 0.64)' }]}>
                <View style={styles.streakPill}>
                  <PremiumIcon name="refresh" size={16} color={colors.teal} strokeWidth={2.4} />
                  <Text style={[styles.streakText, { color: colors.teal }]}>{streakLabel}</Text>
                </View>
                <View style={[styles.firePill, { borderLeftColor: isDark ? 'rgba(116, 154, 209, 0.18)' : 'rgba(69, 94, 140, 0.18)' }]}>
                  <PremiumIcon name="flame" size={15} color={colors.amber} />
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
            title="Learn UCAT Techniques"
            description="Theory, question types, worked examples, and strategy."
            icon={LEARN_FEATURE_ICON}
            accent={colors.cyan}
            onPress={() => navigation.navigate('LearnSections')}
            style={styles.actionCard}
          />
        </Animated.View>

        <Animated.View style={action3Anim}>
          <GlassMenuCard
            title="Performance Analytics"
            description="Track progress, strengths, and areas to improve."
            icon="chart"
            accent={colors.teal}
            onPress={() => navigation.navigate('PerformanceAnalytics')}
            style={styles.actionCard}
          />
        </Animated.View>

        <Animated.View style={action4Anim}>
          <GlassMenuCard
            title="About the UCAT"
            description="General knowledge about the UCAT"
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
    marginTop: 14,
    overflow: 'hidden',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  firePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(116, 154, 209, 0.18)',
  },
  streakText: {
    color: premiumColors.teal,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  fireText: {
    color: premiumColors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  clockCard: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 6,
    alignItems: 'center',
  },
  clockHeadline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  clockDigits: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  clockUnitsRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-around',
    marginTop: 4,
    paddingHorizontal: 6,
  },
  clockUnit: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    width: 56,
    textAlign: 'center',
  },
  clockHelper: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.4,
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
