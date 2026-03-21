import { useState, useMemo, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useItemNavigation } from '../../hooks/ui/useItemNavigation';
import { useAnswers } from '../../hooks/ui/useAnswers';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useTestTimer } from '../../hooks/ui/useTestTimer';
import ScreenNavBar from '../../components/ScreenNavBar';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import TestNavigatorModal from '../../components/TestNavigatorModal';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function TimedVRTestScreen({ route }) {
  const { test } = route.params;
  const { practiceTheme: t } = useTheme();
  const insets = useSafeAreaInsets();

  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const [flags, setFlags] = useState(new Set());
  const [seenQuestions, setSeenQuestions] = useState(new Set());
  const [panelExpanded, setPanelExpanded] = useState(true);

  const { display: timerDisplay, isUrgent } = useTestTimer(test.timeMinutes);

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
  } = useItemNavigation(test.passages, 0);

  const { handleAnswer, getAnswer } = useAnswers({});

  const itemId = item.id;
  const qid = question.questionId ?? question.id;
  const selectedAnswer = getAnswer(itemId, qid);
  const hasAnswered = !!selectedAnswer;
  const sectionColor = t.sectionVR;
  const isFlagged = flags.has(qid);

  // Mark question as seen whenever we land on it
  useEffect(() => {
    setSeenQuestions((prev) => {
      if (prev.has(qid)) return prev;
      const next = new Set(prev);
      next.add(qid);
      return next;
    });
  }, [qid]);

  // Flat list of all questions for the navigator
  const flatQuestions = useMemo(() => {
    const list = [];
    test.passages.forEach((passage, pIdx) => {
      passage.questions.forEach((q, qIdx) => {
        list.push({
          globalIndex: list.length,
          passageIndex: pIdx,
          questionIndex: qIdx,
          questionId: q.questionId,
        });
      });
    });
    return list;
  }, [test]);

  const panHandlers = useSwipeGesture(
    isFirstItem ? null : () => goToItem(itemIndex - 1),
    isLastItem ? null : () => goToItem(itemIndex + 1),
  );

  function getOptionState(option) {
    if (!hasAnswered) return 'idle';
    if (option === selectedAnswer) return 'selected';
    return 'idle';
  }

  function onAnswer(option) {
    if (hasAnswered) return;
    handleAnswer(itemId, qid, option);
  }

  function togglePanel() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPanelExpanded((v) => !v);
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
    const passage = test.passages[fq.passageIndex];
    const answered = getAnswer(passage.id, fq.questionId);
    if (answered) return 'Answered';
    if (seenQuestions.has(fq.questionId)) return 'Incomplete';
    return 'Unseen';
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Timed test header — title + timer */}
      <View style={styles.timedHeader}>
        <Text style={styles.timedHeaderTitle}>Verbal Reasoning</Text>
        <View style={[styles.timerBadge, { backgroundColor: isUrgent ? '#dc2626' : '#1d4ed8' }]}>
          <Text style={styles.timerText}>{timerDisplay}</Text>
        </View>
      </View>

      {/* Passage navigation bar */}
      <ScreenNavBar
        title={item.title}
        meta={`Passage ${itemIndex + 1} of ${test.passages.length}`}
        onPrev={() => goToItem(itemIndex - 1)}
        onNext={() => goToItem(itemIndex + 1)}
        isFirst={isFirstItem}
        isLast={isLastItem}
        color={sectionColor}
      />

      {/* Passage resource panel */}
      <View style={[styles.resourceContainer, { backgroundColor: t.bgCard, borderLeftColor: sectionColor, borderColor: t.border }]}>
        <Text style={[styles.resourceLabel, { color: sectionColor }]}>PASSAGE</Text>
        <ScrollView key={itemIndex} showsVerticalScrollIndicator>
          <Text style={[styles.resourceText, { color: t.textSecondary }]}>{item.resource}</Text>
        </ScrollView>
      </View>

      {/* Question panel */}
      <View style={[styles.questionPanel, { backgroundColor: t.bgCard, borderColor: t.border }]}>
        <TouchableOpacity style={styles.panelHeader} onPress={togglePanel} activeOpacity={0.8}>
          <Text style={[styles.panelCounter, { color: t.textSecondary }]}>
            Question {questionIndex + 1} of {item.questions.length}
          </Text>
          <View style={styles.panelHeaderRight}>
            {/* Flag button */}
            <TouchableOpacity
              style={[styles.flagButton, isFlagged && { backgroundColor: '#dbeafe' }]}
              onPress={() => toggleFlag(qid)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.flagIcon, { color: isFlagged ? '#2563eb' : t.textSecondary }]}>
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
            style={styles.panelContent}
            contentContainerStyle={styles.panelContentInner}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.questionText, { color: t.text }]}>{question.questionText}</Text>

            <View style={styles.optionsContainer}>
              {question.options.map((opt) => (
                <AnswerOptionButton
                  key={opt}
                  label={opt}
                  state={getOptionState(opt)}
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
                onPress={goToPrevQuestion}
                disabled={isFirstQuestion}
              >
                <Text style={[styles.questionNavText, { color: t.text }]}>← Previous</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.questionNavButton,
                  { backgroundColor: t.bgInput, borderColor: t.borderStrong },
                  isLastQuestion && styles.questionNavButtonDisabled,
                ]}
                onPress={goToNextQuestion}
                disabled={isLastQuestion}
              >
                <Text style={[styles.questionNavText, { color: t.text }]}>Next →</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Bottom toolbar — Navigator button */}
      <View style={[styles.bottomBar, { backgroundColor: t.bgCard, borderTopColor: t.border, paddingBottom: insets.bottom + 4 }]}>
        <TouchableOpacity
          style={[styles.navigatorButton, { borderColor: sectionColor }]}
          onPress={() => setNavigatorVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.navigatorButtonText, { color: sectionColor }]}>☰ Navigator</Text>
        </TouchableOpacity>
      </View>

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
    maxHeight: 340,
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
