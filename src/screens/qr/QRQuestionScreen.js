import { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { useFlatNavigation } from '../../hooks/ui/useFlatNavigation';
import { useAnswers } from '../../hooks/ui/useAnswers';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { usePremiumGate } from '../../hooks/ui/usePremiumGate';
import { useActiveTimer } from '../../hooks/ui/useActiveTimer';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useQuantitativeReasoningSets } from '../../hooks/queries/useQuantitativeReasoningSets';
import { useQuantitativeReasoningAttempts } from '../../hooks/attempts/useQuantitativeReasoningAttempts';
import { useQuestionStats } from '../../hooks/queries/useQuestionStats';
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
import { QR_TUTOR_DEMO_SET } from '../../data/demo/qrTutorDemoQuestion';
import { QR_WORKED_EXAMPLES } from '../../data/learn/qrWorkedExamples';
import { QR_LEARN_STORAGE_KEY } from '../../data/learn/learningStorageKeys';

export default function QRQuestionScreen({ route, navigation }) {
  const mode = route?.params?.mode;

  if (mode === 'tutorDemo') {
    return (
      <QRSingleSetBranch
        set={QR_TUTOR_DEMO_SET}
        headerTitle="AI Tutor Demo"
        headerSubtitle="Sample question"
        isDemo
      />
    );
  }

  if (mode === 'workedExample') {
    return <QRWorkedExampleBranch exampleId={route?.params?.exampleId} />;
  }

  return <QRQuestionScreenInner route={route} navigation={navigation} />;
}

// ── Worked example branch ─────────────────────────────────────────────────────
//
// Loads a single hardcoded QR set keyed by the lesson id. On answer commit,
// writes the lesson id to the QR learn storage so the lesson screen picks it
// up via useFocusEffect and unlocks the "Continue" button.

function QRWorkedExampleBranch({ exampleId }) {
  const example = exampleId ? QR_WORKED_EXAMPLES[exampleId] : null;

  const onAnswerCommit = useCallback(() => {
    if (!exampleId) return;
    AsyncStorage.getItem(QR_LEARN_STORAGE_KEY)
      .then((raw) => {
        let ids = [];
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) ids = parsed;
          } catch (_) {
            ids = [];
          }
        }
        if (ids.includes(exampleId)) return;
        const next = [...ids, exampleId];
        AsyncStorage.setItem(QR_LEARN_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      })
      .catch(() => {});
  }, [exampleId]);

  if (!example) {
    return <PremiumQuestionLoading label="Loading worked example..." />;
  }

  return (
    <QRSingleSetBranch
      set={example}
      headerTitle="Worked Example"
      headerSubtitle={example.title}
      onAnswerCommit={onAnswerCommit}
    />
  );
}

// ── Single-set branch ─────────────────────────────────────────────────────────
//
// Renders one hardcoded QR set + question without going through Supabase or
// the attempts cache. Used for both the AI tutor demo and the worked-example
// flow. The user can still open the calculator and notes from the toolbar.

