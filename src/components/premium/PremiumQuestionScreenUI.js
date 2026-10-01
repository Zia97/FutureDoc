import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';
import { PremiumScreen } from './PremiumPracticeUI';
import PremiumIcon from './PremiumIcon';

export function PremiumQuestionScaffold({ children, panHandlers, style }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'left', 'right']} {...panHandlers}>
        {children}
      </SafeAreaView>
    </PremiumScreen>
  );
}

export function PremiumQuestionLoading({ label = 'Loading...' }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{label}</Text>
      </View>
    </PremiumScreen>
  );
}

export function QuestionTopBar({
  title,
  subtitle,
  timerDisplay,
  isUrgent = false,
  accent,
  onExit,
}) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const activeAccent = accent ?? colors.blue;
  const timerColor = isUrgent ? colors.red : activeAccent;

  return (
    <View style={styles.topBar}>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onExit}
        style={[
          styles.exitButton,
          {
            borderColor: isDark ? 'rgba(122, 158, 214, 0.2)' : 'rgba(69, 94, 140, 0.22)',
            backgroundColor: isDark ? 'rgba(17, 31, 55, 0.82)' : 'rgba(255, 255, 255, 0.78)',
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Leave questions"
      >
        <PremiumIcon name="arrow-left" size={21} color={colors.text} strokeWidth={2.3} />
      </TouchableOpacity>

      <View style={styles.topTitleBlock}>
        <Text style={[styles.topTitle, styles.topTitleCenter, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.topSubtitle, styles.topTitleCenter, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {timerDisplay ? (
        <View
          style={[
            styles.timerPill,
            {
              borderColor: hexToRgba(timerColor, isDark ? 0.54 : 0.36),
              backgroundColor: hexToRgba(timerColor, isDark ? 0.15 : 0.1),
            },
          ]}
        >
          <PremiumIcon name="timer" size={16} color={timerColor} strokeWidth={2.2} />
          <Text style={[styles.timerText, { color: timerColor }]}>{timerDisplay}</Text>
        </View>
      ) : (
        <View style={styles.topRightSpacer} />
      )}
    </View>
  );
}

export function QuestionPanel({ children, style }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  return (
    <LinearGradient
      colors={isDark
        ? ['rgba(13, 27, 51, 0.9)', 'rgba(7, 18, 36, 0.94)']
        : ['rgba(255, 255, 255, 0.96)', 'rgba(246, 250, 255, 0.96)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.panel,
        {
          borderColor: colors.border,
          shadowColor: colors.blue,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

export function SectionLabel({ children, accent }) {
  const { colors } = getPremiumTheme(useTheme().isDark);
  return (
    <Text style={[styles.sectionLabel, { color: accent ?? colors.blue }]}>
      {children}
    </Text>
  );
}

export function QuestionText({ children, muted = false, style }) {
  const { colors } = getPremiumTheme(useTheme().isDark);
  const { multiplier } = useTextSize();
  const base = muted ? styles.mutedText : styles.questionText;
  const scaled = {
    fontSize: Math.round(base.fontSize * multiplier),
    lineHeight: Math.round(base.lineHeight * multiplier),
  };
  return (
    <Text style={[base, scaled, { color: muted ? colors.textSecondary : colors.text }, style]}>
      {children}
    </Text>
  );
}

export function QuestionDivider() {
  const { colors } = getPremiumTheme(useTheme().isDark);
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

export function PrimaryQuestionButton({ children, onPress, disabled, accent, style }) {
  const { colors } = getPremiumTheme(useTheme().isDark);
  const activeAccent = accent ?? colors.blue;

  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.primaryButton,
        { backgroundColor: activeAccent, opacity: disabled ? 0.55 : 1 },
        style,
      ]}
      accessibilityRole="button"
    >
      <Text style={styles.primaryButtonText}>{children}</Text>
    </TouchableOpacity>
  );
}

export function FlagButton({ active, onPress, accent }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const activeAccent = accent ?? colors.amber;
  const iconColor = active ? activeAccent : colors.textSecondary;

  return (
    <TouchableOpacity
      activeOpacity={0.76}
      onPress={onPress}
      style={[
        styles.flagButton,
        {
          borderColor: hexToRgba(iconColor, active ? 0.42 : 0.2),
          backgroundColor: active ? hexToRgba(activeAccent, isDark ? 0.16 : 0.1) : 'transparent',
        },
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Unflag question' : 'Flag question'}
    >
      <PremiumIcon name="flag" size={19} color={iconColor} strokeWidth={2.1} />
    </TouchableOpacity>
  );
}

export function PremiumPauseModal({ visible, onResume }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.pauseOverlay, { backgroundColor: isDark ? '#02050C' : '#F8FBFF' }]}>
        <View style={[styles.pauseCardWrap, { shadowColor: colors.blue }]}>
          <LinearGradient
            colors={isDark
              ? ['#162C52', '#0B1831', '#050C1A']
              : ['#FFFFFF', '#F4F9FF', '#E8F1FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.pauseCard, { borderColor: hexToRgba(colors.blue, isDark ? 0.32 : 0.22) }]}
          >
            <View style={[styles.pauseAccentBar, { backgroundColor: colors.blue }]} />

            <View style={styles.pauseIconHalo}>
              <View style={[styles.pauseHaloRing, { borderColor: hexToRgba(colors.blue, 0.18) }]} />
              <View style={[styles.pauseHaloRingInner, { borderColor: hexToRgba(colors.blue, 0.28) }]} />
              <LinearGradient
                colors={[hexToRgba(colors.blue, 0.32), hexToRgba(colors.blue, 0.08)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.pauseIconWrap, { borderColor: hexToRgba(colors.blue, 0.5) }]}
              >
                <PremiumIcon name="pause" size={32} color={colors.blue} />
              </LinearGradient>
            </View>

            <Text style={[styles.pauseEyebrow, { color: colors.blue }]}>SESSION PAUSED</Text>
            <Text style={[styles.pauseTitle, { color: colors.text }]}>Take a breath</Text>
            <Text style={[styles.pauseSubtitle, { color: colors.textSecondary }]}>
              The timer has stopped. Step away for a moment, then resume when you're focused and ready.
            </Text>

            <View style={[styles.pauseDivider, { backgroundColor: hexToRgba(colors.blue, isDark ? 0.18 : 0.14) }]} />

            <View style={[styles.pauseReminderBox, { backgroundColor: hexToRgba(colors.amber, isDark ? 0.1 : 0.08), borderColor: hexToRgba(colors.amber, 0.32) }]}>
              <View style={[styles.pauseReminderDot, { backgroundColor: colors.amber }]} />
              <Text style={[styles.pauseReminder, { color: colors.textSecondary }]}>
                You won't be able to pause during the real UCAT exam.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.resumeButtonWrap}
              onPress={onResume}
              activeOpacity={0.88}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[colors.blue, hexToRgba(colors.blue, 0.78)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.resumeButton}
              >
                <PremiumIcon name="play" size={17} color="#ffffff" />
                <Text style={styles.resumeButtonText}>Resume Test</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
  },
  topBar: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  topTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  topTitleCenter: {
    textAlign: 'center',
  },
  topRightSpacer: {
    width: 42,
    height: 42,
  },
  topTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  topSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  timerPill: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  exitButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0,
    shadowRadius: 22,
    elevation: 0,
  },
  sectionLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  mutedText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  flagButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pauseOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  pauseCardWrap: {
    width: '100%',
    maxWidth: 380,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: Platform.OS === 'ios' ? 0.35 : 0,
    shadowRadius: 32,
  },
  pauseCard: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 38,
    paddingBottom: 28,
    paddingHorizontal: 26,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pauseAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.85,
  },
  pauseIconHalo: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  pauseHaloRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
  },
  pauseHaloRingInner: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
  },
  pauseIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.4,
  },
  pauseEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  pauseTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  pauseSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  pauseDivider: {
    height: 1,
    alignSelf: 'stretch',
    marginVertical: 18,
  },
  pauseReminderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  pauseReminderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pauseReminder: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  resumeButtonWrap: {
    alignSelf: 'stretch',
    borderRadius: 14,
    overflow: 'hidden',
  },
  resumeButton: {
    minHeight: 52,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
