import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, StatusBar, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DMQuestionRenderer from '../../components/dm/DMQuestionRenderer';
import ScreenNavBar from '../../components/ScreenNavBar';
import CalculatorModal from '../../components/CalculatorModal';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useDecisionMakingQuestions } from '../../hooks/queries/useDecisionMakingQuestions';
import { useDecisionMakingAttempts } from '../../hooks/attempts/useDecisionMakingAttempts';
import { useTheme } from '../../context/ThemeContext';

const YES_NO_TYPES = ['syllogism', 'interpreting_info'];

// ── Venn description helpers ──────────────────────────────────────────────────

function describeRegionKey(key, setLabels) {
  if (key === 'outside') return 'outside all sets';
  if (key === 'all_three') return 'all three sets overlap';
  const parts = key.split('_');
  if (parts[parts.length - 1] === 'only') {
    const setId = parts.slice(0, -1).join('_');
    return `only ${setLabels[setId] || setId}`;
  }
  return parts.map((id) => setLabels[id] || id).join(' ∩ ');
}

function describeVennConfig(vennConfig) {
  if (!vennConfig) return '';
  const { diagramLayout, sets = [], regions = {} } = vennConfig;
  const setLabels = {};
  sets.forEach((s) => { setLabels[s.id] = s.label || s.id; });
  const setsDesc = sets.map((s) => `${s.label || s.id} (${s.shape || 'circle'})`).join(', ');
  const regionLines = Object.entries(regions)
    .map(([key, value]) => `  ${describeRegionKey(key, setLabels)}: ${value}`)
    .join('\n');
  return `layout: ${diagramLayout}\nsets: ${setsDesc}\nregion counts:\n${regionLines}`;
}

export default function DMQuestionScreen({ route }) {
  const { index: initialIndex = 0 } = route?.params ?? {};
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [calcVisible, setCalcVisible] = useState(false);
  const { practiceTheme: t } = useTheme();

  const { questions, loading } = useDecisionMakingQuestions();
  const { submitAttempt, localAnswers, localSubmitted, cacheLoading } = useDecisionMakingAttempts();

  useEffect(() => {
    if (!cacheLoading) {
      setAnswers(localAnswers);
      setSubmitted(localSubmitted);
    }
  }, [cacheLoading]);

  const question = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  function goPrev() { if (!isFirst) setCurrentIndex((i) => i - 1); }
  function goNext() { if (!isLast) setCurrentIndex((i) => i + 1); }

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? null : goNext,
  );

  if (loading || cacheLoading || !question) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bg }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  const isYesNo = YES_NO_TYPES.includes(question.type);
  const currentAnswer = answers[question.id];
  const isSubmitted = !!submitted[question.id];

  function handleAnswer(val) {
    if (isSubmitted) return;
    if (!isYesNo) {
      setAnswers((prev) => ({ ...prev, [question.id]: val }));
      setSubmitted((prev) => ({ ...prev, [question.id]: true }));
      submitAttempt({ questionId: question.id, answer: val });
    } else {
      setAnswers((prev) => ({ ...prev, [question.id]: val }));
    }
  }

  function handleCheckAnswers() {
    setSubmitted((prev) => ({ ...prev, [question.id]: true }));
    submitAttempt({ questionId: question.id, answer: currentAnswer });
  }

  const allStatementsAnswered =
    isYesNo &&
    question.statements &&
    currentAnswer &&
    question.statements.every((_, i) => currentAnswer[i] !== undefined);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.headerBg} />

      <ScreenNavBar
        title={question.title}
        meta={`Question ${currentIndex + 1} of ${questions.length}`}
        onPrev={goPrev}
        onNext={goNext}
        isFirst={isFirst}
        isLast={isLast}
        color={t.sectionDM}
        onCalculator={() => setCalcVisible(true)}
      />

      <CalculatorModal visible={calcVisible} onClose={() => setCalcVisible(false)} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DMQuestionRenderer
          question={question}
          answer={currentAnswer}
          onAnswer={handleAnswer}
          submitted={isSubmitted}
          questionContext={isSubmitted ? {
            question: question.stem,
            questionType: question.type,
            section: 'dm',
            options: isYesNo
              ? question.statements?.map((s, i) => `${i + 1}. ${s}`)
              : question.subtype === 'select_diagram'
              ? undefined
              : question.options?.map((o) => `${o.label}. ${o.text}`),
            correctAnswer: typeof question.answer === 'object'
              ? JSON.stringify(question.answer)
              : question.answer,
            userAnswer: typeof currentAnswer === 'object'
              ? JSON.stringify(currentAnswer)
              : (currentAnswer ?? ''),
            explanation: question.answeringReason,
            stimulusData: question.tableData ?? undefined,
            vennDiagrams: question.type === 'venn_diagram'
              ? question.subtype === 'select_diagram'
                ? question.options?.map((o) => `Option ${o.label}:\n${describeVennConfig(o.vennConfig)}`).join('\n\n')
                : describeVennConfig(question.stimulusDiagram)
              : undefined,
          } : undefined}
        />

        {isYesNo && !isSubmitted && (
          <TouchableOpacity
            style={[
              styles.checkButton,
              { backgroundColor: t.sectionDM },
              !allStatementsAnswered && { backgroundColor: t.borderStrong, opacity: 0.5 },
            ]}
            onPress={handleCheckAnswers}
            disabled={!allStatementsAnswered}
          >
            <Text style={styles.checkButtonText}>Check Answers</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  checkButton: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
