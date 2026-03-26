import { useState, useEffect, useRef } from 'react';
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
import { useFlatNavigation } from '../../hooks/ui/useFlatNavigation';
import { useAnswers } from '../../hooks/ui/useAnswers';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useTestTimer } from '../../hooks/ui/useTestTimer';
import { useTimedSJExamProgress } from '../../hooks/attempts/useTimedSJExamProgress';
import { LABEL_SETS } from '../../constants/sjLabelSets';
import ScreenNavBar from '../../components/ScreenNavBar';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import TestNavigatorModal from '../../components/TestNavigatorModal';
import SJTestReviewScreen from '../../components/SJTestReviewScreen';
import TimedSJResultsScreen from '../../components/TimedSJResultsScreen';

export default function TimedSJTestScreen({ route, navigation }) {
  const { test } = route.params;
  const { practiceTheme: t } = useTheme();

  const panelScrollRef = useRef(null);
  const onExpireRef = useRef(null);
  const secondsLeftRef = useRef(test.timeMinutes * 60);
  const endExamCalledRef = useRef(false);

  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [flags, setFlags] = useState(new Set());
  const [seenItems, setSeenItems] = useState(new Set());

  const { submitExam } = useTimedSJExamProgress();

  const { secondsLeft, display: timerDisplay, isUrgent, isPaused, pause, resume } = useTestTimer(
    test.timeMinutes,
    () => onExpireRef.current?.(),
  );
  secondsLeftRef.current = secondsLeft;

  const { index, item, isFirst, isLast, goTo, goNext, goPrev } =
    useFlatNavigation(test.flatQuestions, 0);
  const { handleAnswer, getAnswer } = useAnswers({});

  function endExam() {
    if (endExamCalledRef.current) return;
    endExamCalledRef.current = true;
    setExamEnded(true);
    submitExam({ test, getAnswer, secondsLeft: secondsLeftRef.current });
  }

  onExpireRef.current = endExam;

  const itemId = item.question.itemId;
  const selectedAnswer = getAnswer(item.stemId, itemId);
  const sectionColor = t.sectionSJ;
  const isFlagged = flags.has(itemId);
  const labelSet = LABEL_SETS[item.labelSet];

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
    isLast ? null : goNext,
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

  if (examEnded) {
    return (
      <TimedSJResultsScreen
        scenarios={test.scenarios}
        getAnswer={getAnswer}
        flags={flags}
        test={test}
        onDone={() => navigation.navigate('TimedTestList', { section: 'SJ', title: 'Situational Judgement' })}
      />
    );
  }

  if (showReview) {
    return (
      <SJTestReviewScreen
        questions={test.flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(flatIndex) => { goTo(flatIndex); setShowReview(false); }}
        onEndTest={endExam}
        timerDisplay={timerDisplay}
        isUrgent={isUrgent}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <View style={styles.timedHeader}>
        <Text style={styles.timedHeaderTitle}>Situational Judgement</Text>
        <View style={[styles.timerBadge, { backgroundColor: isUrgent ? '#dc2626' : '#1d4ed8' }]}>
          <Text style={styles.timerText}>{timerDisplay}</Text>
        </View>
      </View>

      <ScreenNavBar
        title={`Scenario ${item.stemIndex + 1}`}
        meta={`Question ${index + 1} of ${test.flatQuestions.length}`}
        onPrev={goPrev}
        onNext={isLast ? () => setShowReview(true) : goNext}
        isFirst={isFirst}
        isLast={false}
        color={sectionColor}
      />

      <View style={styles.panelsContainer}>
        <View style={[styles.resourceContainer, { flex: 1, backgroundColor: t.bgCard, borderLeftColor: sectionColor, borderColor: t.border }]}>
          <Text style={[styles.resourceLabel, { color: sectionColor }]}>SCENARIO</Text>
          <ScrollView key={item.stemId} showsVerticalScrollIndicator={false}>
            <Text style={[styles.resourceText, { color: t.textSecondary }]}>{item.stem}</Text>
          </ScrollView>
        </View>

        <View style={[styles.questionPanel, { flex: 2, backgroundColor: t.bgCard, borderColor: t.border }]}>
          <View style={styles.panelHeader}>
            <Text style={[styles.panelCounter, { color: t.textSecondary }]}>Question</Text>
            <TouchableOpacity
              style={[styles.flagButton, isFlagged && styles.flagButtonActive]}
              onPress={() => toggleFlag(itemId)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.flagIcon, { color: isFlagged ? '#d97706' : t.textSecondary }]}>
                {isFlagged ? '⚑' : '⚐'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView ref={panelScrollRef} showsVerticalScrollIndicator={false}>
            <Text style={[styles.questionText, { color: t.text }]}>{item.question.text}</Text>

            <View style={styles.optionsContainer}>
              {labelSet.map((opt) => (
                <AnswerOptionButton
                  key={opt}
                  label={opt}
                  state={selectedAnswer === opt ? 'selected' : 'idle'}
                  onPress={() => onAnswer(opt)}
                />
              ))}
            </View>
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
          style={[styles.navigatorButton, { borderColor: sectionColor }]}
          onPress={() => setNavigatorVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.navigatorButtonText, { color: sectionColor }]}>☰ Navigator</Text>
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
        questions={test.flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(flatIndex) => { goTo(flatIndex); setNavigatorVisible(false); }}
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
  resourceContainer: {
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  resourceLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  resourceText: { fontSize: 14, lineHeight: 22 },
  questionPanel: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  flagButton: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  flagButtonActive: { backgroundColor: '#fef3c7' },
  flagIcon: { fontSize: 20 },
  panelCounter: { fontSize: 13, fontWeight: '600' },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 24, marginBottom: 14 },
  optionsContainer: { gap: 10 },
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
  navigatorButton: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 3 },
  navigatorButtonText: { fontSize: 12, fontWeight: '700' },
});
