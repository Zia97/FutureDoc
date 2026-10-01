import React, { useEffect, useRef, useState } from 'react';
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

import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';
import PremiumIcon from './PremiumIcon';
import {
  PremiumScreen,
  PremiumScrollView,
  RichIconBox,
  useFadeSlide,
} from './PremiumPracticeUI';

export default function PremiumInstructionScreen({
  navigation,
  sectionTitle,
  sectionIcon,
  accent,
  durationSeconds,
  readNotice,
  table,
  paragraphs,
  credit,
  onStart,
}) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onStart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const handleStart = () => {
    clearInterval(timerRef.current);
    onStart();
  };

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation?.navigate?.('Home');
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timerLabel = `${mins}:${secs.toString().padStart(2, '0')}`;
  const isUrgent = secondsLeft <= 30;
  const timerColor = isUrgent ? colors.red : accent;

  const headerAnim = useFadeSlide(0);
  const introAnim = useFadeSlide(80);
  const tableAnim = useFadeSlide(160);
  const bodyAnim = useFadeSlide(240);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />

      <Animated.View style={[styles.appHeader, { paddingTop: Math.max(insets.top, 12) + 8 }, headerAnim]}>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={handleBack}
          style={[
            styles.headerIconButton,
            {
              backgroundColor: isDark ? 'rgba(17, 31, 55, 0.82)' : 'rgba(255, 255, 255, 0.78)',
              borderColor: isDark ? 'rgba(122, 158, 214, 0.2)' : 'rgba(69, 94, 140, 0.22)',
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <PremiumIcon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.appHeaderTitle, { color: colors.text }]} numberOfLines={1}>
          {sectionTitle}
        </Text>

        <View
          style={[
            styles.timerPill,
            {
              borderColor: hexToRgba(timerColor, 0.45),
              backgroundColor: hexToRgba(timerColor, isDark ? 0.16 : 0.12),
              shadowColor: timerColor,
            },
          ]}
        >
          <PremiumIcon name="timer" size={14} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]}>{timerLabel}</Text>
        </View>
      </Animated.View>

      <PremiumScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.intro, introAnim]}>
          <View style={styles.introHeading}>
            <RichIconBox icon={sectionIcon} accent={accent} size={52} iconSize={26} />
            <View style={styles.introCopy}>
              <Text style={[styles.eyebrow, { color: accent }]}>Test Instructions</Text>
              <Text style={[styles.heading, { color: colors.text }]}>{sectionTitle}</Text>
            </View>
          </View>
          <Text style={[styles.readNotice, { color: colors.textSecondary }]}>{readNotice}</Text>
        </Animated.View>

        <Animated.View style={tableAnim}>
          <LinearGradient
            colors={[
              isDark ? 'rgba(18, 35, 64, 0.96)' : 'rgba(255, 255, 255, 0.98)',
              isDark ? 'rgba(8, 22, 43, 0.96)' : 'rgba(246, 250, 255, 0.98)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.tableCard,
              {
                borderColor: hexToRgba(accent, isDark ? 0.32 : 0.28),
                shadowColor: accent,
              },
            ]}
          >
            <View style={[styles.accentStripe, { backgroundColor: accent, shadowColor: accent }]} />

            <View style={styles.tableRow}>
              <View style={[styles.tableCell, { flex: 3 }]}>
                <Text style={[styles.tableHeader, { color: colors.textMuted }]}>Subtest</Text>
                <Text style={[styles.tableValue, { color: colors.text }]}>{table.subtest}</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellDivider, { borderLeftColor: colors.border, flex: 2 }]}>
                <Text style={[styles.tableHeader, { color: colors.textMuted }]}>Questions</Text>
                <Text style={[styles.tableValue, { color: colors.text, textAlign: 'center' }]}>{table.questions}</Text>
              </View>
            </View>

            <View style={[styles.timeBlockDivider, { backgroundColor: colors.border }]} />

            <View style={styles.timeBlock}>
              <View style={styles.timeRow}>
                <View style={styles.timeMeta}>
                  <Text style={[styles.tableHeader, { color: colors.textMuted }]}>UCAT</Text>
                  <Text style={[styles.tableValue, { color: colors.text }]}>{table.timeUCAT}</Text>
                </View>
                <View style={[styles.timePill, { borderColor: hexToRgba(accent, 0.32), backgroundColor: hexToRgba(accent, 0.1) }]}>
                  <Text style={[styles.timePillText, { color: accent }]}>Standard</Text>
                </View>
              </View>

              <View style={[styles.timeMiniDivider, { backgroundColor: colors.border }]} />

              <View style={styles.timeRow}>
                <View style={styles.timeMeta}>
                  <Text style={[styles.tableHeader, { color: colors.textMuted }]}>UCAT +25%</Text>
                  <Text style={[styles.tableValue, { color: colors.text }]}>{table.timeExtended}</Text>
                </View>
                <View style={[styles.timePill, { borderColor: hexToRgba(colors.amber, 0.36), backgroundColor: hexToRgba(colors.amber, 0.1) }]}>
                  <Text style={[styles.timePillText, { color: colors.amber }]}>+25%</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.body, bodyAnim]}>
          {paragraphs.map((node, idx) => (
            <View key={idx} style={styles.bullet}>
              <View style={[styles.bulletDot, { backgroundColor: accent, shadowColor: accent }]} />
              <Text style={[styles.bodyText, { color: colors.text }]}>{node}</Text>
            </View>
          ))}

          {credit ? (
            <Text style={[styles.credit, { color: colors.textMuted }]}>{credit}</Text>
          ) : null}
        </Animated.View>
      </PremiumScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 14,
            borderTopColor: colors.border,
            backgroundColor: isDark ? 'rgba(4, 10, 23, 0.92)' : 'rgba(247, 250, 255, 0.94)',
          },
        ]}
      >
        <TouchableOpacity activeOpacity={0.92} onPress={handleStart} style={styles.startTouch}>
          <View style={[styles.startGlow, { backgroundColor: hexToRgba(accent, isDark ? 0.32 : 0.22), shadowColor: accent }]} />
          <LinearGradient
            colors={[hexToRgba(accent, 1), accent, hexToRgba(accent, 0.82)]}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.startButton, { shadowColor: accent, borderColor: hexToRgba('#ffffff', 0.28) }]}
          >
            <LinearGradient
              colors={[hexToRgba('#ffffff', 0.32), hexToRgba('#ffffff', 0)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.startSheen}
              pointerEvents="none"
            />
            <View style={styles.startInner}>
              <View style={styles.startLabelGroup}>
                <Text style={styles.startButtonText}>Start Test</Text>
              </View>
              <View style={[styles.startIconChip, { backgroundColor: hexToRgba('#ffffff', 0.22), borderColor: hexToRgba('#ffffff', 0.45) }]}>
                <PremiumIcon name="chevron-right" size={20} color="#ffffff" strokeWidth={2.8} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  appHeader: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  appHeaderTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'ios' ? 0.28 : 0,
    shadowRadius: 12,
  },
  timerText: {
    fontWeight: '800',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.4,
  },
  scroll: {
    paddingTop: 4,
    paddingBottom: 24,
    gap: 22,
  },
  intro: {
    gap: 14,
  },
  introHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  introCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    marginTop: 4,
  },
  readNotice: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  tableCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 22,
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
    shadowOpacity: Platform.OS === 'ios' ? 0.85 : 0,
    shadowRadius: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tableCell: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  tableCellDivider: {
    borderLeftWidth: 1,
    paddingLeft: 14,
  },
  tableHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tableValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  timeBlockDivider: {
    height: 1,
    marginVertical: 14,
    opacity: 0.7,
  },
  timeBlock: {
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeMeta: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  timePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  timePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  timeMiniDivider: {
    height: 1,
    opacity: 0.5,
  },
  body: {
    gap: 14,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingRight: 4,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 9,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.85 : 0,
    shadowRadius: 6,
  },
  bodyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  credit: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  startTouch: {
    borderRadius: 22,
  },
  startGlow: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 10,
    bottom: -6,
    borderRadius: 28,
    opacity: 0.9,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: Platform.OS === 'ios' ? 0.55 : 0,
    shadowRadius: 28,
    elevation: 12,
  },
  startButton: {
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: Platform.OS === 'ios' ? 0.42 : 0,
    shadowRadius: 22,
    elevation: 8,
  },
  startSheen: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '55%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  startInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  startLabelGroup: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  startEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  startIconChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
