import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';
import PremiumIcon from './premium/PremiumIcon';
import ReportQuestionModal from './ReportQuestionModal';

export default function ReportLessonButton({ lessonId, lessonTitle, section, style }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [visible, setVisible] = useState(false);

  if (!lessonId || !section) return null;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: hexToRgba(colors.text, isDark ? 0.04 : 0.05),
            borderColor: hexToRgba(colors.textSecondary, 0.22),
          },
          style,
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.78}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Report this lesson"
      >
        <PremiumIcon name="flag" size={17} color={colors.textSecondary} strokeWidth={2.3} />
      </TouchableOpacity>

      <ReportQuestionModal
        visible={visible}
        onClose={() => setVisible(false)}
        reportType="lesson"
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        section={section}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
