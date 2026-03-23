import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFlatNavigation } from '../hooks/ui/useFlatNavigation';
import { useAnswers } from '../hooks/ui/useAnswers';
import { useSwipeGesture } from '../hooks/ui/useSwipeGesture';
import { useTheme } from '../context/ThemeContext';
import ScreenNavBar from './ScreenNavBar';
import FeedbackBox from './FeedbackBox';

export default function PassageLayout({
  flatQuestions,
  initialIndex = 0,
  itemLabel,
  getTitle,
  renderOptions,
  getQuestionOptions = null,
  alwaysShowReason = false,
  onAnswerCommit = null,
  initialAnswers = {},
  section = 'vr',
}) {
  const { practiceTheme: t } = useTheme();

  const { index, item, isFirst, isLast, goNext, goPrev } =
    useFlatNavigation(flatQuestions, initialIndex);

  const { handleAnswer, getAnswer } = useAnswers(initialAnswers);
  const [pendingAnswer, setPendingAnswer] = useState(null);

  const qid = item.question.questionId ?? item.question.id;
  const selectedAnswer = getAnswer(item.stemId, qid);
  const hasAnswered = !!selectedAnswer;
  const isCorrect = selectedAnswer === item.question.answer;

  useEffect(() => { setPendingAnswer(null); }, [qid]);

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? null : goNext,
  );

  function getOptionState(option) {
    if (!hasAnswered) return option === pendingAnswer ? 'selected' : 'idle';
    if (option === item.question.answer) return 'correct';
    if (option === selectedAnswer) return 'incorrect';
    return 'idle';
  }

  function onAnswer(option) {
    if (hasAnswered) return;
    setPendingAnswer(option);
  }

  function handleCheckAnswer() {
    if (!pendingAnswer || hasAnswered) return;
    handleAnswer(item.stemId, qid, pendingAnswer);
    onAnswerCommit?.(item, pendingAnswer);
  }

  const sectionColor = section === 'sj' ? t.sectionSJ : t.sectionVR;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.headerBg} />

      <ScreenNavBar
        title={getTitle(item)}
        meta={`Question ${index + 1} of ${flatQuestions.length}`}
        onPrev={goPrev}
        onNext={goNext}
        isFirst={isFirst}
        isLast={isLast}
        color={sectionColor}
      />

      <View style={[styles.resourceContainer, { backgroundColor: t.bgCard, borderLeftColor: sectionColor, borderColor: t.border }]}>
        <Text style={[styles.resourceLabel, { color: sectionColor }]}>{itemLabel.toUpperCase()}</Text>
        <ScrollView key={item.stemId} showsVerticalScrollIndicator>
          <Text style={[styles.resourceText, { color: t.textSecondary }]}>{item.resource}</Text>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.questionPanel}
        contentContainerStyle={styles.questionPanelInner}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.questionText, { color: t.text }]}>{item.question.questionText}</Text>

        <View style={styles.optionsContainer}>
          {renderOptions({ item, question: item.question, getOptionState, onAnswer })}
        </View>

        {pendingAnswer && !hasAnswered && (
          <TouchableOpacity
            style={[styles.checkButton, { backgroundColor: sectionColor }]}
            onPress={handleCheckAnswer}
          >
            <Text style={styles.checkButtonText}>Check Answer</Text>
          </TouchableOpacity>
        )}

        {hasAnswered && (
          <FeedbackBox
            isCorrect={isCorrect}
            correctAnswer={item.question.answer}
            reason={item.question.answeringReason}
            showReason={!isCorrect || alwaysShowReason}
            questionContext={!isCorrect ? {
              question: item.question.questionText,
              questionType: section === 'sj' ? 'situational_judgement' : 'true_false_cant_tell',
              section,
              passage: item.resource ?? undefined,
              options: getQuestionOptions ? getQuestionOptions(item, item.question) : undefined,
              correctAnswer: item.question.answer,
              userAnswer: selectedAnswer,
              explanation: item.question.answeringReason,
            } : undefined}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resourceContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  resourceLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  resourceText: {
    fontSize: 14,
    lineHeight: 22,
  },
  questionPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 8,
  },
  questionPanelInner: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 10,
  },
  checkButton: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
