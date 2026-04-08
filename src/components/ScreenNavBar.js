import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import ReportQuestionModal from './ReportQuestionModal';

function BugIcon({ color = '#ffffff', size = 20 }) {
  // Lucide-style bug glyph drawn with react-native-svg.
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
  report = null, // { questionId, section, testId?, isTimed? }
}) {
  const { practiceTheme: t } = useTheme();
  const [reportVisible, setReportVisible] = useState(false);

  const showReport = !!(report && report.questionId && report.section);

  return (
    <View style={[styles.navBar, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
      <View style={styles.sideGroup}>
        {showReport && <View style={styles.iconButton} />}
        <TouchableOpacity style={styles.navButton} onPress={onPrev} disabled={isFirst}>
          <Text style={[styles.navArrow, { color: isFirst ? t.borderStrong : (color || '#ffffff') }]}>‹</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navCenter}>
        <Text style={[styles.navTitle, { color: '#ffffff' }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.navMeta, { color: 'rgba(255,255,255,0.65)' }]}>{meta}</Text>
      </View>

      <View style={styles.sideGroup}>
        <TouchableOpacity style={styles.navButton} onPress={onNext} disabled={isLast}>
          <Text style={[styles.navArrow, { color: isLast ? t.borderStrong : (color || '#ffffff') }]}>›</Text>
        </TouchableOpacity>
        {showReport && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setReportVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Report this question"
          >
            <BugIcon color={color || '#ffffff'} size={20} />
          </TouchableOpacity>
        )}
      </View>

      {showReport && (
        <ReportQuestionModal
          visible={reportVisible}
          onClose={() => setReportVisible(false)}
          questionId={report.questionId}
          section={report.section}
          testId={report.testId ?? null}
          isTimed={!!report.isTimed}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sideGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: 32,
    lineHeight: 36,
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  navMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
