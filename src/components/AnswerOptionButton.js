import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTextSize } from '../context/TextSizeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';

export default function AnswerOptionButton({ label, state, onPress }) {
  const { practiceTheme: t, isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { multiplier } = useTextSize();

  const buttonStyle = [
    styles.button,
    {
      backgroundColor: isDark ? 'rgba(9, 22, 43, 0.86)' : 'rgba(255, 255, 255, 0.92)',
      borderColor: colors.border,
    },
    state === 'correct' && { borderColor: t.correct, backgroundColor: t.correctBg },
    state === 'incorrect' && { borderColor: t.incorrect, backgroundColor: t.incorrectBg },
    state === 'partial' && {
      borderColor: colors.amber,
      backgroundColor: hexToRgba(colors.amber, isDark ? 0.16 : 0.1),
    },
    state === 'selected' && {
      borderColor: colors.blue,
      backgroundColor: hexToRgba(colors.blue, isDark ? 0.16 : 0.1),
    },
  ];

  const textStyle = [
    styles.text,
    {
      color: colors.text,
      fontSize: Math.round(styles.text.fontSize * multiplier),
      lineHeight: Math.round(styles.text.lineHeight * multiplier),
    },
    state === 'correct' && { color: t.correctText, fontWeight: '700' },
    state === 'incorrect' && { color: t.incorrectText, fontWeight: '700' },
    state === 'partial' && { color: colors.amber, fontWeight: '800' },
    state === 'selected' && { color: colors.blue, fontWeight: '800' },
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={state === 'correct' || state === 'incorrect' || state === 'partial'}
      accessibilityLabel={state === 'partial' ? `${label}, half mark` : label}
    >
      <View style={styles.content}>
        <Text style={textStyle}>{label}</Text>
        {state === 'partial' ? (
          <View style={[styles.markBadge, { backgroundColor: hexToRgba(colors.amber, isDark ? 0.2 : 0.12) }]}>
            <Text style={[styles.markBadgeText, { color: colors.amber }]}>½ mark</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  markBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  markBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
});
