import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFlatNavigation } from '../../hooks/ui/useFlatNavigation';
import { useAnswers } from '../../hooks/ui/useAnswers';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useQuantitativeReasoningSets } from '../../hooks/queries/useQuantitativeReasoningSets';
import { useQuantitativeReasoningAttempts } from '../../hooks/attempts/useQuantitativeReasoningAttempts';
import QRStimulusRenderer from '../../components/qr/QRStimulusRenderer';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import ScreenNavBar from '../../components/ScreenNavBar';
import FeedbackBox from '../../components/FeedbackBox';
import CalculatorModal from '../../components/CalculatorModal';
import { useTheme } from '../../context/ThemeContext';

export default function QRQuestionScreen({ route }) {
  const { index: initialIndex = 0 } = route?.params ?? {};
  const { flatQuestions, loading } = useQuantitativeReasoningSets();
  const { submitAttempt, localAnswers, cacheLoading } = useQuantitativeReasoningAttempts();
  const { practiceTheme: t } = useTheme();

  const { index, item, isFirst, isLast, goNext, goPrev } =
    useFlatNavigation(flatQuestions, initialIndex);

  const { handleAnswer, getAnswer, resetAnswers } = useAnswers();
  const [calcVisible, setCalcVisible] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState(null);

  useEffect(() => {
    if (!cacheLoading) resetAnswers(localAnswers);
  }, [cacheLoading]);

  useEffect(() => { setPendingAnswer(null); }, [item?.question?.questionId]);

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? null : goNext,
  );

  if (loading || cacheLoading || flatQuestions.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bg }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  const qid = item.question.questionId;
  const selectedAnswer = getAnswer(item.stemId, qid);
  const hasAnswered = !!selectedAnswer;
  const isCorrect = selectedAnswer === item.question.answer;

  function onAnswer(option) {
    if (hasAnswered) return;
    setPendingAnswer(option);
  }

  function handleCheckAnswer() {
    if (!pendingAnswer || hasAnswered) return;
    handleAnswer(item.stemId, qid, pendingAnswer);
    submitAttempt({
      questionId: qid,
      setId: item.stemId,
      selectedAnswer: pendingAnswer,
      totalQuestions: item.stemQuestionCount,
    });
  }

  function getOptionState(option) {
    if (!hasAnswered) return option === pendingAnswer ? 'selected' : 'idle';
    if (option === item.question.answer) return 'correct';
    if (option === selectedAnswer) return 'incorrect';
    return 'idle';
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.headerBg} />

      <ScreenNavBar
        title={item.stemTitle}
        meta={`Question ${index + 1} of ${flatQuestions.length}`}
        onPrev={goPrev}
        onNext={goNext}
        isFirst={isFirst}
        isLast={isLast}
        color={t.sectionQR}
        onCalculator={() => setCalcVisible(true)}
      />

      <CalculatorModal visible={calcVisible} onClose={() => setCalcVisible(false)} />

      <ScrollView
        key={item.stemId}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.stimulusContainer, { backgroundColor: t.bgCard, borderLeftColor: t.sectionQR, borderColor: t.border }]}>
          <Text style={[styles.dataLabel, { color: t.sectionQR }]}>DATA</Text>
          <QRStimulusRenderer stimulus={item.stimulus} />
        </View>

        <View style={[styles.questionCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.questionText, { color: t.text }]}>{item.question.questionText}</Text>

          <View style={styles.options}>
            {item.question.options.map((opt) => (
              <AnswerOptionButton
                key={opt.label}
                label={`${opt.label}.  ${opt.text}`}
                state={getOptionState(opt.label)}
                onPress={() => onAnswer(opt.label)}
              />
            ))}
          </View>

          {pendingAnswer && !hasAnswered && (
            <TouchableOpacity
              style={[styles.checkButton, { backgroundColor: t.sectionQR }]}
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
              showReason
              questionContext={!isCorrect ? {
                question: item.question.questionText,
                questionType: item.stimulus?.type ?? 'quantitative_reasoning',
                section: 'qr',
                options: item.question.options.map((o) => `${o.label}. ${o.text}`),
                correctAnswer: item.question.answer,
                userAnswer: selectedAnswer,
                explanation: item.question.answeringReason,
                stimulusData: item.stimulus,
              } : undefined}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  stimulusContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  dataLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  questionCard: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 28,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 16,
  },
  options: { gap: 10 },
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
