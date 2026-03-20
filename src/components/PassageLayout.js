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
import { useTheme } from '../context/ThemeContext';
import ScreenNavBar from './ScreenNavBar';
import FeedbackBox from './FeedbackBox';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function PassageLayout({
  items,
  initialIndex,
  itemLabel,
  getTitle,
  getId,
  renderOptions,
  getQuestionOptions = null,
  alwaysShowReason = false,
  onAnswerCommit = null,
  initialAnswers = {},
  section = 'vr',
}) {
  const { practiceTheme: t } = useTheme();

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

  // Section accent color for the resource panel border
  const sectionColor = section === 'sj' ? t.sectionSJ : t.sectionVR;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.headerBg} />

      <ScreenNavBar
        title={getTitle(item, itemIndex)}
        meta={`Question ${itemIndex + 1} of ${items.length}`}
        onPrev={() => goToItem(itemIndex - 1)}
        onNext={() => goToItem(itemIndex + 1)}
        isFirst={isFirstItem}
        isLast={isLastItem}
        color={sectionColor}
      />

      <View style={[styles.resourceContainer, { backgroundColor: t.bgCard, borderLeftColor: sectionColor, borderColor: t.border }]}>
        <Text style={[styles.resourceLabel, { color: sectionColor }]}>{itemLabel.toUpperCase()}</Text>
        <ScrollView key={itemIndex} showsVerticalScrollIndicator>
          <Text style={[styles.resourceText, { color: t.textSecondary }]}>{item.resource}</Text>
        </ScrollView>
      </View>

      <View style={[styles.questionPanel, { backgroundColor: t.bgCard, borderColor: t.border }]}>
        <TouchableOpacity style={styles.panelHeader} onPress={togglePanel} activeOpacity={0.8}>
          <Text style={[styles.panelCounter, { color: t.textSecondary }]}>
            Question {questionIndex + 1} of {item.questions.length}
          </Text>
          <Text style={[styles.panelChevron, { color: sectionColor }]}>{panelExpanded ? '▾' : '▴'}</Text>
        </TouchableOpacity>

        {panelExpanded && (
          <ScrollView
            style={styles.panelContent}
            contentContainerStyle={styles.panelContentInner}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.questionText, { color: t.text }]}>{question.questionText}</Text>

            <View style={styles.optionsContainer}>
              {renderOptions({ item, question, getOptionState, onAnswer })}
            </View>

            {hasAnswered && (
              <FeedbackBox
                isCorrect={isCorrect}
                correctAnswer={question.answer}
                reason={question.answeringReason}
                showReason={!isCorrect || alwaysShowReason}
                questionContext={!isCorrect ? {
                  question: question.questionText,
                  questionType: section === 'sj' ? 'situational_judgement' : 'true_false_cant_tell',
                  section,
                  passage: item.resource ?? undefined,
                  options: getQuestionOptions ? getQuestionOptions(item, question) : undefined,
                  correctAnswer: question.answer,
                  userAnswer: selectedAnswer,
                  explanation: question.answeringReason,
                } : undefined}
              />
            )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingBottom: 24,
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
});
