import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useFlatNavigation } from '../../hooks/ui/useFlatNavigation';
import { useAnswers } from '../../hooks/ui/useAnswers';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useTestTimer } from '../../hooks/ui/useTestTimer';
import ScreenNavBar from '../../components/ScreenNavBar';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import TestNavigatorModal from '../../components/TestNavigatorModal';
import SJTestReviewScreen from '../../components/SJTestReviewScreen';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function TimedVRTestScreen({ route }) {
  const { test } = route.params;
  const { practiceTheme: t } = useTheme();

  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [flags, setFlags] = useState(new Set());
  const [seenQuestions, setSeenQuestions] = useState(new Set());

  const { display: timerDisplay, isUrgent } = useTestTimer(test.timeMinutes);
  const { index, item, isFirst, isLast, goTo, goNext, goPrev } =
    useFlatNavigation(test.flatQuestions, 0);
  const { handleAnswer, getAnswer } = useAnswers({});

  const qid = item.question.questionId;
  const selectedAnswer = getAnswer(item.stemId, qid);
  const hasAnswered = !!selectedAnswer;
  const sectionColor = t.sectionVR;
  const isFlagged = flags.has(qid);

  useEffect(() => {
    setSeenQuestions((prev) => {
      if (prev.has(qid)) return prev;
      const next = new Set(prev);
      next.add(qid);
      return next;
    });
  }, [qid]);

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? null : goNext,
  );

  function onAnswer(option) {
    if (hasAnswered) return;
    handleAnswer(item.stemId, qid, option);
  }

  function toggleFlag(questionId) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  function getOptionState(option) {
    if (!hasAnswered) return 'idle';
    if (option === selectedAnswer) return 'selected';
    return 'idle';
  }

  function getQuestionStatus(fq) {
    const answered = getAnswer(fq.stemId, fq.question.questionId);
    if (answered) return 'Answered';
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
        title="Verbal Reasoning"
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <View style={styles.timedHeader}>
        <Text style={styles.timedHeaderTitle}>Verbal Reasoning</Text>
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
        color={sectionColor}
      />

      <View style={[styles.resourceContainer, { backgroundColor: t.bgCard, borderLeftColor: sectionColor, borderColor: t.border }]}>
        <Text style={[styles.resourceLabel, { color: sectionColor }]}>PASSAGE</Text>
        <ScrollView key={item.stemId} showsVerticalScrollIndicator>
          <Text style={[styles.resourceText, { color: t.textSecondary }]}>{item.resource}</Text>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.questionPanel}
        contentContainerStyle={styles.questionPanelInner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionHeader}>
          <Text style={[styles.questionText, { color: t.text }]}>{item.question.questionText}</Text>
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

        <View style={styles.optionsContainer}>
          {item.question.options.map((opt) => (
            <AnswerOptionButton
              key={opt}
              label={opt}
              state={getOptionState(opt)}
              onPress={() => onAnswer(opt)}
            />
          ))}
        </View>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.navigatorButton, { borderColor: sectionColor }]}
            onPress={() => setNavigatorVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.navigatorButtonText, { color: sectionColor }]}>☰ Navigator</Text>
          </TouchableOpacity>
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
  resourceContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  resourceLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  resourceText: { fontSize: 14, lineHeight: 22 },
  questionPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 8,
  },
  questionPanelInner: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 24, flex: 1 },
  flagButton: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  flagIcon: { fontSize: 20 },
  optionsContainer: { gap: 10 },
  bottomButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  navigatorButton: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 3 },
  navigatorButtonText: { fontSize: 12, fontWeight: '700' },
});
