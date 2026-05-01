import { useState, useEffect, useRef } from 'react';
import {
  View,
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
import { useTimedQRExamProgress } from '../../hooks/attempts/useTimedQRExamProgress';
import ScreenNavBar from '../../components/ScreenNavBar';
import CalculatorModal from '../../components/CalculatorModal';
import NotesModal from '../../components/NotesModal';
import BottomToolbar from '../../components/BottomToolbar';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import QRStimulusRenderer from '../../components/qr/QRStimulusRenderer';
import TestNavigatorModal from '../../components/TestNavigatorModal';
import TimedTestReviewScreen from '../../components/TimedTestReviewScreen';
import TimedQRResultsScreen from '../../components/TimedQRResultsScreen';
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
        report={{ questionId: qid, section: 'qr', testId: test.id, isTimed: true }}
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

          <View style={styles.questionHeader}>
            <View style={styles.questionCopy}>
              <SectionLabel accent={sectionColor}>Question</SectionLabel>
              <QuestionText>{item.question.stem}</QuestionText>
            </View>
            <FlagButton active={isFlagged} onPress={() => toggleFlag(qid)} accent={colors.amber} />
          </View>

          <View style={styles.options}>
            {item.question.options.map((opt) => (
              <AnswerOptionButton
                key={opt.label}
                label={`${opt.label}.  ${opt.text}`}
                state={currentAnswer === opt.label ? 'selected' : 'idle'}
                onPress={() => handleAnswer(opt.label)}
              />
            ))}
          </View>
        </QuestionPanel>
      </ScrollView>

      <BottomToolbar
        onPause={pause}
        onNotes={() => setNotesVisible(true)}
        onCalculator={() => setCalcVisible(true)}
        onNavigator={() => setNavigatorVisible(true)}
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
    gap: 12,
  },
  questionCopy: {
    flex: 1,
    minWidth: 0,
  },
  options: { gap: 10, marginTop: 16 },
});
