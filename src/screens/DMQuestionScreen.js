import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DMQuestionRenderer from '../components/dm/DMQuestionRenderer';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import questionsData from '../data/decisionMaking/questions.json';

const QUESTIONS = questionsData.questions;
const YES_NO_TYPES = ['syllogism', 'interpreting_info'];

export default function DMQuestionScreen({ route }) {
  const { index: initialIndex = 0 } = route?.params ?? {};
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // answers: { [questionId]: string (MCQ) | object (Yes/No) }
  const [answers, setAnswers] = useState({});
  // submitted: { [questionId]: true }
  const [submitted, setSubmitted] = useState({});

  const question    = QUESTIONS[currentIndex];
  const isYesNo     = YES_NO_TYPES.includes(question.type);
  const currentAnswer  = answers[question.questionId];
  const isSubmitted = !!submitted[question.questionId];

  const isFirst = currentIndex === 0;
  const isLast  = currentIndex === QUESTIONS.length - 1;

  function goPrev() { if (!isFirst) setCurrentIndex((i) => i - 1); }
  function goNext() { if (!isLast)  setCurrentIndex((i) => i + 1); }

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast  ? null : goNext,
  );

  function handleAnswer(val) {
    if (isSubmitted) return;
    if (!isYesNo) {
      setAnswers((prev) => ({ ...prev, [question.questionId]: val }));
      setSubmitted((prev) => ({ ...prev, [question.questionId]: true }));
    } else {
      setAnswers((prev) => ({ ...prev, [question.questionId]: val }));
    }
  }

  function handleCheckAnswers() {
    setSubmitted((prev) => ({ ...prev, [question.questionId]: true }));
  }

  const allStatementsAnswered =
    isYesNo &&
    question.statements &&
    currentAnswer &&
    question.statements.every((_, i) => currentAnswer[i] !== undefined);

  return (
    <SafeAreaView style={styles.container} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Nav bar — matches PassageLayout style */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={goPrev}
          disabled={isFirst}
        >
          <Text style={[styles.navArrow, isFirst && styles.disabled]}>‹</Text>
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text style={styles.navTitle} numberOfLines={1}>{question.title}</Text>
          <Text style={styles.navMeta}>
            Question {currentIndex + 1} of {QUESTIONS.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={goNext}
          disabled={isLast}
        >
          <Text style={[styles.navArrow, isLast && styles.disabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Question content */}
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
            style={[
              styles.checkButton,
              !allStatementsAnswered && styles.checkButtonDisabled,
            ]}
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
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    color: '#0891b2',
    fontSize: 32,
    lineHeight: 36,
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  navMeta: {
    color: '#a0aec0',
    fontSize: 12,
    marginTop: 2,
  },
  disabled: {
    color: '#2d3748',
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
