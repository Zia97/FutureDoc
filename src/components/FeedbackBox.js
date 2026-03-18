import { View, Text, StyleSheet } from 'react-native';

// showReason: show the explanation text (default true).
// Set to false when the answer is correct and you don't want to show the reason on correct answers.
export default function FeedbackBox({ isCorrect, correctAnswer, reason, showReason = true }) {
  return (
    <View style={[styles.box, isCorrect ? styles.correct : styles.incorrect]}>
      <Text style={styles.title}>{isCorrect ? 'Correct' : 'Incorrect'}</Text>
      {(!isCorrect || showReason) && (
        <>
          {!isCorrect && (
            <Text style={styles.correctAnswer}>Correct answer: {correctAnswer}</Text>
          )}
          <Text style={styles.reason}>{reason}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
  },
  correct: {
    backgroundColor: '#1a3a2a',
    borderColor: '#38a169',
  },
  incorrect: {
    backgroundColor: '#2a1a1a',
    borderColor: '#e53e3e',
  },
  title: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  correctAnswer: {
    color: '#a0aec0',
    fontSize: 13,
    marginBottom: 8,
  },
  reason: {
    color: '#cbd5e0',
    fontSize: 14,
    lineHeight: 21,
  },
});
