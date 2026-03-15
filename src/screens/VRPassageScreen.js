import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  PanResponder,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import questionData from '../data/verbalReasoning/questions.json';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PASSAGES = questionData.passages;

// ─── Option Button ────────────────────────────────────────────────────────────

function OptionButton({ label, state, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        state === 'correct' && styles.optionCorrect,
        state === 'incorrect' && styles.optionIncorrect,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={state !== 'idle'}
    >
      <Text
        style={[
          styles.optionText,
          state === 'correct' && styles.optionTextCorrect,
          state === 'incorrect' && styles.optionTextIncorrect,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VRPassageScreen({ route }) {
  const { passageIndex: initialPassageIndex } = route.params;

  const [passageIndex, setPassageIndex] = useState(initialPassageIndex);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [panelExpanded, setPanelExpanded] = useState(true);

  const passage = PASSAGES[passageIndex];
  const question = passage.questions[questionIndex];

  const isFirstPassage = passageIndex === 0;
  const isLastPassage = passageIndex === PASSAGES.length - 1;
  const isFirstQuestion = questionIndex === 0;
  const isLastQuestion = questionIndex === passage.questions.length - 1;

  const selectedAnswer = answers[passage.passageId]?.[question.questionId] ?? null;
  const hasAnswered = !!selectedAnswer;
  const isCorrect = selectedAnswer === question.answer;

  function handleAnswer(option) {
    if (hasAnswered) return;
    setAnswers((prev) => ({
      ...prev,
      [passage.passageId]: {
        ...prev[passage.passageId],
        [question.questionId]: option,
      },
    }));
  }

  function goToPassage(newPassageIndex) {
    setPassageIndex(newPassageIndex);
    setQuestionIndex(0);
  }

  function goToNextQuestion() {
    if (!isLastQuestion) setQuestionIndex((i) => i + 1);
  }

  function goToPrevQuestion() {
    if (!isFirstQuestion) setQuestionIndex((i) => i - 1);
  }

  function togglePanel() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPanelExpanded((v) => !v);
  }

  // Refs so the PanResponder (created once) can read current state without stale closures
  const passageIndexRef = useRef(passageIndex);
  const goToPassageRef = useRef(goToPassage);
  useEffect(() => { passageIndexRef.current = passageIndex; }, [passageIndex]);
  useEffect(() => { goToPassageRef.current = goToPassage; });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 15,
      onPanResponderRelease: (_, { dx }) => {
        if (Math.abs(dx) < 60) return;
        const current = passageIndexRef.current;
        if (dx > 0 && current > 0) {
          goToPassageRef.current(current - 1);
        } else if (dx < 0 && current < PASSAGES.length - 1) {
          goToPassageRef.current(current + 1);
        }
      },
    })
  ).current;

  function getOptionState(option) {
    if (!hasAnswered) return 'idle';
    if (option === question.answer) return 'correct';
    if (option === selectedAnswer) return 'incorrect';
    return 'idle';
  }

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Passage navigation bar */}
      <View style={styles.passageNavBar}>
        <TouchableOpacity
          style={styles.passageNavButton}
          onPress={() => goToPassage(passageIndex - 1)}
          disabled={isFirstPassage}
        >
          <Text style={[styles.passageNavArrow, isFirstPassage && styles.disabled]}>‹</Text>
        </TouchableOpacity>

        <View style={styles.passageNavCenter}>
          <Text style={styles.passageNavTitle} numberOfLines={1}>{passage.title}</Text>
          <Text style={styles.passageNavMeta}>
            Passage {passageIndex + 1} of {PASSAGES.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.passageNavButton}
          onPress={() => goToPassage(passageIndex + 1)}
          disabled={isLastPassage}
        >
          <Text style={[styles.passageNavArrow, isLastPassage && styles.disabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Passage text — fills all remaining space */}
      <View style={styles.passageContainer}>
        <Text style={styles.passageLabel}>PASSAGE</Text>
        <ScrollView key={passageIndex} showsVerticalScrollIndicator>
          <Text style={styles.passageText}>{passage.resource}</Text>
        </ScrollView>
      </View>

      {/* Collapsible question panel */}
      <View style={styles.questionPanel}>

        {/* Panel handle / header — always visible */}
        <TouchableOpacity style={styles.panelHeader} onPress={togglePanel} activeOpacity={0.8}>
          <Text style={styles.panelQuestionCounter}>
            Question {questionIndex + 1} of {passage.questions.length}
          </Text>
          <Text style={styles.panelChevron}>{panelExpanded ? '▾' : '▴'}</Text>
        </TouchableOpacity>

        {/* Collapsible content */}
        {panelExpanded && (
          <ScrollView
            style={styles.panelContent}
            contentContainerStyle={styles.panelContentInner}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.questionText}>{question.questionText}</Text>

            <View style={styles.optionsContainer}>
              {question.options.map((option) => (
                <OptionButton
                  key={option}
                  label={option}
                  state={getOptionState(option)}
                  onPress={() => handleAnswer(option)}
                />
              ))}
            </View>

            {hasAnswered && (
              <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
                <Text style={styles.feedbackTitle}>{isCorrect ? 'Correct' : 'Incorrect'}</Text>
                {!isCorrect && (
                  <>
                    <Text style={styles.feedbackCorrectAnswer}>Correct answer: {question.answer}</Text>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },

  // Passage nav bar
  passageNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  passageNavButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passageNavArrow: {
    color: '#7c3aed',
    fontSize: 32,
    lineHeight: 36,
  },
  passageNavCenter: {
    flex: 1,
    alignItems: 'center',
  },
  passageNavTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  passageNavMeta: {
    color: '#a0aec0',
    fontSize: 12,
    marginTop: 2,
  },
  disabled: {
    color: '#2d3748',
  },

  // Passage — fills all available space between nav bar and question panel
  passageContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 0,
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  passageLabel: {
    color: '#7c3aed',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  passageText: {
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
  panelQuestionCounter: {
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
  optionButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: '#2d3748',
  },
  optionCorrect: {
    borderColor: '#38a169',
    backgroundColor: '#1a3a2a',
  },
  optionIncorrect: {
    borderColor: '#e53e3e',
    backgroundColor: '#3a1a1a',
  },
  optionText: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '500',
  },
  optionTextCorrect: {
    color: '#68d391',
    fontWeight: '700',
  },
  optionTextIncorrect: {
    color: '#fc8181',
    fontWeight: '700',
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
