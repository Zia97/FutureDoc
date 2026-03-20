import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import AITutorModal from './AITutorModal';
import { useAITutor } from '../hooks/useAITutor';
import { useTheme } from '../context/ThemeContext';

export default function FeedbackBox({ isCorrect, correctAnswer, reason, showReason = true, questionContext }) {
  const { practiceTheme: t } = useTheme();
  const [tutorVisible, setTutorVisible] = useState(false);
  const [inputText, setInputText] = useState('');

  const tutorState = useAITutor(questionContext);

  useEffect(() => {
    setInputText('');
  }, [questionContext?.question]);

  return (
    <>
      <View style={[
        styles.box,
        isCorrect
          ? { backgroundColor: t.correctBg, borderColor: t.correct }
          : { backgroundColor: t.incorrectBg, borderColor: t.incorrect },
      ]}>
        <Text style={[styles.title, { color: t.text }]}>{isCorrect ? 'Correct' : 'Incorrect'}</Text>
        {(!isCorrect || showReason) && (
          <>
            {!isCorrect && (
              <Text style={[styles.correctAnswer, { color: t.textSecondary }]}>
                Correct answer: {correctAnswer}
              </Text>
            )}
            <Text style={[styles.reason, { color: t.textSecondary }]}>{reason}</Text>
          </>
        )}
        {!isCorrect && questionContext && (
          <TouchableOpacity
            style={[styles.teachMeBtn, { backgroundColor: t.bgInput, borderColor: t.borderStrong }]}
            onPress={() => setTutorVisible(true)}
          >
            <Text style={[styles.teachMeBtnText, { color: t.text }]}>Teach Me</Text>
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
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  correctAnswer: {
    fontSize: 13,
    marginBottom: 8,
  },
  reason: {
    fontSize: 14,
    lineHeight: 21,
  },
  teachMeBtn: {
    marginTop: 14,
    alignSelf: 'flex-end',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  teachMeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
