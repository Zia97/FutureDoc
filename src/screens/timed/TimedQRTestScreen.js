import { useState, useEffect } from 'react';
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

  const { display: timerDisplay, isUrgent } = useTestTimer(test.timeMinutes);
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
        key={item.stemId}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.stimulusContainer, { backgroundColor: t.bgCard, borderLeftColor: t.sectionQR, borderColor: t.border }]}>
          <Text style={[styles.dataLabel, { color: t.sectionQR }]}>DATA</Text>
          <QRStimulusRenderer stimulus={item.stimulus} />
        </View>

        <View style={[styles.questionCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
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

          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[styles.navigatorButton, { borderColor: t.sectionQR }]}
              onPress={() => setNavigatorVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.navigatorButtonText, { color: t.sectionQR }]}>☰ Navigator</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
  flagButton: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  flagIcon: { fontSize: 20 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  stimulusContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  dataLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12 },
  questionCard: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 28,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 24, flex: 1 },
  options: { gap: 10 },
  bottomButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  navigatorButton: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 3 },
  navigatorButtonText: { fontSize: 12, fontWeight: '700' },
});
