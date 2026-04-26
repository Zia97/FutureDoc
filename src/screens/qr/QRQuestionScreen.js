import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useFlatNavigation } from '../../hooks/ui/useFlatNavigation';
import { useAnswers } from '../../hooks/ui/useAnswers';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { usePremiumGate } from '../../hooks/ui/usePremiumGate';
import { useQuantitativeReasoningSets } from '../../hooks/queries/useQuantitativeReasoningSets';
import { useQuantitativeReasoningAttempts } from '../../hooks/attempts/useQuantitativeReasoningAttempts';
import QRStimulusRenderer from '../../components/qr/QRStimulusRenderer';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import ScreenNavBar from '../../components/ScreenNavBar';
import FeedbackBox from '../../components/FeedbackBox';
import CalculatorModal from '../../components/CalculatorModal';
import NotesModal from '../../components/NotesModal';
import BottomToolbar from '../../components/BottomToolbar';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';
import {
  PremiumQuestionScaffold,
  PremiumQuestionLoading,
  QuestionTopBar,
  QuestionPanel,
  SectionLabel,
  QuestionText,
  QuestionDivider,
  PrimaryQuestionButton,
} from '../../components/premium/PremiumQuestionScreenUI';

export default function QRQuestionScreen({ route, navigation }) {
  const { index: initialIndex = 0 } = route?.params ?? {};
  const { flatQuestions, loading } = useQuantitativeReasoningSets();
  const { submitAttempt, localAnswers, cacheLoading } = useQuantitativeReasoningAttempts();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const sectionColor = colors.purple;

  const { index, item, isFirst, isLast, goNext: rawGoNext, goPrev: rawGoPrev } =
    useFlatNavigation(flatQuestions, initialIndex);
  const { canAccess } = usePremiumGate((item) => item.isFree);

  function goNext() {
    const next = flatQuestions[index + 1];
    if (next && !canAccess(next)) return;
    rawGoNext();
  }
  function goPrev() {
    const prev = flatQuestions[index - 1];
    if (prev && !canAccess(prev)) return;
    rawGoPrev();
  }

  const { handleAnswer, getAnswer, resetAnswers } = useAnswers();
  const [calcVisible, setCalcVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
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
    return <PremiumQuestionLoading label="Loading question..." />;
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
    <PremiumQuestionScaffold panHandlers={panHandlers}>
      <QuestionTopBar
        title="Quantitative Reasoning"
        subtitle="Practice"
        accent={sectionColor}
        onExit={() => navigation.goBack()}
      />

      <ScreenNavBar
        title={item.stemTitle}
        meta={`Question ${index + 1} of ${flatQuestions.length}`}
        onPrev={goPrev}
        onNext={goNext}
        isFirst={isFirst}
        isLast={isLast}
        color={sectionColor}
        report={{ questionId: qid, section: 'qr' }}
      />

      <CalculatorModal visible={calcVisible} onClose={() => setCalcVisible(false)} />

      <ScrollView
        key={item.stemId + qid}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QuestionPanel>
          <SectionLabel accent={sectionColor}>Stem</SectionLabel>
          <QRStimulusRenderer stimulus={item.stimulus} />

          <QuestionDivider />

          <SectionLabel accent={sectionColor}>Question</SectionLabel>
          <QuestionText>{item.question.questionText}</QuestionText>
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

          {pendingAnswer && !hasAnswered ? (
            <PrimaryQuestionButton accent={sectionColor} onPress={handleCheckAnswer}>
              Check Answer
            </PrimaryQuestionButton>
          ) : null}

          {hasAnswered ? (
            <FeedbackBox
              isCorrect={isCorrect}
              correctAnswer={item.question.answer}
              reason={item.question.answeringReason}
              showReason
              questionContext={{
                questionId: item.question.questionId ?? item.question.id,
                question: item.question.questionText,
                questionType: item.stimulus?.type ?? 'quantitative_reasoning',
                section: 'qr',
                options: item.question.options.map((o) => `${o.label}. ${o.text}`),
                correctAnswer: item.question.answer,
                userAnswer: selectedAnswer,
                explanation: item.question.answeringReason,
                stimulusData: item.stimulus,
                isTimed: false,
              }}
            />
          ) : null}
        </QuestionPanel>
      </ScrollView>

      <BottomToolbar
        onNotes={() => setNotesVisible(true)}
        onCalculator={() => setCalcVisible(true)}
        sectionColor={sectionColor}
      />

      <NotesModal
        visible={notesVisible}
        sectionKey="qr"
        onClose={() => setNotesVisible(false)}
      />
    </PremiumQuestionScaffold>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 8, paddingBottom: 28 },
  options: { gap: 10, marginTop: 16 },
});