function QRSingleSetBranch({ set, headerTitle, headerSubtitle, onAnswerCommit, isDemo = false }) {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const sectionColor = colors.purple;

  const question = set.questions[0];
  const qid = question.questionId ?? question.id;
  const [pendingAnswer, setPendingAnswer] = useState(null);
  const [submittedAnswer, setSubmittedAnswer] = useState(null);
  const [calcVisible, setCalcVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);

  const hasAnswered = !!submittedAnswer;
  const isCorrect = submittedAnswer === question.answer;

  function onAnswer(option) {
    if (hasAnswered) return;
    setPendingAnswer(option);
  }

  function handleCheckAnswer() {
    if (!pendingAnswer || hasAnswered) return;
    setSubmittedAnswer(pendingAnswer);
    onAnswerCommit?.();
  }

  function getOptionState(option) {
    if (!hasAnswered) return option === pendingAnswer ? 'selected' : 'idle';
    if (option === question.answer) return 'correct';
    if (option === submittedAnswer) return 'incorrect';
    return 'idle';
  }

  return (
    <PremiumQuestionScaffold panHandlers={null}>
      <QuestionTopBar
        title={headerTitle}
        subtitle={headerSubtitle}
        accent={sectionColor}
        onExit={() => navigation.goBack()}
      />

      <ScreenNavBar
        title={set.title}
        meta=""
        onPrev={null}
        onNext={null}
        isFirst
        isLast
        color={sectionColor}
        report={{ questionId: qid, section: 'qr' }}
      />

      <CalculatorModal visible={calcVisible} onClose={() => setCalcVisible(false)} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QuestionPanel>
          <SectionLabel accent={sectionColor}>Stem</SectionLabel>
          <QRStimulusRenderer stimulus={set.stimulus} />

          <QuestionDivider />

          <SectionLabel accent={sectionColor}>Question</SectionLabel>
          <QuestionText>{question.questionText}</QuestionText>
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

          {pendingAnswer && !hasAnswered ? (
            <PrimaryQuestionButton accent={sectionColor} onPress={handleCheckAnswer}>
              Check Answer
            </PrimaryQuestionButton>
          ) : null}

          {hasAnswered ? (
            <FeedbackBox
              isCorrect={isCorrect}
              correctAnswer={question.answer}
              reason={question.answeringReason}
              showReason
              isDemo={isDemo}
              highlightTeachMe={isDemo}
              questionContext={{
                questionId: qid,
                question: question.questionText,
                questionType: set.stimulus?.type ?? 'quantitative_reasoning',
                section: 'qr',
                options: question.options.map((o) => `${o.label}. ${o.text}`),
                correctAnswer: question.answer,
                userAnswer: submittedAnswer,
                explanation: question.answeringReason,
                stimulusData: set.stimulus,
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

// ── Regular practice flow ─────────────────────────────────────────────────────

function QRQuestionScreenInner({ route, navigation }) {
  const { index: initialIndex = 0 } = route?.params ?? {};
  const { flatQuestions, loading } = useQuantitativeReasoningSets();
  const { submitAttempt, localAnswers, localTimesMs, cacheLoading } = useQuantitativeReasoningAttempts();
  const { getStats } = useQuestionStats('qr');
  const [userTimesMs, setUserTimesMs] = useState({});
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
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks('qr');

  useEffect(() => {
    if (!cacheLoading) resetAnswers(localAnswers);
  }, [cacheLoading]);

  const qidForTimer = item?.question?.questionId ?? item?.question?.id ?? null;
  const timer = useActiveTimer({ resetKey: `${item?.stemId ?? ''}:${qidForTimer ?? ''}` });
  useEffect(() => {
    setPendingAnswer(null);
  }, [item?.question?.questionId, item?.stemId]);

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? null : goNext,
  );

  if (loading || cacheLoading || flatQuestions.length === 0) {
    return <PremiumQuestionLoading label="Loading question..." />;
  }

  const qid = item.question.questionId ?? item.question.id;
  const selectedAnswer = getAnswer(item.stemId, qid);
  const hasAnswered = !!selectedAnswer;
  const isCorrect = selectedAnswer === item.question.answer;

  function onAnswer(option) {
    if (hasAnswered) return;
    setPendingAnswer(option);
  }

  function handleCheckAnswer() {
    if (!pendingAnswer || hasAnswered) return;
    const timeSpentMs = Math.max(0, timer.getElapsedMs());
    const correctAnswer = item.question.answer;
    const correctness = correctAnswer != null ? pendingAnswer === correctAnswer : null;
    setUserTimesMs((prev) => ({ ...prev, [qid]: timeSpentMs }));
    handleAnswer(item.stemId, qid, pendingAnswer);
    submitAttempt({
      questionId: qid,
      setId: item.stemId,
      selectedAnswer: pendingAnswer,
      totalQuestions: item.stemQuestionCount,
      timeSpentMs,
      isCorrect: correctness,
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

      <CalculatorModal visible={calcVisible} onClose={() => { setCalcVisible(false); timer.resume(); }} />

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
              showStats
              userTimeMs={userTimesMs[qid] ?? localTimesMs[qid] ?? null}
              stats={getStats(qid, null)}
              questionContext={{
                questionId: qid,
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
        onNotes={() => { timer.pause(); setNotesVisible(true); }}
        onCalculator={() => { timer.pause(); setCalcVisible(true); }}
        onBookmark={() => toggleBookmark(qid)}
        isBookmarked={isBookmarked(qid)}
        onPrev={goPrev}
        onNext={goNext}
        isFirst={isFirst}
        isLast={isLast}
        sectionColor={sectionColor}
      />

      <NotesModal
        visible={notesVisible}
        sectionKey="qr"
        onClose={() => { setNotesVisible(false); timer.resume(); }}
      />
    </PremiumQuestionScaffold>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 8, paddingBottom: 28 },
  options: { gap: 10, marginTop: 16 },
});
