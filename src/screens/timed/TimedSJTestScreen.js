import TimedQuestionPanel from '../../components/timed/TimedQuestionPanel';
import { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { useFlatNavigation } from '../../hooks/ui/useFlatNavigation';
import { useAnswers } from '../../hooks/ui/useAnswers';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useTestTimer } from '../../hooks/ui/useTestTimer';
import { useExitWarning } from '../../hooks/ui/useExitWarning';
import { useExamSubmission } from '../../hooks/ui/useExamSubmission';
import TimedExamSavingScreen from '../../components/TimedExamSavingScreen';
import { useQuestionTimeTracker } from '../../hooks/ui/useQuestionTimeTracker';
import { useTimedSJExamProgress } from '../../hooks/attempts/useTimedSJExamProgress';
import { LABEL_SETS } from '../../constants/sjLabelSets';
import ScreenNavBar from '../../components/ScreenNavBar';
import NotesModal from '../../components/NotesModal';
import BottomToolbar from '../../components/BottomToolbar';
import TestNavigatorModal from '../../components/TestNavigatorModal';
import TimedTestReviewScreen from '../../components/TimedTestReviewScreen';
import TimedSJResultsScreen from '../../components/TimedSJResultsScreen';
import {
  PremiumQuestionScaffold,
  QuestionTopBar,
  PremiumPauseModal,
} from '../../components/premium/PremiumQuestionScreenUI';

export default function TimedSJTestScreen({ route, navigation }) {
  const { test } = route.params;
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const sectionColor = colors.mint;

  const testNumMatch = test.title?.match(/\d+/);
  const headerTitle = testNumMatch ? `Situational Judgement Test ${testNumMatch[0]}` : 'Situational Judgement';

  const onExpireRef = useRef(null);
  const secondsLeftRef = useRef(test.timeMinutes * 60);

  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [flags, setFlags] = useState(new Set());
  const [seenItems, setSeenItems] = useState(new Set());

  useExitWarning(navigation, !examEnded);

  const { submitExam } = useTimedSJExamProgress();
  const { submit: saveCompletedExam, submissionState } = useExamSubmission(submitExam, () => setExamEnded(true));

  const { secondsLeft, display: timerDisplay, isUrgent, isPaused, pause, resume, stop: stopTimer } = useTestTimer(
    test.timeMinutes,
    () => onExpireRef.current?.(),
  );
  secondsLeftRef.current = secondsLeft;

  const { index, item, isFirst, isLast, goTo, goNext, goPrev } =
    useFlatNavigation(test.flatQuestions, 0);
  const { handleAnswer, getAnswer } = useAnswers({});

  const itemId = item.question.itemId ?? item.question.questionId ?? item.question.id;

  const getQuestionTimes = useQuestionTimeTracker(
    itemId,
    !isPaused && !showReview && !examEnded,
  );

  function endExam(timerExpired = false) {
    stopTimer();
    void saveCompletedExam({ test, getAnswer, secondsLeft: timerExpired === true ? 0 : secondsLeftRef.current, flags, timeMsByQid: getQuestionTimes() });
  }

  onExpireRef.current = () => endExam(true);

  const selectedAnswer = getAnswer(item.stemId, itemId);
  const isFlagged = flags.has(itemId);
  const labelSet = LABEL_SETS[item.labelSet] ?? LABEL_SETS[1];

  useEffect(() => {
    setSeenItems((prev) => {
      if (prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  }, [itemId]);

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? () => setShowReview(true) : goNext,
  );

  function onAnswer(option) {
    handleAnswer(item.stemId, itemId, option);
  }

  function toggleFlag(qId) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  }

  function getQuestionStatus(fq) {
    const answered = getAnswer(fq.stemId, fq.question.itemId);
    if (answered) return 'Answered';
    if (seenItems.has(fq.question.itemId)) return 'Incomplete';
    return 'Unseen';
  }

  if (submissionState) {
    return <TimedExamSavingScreen state={submissionState} onRetry={() => saveCompletedExam()} />;
  }

  if (examEnded) {
    return (
      <TimedSJResultsScreen
        scenarios={test.scenarios}
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
        onEndTest={endExam}
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
        title={`Scenario ${item.stemIndex + 1}`}
        meta={`Question ${index + 1} of ${test.flatQuestions.length}`}
        onPrev={goPrev}
        onNext={isLast ? () => setShowReview(true) : goNext}
        isFirst={isFirst}
        isLast={false}
        color={sectionColor}
        report={{ questionId: itemId, section: 'sj', testId: test.id, isTimed: true, context: { selected_answer: selectedAnswer, question_index: index, seconds_left: secondsLeft, is_paused: isPaused, screen: 'timed-question' } }}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        key={item.stemId + itemId}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TimedQuestionPanel section="sj" accent={sectionColor} context={item.stem} text={item.question.text}
          choices={labelSet.map((value) => ({ value, label: value }))} answer={selectedAnswer}
          flagged={isFlagged} onToggleFlag={() => toggleFlag(itemId)} onAnswer={onAnswer} />
      </ScrollView>

      <BottomToolbar
        onPause={pause}
        onNotes={() => setNotesVisible(true)}
        onNavigator={() => setNavigatorVisible(true)}
        onPrev={goPrev}
        onNext={isLast ? () => setShowReview(true) : goNext}
        isFirst={isFirst}
        isLast={false}
        sectionColor={sectionColor}
      />

      <NotesModal
        visible={notesVisible}
        sectionKey="sj"
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
        onReview={() => { setNavigatorVisible(false); setShowReview(true); }}
      />
    </PremiumQuestionScaffold>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 8, paddingBottom: 28 },
});
