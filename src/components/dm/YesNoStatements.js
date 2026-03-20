import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function YesNoStatements({ statements, answers = {}, onAnswer, submitted }) {
  const { practiceTheme: t } = useTheme();

  return (
    <View style={styles.container}>
      {statements.map((statement, index) => {
        const selected = answers[index];
        const isCorrect = selected === statement.answer;

        return (
          <View key={index} style={[styles.row, { backgroundColor: t.bgCard, borderColor: t.borderStrong }]}>
            <Text style={[styles.statementText, { color: t.text }]}>{statement.text}</Text>

            <View style={styles.buttons}>
              {['Yes', 'No'].map((opt) => {
                const isSelected = selected === opt;
                const isReveal = submitted && opt === statement.answer && !isSelected;

                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.button,
                      { borderColor: t.borderStrong, backgroundColor: t.bgInput },
                      isSelected && { borderColor: t.accent, backgroundColor: t.accentDim },
                      submitted && isSelected && isCorrect && { borderColor: t.correct, backgroundColor: t.correctBg },
                      submitted && isSelected && !isCorrect && { borderColor: t.incorrect, backgroundColor: t.incorrectBg },
                      isReveal && { borderColor: t.correct, backgroundColor: t.correctBg, opacity: 0.7 },
                    ]}
                    onPress={() => !submitted && onAnswer(index, opt)}
                    activeOpacity={0.75}
                    disabled={submitted}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: t.textMuted },
                        isSelected && { color: t.text },
                        submitted && isSelected && isCorrect && { color: t.correctText },
                        submitted && isSelected && !isCorrect && { color: t.incorrectText },
                        isReveal && { color: t.correctText },
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
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  statementText: {
    flex: 1,
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
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
