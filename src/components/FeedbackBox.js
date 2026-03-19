import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import AITutorModal from './AITutorModal';
import { useAITutor } from '../hooks/useAITutor';

// showReason: show the explanation text (default true).
// Set to false when the answer is correct and you don't want to show the reason on correct answers.
// questionContext: { question, questionType, section, correctAnswer, userAnswer, explanation, stimulusData? }
//   Required to enable the "Teach Me" button on incorrect answers.
export default function FeedbackBox({ isCorrect, correctAnswer, reason, showReason = true, questionContext }) {
  const [tutorVisible, setTutorVisible] = useState(false);
  const [inputText, setInputText] = useState('');

  // State lives here so it survives modal open/close (Modal unmounts children when hidden)
  const tutorState = useAITutor(questionContext);

  // Clear draft input when the question or passage changes
  useEffect(() => {
    setInputText('');
  }, [questionContext?.question]);

  return (
    <>
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
        {!isCorrect && questionContext && (
          <TouchableOpacity style={styles.teachMeBtn} onPress={() => setTutorVisible(true)}>
            <Text style={styles.teachMeBtnText}>Teach Me</Text>
          </TouchableOpacity>
        )}
      </View>

      {questionContext && (
        <AITutorModal
          visible={tutorVisible}
          onClose={() => setTutorVisible(false)}
          questionContext={questionContext}
          tutorState={tutorState}
          inputText={inputText}
          setInputText={setInputText}
        />
      )}
    </>
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
  teachMeBtn: {
    marginTop: 14,
    alignSelf: 'flex-end',
    backgroundColor: '#2d3748',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  teachMeBtnText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
});
