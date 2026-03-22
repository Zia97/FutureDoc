import { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useItemNavigation } from '../../hooks/ui/useItemNavigation';
import { useAnswers } from '../../hooks/ui/useAnswers';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useTestTimer } from '../../hooks/ui/useTestTimer';
import { LABEL_SETS } from '../../constants/sjLabelSets';
import ScreenNavBar from '../../components/ScreenNavBar';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import TestNavigatorModal from '../../components/TestNavigatorModal';
import SJTestReviewScreen from '../../components/SJTestReviewScreen';
import TimedSJResultsScreen from '../../components/TimedSJResultsScreen';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function TimedSJTestScreen({ route, navigation }) {
  const { test } = route.params;
  const { practiceTheme: t } = useTheme();
  const insets = useSafeAreaInsets();

  const panelScrollRef = useRef(null);
  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [flags, setFlags] = useState(new Set());
  const [seenItems, setSeenItems] = useState(new Set());
  const [panelExpanded, setPanelExpanded] = useState(true);

  const { display: timerDisplay, isUrgent, isPaused, pause, resume } = useTestTimer(test.timeMinutes);

  // Adapt scenarios so useItemNavigation can work with item.questions
  const scenarios = useMemo(
    () => test.scenarios.map((s) => ({ ...s, questions: s.items })),
    [test],
  );

  const {
    itemIndex,
    questionIndex,
    item,
    question,
    isFirstItem,
    isLastItem,
    isFirstQuestion,
    isLastQuestion,
    goToItem,
    goToItemAndQuestion,
    goToNextQuestion,
    goToPrevQuestion,
  } = useItemNavigation(scenarios, 0);

  const { handleAnswer, getAnswer } = useAnswers({});

  const scenarioId = item.scenarioId;
  const itemId = question.itemId;
  const selectedAnswer = getAnswer(scenarioId, itemId);
  const sectionColor = t.sectionSJ;
  const isFlagged = flags.has(itemId);
  const labelSet = question.type === 'importance' ? LABEL_SETS[1] : LABEL_SETS[2];

  useEffect(() => {
    setSeenItems((prev) => {
      if (prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });
  }, [itemId]);

  const flatQuestions = useMemo(() => {
    const list = [];
    scenarios.forEach((s, sIdx) => {
      s.items.forEach((it, iIdx) => {
        list.push({
          globalIndex: list.length,
          passageIndex: sIdx,
          questionIndex: iIdx,
          questionId: it.itemId,
        });
      });
    });
    return list;
  }, [scenarios]);

  const panHandlers = useSwipeGesture(
    isFirstItem ? null : () => goToItem(itemIndex - 1),
    isLastItem ? null : () => goToItem(itemIndex + 1),
  );

  function onAnswer(option) {
    handleAnswer(scenarioId, itemId, option);
  }

  function togglePanel() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPanelExpanded((v) => !v);
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
    const scenario = scenarios[fq.passageIndex];
    const answered = getAnswer(scenario.scenarioId, fq.questionId);
    if (answered) return 'Answered';
    if (seenItems.has(fq.questionId)) return 'Incomplete';
    return 'Unseen';
  }

  if (examEnded) {
    return (
      <TimedSJResultsScreen
        scenarios={scenarios}
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
        questions={flatQuestions}
        getStatus={getQuestionStatus}
        flags={flags}
        onNavigateTo={(passageIndex, questionIndex) => {
          goToItemAndQuestion(passageIndex, questionIndex);
          setShowReview(false);
        }}
        onEndTest={() => setExamEnded(true)}
        timerDisplay={timerDisplay}
        isUrgent={isUrgent}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Timed header — title + timer */}
      <View style={styles.timedHeader}>
        <Text style={styles.timedHeaderTitle}>Situational Judgement</Text>
        <View style={[styles.timerBadge, { backgroundColor: isUrgent ? '#dc2626' : '#1d4ed8' }]}>
          <Text style={styles.timerText}>{timerDisplay}</Text>
        </View>
      </View>

      {/* Scenario nav bar */}
      <ScreenNavBar
        title={`Scenario ${itemIndex + 1}`}
        meta={`Scenario ${itemIndex + 1} of ${scenarios.length}`}
        onPrev={() => goToItem(itemIndex - 1)}
        onNext={isLastItem ? () => setShowReview(true) : () => goToItem(itemIndex + 1)}
        isFirst={isFirstItem}
        isLast={false}
        color={sectionColor}
      />

      {/* Scenario stem */}
      <View style={[styles.resourceContainer, { backgroundColor: t.bgCard, borderLeftColor: sectionColor, borderColor: t.border }]}>
        <Text style={[styles.resourceLabel, { color: sectionColor }]}>SCENARIO</Text>
        <ScrollView key={itemIndex} showsVerticalScrollIndicator>
          <Text style={[styles.resourceText, { color: t.textSecondary }]}>{item.stem}</Text>
        </ScrollView>
      </View>

      {/* Question panel */}
      <View style={[styles.questionPanel, { backgroundColor: t.bgCard, borderColor: t.border }]}>
        <TouchableOpacity style={styles.panelHeader} onPress={togglePanel} activeOpacity={0.8}>
          <Text style={[styles.panelCounter, { color: t.textSecondary }]}>
            Item {questionIndex + 1} of {item.questions.length}
          </Text>
          <View style={styles.panelHeaderRight}>
            <TouchableOpacity
              style={[styles.flagButton, isFlagged && styles.flagButtonActive]}
              onPress={() => toggleFlag(itemId)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.flagIcon, { color: isFlagged ? '#d97706' : t.textSecondary }]}>
                {isFlagged ? '⚑' : '⚐'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.panelChevron, { color: sectionColor }]}>
              {panelExpanded ? '▾' : '▴'}
            </Text>
          </View>
        </TouchableOpacity>

        {panelExpanded && (
          <ScrollView
            ref={panelScrollRef}
            style={styles.panelContent}
            contentContainerStyle={styles.panelContentInner}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.questionText, { color: t.text }]}>{question.text}</Text>

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

            <View style={styles.questionNav}>
              <TouchableOpacity
                style={[
                  styles.questionNavButton,
                  { backgroundColor: t.bgInput, borderColor: t.borderStrong },
                  isFirstQuestion && styles.questionNavButtonDisabled,
                ]}
                onPress={() => { goToPrevQuestion(); panelScrollRef.current?.scrollTo({ y: 0, animated: false }); }}
                disabled={isFirstQuestion}
              >
                <Text style={[styles.questionNavText, { color: t.text }]}>← Previous</Text>
              </TouchableOpacity>

              {isLastItem && isLastQuestion ? (
                <TouchableOpacity
                  style={[styles.questionNavButton, { backgroundColor: '#1e3a8a', borderColor: '#1e3a8a' }]}
                  onPress={() => setShowReview(true)}
                >
                  <Text style={[styles.questionNavText, { color: '#ffffff' }]}>Review →</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.questionNavButton,
                    { backgroundColor: t.bgInput, borderColor: t.borderStrong },
                    isLastQuestion && styles.questionNavButtonDisabled,
                  ]}
                  onPress={() => { goToNextQuestion(); panelScrollRef.current?.scrollTo({ y: 0, animated: false }); }}
                  disabled={isLastQuestion}
                >
                  <Text style={[styles.questionNavText, { color: t.text }]}>Next →</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.bottomButtons}>
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
          </ScrollView>
        )}
      </View>

      {/* Pause overlay */}
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
        onNavigateTo={goToItemAndQuestion}
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
  resourceContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  resourceLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  resourceText: {
    fontSize: 14,
    lineHeight: 22,
  },
  questionPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1.5,
    marginTop: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  panelHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagButton: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  flagButtonActive: {
    backgroundColor: '#fef3c7',
  },
  flagIcon: {
    fontSize: 20,
  },
  panelCounter: {
    fontSize: 13,
    fontWeight: '600',
  },
  panelChevron: {
    fontSize: 18,
  },
  panelContent: {
    maxHeight: 380,
  },
  panelContentInner: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 10,
  },
  questionNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  questionNavButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  questionNavButtonDisabled: {
    opacity: 0.3,
  },
  questionNavText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pauseButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  pauseButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
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
  pauseIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  pauseTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
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
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
