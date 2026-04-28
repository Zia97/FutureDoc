import { Animated, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AITutorModal from './AITutorModal';
import { useAITutor } from '../hooks/ai/useAITutor';
import { useAICredits } from '../hooks/ai/useAICredits';
import { useTheme } from '../context/ThemeContext';
import { useTextSize } from '../context/TextSizeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';

export default function FeedbackBox({
  isCorrect,
  correctAnswer,
  reason,
  showReason = true,
  questionContext,
  isDemo = false,
  highlightTeachMe = false,
}) {
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
  const [tutorOpenedOnce, setTutorOpenedOnce] = useState(false);

  const tutorState = useAITutor(questionContext, { isDemo });
  const { creditsRemaining, isPro, decrement: decrementCredits } = useAICredits();

  useEffect(() => {
    setInputText('');
  }, [questionContext?.question]);

  const pulse = useRef(new Animated.Value(0)).current;
  const shouldPulse = highlightTeachMe && !tutorOpenedOnce;
  useEffect(() => {
    if (!shouldPulse) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shouldPulse, pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

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
          <View style={styles.teachMeWrap}>
            {shouldPulse ? (
              <>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.teachMeRing,
                    {
                      borderColor: colors.cyan,
                      opacity: ringOpacity,
                      transform: [{ scale: ringScale }],
                    },
                  ]}
                />
                <Text style={[styles.teachMeHint, { color: colors.cyan }]}>Tap to ask the AI tutor</Text>
              </>
            ) : null}
            <TouchableOpacity
              style={[
                styles.teachMeBtn,
                shouldPulse
                  ? { backgroundColor: colors.cyan, borderColor: colors.cyan }
                  : {
                      backgroundColor: isDark ? 'rgba(9, 22, 43, 0.86)' : 'rgba(255, 255, 255, 0.92)',
                      borderColor: colors.border,
                    },
              ]}
              onPress={() => {
                setTutorVisible(true);
                setTutorOpenedOnce(true);
              }}
            >
              <Text style={[styles.teachMeBtnText, { color: shouldPulse ? '#FFFFFF' : colors.text }]}>
                Teach Me
              </Text>
            </TouchableOpacity>
          </View>
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
          onCreditUsed={isDemo ? null : decrementCredits}
          isDemo={isDemo}
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
  teachMeWrap: {
    marginTop: 14,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    position: 'relative',
  },
  teachMeBtn: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  teachMeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  teachMeRing: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    top: 0,
    left: 0,
    borderRadius: 12,
    borderWidth: 2,
  },
  teachMeHint: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: 0.4,
  },
});
