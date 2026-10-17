import TimedQuestionPanel from '../../components/timed/TimedQuestionPanel';
import { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { useFlatNavigation } from '../../hooks/ui/useFlatNavigation';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useTestTimer } from '../../hooks/ui/useTestTimer';
import { useQuestionTimeTracker } from '../../hooks/ui/useQuestionTimeTracker';
import { useExitWarning } from '../../hooks/ui/useExitWarning';
import { useExamSubmission } from '../../hooks/ui/useExamSubmission';
import TimedExamSavingScreen from '../../components/TimedExamSavingScreen';
import { useTimedQRExamProgress } from '../../hooks/attempts/useTimedQRExamProgress';
import ScreenNavBar from '../../components/ScreenNavBar';
import CalculatorModal from '../../components/CalculatorModal';
import NotesModal from '../../components/NotesModal';
import BottomToolbar from '../../components/BottomToolbar';
import TestNavigatorModal from '../../components/TestNavigatorModal';
import TimedTestReviewScreen from '../../components/TimedTestReviewScreen';
import TimedQRResultsScreen from '../../components/TimedQRResultsScreen';
import {
  PremiumQuestionScaffold,
  QuestionTopBar,
  PremiumPauseModal,
} from '../../components/premium/PremiumQuestionScreenUI';

export default function TimedQRTestScreen({ route, navigation }) {
  const { test } = route.params;
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { submitExam } = useTimedQRExamProgress();
  const sectionColor = colors.purple;

  const testNumMatch = test.title?.match(/\d+/);
  const headerTitle = testNumMatch ? `Quantitative Reasoning Test ${testNumMatch[0]}` : 'Quantitative Reasoning';

  const [answers, setAnswers] = useState({});
  const [seenQuestions, setSeenQuestions] = useState(new Set());
  const [flags, setFlags] = useState(new Set());
  const [calcVisible, setCalcVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { submit: saveCompletedExam, submissionState } = useExamSubmission(submitExam, () => setShowResults(true));

  useExitWarning(navigation, !showResults);

  const secondsLeftRef = useRef(null);

  const { display: timerDisplay, isUrgent, secondsLeft, isPaused, pause, resume, stop: stopTimer } = useTestTimer(
    test.timeMinutes,
    () => endExam(true),
  );

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  const { index, item, isFirst, isLast, goTo, goNext, goPrev } =
    useFlatNavigation(test.flatQuestions, 0);

  const qid = item.question.questionId ?? item.question.id;
  const currentAnswer = answers[qid];
  const isFlagged = flags.has(qid);

  const getQuestionTimes = useQuestionTimeTracker(
    qid,
    !isPaused && !showReview && !showResults,
  );

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? () => setShowReview(true) : goNext,
  );

  useEffect(() => {
    setSeenQuestions((prev) => {
      if (prev.has(qid)) return prev;
      const next = new Set(prev);
      next.add(qid);
      return next;
    });
  }, [qid]);

  function handleAnswer(val) {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  }

  function toggleFlag(questionId) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  async function endExam(timerExpired = false) {
    stopTimer();
    const timeMsByQid = getQuestionTimes();
    await saveCompletedExam({
      test,
      answers,
      secondsLeft: timerExpired ? 0 : (secondsLeftRef.current ?? 0),
      flags,
      timeMsByQid,
    });
  }

  function getQuestionStatus(fq) {
    if (answers[fq.question.questionId] != null) return 'Answered';
    if (seenQuestions.has(fq.question.questionId)) return 'Incomplete';
    return 'Unseen';
  }

  const sets = test.sets.map((s) => ({
    ...s,
    setId: s.setId,
    questions: s.questions.map((q) => ({
      ...q,
      questionId: q.questionId ?? q.id,
    })),
  }));

  function getAnswerForResults(setId, questionId) {
    return answers[questionId] ?? null;
  }

  if (submissionState) {
    return <TimedExamSavingScreen state={submissionState} onRetry={() => saveCompletedExam()} />;
  }

  if (showResults) {
    return (
      <TimedQRResultsScreen
        sets={sets}
        getAnswer={getAnswerForResults}
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
        onEndTest={() => endExam(false)}
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
        title={item.stemTitle}
        meta={`Question ${index + 1} of ${test.flatQuestions.length}`}
        onPrev={goPrev}
        onNext={isLast ? () => setShowReview(true) : goNext}
        isFirst={isFirst}
        isLast={false}
        color={sectionColor}
        report={{ questionId: qid, section: 'qr', testId: test.id, isTimed: true, context: { selected_answer: currentAnswer, question_index: index, seconds_left: secondsLeft, is_paused: isPaused, screen: 'timed-question' } }}
      />

      <CalculatorModal visible={calcVisible} onClose={() => setCalcVisible(false)} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        key={item.stemId + qid}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TimedQuestionPanel section="qr" accent={sectionColor} stimulus={item.stimulus} text={item.question.stem}
          choices={item.question.options.map((opt) => ({ value: opt.label, label: opt.label + '.  ' + opt.text }))}
          answer={currentAnswer} flagged={isFlagged} onToggleFlag={() => toggleFlag(qid)} onAnswer={handleAnswer} />
      </ScrollView>

      <BottomToolbar
        onPause={pause}
        onNotes={() => setNotesVisible(true)}
        onCalculator={() => setCalcVisible(true)}
        onNavigator={() => setNavigatorVisible(true)}
        onPrev={goPrev}
        onNext={isLast ? () => setShowReview(true) : goNext}
        isFirst={isFirst}
        isLast={false}
        sectionColor={sectionColor}
      />

      <NotesModal
        visible={notesVisible}
        sectionKey="qr"
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
