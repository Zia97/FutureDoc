import React, { useState } from 'react';
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

  const { handleAnswer, getAnswer } = useAnswers();
  const [panelExpanded, setPanelExpanded] = useState(true);

  const itemId = getId(item);
  const selectedAnswer = getAnswer(itemId, question.questionId);
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
    handleAnswer(itemId, question.questionId, option);
  }

  function togglePanel() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPanelExpanded((v) => !v);
  }

  return (
    <SafeAreaView style={styles.container} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Item navigation bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => goToItem(itemIndex - 1)}
          disabled={isFirstItem}
        >
          <Text style={[styles.navArrow, isFirstItem && styles.disabled]}>‹</Text>
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text style={styles.navTitle} numberOfLines={1}>{getTitle(item, itemIndex)}</Text>
          <Text style={styles.navMeta}>
            {itemLabel} {itemIndex + 1} of {items.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => goToItem(itemIndex + 1)}
          disabled={isLastItem}
        >
          <Text style={[styles.navArrow, isLastItem && styles.disabled]}>›</Text>
        </TouchableOpacity>
      </View>

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
              <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
                <Text style={styles.feedbackTitle}>{isCorrect ? 'Correct' : 'Incorrect'}</Text>
                {(!isCorrect || alwaysShowReason) && (
                  <>
                    {!isCorrect && (
                      <Text style={styles.feedbackCorrectAnswer}>
                        Correct answer: {question.answer}
                      </Text>
                    )}
                    <Text style={styles.feedbackReason}>{question.answeringReason}</Text>
                  </>
                )}
              </View>
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

  // Nav bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    color: '#7c3aed',
    fontSize: 32,
    lineHeight: 36,
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  navMeta: {
    color: '#a0aec0',
    fontSize: 12,
    marginTop: 2,
  },
  disabled: {
    color: '#2d3748',
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

  // Feedback
  feedbackBox: {
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
  },
  feedbackCorrect: {
    backgroundColor: '#1a3a2a',
    borderColor: '#38a169',
  },
  feedbackIncorrect: {
    backgroundColor: '#2a1a1a',
    borderColor: '#e53e3e',
  },
  feedbackTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  feedbackCorrectAnswer: {
    color: '#a0aec0',
    fontSize: 13,
    marginBottom: 8,
  },
  feedbackReason: {
    color: '#cbd5e0',
    fontSize: 14,
    lineHeight: 21,
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
