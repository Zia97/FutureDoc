import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';
import PremiumIcon from '../premium/PremiumIcon';

export default function LessonIntroCard({ lesson, accent }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const iconName = lesson.icon ?? 'book';
  const showMeta = lesson.duration || lesson.type;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(5, 12, 26, 0.62)' : 'rgba(248, 252, 255, 0.92)',
          borderColor: hexToRgba(accent, 0.52),
          shadowColor: accent,
        },
      ]}
    >
      <LinearGradient
        colors={[hexToRgba(accent, isDark ? 0.22 : 0.16), hexToRgba(accent, 0)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
        pointerEvents="none"
      />

      <View
        style={[
          styles.iconRing,
          {
            borderColor: hexToRgba(accent, 0.55),
            backgroundColor: hexToRgba(accent, isDark ? 0.18 : 0.12),
          },
        ]}
      >
        <PremiumIcon name={iconName} size={30} color={accent} strokeWidth={2.2} />
      </View>

      <Text style={[styles.eyebrow, { color: accent }]}>LESSON INTRO</Text>
      <Text style={[styles.title, { color: colors.text }]}>{lesson.title}</Text>

      {lesson.subtitle ? (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>WHAT YOU'LL LEARN</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{lesson.subtitle}</Text>
        </>
      ) : null}

      {showMeta ? (
        <View style={styles.metaRow}>
          {lesson.duration ? (
            <View
              style={[
                styles.metaPill,
                {
                  borderColor: hexToRgba(accent, 0.42),
                  backgroundColor: hexToRgba(accent, isDark ? 0.16 : 0.10),
                },
              ]}
            >
              <PremiumIcon name="timer" size={12} color={accent} strokeWidth={2.4} />
              <Text style={[styles.metaText, { color: accent }]}>{lesson.duration}</Text>
            </View>
          ) : null}
          {lesson.type ? (
            <View
              style={[
                styles.metaPill,
                {
                  borderColor: colors.border,
                  backgroundColor: hexToRgba(colors.textMuted, isDark ? 0.14 : 0.08),
                },
              ]}
            >
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{lesson.type}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.swipeHint, { borderTopColor: colors.border }]}>
        <Text style={[styles.swipeText, { color: colors.textMuted }]}>
          Swipe to begin the lesson
        </Text>
        <PremiumIcon name="chevron-right" size={14} color={accent} strokeWidth={2.6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  iconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  metaText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  swipeHint: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  swipeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
