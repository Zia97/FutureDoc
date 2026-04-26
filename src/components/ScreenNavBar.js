import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';
import ReportQuestionModal from './ReportQuestionModal';
import PremiumIcon from './premium/PremiumIcon';

function BugIcon({ color = '#ffffff', size = 20 }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6Z" />
      <Path d="M12 20V11" />
      <Path d="M9 7V6a3 3 0 1 1 6 0v1" />
      <Path d="M6 13H2" />
      <Path d="M22 13h-4" />
      <Path d="M6.5 9C4.6 8.8 3 7.2 3 5" />
      <Path d="M17.5 9c1.9-.2 3.5-1.8 3.5-4" />
      <Path d="M3 21c0-2.1 1.6-3.8 3.6-4" />
      <Path d="M21 21c0-2.1-1.6-3.8-3.6-4" />
      <Circle cx="9.5" cy="13" r="0.6" fill={color} />
      <Circle cx="14.5" cy="16" r="0.6" fill={color} />
    </Svg>
  );
}

export default function ScreenNavBar({
  title,
  meta,
  onPrev,
  onNext,
  isFirst,
  isLast,
  color,
  report = null,
}) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [reportVisible, setReportVisible] = useState(false);

  const showReport = !!(report && report.questionId && report.section);
  const accent = color ?? colors.blue;

  return (
    <View
      style={[
        styles.navBar,
        {
          backgroundColor: isDark ? 'rgba(7, 19, 39, 0.78)' : 'rgba(255, 255, 255, 0.76)',
          borderColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.navButton, { borderColor: hexToRgba(accent, isFirst ? 0.16 : 0.34) }]}
        onPress={onPrev}
        disabled={isFirst}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel="Previous question"
      >
        <PremiumIcon name="chevron-left" size={22} color={isFirst ? colors.textMuted : accent} strokeWidth={2.4} />
      </TouchableOpacity>
      {showReport ? <View style={styles.iconSpacer} /> : null}

      <View style={styles.navCenter}>
        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.navMeta, { color: colors.textSecondary }]} numberOfLines={1}>{meta}</Text>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.navButton, { borderColor: hexToRgba(accent, isLast ? 0.16 : 0.34) }]}
          onPress={onNext}
          disabled={isLast}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel="Next question"
        >
          <PremiumIcon name="chevron-right" size={22} color={isLast ? colors.textMuted : accent} strokeWidth={2.4} />
        </TouchableOpacity>

        {showReport ? (
          <TouchableOpacity
            style={[styles.iconButton, { borderColor: hexToRgba(colors.textSecondary, 0.22) }]}
            onPress={() => setReportVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.78}
            accessibilityLabel="Report this question"
            accessibilityRole="button"
          >
            <BugIcon color={colors.textSecondary} size={18} />
          </TouchableOpacity>
        ) : null}
      </View>

      {showReport ? (
        <ReportQuestionModal
          visible={reportVisible}
          onClose={() => setReportVisible(false)}
          questionId={report.questionId}
          section={report.section}
          testId={report.testId ?? null}
          isTimed={!!report.isTimed}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderRadius: 18,
    gap: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 40,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconSpacer: {
    width: 36,
    height: 40,
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  navTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  navMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginTop: 1,
  },
});
