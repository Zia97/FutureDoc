import React, { useMemo } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba, premiumColors } from '../../theme/premiumTheme';
import { UCAT_SECTIONS } from '../../constants/sectionVisuals';
import PremiumIcon from './PremiumIcon';

const SECTION_COPY = {
  VR: {
    shortLabel: UCAT_SECTIONS.VR.shortLabel,
    title: UCAT_SECTIONS.VR.title,
    description: 'Reading speed, accuracy, and scaled-score movement.',
    icon: UCAT_SECTIONS.VR.icon,
  },
  DM: {
    shortLabel: UCAT_SECTIONS.DM.shortLabel,
    title: UCAT_SECTIONS.DM.title,
    description: 'Logic, assumptions, diagrams, and reasoning accuracy.',
    icon: UCAT_SECTIONS.DM.icon,
  },
  QR: {
    shortLabel: UCAT_SECTIONS.QR.shortLabel,
    title: UCAT_SECTIONS.QR.title,
    description: 'Numerical accuracy, timing, and data interpretation.',
    icon: UCAT_SECTIONS.QR.icon,
  },
  SJ: {
    shortLabel: UCAT_SECTIONS.SJ.shortLabel,
    title: UCAT_SECTIONS.SJ.title,
    description: 'Professional judgement, bands, and mark quality.',
    icon: UCAT_SECTIONS.SJ.icon,
  },
};

export function getAnalyticsSectionMeta(sectionKey = 'VR', colors = premiumColors) {
  const accentKey = UCAT_SECTIONS[sectionKey]?.accentKey ?? UCAT_SECTIONS.VR.accentKey;

  return {
    key: sectionKey,
    ...(SECTION_COPY[sectionKey] ?? SECTION_COPY.VR),
    accent: colors[accentKey] ?? colors.blue,
  };
}

export function createPremiumAnalyticsTheme(isDark = true, sectionKey = 'VR') {
  const { colors, gradients } = getPremiumTheme(isDark);
  const meta = getAnalyticsSectionMeta(sectionKey, colors);

  return {
    colors,
    gradients,
    meta,
    isDark,
    accent: meta.accent,
    accentDim: hexToRgba(meta.accent, isDark ? 0.16 : 0.11),
    bgInput: colors.bgBottom,
    bgCard: isDark ? 'rgba(12, 27, 52, 0.86)' : 'rgba(255, 255, 255, 0.88)',
    bgTrack: isDark ? 'rgba(3, 9, 20, 0.66)' : 'rgba(224, 235, 250, 0.88)',
    border: isDark ? 'rgba(116, 154, 209, 0.24)' : 'rgba(69, 94, 140, 0.2)',
    text: colors.text,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    correct: colors.mint,
    danger: colors.red,
    warning: colors.amber,
    statusBar: isDark ? 'light-content' : 'dark-content',
  };
}

export function usePremiumAnalyticsTheme(sectionKey = 'VR') {
  const { isDark } = useTheme();
  return useMemo(() => createPremiumAnalyticsTheme(isDark, sectionKey), [isDark, sectionKey]);
}

export function AnalyticsCard({ t, children, accent, style, ...props }) {
  const cardAccent = accent ?? t.accent;

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          borderColor: hexToRgba(cardAccent, t.isDark ? 0.28 : 0.18),
          shadowColor: cardAccent,
        },
        style,
      ]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={t.isDark
          ? ['rgba(18, 35, 64, 0.95)', 'rgba(8, 22, 43, 0.95)', 'rgba(4, 10, 23, 0.98)']
          : ['rgba(255, 255, 255, 0.96)', 'rgba(246, 250, 255, 0.96)', 'rgba(235, 243, 255, 0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[hexToRgba(cardAccent, t.isDark ? 0.22 : 0.12), hexToRgba(cardAccent, 0)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.7 }}
        style={styles.cardGlow}
      />
      <View pointerEvents="none" style={[styles.cardStripe, { backgroundColor: cardAccent }]} />
      {children}
    </View>
  );
}

