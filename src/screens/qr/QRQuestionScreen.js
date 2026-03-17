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

import { useItemNavigation } from '../../hooks/useItemNavigation';
import { useAnswers } from '../../hooks/useAnswers';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import QRStimulusRenderer from '../../components/qr/QRStimulusRenderer';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import ScreenNavBar from '../../components/ScreenNavBar';
import FeedbackBox from '../../components/FeedbackBox';
import setsData from '../../data/quantitativeReasoning/questions.json';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const SETS = setsData.sets;

export default function QRQuestionScreen({ route }) {
  const { index: initialIndex = 0 } = route?.params ?? {};

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
  } = useItemNavigation(SETS, initialIndex);

  const { handleAnswer, getAnswer } = useAnswers();
  const [panelExpanded, setPanelExpanded] = useState(true);

  const selectedAnswer = getAnswer(item.setId, question.questionId);
  const hasAnswered = !!selectedAnswer;
  const isCorrect = selectedAnswer === question.answer;

  const panHandlers = useSwipeGesture(
    isFirstItem ? null : () => goToItem(itemIndex - 1),
    isLastItem ? null : () => goToItem(itemIndex + 1),
  );

  function onAnswer(option) {
    if (hasAnswered) return;
    handleAnswer(item.setId, question.questionId, option);
  }

  function getOptionState(option) {
    if (!hasAnswered) return 'idle';
    if (option === question.answer) return 'correct';
    if (option === selectedAnswer) return 'incorrect';
    return 'idle';
  }

  function togglePanel() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPanelExpanded((v) => !v);
  }

  return (
    <SafeAreaView style={styles.container} {...panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <ScreenNavBar
        title={item.title}
        meta={`Set ${itemIndex + 1} of ${SETS.length}`}
        onPrev={() => goToItem(itemIndex - 1)}
        onNext={() => goToItem(itemIndex + 1)}
        isFirst={isFirstItem}
        isLast={isLastItem}
        color="#059669"
      />

      {/* Stimulus area */}
      <ScrollView
        key={itemIndex}
        style={styles.stimulusScroll}
        contentContainerStyle={styles.stimulusContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dataLabel}>DATA</Text>
        <QRStimulusRenderer stimulus={item.stimulus} />
      </ScrollView>

      {/* Question panel */}
      <View style={styles.panel}>
        <TouchableOpacity style={styles.panelHeader} onPress={togglePanel} activeOpacity={0.8}>
          <Text style={styles.panelCounter}>
            Question {questionIndex + 1} of {item.questions.length}
          </Text>
          <Text style={styles.panelChevron}>{panelExpanded ? '▾' : '▴'}</Text>
        </TouchableOpacity>

        {panelExpanded && (
          <ScrollView
            style={styles.panelScroll}
            contentContainerStyle={styles.panelContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.questionText}>{question.questionText}</Text>

            <View style={styles.options}>
              {question.options.map((opt) => (
                <AnswerOptionButton
                  key={opt.label}
                  label={`${opt.label}.  ${opt.text}`}
                  state={getOptionState(opt.label)}
                  onPress={() => onAnswer(opt.label)}
                />
              ))}
            </View>

            {hasAnswered && (
              <FeedbackBox
                isCorrect={isCorrect}
                correctAnswer={question.answer}
                reason={question.answeringReason}
                showReason
              />
            )}

            <View style={styles.questionNav}>
              <TouchableOpacity
                style={[styles.qNavBtn, isFirstQuestion && styles.qNavBtnDisabled]}
                onPress={goToPrevQuestion}
                disabled={isFirstQuestion}
              >
                <Text style={styles.qNavText}>← Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.qNavBtn, isLastQuestion && styles.qNavBtnDisabled]}
                onPress={goToNextQuestion}
                disabled={isLastQuestion}
              >
                <Text style={styles.qNavText}>Next →</Text>
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

  stimulusScroll: {
    flex: 1,
  },
  stimulusContent: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
    marginBottom: 8,
  },
  dataLabel: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  panel: {
    backgroundColor: '#16213e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1.5,
    borderColor: '#2d3748',
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
    color: '#059669',
    fontSize: 18,
  },
  panelScroll: {
    maxHeight: 390,
  },
  panelContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  questionText: {
    color: '#ffffff',
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
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2d3748',
  },
  qNavBtnDisabled: {
    opacity: 0.3,
  },
  qNavText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
