import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Renders a list of statements each with Yes / No answer buttons.
 * Used for syllogism and interpreting_info question types.
 *
 * Props:
 *   statements  — array of { text, answer }
 *   answers     — object keyed by statement index: { 0: 'Yes', 1: 'No', ... }
 *   onAnswer    — (index, 'Yes'|'No') => void
 *   submitted   — boolean, whether the user has checked their answers
 */
export default function YesNoStatements({ statements, answers = {}, onAnswer, submitted }) {
  return (
    <View style={styles.container}>
      {statements.map((statement, index) => {
        const selected = answers[index];
        const isCorrect = selected === statement.answer;

        return (
          <View key={index} style={styles.row}>
            <Text style={styles.statementText}>{statement.text}</Text>

            <View style={styles.buttons}>
              {['Yes', 'No'].map((opt) => {
                const isSelected = selected === opt;
                const isReveal = submitted && opt === statement.answer && !isSelected;

                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.button,
                      isSelected && styles.selected,
                      submitted && isSelected && isCorrect && styles.correct,
                      submitted && isSelected && !isCorrect && styles.incorrect,
                      isReveal && styles.reveal,
                    ]}
                    onPress={() => !submitted && onAnswer(index, opt)}
                    activeOpacity={0.75}
                    disabled={submitted}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isSelected && styles.selectedText,
                        submitted && isSelected && isCorrect && styles.correctText,
                        submitted && isSelected && !isCorrect && styles.incorrectText,
                        isReveal && styles.revealText,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2d3748',
    gap: 12,
  },
  statementText: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 6,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2d3748',
    backgroundColor: '#1a1a2e',
  },
  selected: {
    borderColor: '#4a9eff',
    backgroundColor: '#1a2a4e',
  },
  correct: {
    borderColor: '#38a169',
    backgroundColor: '#1a3a2a',
  },
  incorrect: {
    borderColor: '#e53e3e',
    backgroundColor: '#3a1a1a',
  },
  reveal: {
    borderColor: '#38a169',
    backgroundColor: '#1a3a2a',
    opacity: 0.7,
  },
  buttonText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedText: {
    color: '#e2e8f0',
  },
  correctText: {
    color: '#68d391',
  },
  incorrectText: {
    color: '#fc8181',
  },
  revealText: {
    color: '#68d391',
  },
});
