import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import AITutorModal from './AITutorModal';
import { useAITutor } from '../hooks/ai/useAITutor';
import { useAICredits } from '../hooks/ai/useAICredits';
import { useTheme } from '../context/ThemeContext';
import { useTextSize } from '../context/TextSizeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';

export default function FeedbackBox({ isCorrect, correctAnswer, reason, showReason = true, questionContext }) {
  const { practiceTheme: t, isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { multiplier } = useTextSize();
  const reasonScaled = {
    fontSize: Math.round(styles.reason.fontSize * multiplier),
    lineHeight: Math.round(styles.reason.lineHeight * multiplier),
  };
  const correctAnswerScaled = {
    fontSize: Math.round(styles.correctAnswer.fontSize * multiplier),
  };
  const [tutorVisible, setTutorVisible] = useState(false);
  const [inputText, setInputText] = useState('');

  const tutorState = useAITutor(questionContext);
  const { creditsRemaining, isPro, decrement: decrementCredits } = useAICredits();

  useEffect(() => {
    setInputText('');
  }, [questionContext?.question]);

  return (
    <>
      <View style={[
        styles.box,
        isCorrect
          ? { backgroundColor: hexToRgba(t.correct, isDark ? 0.14 : 0.1), borderColor: t.correct }
          : { backgroundColor: hexToRgba(t.incorrect, isDark ? 0.14 : 0.1), borderColor: t.incorrect },
      ]}>
        <Text style={[styles.title, { color: colors.text }]}>{isCorrect ? 'Correct' : 'Incorrect'}</Text>
        {(!isCorrect || showReason) && (
          <>
            {!isCorrect && (
              <Text style={[styles.correctAnswer, correctAnswerScaled, { color: colors.textSecondary }]}>
                Correct answer: {correctAnswer}
              </Text>
            )}
            <Text style={[styles.reason, reasonScaled, { color: colors.textSecondary }]}>{reason}</Text>
          </>
        )}
        {questionContext && (
          <TouchableOpacity
            style={[
              styles.teachMeBtn,
              {
                backgroundColor: isDark ? 'rgba(9, 22, 43, 0.86)' : 'rgba(255, 255, 255, 0.92)',
                borderColor: colors.border,
              },
            ]}
            onPress={() => setTutorVisible(true)}
          >
            <Text style={[styles.teachMeBtnText, { color: colors.text }]}>Teach Me</Text>
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
          creditsRemaining={creditsRemaining}
          isPro={isPro}
          onCreditUsed={decrementCredits}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
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
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  teachMeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
