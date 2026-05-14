import { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useTestTimer } from '../../hooks/ui/useTestTimer';
import { useExitWarning } from '../../hooks/ui/useExitWarning';
import { useQuestionTimeTracker } from '../../hooks/ui/useQuestionTimeTracker';
import { useTimedDMExamProgress } from '../../hooks/attempts/useTimedDMExamProgress';
import ScreenNavBar from '../../components/ScreenNavBar';
import CalculatorModal from '../../components/CalculatorModal';
import NotesModal from '../../components/NotesModal';
import BottomToolbar from '../../components/BottomToolbar';
import { DMStemContent, DMOptionsContent } from '../../components/dm/DMQuestionRenderer';
import TestNavigatorModal from '../../components/TestNavigatorModal';
import TimedTestReviewScreen from '../../components/TimedTestReviewScreen';
import TimedDMResultsScreen from '../../components/TimedDMResultsScreen';
import {
  PremiumQuestionScaffold,
  QuestionTopBar,
  QuestionPanel,
  SectionLabel,
  QuestionDivider,
  FlagButton,
  PremiumPauseModal,
} from '../../components/premium/PremiumQuestionScreenUI';

export default function TimedDMTestScreen({ route, navigation }) {
  const { test } = route.params;
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { submitExam } = useTimedDMExamProgress();
  const sectionColor = colors.teal;

  const testNumMatch = test.title?.match(/\d+/);
  const headerTitle = testNumMatch ? `Decision Making Test ${testNumMatch[0]}` : 'Decision Making';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [seenQuestions, setSeenQuestions] = useState(new Set());
  const [flags, setFlags] = useState(new Set());
  const [calcVisible, setCalcVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useExitWarning(navigation, !showResults);

  const endExamCalledRef = useRef(false);
  const secondsLeftRef = useRef(null);

  const { display: timerDisplay, isUrgent, secondsLeft, isPaused, pause, resume } = useTestTimer(
    test.timeMinutes,
    () => endExam(true),
  );

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  const question = test.questions[currentIndex] ?? test.questions[0];
  const qid = question?.questionId ?? question?.id;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === test.questions.length - 1;
  const currentAnswer = answers[qid];
  const isFlagged = flags.has(qid);

  const getQuestionTimes = useQuestionTimeTracker(
    qid,
    !isPaused && !showReview && !showResults,
  );

  const panHandlers = useSwipeGesture(
    isFirst ? null : () => setCurrentIndex((i) => i - 1),
    isLast ? () => setShowReview(true) : () => setCurrentIndex((i) => i + 1),
  );

  useEffect(() => {
    setSeenQuestions((prev) => {
      if (prev.has(qid)) return prev;
      const next = new Set(prev);
      next.add(qid);
      return next;
    });
  }, [qid]);

  const flatQuestions = useMemo(() =>
    test.questions.map((q, idx) => ({
      globalIndex: idx,
      passageIndex: idx,
      questionIndex: idx,
      flatIndex: idx,
      stemIndex: idx,
      questionId: q.questionId ?? q.id,
    })),
  [test]);

  async function endExam(timerExpired = false) {
    if (endExamCalledRef.current) return;
    endExamCalledRef.current = true;
    const timeMsByQid = getQuestionTimes();
    await submitExam({
      test,
      answers,
      secondsLeft: timerExpired ? 0 : (secondsLeftRef.current ?? 0),
      flags,
      timeMsByQid,
    });
    setShowResults(true);
  }

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

  function isAnswered(questionId) {
    const ans = answers[questionId];
    if (ans == null) return false;
    if (typeof ans === 'object') return Object.keys(ans).length > 0;
    return true;
  }

  function getQuestionStatus(fq) {
    if (isAnswered(fq.questionId)) return 'Answered';
    if (seenQuestions.has(fq.questionId)) return 'Incomplete';
    return 'Unseen';
  }

  if (showResults) {
    return (
      <TimedDMResultsScreen
        questions={test.questions}
        answers={answers}
        flags={flags}
        test={test}
        onDone={() => navigation.goBack()}
      />
    );
  }

  if (showReview) {
    return (
      <TimedTestReviewScreen
        questions={flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(flatIndex) => { setCurrentIndex(flatIndex); setShowReview(false); }}
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
        title={question.title ?? `Question ${currentIndex + 1}`}
        meta={`Question ${currentIndex + 1} of ${test.questions.length}`}
        onPrev={() => setCurrentIndex((i) => i - 1)}
        onNext={isLast ? () => setShowReview(true) : () => setCurrentIndex((i) => i + 1)}
        isFirst={isFirst}
        isLast={false}
        color={sectionColor}
        report={{ questionId: qid, section: 'dm', testId: test.id, isTimed: true }}
      />

      <CalculatorModal visible={calcVisible} onClose={() => setCalcVisible(false)} />

      <ScrollView
        key={qid}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QuestionPanel>
          <SectionLabel accent={sectionColor}>Stem</SectionLabel>
          <DMStemContent question={question} showLabel={false} />

          <QuestionDivider />

          <View style={styles.optionsHeader}>
            <SectionLabel accent={sectionColor}>Options</SectionLabel>
            <FlagButton active={isFlagged} onPress={() => toggleFlag(qid)} accent={colors.amber} />
          </View>
          <DMOptionsContent
            question={question}
            answer={currentAnswer}
            onAnswer={handleAnswer}
            submitted={false}
            timedMode
            showLabel={false}
          />
        </QuestionPanel>
      </ScrollView>

      <BottomToolbar
        onPause={pause}
        onNotes={() => setNotesVisible(true)}
        onCalculator={() => setCalcVisible(true)}
        onNavigator={() => setNavigatorVisible(true)}
        onPrev={() => setCurrentIndex((i) => i - 1)}
        onNext={isLast ? () => setShowReview(true) : () => setCurrentIndex((i) => i + 1)}
        isFirst={isFirst}
        isLast={false}
        sectionColor={sectionColor}
      />

      <NotesModal
        visible={notesVisible}
        sectionKey="dm"
        onClose={() => setNotesVisible(false)}
      />

      <PremiumPauseModal visible={isPaused} onResume={resume} />

      <TestNavigatorModal
        visible={navigatorVisible}
        questions={flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(idx) => setCurrentIndex(idx)}
        onClose={() => setNavigatorVisible(false)}
        onReview={() => { setNavigatorVisible(false); setShowReview(true); }}
      />
    </PremiumQuestionScaffold>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 8, paddingBottom: 28 },
  optionsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
});
