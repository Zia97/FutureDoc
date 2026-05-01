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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getDisplayName(user, profileDisplayName) {
  if (!user) return 'Guest';
  const name = profileDisplayName || user?.user_metadata?.full_name || user?.email?.split('@')[0];
  if (!name) return 'Guest';
  return name.split(/[ ._-]/)[0] || 'Guest';
}

function getInitial(user, profileDisplayName) {
  const source = profileDisplayName || user?.user_metadata?.full_name || user?.email;
  return source?.trim()?.[0]?.toUpperCase() ?? '?';
}

function HomeHeader({ navigation, isDark, toggleDark, initial, showProfile, colors }) {
  const avatarTint = isDark ? '#BDE2FF' : colors.blue;
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
          {showProfile ? (
            <Text style={[styles.avatarText, { color: avatarTint }]}>{initial}</Text>
          ) : (
            <PremiumIcon name="user" size={26} color={avatarTint} strokeWidth={2.2} />
          )}
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
  const initial = showProfile ? getInitial(user, profileDisplayName) : '';
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
            <View style={[styles.heroCopy, { minHeight: resumeVisuals ? 150 : 112 }]}>
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
            title="Learn UCAT Techniques"
            description="Theory, question types, worked examples, and strategy."
            icon={LEARN_FEATURE_ICON}
            accent={colors.cyan}
            highlighted
            onPress={() => navigation.navigate('LearnSections')}
            style={styles.actionCard}
          />
        </Animated.View>

        <Animated.View style={action2Anim}>
          <GlassMenuCard
            title="Start Practising"
            description="Adaptive practice across all UCAT subtests."
            icon="target"
            accent={colors.blue}
            onPress={() => navigation.navigate('PracticeMode')}
            style={styles.actionCard}
          />
        </Animated.View>

        <Animated.View style={action3Anim}>
          <GlassMenuCard
            title="Performance Analytics"
            description="Track progress, strengths, and areas to improve."
            icon="chart"
            accent={colors.teal}
            onPress={() => (isPro ? navigation.navigate('PerformanceAnalytics') : navigation.navigate('Paywall'))}
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
