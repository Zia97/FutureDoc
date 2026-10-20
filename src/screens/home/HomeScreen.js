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
import { getExamDate, NOT_BOOKED } from '../../services/onboardingFlags';
import { LEARN_FEATURE_ICON } from '../../constants/sectionVisuals';
import {
  GlassMenuCard,
  PremiumFooter,
  PremiumIcon,
  PremiumScreen,
  PremiumScrollView,
  hexToRgba,
  premiumColors,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { loadCoachHubCache, saveCoachHubCache, coachRequest } from '../../services/coachingService';
import { buildDashboardStory, sectionSnapshot } from '../../lib/coaching/dashboard';
import { StatRing, SECTION_COLOURS } from '../../components/performance/PerformanceUI';
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

function ExamCountdownClock({ examDate, isDark, colors, onPress }) {
  const isSet = !!examDate && examDate !== NOT_BOOKED;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!isSet) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isSet, examDate]);

  const remaining = isSet ? parseExamEndOfDay(examDate) - now : null;
  const secondsLeft = remaining == null ? 0 : Math.max(0, Math.floor(remaining / 1000));
  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  const pad = (value) => String(value).padStart(2, '0');
  let label = 'Set exam date';
  if (isSet) {
    if (remaining <= 0) label = 'Exam date passed';
    else label = `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)} till exam`;
  }
  return <TouchableOpacity activeOpacity={0.85} onPress={onPress} accessibilityRole="button"
    accessibilityLabel={isSet ? 'Change exam date' : 'Set exam date'}
    style={[styles.summaryPill, styles.examCountdownPill, { borderColor: hexToRgba(colors.blue, isDark ? 0.24 : 0.18), backgroundColor: isDark ? 'rgba(5, 12, 26, 0.45)' : 'rgba(255, 255, 255, 0.7)' }]}>
    <PremiumIcon name="timer" size={15} color={colors.cyan} />
    <Text style={[styles.summaryText, styles.countdownText, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{label}</Text>
  </TouchableOpacity>;
}

function StudyStreakCard({ streak, isDark, colors }) {
  const current = streak.currentStreak ?? 0;
  return <View style={[styles.summaryPill, { borderColor: hexToRgba(colors.amber, isDark ? 0.3 : 0.25), backgroundColor: isDark ? 'rgba(5, 12, 26, 0.45)' : 'rgba(255, 255, 255, 0.7)' }]}>
    <PremiumIcon name="flame" size={15} color={colors.amber} />
    <Text style={[styles.summaryText, { color: colors.text }]} numberOfLines={1}>{current ? current + (current === 1 ? ' day streak' : ' days streak') : 'Start a streak'}</Text>
  </View>;
}

function CoachingProgressCard({ data, colors, isDark, onPress }) {
  const story = data?.profile ? buildDashboardStory(data.profile, data.baseline, data.history || []) : null;
  const snapshot = data?.profile ? sectionSnapshot(data.profile, data.baseline) : [];
  const hasBaseline = Boolean(data?.baseline);
  const border = isDark ? 'rgba(112, 94, 214, 0.3)' : 'rgba(112, 94, 214, 0.2)';
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} accessibilityRole="button" style={[styles.coachCard, { borderColor: border, backgroundColor: isDark ? '#151B38' : '#F4F2FF' }]}>
      <View style={styles.coachCardTop}>
        <View style={[styles.coachIcon, { backgroundColor: isDark ? 'rgba(151, 130, 255, 0.16)' : 'rgba(111, 87, 230, 0.12)' }]}>
          <PremiumIcon name="graduation-cap" size={20} color={colors.purple} />
        </View>
        <View style={styles.coachHeading}>
          <Text style={[styles.coachTitle, { color: colors.text }]}>{hasBaseline ? 'Your coaching progress' : 'Meet your coach'}</Text>
          <Text style={[styles.coachDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {hasBaseline ? (story?.focus?.title ? 'Next focus: ' + story.focus.title : 'Your performance plan is ready') : 'Take your mini mock to build your personal plan'}
          </Text>
        </View>
        <PremiumIcon name="chevron-right" size={20} color={colors.purple} />
      </View>
      {hasBaseline ? (
        <View style={styles.coachMetrics}>
          {snapshot.slice(0, 4).map((item) => (
            <View key={item.id} style={[styles.coachMetric, { borderColor: hexToRgba(colors[SECTION_COLOURS[item.id]] ?? colors.blue, 0.22), backgroundColor: isDark ? 'rgba(8, 14, 31, 0.5)' : 'rgba(255,255,255,0.72)' }]}>
              <StatRing value={item.accuracy} color={colors[SECTION_COLOURS[item.id]] ?? colors.blue} size={62} compact label={`${item.title} accuracy`} />
              <Text style={[styles.coachMetricLabel, { color: colors.textSecondary }]} numberOfLines={1}>{item.short}</Text>
            </View>
          ))}
        </View>
      ) : null}
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
  const { colors } = getPremiumTheme(isDark);

  const initial = getInitial(user, profileDisplayName);
  const displayName = getDisplayName(user, profileDisplayName);

  const headerAnim = useFadeSlide(0, 12);
  const heroAnim = useFadeSlide(80, 18);
  const action1Anim = useFadeSlide(150, 18);
  const footerAnim = useFadeSlide(240, 18);

  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [lastActivity, setLastActivityState] = useState(null);
  const [examDate, setExamDateState] = useState(null);
  const [coachData, setCoachData] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [s, a, e, cached] = await Promise.all([getDisplayStreak(), getLastActivity(), getExamDate(), user?.id ? loadCoachHubCache(user.id) : null]);
        if (cancelled) return;
        setStreak(s);
        setLastActivityState(a);
        setExamDateState(e);
        if (cached) setCoachData(cached);
        if (user?.id) {
          try {
            const latest = await coachRequest(user.id, 'hub');
            if (cancelled) return;
            setCoachData(latest);
            void saveCoachHubCache(user.id, latest).catch(() => {});
          } catch (_) { /* Keep the locally cached coaching summary available offline. */ }
        }
      })();
      return () => { cancelled = true; };
    }, [user?.id]),
  );

  const resumeTarget = getResumeNavTarget(lastActivity);
  const resumeVisuals = lastActivity ? getSectionVisuals(lastActivity.section) : null;
  const resumeAccent = resumeVisuals ? (colors[resumeVisuals.accentKey] ?? colors.blue) : colors.blue;
  const handleResume = () => {
    if (resumeTarget) {
      navigation.navigate(resumeTarget.screen, resumeTarget.params);
    } else {
      navigation.navigate('MainTabs', { screen: 'PracticeSections' });
    }
  };
  const openCoaching = () => navigation.navigate('MainTabs', { screen: 'Coaching' });
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
          <View style={styles.summaryRow}>
            <ExamCountdownClock examDate={examDate} isDark={isDark} colors={colors} onPress={() => navigation.navigate('ExamDate')} />
            <StudyStreakCard streak={streak} isDark={isDark} colors={colors} />
          </View>
          {displayName ? <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}, {displayName}</Text> : null}
          <CoachingProgressCard data={coachData} colors={colors} isDark={isDark} onPress={openCoaching} />
          {resumeVisuals ? (
            <TouchableOpacity activeOpacity={0.85} onPress={handleResume} style={[styles.resumeLink, { borderColor: colors.border }]} accessibilityRole="button">
              <PremiumIcon name={resumeVisuals.icon} size={18} color={resumeAccent} />
              <Text style={[styles.resumeText, { color: colors.text }]} numberOfLines={1}>Continue where you left off</Text>
              <PremiumIcon name="chevron-right" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </Animated.View>

        <Animated.View style={action1Anim}>
          <GlassMenuCard title="Practice" description="Free or timed questions across the UCAT subtests." icon="target" accent={colors.blue} highlighted onPress={() => navigation.navigate('MainTabs', { screen: 'PracticeSections' })} style={styles.actionCard} />
          <GlassMenuCard title="Coaching" description="Your personalised plan, practice and progress." icon="graduation-cap" accent={colors.purple} onPress={openCoaching} style={styles.actionCard} />
          <GlassMenuCard title="Learn UCAT Techniques" description="Lessons and strategies for every subtest." icon={LEARN_FEATURE_ICON} accent={colors.cyan} onPress={() => navigation.navigate('LearnSections')} style={styles.actionCard} />
          <GlassMenuCard title="Your progress" description="Section results, skills and cohort comparison." icon="chart" accent={colors.teal} onPress={() => navigation.navigate('MainTabs', { screen: 'Coaching', params: { area: 'progress' } })} style={styles.actionCard} />
          <GlassMenuCard title="Student Community" description="Ask questions and learn with other students." icon="chat" accent={colors.purple} onPress={() => navigation.navigate('MainTabs', { screen: 'Community' })} style={styles.actionCard} />
          <GlassMenuCard title="About the UCAT" description="Learn how the test works." icon="book" accent={colors.amber} onPress={() => navigation.navigate('AboutUCAT')} style={styles.actionCard} />
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 14,
  },
  summaryPill: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 14,
    flex: 1,
    minWidth: 0,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    flexShrink: 1,
  },
  examCountdownPill: { flexGrow: 1.35 },
  countdownText: {
    fontSize: 10,
    letterSpacing: -0.35,
    fontVariant: ['tabular-nums'],
  },
  greeting: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    marginBottom: 12,
  },
  coachCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  coachCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  coachIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachHeading: { flex: 1, minWidth: 0 },
  coachTitle: { fontSize: 17, lineHeight: 21, fontWeight: '800' },
  coachDescription: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  coachMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 9,
    marginTop: 14,
  },
  coachMetric: { width: '48.5%', minHeight: 88, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, gap: 3 },
  coachMetricLabel: { fontSize: 11, lineHeight: 14, fontWeight: '700', marginTop: 2 },
  resumeLink: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  resumeText: { flex: 1, fontSize: 13, fontWeight: '700' },
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
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 159, 67, 0.34)',
    borderRadius: 18,
    backgroundColor: 'rgba(5, 12, 26, 0.5)',
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
    minHeight: 72,
    overflow: 'hidden',
  },
  streakIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  streakCopy: {
    flex: 1,
    minWidth: 0,
  },
  streakEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  streakValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
    gap: 6,
  },
  streakValue: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  streakUnit: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  streakBestBox: {
    minWidth: 54,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(116, 154, 209, 0.18)',
    paddingLeft: 13,
    marginLeft: 12,
    alignItems: 'center',
  },
  streakBestLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  streakBestValue: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    marginTop: 3,
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
