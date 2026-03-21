import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useItemNavigation } from '../../hooks/ui/useItemNavigation';
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

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function QRQuestionScreen({ route }) {
  const { index: initialIndex = 0 } = route?.params ?? {};
  const { sets, loading } = useQuantitativeReasoningSets();
  const { submitAttempt, localAnswers, cacheLoading } = useQuantitativeReasoningAttempts();
  const { practiceTheme: t } = useTheme();

  const {
    itemIndex,
    questionIndex,
    item,
    question,
    isFirstItem,
    isLastItem,
    isFirstQuestion,
    isLastQuestion,
    goToItem,
    goToNextQuestion,
    goToPrevQuestion,
  } = useItemNavigation(sets, initialIndex);

  const { handleAnswer, getAnswer, resetAnswers } = useAnswers();
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [calcVisible, setCalcVisible] = useState(false);

  useEffect(() => {
    if (!cacheLoading) resetAnswers(localAnswers);
  }, [cacheLoading]);

  const panHandlers = useSwipeGesture(
    isFirstItem ? null : () => goToItem(itemIndex - 1),
    isLastItem ? null : () => goToItem(itemIndex + 1),
  );

  if (loading || cacheLoading || sets.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bg }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  const selectedAnswer = getAnswer(item.setId, question.questionId);
  const hasAnswered = !!selectedAnswer;
  const isCorrect = selectedAnswer === question.answer;

  function onAnswer(option) {
    if (hasAnswered) return;
    handleAnswer(item.setId, question.questionId, option);
    submitAttempt({
      questionId: question.questionId,
      setId: item.setId,
      selectedAnswer: option,
      totalQuestions: item.questions.length,
    });
  }

  function getOptionState(option) {
    if (!hasAnswered) return 'idle';
    if (option === question.answer) return 'correct';
    if (option === selectedAnswer) return 'incorrect';
    return 'idle';
  }

  function togglePanel() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPanelExpanded((v) => !v);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.headerBg} />

      <ScreenNavBar
        title={item.title}
        meta={`Question ${itemIndex + 1} of ${sets.length}`}
        onPrev={() => goToItem(itemIndex - 1)}
        onNext={() => goToItem(itemIndex + 1)}
        isFirst={isFirstItem}
        isLast={isLastItem}
        color={t.sectionQR}
        onCalculator={() => setCalcVisible(true)}
      />

      <CalculatorModal visible={calcVisible} onClose={() => setCalcVisible(false)} />

      <ScrollView
        key={itemIndex}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.stimulusContainer, { backgroundColor: t.bgCard, borderLeftColor: t.sectionQR, borderColor: t.border }]}>
          <Text style={[styles.dataLabel, { color: t.sectionQR }]}>DATA</Text>
          <QRStimulusRenderer stimulus={item.stimulus} />
        </View>

        <View style={[styles.panel, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <TouchableOpacity style={styles.panelHeader} onPress={togglePanel} activeOpacity={0.8}>
            <Text style={[styles.panelCounter, { color: t.textSecondary }]}>
              Question {questionIndex + 1} of {item.questions.length}
            </Text>
            <Text style={[styles.panelChevron, { color: t.sectionQR }]}>{panelExpanded ? '▾' : '▴'}</Text>
          </TouchableOpacity>

          {panelExpanded && (
            <View style={styles.panelContent}>
              <Text style={[styles.questionText, { color: t.text }]}>{question.questionText}</Text>

              <View style={styles.options}>
                {question.options.map((opt) => (
                  <AnswerOptionButton
                    key={opt.label}
                    label={`${opt.label}.  ${opt.text}`}
                    state={getOptionState(opt.label)}
                    onPress={() => onAnswer(opt.label)}
                  />
                ))}
              </View>

              {hasAnswered && (
                <FeedbackBox
                  isCorrect={isCorrect}
                  correctAnswer={question.answer}
                  reason={question.answeringReason}
                  showReason
                  questionContext={!isCorrect ? {
                    question: question.questionText,
                    questionType: item.stimulus?.type ?? 'quantitative_reasoning',
                    section: 'qr',
                    options: question.options.map((o) => `${o.label}. ${o.text}`),
                    correctAnswer: question.answer,
                    userAnswer: selectedAnswer,
                    explanation: question.answeringReason,
                    stimulusData: item.stimulus,
                  } : undefined}
                />
              )}

              <View style={styles.questionNav}>
                <TouchableOpacity
                  style={[styles.qNavBtn, { backgroundColor: t.bgInput, borderColor: t.borderStrong }, isFirstQuestion && styles.qNavBtnDisabled]}
                  onPress={goToPrevQuestion}
                  disabled={isFirstQuestion}
                >
                  <Text style={[styles.qNavText, { color: t.text }]}>← Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.qNavBtn, { backgroundColor: t.bgInput, borderColor: t.borderStrong }, isLastQuestion && styles.qNavBtnDisabled]}
                  onPress={goToNextQuestion}
                  disabled={isLastQuestion}
                >
                  <Text style={[styles.qNavText, { color: t.text }]}>Next →</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  panel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1.5,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  panelCounter: {
    fontSize: 13,
    fontWeight: '600',
  },
  panelChevron: {
    fontSize: 18,
  },
  panelContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 16,
  },
  options: { gap: 10 },
  questionNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  qNavBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  qNavBtnDisabled: { opacity: 0.3 },
  qNavText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
