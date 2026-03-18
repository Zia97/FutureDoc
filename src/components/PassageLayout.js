import { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { useItemNavigation } from '../hooks/useItemNavigation';
import { useAnswers } from '../hooks/useAnswers';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import ScreenNavBar from './ScreenNavBar';
import FeedbackBox from './FeedbackBox';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// Props:
//   items          — array of passage/scenario objects
//   initialIndex   — starting item index
//   itemLabel      — "Passage" | "Scenario"
//   getTitle       — (item, index) => string  — text shown in the nav bar
//   getId          — (item) => string|number  — unique item identifier for answer tracking
//   renderOptions  — ({ item, question, getOptionState, onAnswer }) => ReactNode
//   alwaysShowReason — bool — show answeringReason even on correct answer (default false)

export default function PassageLayout({
  items,
  initialIndex,
  itemLabel,
  getTitle,
  getId,
  renderOptions,
  alwaysShowReason = false,
  onAnswerCommit = null,
  initialAnswers = {},
}) {
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
    goToNextQuestion,
    goToPrevQuestion,
  } = useItemNavigation(items, initialIndex);

  const { handleAnswer, getAnswer } = useAnswers(initialAnswers);
  const [panelExpanded, setPanelExpanded] = useState(true);

  const itemId = getId(item);
  const qid = question.questionId ?? question.id;
  const selectedAnswer = getAnswer(itemId, qid);
  const hasAnswered = !!selectedAnswer;
  const isCorrect = selectedAnswer === question.answer;

  const panHandlers = useSwipeGesture(
    isFirstItem ? null : () => goToItem(itemIndex - 1),
    isLastItem ? null : () => goToItem(itemIndex + 1),
  );

  function getOptionState(option) {
    if (!hasAnswered) return 'idle';
    if (option === question.answer) return 'correct';
    if (option === selectedAnswer) return 'incorrect';
    return 'idle';
  }

  function onAnswer(option) {
    if (hasAnswered) return;
    handleAnswer(itemId, qid, option);
    onAnswerCommit?.(itemId, qid, option);
  }

  function togglePanel() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPanelExpanded((v) => !v);
  }

  return (
    <SafeAreaView style={styles.container} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <ScreenNavBar
        title={getTitle(item, itemIndex)}
        meta={`Question ${itemIndex + 1} of ${items.length}`}
        onPrev={() => goToItem(itemIndex - 1)}
        onNext={() => goToItem(itemIndex + 1)}
        isFirst={isFirstItem}
        isLast={isLastItem}
        color="#7c3aed"
      />

      {/* Resource text */}
      <View style={styles.resourceContainer}>
        <Text style={styles.resourceLabel}>{itemLabel.toUpperCase()}</Text>
        <ScrollView key={itemIndex} showsVerticalScrollIndicator>
          <Text style={styles.resourceText}>{item.resource}</Text>
        </ScrollView>
      </View>

      {/* Collapsible question panel */}
      <View style={styles.questionPanel}>
        <TouchableOpacity style={styles.panelHeader} onPress={togglePanel} activeOpacity={0.8}>
          <Text style={styles.panelCounter}>
            Question {questionIndex + 1} of {item.questions.length}
          </Text>
          <Text style={styles.panelChevron}>{panelExpanded ? '▾' : '▴'}</Text>
        </TouchableOpacity>

        {panelExpanded && (
          <ScrollView
            style={styles.panelContent}
            contentContainerStyle={styles.panelContentInner}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.questionText}>{question.questionText}</Text>

            <View style={styles.optionsContainer}>
              {renderOptions({ item, question, getOptionState, onAnswer })}
            </View>

            {hasAnswered && (
              <FeedbackBox
                isCorrect={isCorrect}
                correctAnswer={question.answer}
                reason={question.answeringReason}
                showReason={!isCorrect || alwaysShowReason}
              />
            )}

            <View style={styles.questionNav}>
              <TouchableOpacity
                style={[styles.questionNavButton, isFirstQuestion && styles.questionNavButtonDisabled]}
                onPress={goToPrevQuestion}
                disabled={isFirstQuestion}
              >
                <Text style={styles.questionNavText}>← Previous</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.questionNavButton, isLastQuestion && styles.questionNavButtonDisabled]}
                onPress={goToNextQuestion}
                disabled={isLastQuestion}
              >
                <Text style={styles.questionNavText}>Next →</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },

  // Resource text area
  resourceContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  resourceLabel: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  resourceText: {
    color: '#cbd5e0',
    fontSize: 14,
    lineHeight: 22,
  },

  // Collapsible question panel
  questionPanel: {
    backgroundColor: '#16213e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1.5,
    borderColor: '#2d3748',
    marginTop: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  panelCounter: {
    color: '#a0aec0',
    fontSize: 13,
    fontWeight: '600',
  },
  panelChevron: {
    color: '#7c3aed',
    fontSize: 18,
  },
  panelContent: {
    maxHeight: 380,
  },
  panelContentInner: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // Question
  questionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 16,
  },

  // Options
  optionsContainer: {
    gap: 10,
  },

  // Question prev/next
  questionNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  questionNavButton: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2d3748',
  },
  questionNavButtonDisabled: {
    opacity: 0.3,
  },
  questionNavText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
