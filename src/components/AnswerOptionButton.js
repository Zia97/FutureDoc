import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function AnswerOptionButton({ label, state, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        state === 'correct' && styles.correct,
        state === 'incorrect' && styles.incorrect,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={state !== 'idle'}
    >
      <Text
        style={[
          styles.text,
          state === 'correct' && styles.textCorrect,
          state === 'incorrect' && styles.textIncorrect,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: '#2d3748',
  },
  correct: {
    borderColor: '#38a169',
    backgroundColor: '#1a3a2a',
  },
  incorrect: {
    borderColor: '#e53e3e',
    backgroundColor: '#3a1a1a',
  },
  text: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '500',
  },
  textCorrect: {
    color: '#68d391',
    fontWeight: '700',
  },
  textIncorrect: {
    color: '#fc8181',
    fontWeight: '700',
  },
});
