import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AnswerOptionButton({ label, state, onPress }) {
  const { practiceTheme: t } = useTheme();

  const buttonStyle = [
    styles.button,
    { backgroundColor: t.bgInput, borderColor: t.borderStrong },
    state === 'correct' && { borderColor: t.correct, backgroundColor: t.correctBg },
    state === 'incorrect' && { borderColor: t.incorrect, backgroundColor: t.incorrectBg },
    state === 'selected' && { borderColor: '#3b5bdb', backgroundColor: '#eff3ff' },
  ];

  const textStyle = [
    styles.text,
    { color: t.text },
    state === 'correct' && { color: t.correctText, fontWeight: '700' },
    state === 'incorrect' && { color: t.incorrectText, fontWeight: '700' },
    state === 'selected' && { color: '#3b5bdb', fontWeight: '700' },
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={state !== 'idle'}
    >
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1.5,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
  },
});
