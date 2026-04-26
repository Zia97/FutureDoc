import { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { useFlatNavigation } from '../../hooks/ui/useFlatNavigation';
import { useAnswers } from '../../hooks/ui/useAnswers';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useTestTimer } from '../../hooks/ui/useTestTimer';
import { useQuestionTimeTracker } from '../../hooks/ui/useQuestionTimeTracker';
import { useExitWarning } from '../../hooks/ui/useExitWarning';
import { useTimedVRExamProgress } from '../../hooks/attempts/useTimedVRExamProgress';
import ScreenNavBar from '../../components/ScreenNavBar';
import NotesModal from '../../components/NotesModal';
import BottomToolbar from '../../components/BottomToolbar';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import TestNavigatorModal from '../../components/TestNavigatorModal';
import TimedTestReviewScreen from '../../components/TimedTestReviewScreen';
import TimedVRResultsScreen from '../../components/TimedVRResultsScreen';
import {
  PremiumQuestionScaffold,
  QuestionTopBar,
  QuestionPanel,
  SectionLabel,
  QuestionText,
  QuestionDivider,
  FlagButton,
  PremiumPauseModal,
} from '../../components/premium/PremiumQuestionScreenUI';

export default function TimedVRTestScreen({ route, navigation }) {
  const { test } = route.params;
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { submitExam } = useTimedVRExamProgress();
  const sectionColor = colors.blue;

  const testNumMatch = test.title?.match(/\d+/);
  const headerTitle = testNumMatch ? `Verbal Reasoning Test ${testNumMatch[0]}` : 'Verbal Reasoning';

  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flags, setFlags] = useState(new Set());
  const [seenQuestions, setSeenQuestions] = useState(new Set());

  useExitWarning(navigation, !showResults);

  const secondsLeftRef = useRef(null);

  const { display: timerDisplay, isUrgent, secondsLeft, isPaused, pause, resume } = useTestTimer(
    test.timeMinutes,
    () => handleExamEnd(true),
  );

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  const { index, item, isFirst, isLast, goTo, goNext, goPrev } =
    useFlatNavigation(test.flatQuestions, 0);
  const { handleAnswer, getAnswer } = useAnswers({});

  const qid = item.question.questionId;
  const scrollRef = useRef(null);
  const prevStemId = useRef(item.stemId);

  const getQuestionTimes = useQuestionTimeTracker(
    qid,
    !isPaused && !showReview && !showResults,
  );

  useEffect(() => {
    if (item.stemId !== prevStemId.current) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      prevStemId.current = item.stemId;
    }
  }, [item.stemId, qid]);

  const selectedAnswer = getAnswer(item.stemId, qid);
  const hasAnswered = !!selectedAnswer;
  const isFlagged = flags.has(qid);

  useEffect(() => {
    setSeenQuestions((prev) => {
      if (prev.has(qid)) return prev;
      const next = new Set(prev);
      next.add(qid);
      return next;
    });
  }, [qid]);

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? () => setShowReview(true) : goNext,
  );

  async function handleExamEnd(timerExpired = false) {
    const timeMsByQid = getQuestionTimes();
    await submitExam({
      test,
      getAnswer,
      secondsLeft: timerExpired ? 0 : (secondsLeftRef.current ?? 0),
      flags,
      timeMsByQid,
    });
    setShowResults(true);
  }

  function onAnswer(option) {
    handleAnswer(item.stemId, qid, option);
  }

  function toggleFlag(questionId) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  function getOptionState(option) {
    if (!hasAnswered) return 'idle';
    if (option === selectedAnswer) return 'selected';
    return 'idle';
  }

  function getQuestionStatus(fq) {
    const answered = getAnswer(fq.stemId, fq.question.questionId);
    if (answered) return 'Answered';
    if (seenQuestions.has(fq.question.questionId)) return 'Incomplete';
    return 'Unseen';
  }

  const passages = test.passages.map((p) => ({
    ...p,
    id: p.id,
    resource: p.resource ?? p.body,
    questions: p.questions.map((q) => ({
      ...q,
      questionId: q.questionId ?? q.id,
    })),
  }));

  if (showResults) {
    return (
      <TimedVRResultsScreen
        passages={passages}
        getAnswer={getAnswer}
        flags={flags}
        test={test}
        onDone={() => navigation.goBack()}
      />
    );
  }

  if (showReview) {
    return (
      <TimedTestReviewScreen
        questions={test.flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(flatIndex) => { goTo(flatIndex); setShowReview(false); }}
        onEndTest={() => handleExamEnd(false)}
        timerDisplay={timerDisplay}
        isUrgent={isUrgent}
        title={headerTitle}
      />
    );
  }

  return (
    <PremiumQuestionScaffold panHandlers={panHandlers}>
      <QuestionTopBar
        title={headerTitle}
        subtitle="Timed practice"
        timerDisplay={timerDisplay}
        isUrgent={isUrgent}
        accent={sectionColor}
        onExit={() => navigation.goBack()}
      />

      <ScreenNavBar
        title={item.stemTitle?.replace(/^Passage\s+\d+[\s:\u2013-]*/i, '') || item.stemTitle}
        meta={`Question ${index + 1} of ${test.flatQuestions.length}`}
        onPrev={goPrev}
        onNext={isLast ? () => setShowReview(true) : goNext}
        isFirst={isFirst}
        isLast={false}
        color={sectionColor}
        report={{ questionId: qid, section: 'vr', testId: test.id, isTimed: true }}
      />

      <ScrollView
        ref={scrollRef}
        key={item.stemId}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QuestionPanel>
          <SectionLabel accent={sectionColor}>Passage</SectionLabel>
          <QuestionText muted>{item.resource}</QuestionText>

          <QuestionDivider />

          <View style={styles.questionHeader}>
            <SectionLabel accent={sectionColor}>Question</SectionLabel>
            <FlagButton active={isFlagged} onPress={() => toggleFlag(qid)} accent={colors.amber} />
          </View>

          <QuestionText>{item.question.questionText}</QuestionText>
          <View style={styles.optionsContainer}>
            {item.question.options.map((opt) => (
              <AnswerOptionButton
                key={opt}
                label={opt}
                state={getOptionState(opt)}
                onPress={() => onAnswer(opt)}
              />
            ))}
          </View>
        </QuestionPanel>
      </ScrollView>

      <BottomToolbar
        onPause={pause}
        onNotes={() => setNotesVisible(true)}
        onNavigator={() => setNavigatorVisible(true)}
        sectionColor={sectionColor}
      />

      <NotesModal
        visible={notesVisible}
        sectionKey="vr"
        onClose={() => setNotesVisible(false)}
      />

      <PremiumPauseModal visible={isPaused} onResume={resume} />

      <TestNavigatorModal
        visible={navigatorVisible}
        questions={test.flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(flatIndex) => { goTo(flatIndex); setNavigatorVisible(false); }}
        onClose={() => setNavigatorVisible(false)}
      />
    </PremiumQuestionScaffold>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 8, paddingBottom: 28 },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionsContainer: { gap: 10, marginTop: 16 },
});
