import { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useTestTimer } from '../../hooks/ui/useTestTimer';
import { useTimedDMExamProgress } from '../../hooks/attempts/useTimedDMExamProgress';
import ScreenNavBar from '../../components/ScreenNavBar';
import CalculatorModal from '../../components/CalculatorModal';
import DMQuestionRenderer from '../../components/dm/DMQuestionRenderer';
import TestNavigatorModal from '../../components/TestNavigatorModal';
import SJTestReviewScreen from '../../components/SJTestReviewScreen';
import TimedDMResultsScreen from '../../components/TimedDMResultsScreen';

export default function TimedDMTestScreen({ route, navigation }) {
  const { test } = route.params;
  const { practiceTheme: t } = useTheme();
  const { submitExam } = useTimedDMExamProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [seenQuestions, setSeenQuestions] = useState(new Set());
  const [flags, setFlags] = useState(new Set());
  const [calcVisible, setCalcVisible] = useState(false);
  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const endExamCalledRef = useRef(false);
  const secondsLeftRef = useRef(null);

  const { display: timerDisplay, isUrgent, secondsLeft } = useTestTimer(
    test.timeMinutes,
    () => endExam(true),
  );

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  const question = test.questions[currentIndex];
  const qid = question.questionId;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === test.questions.length - 1;
  const currentAnswer = answers[qid];
  const isFlagged = flags.has(qid);

  const panHandlers = useSwipeGesture(
    isFirst ? null : () => setCurrentIndex((i) => i - 1),
    isLast ? null : () => setCurrentIndex((i) => i + 1),
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
      questionId: q.questionId,
    })),
  [test]);

  async function endExam(timerExpired = false) {
    if (endExamCalledRef.current) return;
    endExamCalledRef.current = true;
    await submitExam({
      test,
      answers,
      secondsLeft: timerExpired ? 0 : (secondsLeftRef.current ?? 0),
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
        test={test}
        onDone={() => navigation.navigate('TimedTestList', { section: 'DM', title: 'Decision Making' })}
      />
    );
  }

  if (showReview) {
    return (
      <SJTestReviewScreen
        questions={flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(_, idx) => { setCurrentIndex(idx); setShowReview(false); }}
        onEndTest={() => endExam(false)}
        timerDisplay={timerDisplay}
        isUrgent={isUrgent}
        title="Decision Making"
        groupLabel="Question"
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Timed header — title + timer */}
      <View style={styles.timedHeader}>
        <Text style={styles.timedHeaderTitle}>Decision Making</Text>
        <View style={[styles.timerBadge, { backgroundColor: isUrgent ? '#dc2626' : '#1d4ed8' }]}>
          <Text style={styles.timerText}>{timerDisplay}</Text>
        </View>
      </View>

      {/* Question nav bar */}
      <ScreenNavBar
        title={question.title ?? `Question ${currentIndex + 1}`}
        meta={`Question ${currentIndex + 1} of ${test.questions.length}`}
        onPrev={() => setCurrentIndex((i) => i - 1)}
        onNext={isLast ? () => setShowReview(true) : () => setCurrentIndex((i) => i + 1)}
        isFirst={isFirst}
        isLast={false}
        color={t.sectionDM}
        onCalculator={() => setCalcVisible(true)}
      />

      <CalculatorModal visible={calcVisible} onClose={() => setCalcVisible(false)} />

      {/* Flag button row */}
      <View style={[styles.flagRow, { borderBottomColor: t.border }]}>
        <TouchableOpacity
          style={[styles.flagButton, isFlagged && { backgroundColor: t.accentDim }]}
          onPress={() => toggleFlag(qid)}
          activeOpacity={0.7}
        >
          <Text style={[styles.flagIcon, { color: isFlagged ? '#f59e0b' : t.textMuted }]}>
            {isFlagged ? '⚑' : '⚐'}
          </Text>
          <Text style={[styles.flagLabel, { color: isFlagged ? t.text : t.textMuted }]}>
            {isFlagged ? 'Flagged' : 'Flag'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DMQuestionRenderer
          question={question}
          answer={currentAnswer}
          onAnswer={handleAnswer}
          submitted={false}
          timedMode
        />

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.navigatorButton, { borderColor: t.sectionDM }]}
            onPress={() => setNavigatorVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.navigatorButtonText, { color: t.sectionDM }]}>☰ Navigator</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.endButton, { borderColor: t.danger }]}
            onPress={() => endExam(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.endButtonText, { color: t.danger }]}>End Exam</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TestNavigatorModal
        visible={navigatorVisible}
        questions={flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(idx) => setCurrentIndex(idx)}
        onClose={() => setNavigatorVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timedHeader: {
    backgroundColor: '#1e3a8a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timedHeaderTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  timerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  timerText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  flagRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-end',
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  flagIcon: {
    fontSize: 18,
  },
  flagLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  navigatorButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  navigatorButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  endButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  endButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
