import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
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
  const insets = useSafeAreaInsets();

  const [setIndex, setSetIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [seenQuestions, setSeenQuestions] = useState(new Set());
  const [flags, setFlags] = useState(new Set());
  const [calcVisible, setCalcVisible] = useState(false);
  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const { display: timerDisplay, isUrgent } = useTestTimer(test.timeMinutes);

  const currentSet = test.sets[setIndex];
  const question = currentSet.questions[questionIndex];
  const qid = question.questionId;

  const isFirstSet = setIndex === 0;
  const isLastSet = setIndex === test.sets.length - 1;
  const isFirstQuestion = questionIndex === 0;
  const isLastQuestion = questionIndex === currentSet.questions.length - 1;

  const currentAnswer = answers[qid];
  const isFlagged = flags.has(qid);

  // Reset question index when navigating to a new set
  function goToSet(idx) {
    setSetIndex(idx);
    setQuestionIndex(0);
  }

  const panHandlers = useSwipeGesture(
    isFirstSet ? null : () => goToSet(setIndex - 1),
    isLastSet ? null : () => goToSet(setIndex + 1),
  );

  useEffect(() => {
    setSeenQuestions((prev) => {
      if (prev.has(qid)) return prev;
      const next = new Set(prev);
      next.add(qid);
      return next;
    });
  }, [qid]);

  // Flat list of all questions for the navigator (one row per question, like VR)
  const flatQuestions = useMemo(() => {
    const list = [];
    test.sets.forEach((s, sIdx) => {
      s.questions.forEach((q, qIdx) => {
        list.push({
          globalIndex: list.length,
          passageIndex: sIdx,
          questionIndex: qIdx,
          questionId: q.questionId,
        });
      });
    });
    return list;
  }, [test]);

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
    if (answers[fq.questionId] != null) return 'Answered';
    if (seenQuestions.has(fq.questionId)) return 'Incomplete';
    return 'Unseen';
  }

  if (showReview) {
    return (
      <SJTestReviewScreen
        questions={flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(sIdx, qIdx) => { goToSet(sIdx); setQuestionIndex(qIdx); setShowReview(false); }}
        onEndTest={() => {}}
        timerDisplay={timerDisplay}
        isUrgent={isUrgent}
        title="Quantitative Reasoning"
        groupLabel="Set"
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Timed header — title + timer */}
      <View style={styles.timedHeader}>
        <Text style={styles.timedHeaderTitle}>Quantitative Reasoning</Text>
        <View style={[styles.timerBadge, { backgroundColor: isUrgent ? '#dc2626' : '#1d4ed8' }]}>
          <Text style={styles.timerText}>{timerDisplay}</Text>
        </View>
      </View>

      {/* Set nav bar */}
      <ScreenNavBar
        title={currentSet.title}
        meta={`Data Set ${setIndex + 1} of ${test.sets.length}`}
        onPrev={() => goToSet(setIndex - 1)}
        onNext={isLastSet ? () => setShowReview(true) : () => goToSet(setIndex + 1)}
        isFirst={isFirstSet}
        isLast={false}
        color={t.sectionQR}
        onCalculator={() => setCalcVisible(true)}
      />

      <CalculatorModal visible={calcVisible} onClose={() => setCalcVisible(false)} />


      <ScrollView
        key={setIndex}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stimulus — shared across all questions in this set */}
        <View style={[styles.stimulusContainer, { backgroundColor: t.bgCard, borderLeftColor: t.sectionQR, borderColor: t.border }]}>
          <Text style={[styles.dataLabel, { color: t.sectionQR }]}>DATA</Text>
          <QRStimulusRenderer stimulus={currentSet.stimulus} />
        </View>

        {/* Question + options */}
        <View style={[styles.panel, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <View style={styles.panelHeader}>
            <Text style={[styles.questionCounter, { color: t.textSecondary }]}>
              Question {questionIndex + 1} of {currentSet.questions.length}
            </Text>
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

          <View style={styles.panelContent}>
            <Text style={[styles.questionText, { color: t.text }]}>{question.stem}</Text>

            <View style={styles.options}>
              {question.options.map((opt) => (
                <AnswerOptionButton
                  key={opt.label}
                  label={`${opt.label}.  ${opt.text}`}
                  state={currentAnswer === opt.label ? 'selected' : 'idle'}
                  onPress={() => handleAnswer(opt.label)}
                />
              ))}
            </View>

            {/* Question prev/next within the set */}
            <View style={styles.questionNav}>
              <TouchableOpacity
                style={[styles.qNavBtn, { backgroundColor: t.bgInput, borderColor: t.borderStrong }, isFirstQuestion && styles.qNavBtnDisabled]}
                onPress={() => setQuestionIndex((i) => i - 1)}
                disabled={isFirstQuestion}
              >
                <Text style={[styles.qNavText, { color: t.text }]}>← Previous</Text>
              </TouchableOpacity>
              {isLastSet && isLastQuestion ? (
                <TouchableOpacity
                  style={[styles.qNavBtn, { backgroundColor: t.headerBg, borderColor: t.headerBg }]}
                  onPress={() => setShowReview(true)}
                >
                  <Text style={[styles.qNavText, { color: '#ffffff' }]}>Review →</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.qNavBtn, { backgroundColor: t.bgInput, borderColor: t.borderStrong }, isLastQuestion && styles.qNavBtnDisabled]}
                  onPress={() => setQuestionIndex((i) => i + 1)}
                  disabled={isLastQuestion}
                >
                  <Text style={[styles.qNavText, { color: t.text }]}>Next →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom toolbar — Navigator */}
      <View style={[styles.bottomBar, { backgroundColor: t.bgCard, borderTopColor: t.border, paddingBottom: insets.bottom + 4 }]}>
        <TouchableOpacity
          style={[styles.navigatorButton, { borderColor: t.sectionQR }]}
          onPress={() => setNavigatorVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.navigatorButtonText, { color: t.sectionQR }]}>☰ Navigator</Text>
        </TouchableOpacity>
      </View>

      <TestNavigatorModal
        visible={navigatorVisible}
        questions={flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(sIdx, qIdx) => { goToSet(sIdx); setQuestionIndex(qIdx); setNavigatorVisible(false); }}
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
  flagButton: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  flagIcon: {
    fontSize: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  stimulusContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  dataLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  panel: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  questionCounter: {
    fontSize: 13,
    fontWeight: '600',
  },
  panelContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 16,
  },
  options: {
    gap: 10,
  },
  questionNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  qNavBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  qNavBtnDisabled: { opacity: 0.3 },
  qNavText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    alignItems: 'flex-end',
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
});
