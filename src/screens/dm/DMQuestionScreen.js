import { useState } from 'react';
import { ScrollView, StyleSheet, StatusBar, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DMQuestionRenderer from '../../components/dm/DMQuestionRenderer';
import ScreenNavBar from '../../components/ScreenNavBar';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { useDecisionMakingQuestions } from '../../hooks/useDecisionMakingQuestions';

const YES_NO_TYPES = ['syllogism', 'interpreting_info'];

export default function DMQuestionScreen({ route }) {
  const { index: initialIndex = 0 } = route?.params ?? {};
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // answers: { [id]: string (MCQ) | object (Yes/No) }
  const [answers, setAnswers] = useState({});
  // submitted: { [id]: true }
  const [submitted, setSubmitted] = useState({});

  const { questions, loading } = useDecisionMakingQuestions();

  const question = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  function goPrev() { if (!isFirst) setCurrentIndex((i) => i - 1); }
  function goNext() { if (!isLast) setCurrentIndex((i) => i + 1); }

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? null : goNext,
  );

  if (loading || !question) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isYesNo = YES_NO_TYPES.includes(question.type);
  const currentAnswer = answers[question.id];
  const isSubmitted = !!submitted[question.id];

  function handleAnswer(val) {
    if (isSubmitted) return;
    if (!isYesNo) {
      setAnswers((prev) => ({ ...prev, [question.id]: val }));
      setSubmitted((prev) => ({ ...prev, [question.id]: true }));
    } else {
      setAnswers((prev) => ({ ...prev, [question.id]: val }));
    }
  }

  function handleCheckAnswers() {
    setSubmitted((prev) => ({ ...prev, [question.id]: true }));
  }

  const allStatementsAnswered =
    isYesNo &&
    question.statements &&
    currentAnswer &&
    question.statements.every((_, i) => currentAnswer[i] !== undefined);

  return (
    <SafeAreaView style={styles.container} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <ScreenNavBar
        title={question.title}
        meta={`Question ${currentIndex + 1} of ${questions.length}`}
        onPrev={goPrev}
        onNext={goNext}
        isFirst={isFirst}
        isLast={isLast}
        color="#0891b2"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DMQuestionRenderer
          question={question}
          answer={currentAnswer}
          onAnswer={handleAnswer}
          submitted={isSubmitted}
        />

        {isYesNo && !isSubmitted && (
          <TouchableOpacity
            style={[styles.checkButton, !allStatementsAnswered && styles.checkButtonDisabled]}
            onPress={handleCheckAnswers}
            disabled={!allStatementsAnswered}
          >
            <Text style={styles.checkButtonText}>Check Answers</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  checkButton: {
    marginTop: 20,
    backgroundColor: '#0891b2',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: '#2d3748',
    opacity: 0.5,
  },
  checkButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
