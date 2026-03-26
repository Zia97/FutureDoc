import { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useTestTimer } from '../../hooks/ui/useTestTimer';
import { useTimedDMExamProgress } from '../../hooks/attempts/useTimedDMExamProgress';
import ScreenNavBar from '../../components/ScreenNavBar';
import CalculatorModal from '../../components/CalculatorModal';
import { DMStemContent, DMOptionsContent } from '../../components/dm/DMQuestionRenderer';
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

  const { display: timerDisplay, isUrgent, secondsLeft, isPaused, pause, resume } = useTestTimer(
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

      <View style={styles.panelsContainer}>
        <View style={[styles.stemPanel, { flex: 2, backgroundColor: t.bgCard, borderLeftColor: t.sectionDM, borderColor: t.border }]}>
          <View style={styles.panelHeader}>
            <Text style={[styles.panelLabel, { color: t.sectionDM }]}>STEM</Text>
            <TouchableOpacity
              style={[styles.flagButton, isFlagged && { backgroundColor: t.accentDim }]}
              onPress={() => toggleFlag(qid)}
              activeOpacity={0.7}
            >
              <Text style={[styles.flagIcon, { color: isFlagged ? '#f59e0b' : t.textMuted }]}>
                {isFlagged ? '⚑' : '⚐'}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DMStemContent question={question} />
          </ScrollView>
        </View>

        <View style={[styles.optionsPanel, { flex: 3, backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.panelLabel, { color: t.sectionDM, marginBottom: 10 }]}>OPTIONS</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DMOptionsContent
              question={question}
              answer={currentAnswer}
              onAnswer={handleAnswer}
              submitted={false}
              timedMode
            />
          </ScrollView>
        </View>
      </View>

      <View style={[styles.bottomBar, { backgroundColor: t.bgCard, borderColor: t.border }]}>
        <TouchableOpacity
          style={[styles.pauseButton, { borderColor: t.borderStrong }]}
          onPress={pause}
          activeOpacity={0.8}
        >
          <Text style={[styles.pauseButtonText, { color: t.textSecondary }]}>⏸ Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navigatorButton, { borderColor: t.sectionDM }]}
          onPress={() => setNavigatorVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.navigatorButtonText, { color: t.sectionDM }]}>☰ Navigator</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isPaused} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseIcon}>⏸</Text>
            <Text style={styles.pauseTitle}>Test Paused</Text>
            <Text style={styles.pauseSubtitle}>Timer has stopped. Resume when you're ready.</Text>
            <Text style={styles.pauseReminder}>[Reminder: You will not be able to pause in the real UCAT exam!]</Text>
            <TouchableOpacity style={styles.resumeButton} onPress={resume} activeOpacity={0.85}>
              <Text style={styles.resumeButtonText}>▶  Resume Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  container: { flex: 1 },
  timedHeader: {
    backgroundColor: '#1e3a8a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timedHeaderTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  timerBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  timerText: { color: '#ffffff', fontWeight: '800', fontSize: 14, fontVariant: ['tabular-nums'] },
  panelsContainer: { flex: 1, padding: 12, gap: 10 },
  stemPanel: {
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  optionsPanel: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  panelLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  flagButton: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  flagIcon: { fontSize: 18 },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  pauseButton: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 6 },
  pauseButtonText: { fontSize: 12, fontWeight: '700' },
  navigatorButton: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 6 },
  navigatorButtonText: { fontSize: 12, fontWeight: '700' },
  pauseOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 30, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  pauseCard: {
    backgroundColor: '#1e2a4a',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pauseIcon: { fontSize: 48, marginBottom: 16 },
  pauseTitle: { color: '#ffffff', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  pauseSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  pauseReminder: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 28,
  },
  resumeButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  resumeButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
