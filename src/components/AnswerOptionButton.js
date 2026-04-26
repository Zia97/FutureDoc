import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';

export default function AnswerOptionButton({ label, state, onPress }) {
  const { practiceTheme: t, isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const buttonStyle = [
    styles.button,
    {
      backgroundColor: isDark ? 'rgba(9, 22, 43, 0.86)' : 'rgba(255, 255, 255, 0.92)',
      borderColor: colors.border,
    },
    state === 'correct' && { borderColor: t.correct, backgroundColor: t.correctBg },
    state === 'incorrect' && { borderColor: t.incorrect, backgroundColor: t.incorrectBg },
    state === 'selected' && {
      borderColor: colors.blue,
      backgroundColor: hexToRgba(colors.blue, isDark ? 0.16 : 0.1),
    },
  ];

  const textStyle = [
    styles.text,
    { color: colors.text },
    state === 'correct' && { color: t.correctText, fontWeight: '700' },
    state === 'incorrect' && { color: t.incorrectText, fontWeight: '700' },
    state === 'selected' && { color: colors.blue, fontWeight: '800' },
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={state === 'correct' || state === 'incorrect'}
    >
      <Text style={textStyle}>{label}</Text>
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
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
});