export function AnalyticsTile({ t, label, value, valueColor, accent, style }) {
  const tileAccent = accent ?? valueColor ?? t.accent;

  return (
    <View
      style={[
        styles.tile,
        {
          borderColor: hexToRgba(tileAccent, t.isDark ? 0.3 : 0.2),
          shadowColor: tileAccent,
        },
        style,
      ]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[
          hexToRgba(tileAccent, t.isDark ? 0.14 : 0.08),
          t.isDark ? 'rgba(5, 13, 29, 0.78)' : 'rgba(255, 255, 255, 0.72)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text
        style={[styles.tileValue, { color: valueColor ?? t.text }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
      >
        {value}
      </Text>
      <Text style={[styles.tileLabel, { color: t.textSecondary }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

export function AnalyticsInsight({ t, text, accent }) {
  const insightAccent = accent ?? t.accent;

  return (
    <View
      style={[
        styles.insight,
        {
          borderColor: hexToRgba(insightAccent, 0.38),
          backgroundColor: hexToRgba(insightAccent, t.isDark ? 0.1 : 0.08),
        },
      ]}
    >
      <View style={[styles.insightIcon, { backgroundColor: hexToRgba(insightAccent, 0.14) }]}>
        <PremiumIcon name="pulse" size={18} color={insightAccent} strokeWidth={2.3} />
      </View>
      <Text style={[styles.insightText, { color: t.text }]}>{text}</Text>
    </View>
  );
}

export function AnalyticsStatBar({ label, value, sub, color, barBg, textColor, mutedColor }) {
  const width = Math.max(0, Math.min(100, value == null ? 0 : value));
  const fillColor = color ?? premiumColors.blue;

  return (
    <View style={styles.barRow}>
      <View style={styles.barHeader}>
        <Text style={[styles.barLabel, { color: textColor }]} numberOfLines={2}>{label}</Text>
        <Text style={[styles.barValue, { color: textColor }]} numberOfLines={1}>
          {value == null ? '-' : `${value}%`}
          {sub ? <Text style={{ color: mutedColor, fontWeight: '500' }}>  {sub}</Text> : null}
        </Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: barBg }]}>
        <LinearGradient
          colors={[hexToRgba(fillColor, 0.78), fillColor]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.barFill, { width: `${width}%` }]}
        />
      </View>
    </View>
  );
}

export function AnalyticsEmptyState({
  t,
  title,
  message,
  icon = 'chart',
  loading = false,
  backgroundColor = 'transparent',
}) {
  return (
    <View style={[styles.emptyState, { backgroundColor }]}>
      <View style={[styles.emptyIcon, { borderColor: hexToRgba(t.accent, 0.32) }]}>
        {loading ? (
          <ActivityIndicator size="small" color={t.accent} />
        ) : (
          <PremiumIcon name={icon} size={28} color={t.accent} secondaryColor={t.text} />
        )}
      </View>
      <Text style={[styles.emptyTitle, { color: t.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.emptyMessage, { color: t.textSecondary }]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: Platform.OS === 'ios' ? 0.18 : 0,
    shadowRadius: 24,
    elevation: 0,
  },
  cardGlow: {
    position: 'absolute',
    top: -40,
    left: -30,
    width: 180,
    height: 140,
    opacity: 0.85,
  },
  cardStripe: {
    position: 'absolute',
    left: 0,
    top: 18,
    bottom: 18,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  tile: {
    flex: 1,
    minHeight: 90,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.14 : 0,
    shadowRadius: 16,
    elevation: 0,
  },
  tileValue: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    textAlign: 'center',
  },
  tileLabel: {
    fontSize: 10,
    lineHeight: 13,
    marginTop: 5,
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  insight: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  insightIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  barRow: {
    marginTop: 5,
    marginBottom: 12,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  barLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  barValue: {
    flexShrink: 0,
    maxWidth: '48%',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    textAlign: 'right',
  },
  barTrack: {
    height: 9,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(9, 22, 43, 0.62)',
  },
  emptyTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 310,
  },
});
