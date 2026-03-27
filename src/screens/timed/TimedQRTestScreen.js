import { useState, useEffect } from 'react';
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
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useTestTimer } from '../../hooks/ui/useTestTimer';
import ScreenNavBar from '../../components/ScreenNavBar';
import CalculatorModal from '../../components/CalculatorModal';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import QRStimulusRenderer from '../../components/qr/QRStimulusRenderer';
import TestNavigatorModal from '../../components/TestNavigatorModal';
import SJTestReviewScreen from '../../components/SJTestReviewScreen';

export default function TimedQRTestScreen({ route }) {
  const { test } = route.params;
  const { practiceTheme: t } = useTheme();

  const [answers, setAnswers] = useState({});
  const [seenQuestions, setSeenQuestions] = useState(new Set());
  const [flags, setFlags] = useState(new Set());
  const [calcVisible, setCalcVisible] = useState(false);
  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const { display: timerDisplay, isUrgent, isPaused, pause, resume } = useTestTimer(test.timeMinutes);
  const { index, item, isFirst, isLast, goTo, goNext, goPrev } =
    useFlatNavigation(test.flatQuestions, 0);

  const qid = item.question.questionId;
  const currentAnswer = answers[qid];
  const isFlagged = flags.has(qid);

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? null : goNext,
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

  function getQuestionStatus(fq) {
    if (answers[fq.question.questionId] != null) return 'Answered';
    if (seenQuestions.has(fq.question.questionId)) return 'Incomplete';
    return 'Unseen';
  }

  if (showReview) {
    return (
      <SJTestReviewScreen
        questions={test.flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(flatIndex) => { goTo(flatIndex); setShowReview(false); }}
        onEndTest={() => {}}
        timerDisplay={timerDisplay}
        isUrgent={isUrgent}
        title="Quantitative Reasoning"
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <View style={styles.timedHeader}>
        <Text style={styles.timedHeaderTitle}>Quantitative Reasoning</Text>
        <View style={[styles.timerBadge, { backgroundColor: isUrgent ? '#dc2626' : '#1d4ed8' }]}>
          <Text style={styles.timerText}>{timerDisplay}</Text>
        </View>
      </View>

      <ScreenNavBar
        title={item.stemTitle}
        meta={`Question ${index + 1} of ${test.flatQuestions.length}`}
        onPrev={goPrev}
        onNext={isLast ? () => setShowReview(true) : goNext}
        isFirst={isFirst}
        isLast={false}
        color={t.sectionQR}
        onCalculator={() => setCalcVisible(true)}
      />

      <CalculatorModal visible={calcVisible} onClose={() => setCalcVisible(false)} />

      <ScrollView
        key={item.stemId + qid}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: t.sectionQR }]}>STEM</Text>
        <QRStimulusRenderer stimulus={item.stimulus} />

        <View style={[styles.divider, { backgroundColor: t.border }]} />

        <Text style={[styles.sectionLabel, { color: t.sectionQR }]}>QUESTION</Text>

        <View style={styles.questionHeader}>
          <Text style={[styles.questionText, { color: t.text }]}>{item.question.stem}</Text>
          <TouchableOpacity
            style={[styles.flagButton, isFlagged && { backgroundColor: '#dbeafe' }]}
            onPress={() => toggleFlag(qid)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.flagIcon, { color: isFlagged ? '#2563eb' : t.textSecondary }]}>
              {isFlagged ? '⚑' : '⚐'}
            </Text>
          </TouchableOpacity>
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

      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: t.bgCard, borderColor: t.border }]}>
        <TouchableOpacity
          style={[styles.pauseButton, { borderColor: t.borderStrong }]}
          onPress={pause}
          activeOpacity={0.8}
        >
          <Text style={[styles.pauseButtonText, { color: t.textSecondary }]}>⏸ Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navigatorButton, { borderColor: t.sectionQR }]}
          onPress={() => setNavigatorVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.navigatorButtonText, { color: t.sectionQR }]}>☰ Navigator</Text>
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
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  divider: { height: 1, marginVertical: 4 },
  questionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 24, flex: 1 },
  flagButton: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  flagIcon: { fontSize: 20 },
  options: { gap: 10 },
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
