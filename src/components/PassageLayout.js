import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useFlatNavigation } from '../hooks/ui/useFlatNavigation';
import { useAnswers } from '../hooks/ui/useAnswers';
import { useSwipeGesture } from '../hooks/ui/useSwipeGesture';
import { usePremiumGate } from '../hooks/ui/usePremiumGate';
import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme } from '../theme/premiumTheme';
import ScreenNavBar from './ScreenNavBar';
import FeedbackBox from './FeedbackBox';
import NotesModal from './NotesModal';
import BottomToolbar from './BottomToolbar';
import {
  PremiumQuestionScaffold,
  QuestionTopBar,
  QuestionPanel,
  SectionLabel,
  QuestionText,
  PrimaryQuestionButton,
} from './premium/PremiumQuestionScreenUI';

const SECTION_TITLE = {
  vr: 'Verbal Reasoning',
  sj: 'Situational Judgement',
};

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
  getItemIsFree = null,
}) {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const { index, item, isFirst, isLast, goNext: rawGoNext, goPrev: rawGoPrev } =
    useFlatNavigation(flatQuestions, initialIndex);
  const { canAccess } = usePremiumGate(getItemIsFree);

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

  const { handleAnswer, getAnswer } = useAnswers(initialAnswers);
  const [pendingAnswer, setPendingAnswer] = useState(null);
  const [notesVisible, setNotesVisible] = useState(false);

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

  const sectionColor = section === 'sj' ? colors.mint : colors.blue;
  const screenTitle = SECTION_TITLE[section] ?? 'Practice';

  return (
    <PremiumQuestionScaffold panHandlers={panHandlers}>
      <QuestionTopBar
        title={screenTitle}
        subtitle="Practice"
        accent={sectionColor}
        onExit={() => navigation.goBack()}
      />

      <ScreenNavBar
        title={getTitle(item)}
        meta={`Question ${index + 1} of ${flatQuestions.length}`}
        onPrev={goPrev}
        onNext={goNext}
        isFirst={isFirst}
        isLast={isLast}
        color={sectionColor}
        report={{ questionId: qid, section }}
      />

      <ScrollView
        key={item.stemId + qid}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QuestionPanel>
          <SectionLabel accent={sectionColor}>{itemLabel}</SectionLabel>
          <QuestionText muted>{item.resource}</QuestionText>
        </QuestionPanel>

        <QuestionPanel>
          <SectionLabel accent={sectionColor}>Question</SectionLabel>
          <QuestionText>{item.question.questionText}</QuestionText>

          <View style={styles.optionsContainer}>
            {renderOptions({ item, question: item.question, getOptionState, onAnswer })}
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
              showReason={alwaysShowReason || true}
              questionContext={{
                questionId: qid,
                question: item.question.questionText,
                questionType: section === 'sj' ? 'situational_judgement' : 'true_false_cant_tell',
                section,
                passage: item.resource ?? undefined,
                options: getQuestionOptions ? getQuestionOptions(item, item.question) : undefined,
                correctAnswer: item.question.answer,
                userAnswer: selectedAnswer,
                explanation: item.question.answeringReason,
                isTimed: false,
              }}
            />
          ) : null}
        </QuestionPanel>
      </ScrollView>

      <BottomToolbar
        onNotes={() => setNotesVisible(true)}
        sectionColor={sectionColor}
      />

      <NotesModal
        visible={notesVisible}
        sectionKey={section}
        onClose={() => setNotesVisible(false)}
      />
    </PremiumQuestionScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 26,
    gap: 14,
  },
  optionsContainer: {
    gap: 10,
    marginTop: 16,
  },
});
