import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function YesNoStatements({ statements, answers = {}, onAnswer, submitted, timedMode = false, onTeachMe }) {
  const { practiceTheme: t } = useTheme();

  return (
    <View style={styles.container}>
      {statements.map((statement, index) => {
        const selected = answers[index];
        const isCorrect = selected === statement.answer;
        const showExplanation = submitted && !timedMode;
        const gotWrong = showExplanation && selected && !isCorrect;

        return (
          <View key={index}>
            <View style={[styles.row, { backgroundColor: t.bgCard, borderColor: t.borderStrong }]}>
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
                        !timedMode && submitted && isSelected && isCorrect && { borderColor: t.correct, backgroundColor: t.correctBg },
                        !timedMode && submitted && isSelected && !isCorrect && { borderColor: t.incorrect, backgroundColor: t.incorrectBg },
                        !timedMode && isReveal && { borderColor: t.correct, backgroundColor: t.correctBg, opacity: 0.7 },
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
                          !timedMode && submitted && isSelected && isCorrect && { color: t.correctText },
                          !timedMode && submitted && isSelected && !isCorrect && { color: t.incorrectText },
                          !timedMode && isReveal && { color: t.correctText },
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {showExplanation && statement.reason ? (
              <View style={[
                styles.explanationCard,
                { borderLeftColor: isCorrect ? t.correct : t.incorrect, backgroundColor: t.bgCard },
              ]}>
                <Text style={[styles.explanationLabel, { color: isCorrect ? t.correct : t.incorrect }]}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </Text>
                <Text style={[styles.explanationText, { color: t.textSecondary }]}>
                  {statement.reason}
                </Text>
                {gotWrong && onTeachMe && (
                  <TouchableOpacity
                    style={[styles.teachMeBtn, { backgroundColor: t.bgInput, borderColor: t.borderStrong }]}
                    onPress={() => onTeachMe(index)}
                  >
                    <Text style={[styles.teachMeBtnText, { color: t.text }]}>Teach Me</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
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
  explanationCard: {
    borderLeftWidth: 3,
    borderRadius: 8,
    padding: 12,
    marginTop: -4,
    marginBottom: 4,
  },
  explanationLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 19,
  },
  teachMeBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  teachMeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
