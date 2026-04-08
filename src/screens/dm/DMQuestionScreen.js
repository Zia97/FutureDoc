import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, StatusBar, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DMQuestionRenderer from '../../components/dm/DMQuestionRenderer';
import ScreenNavBar from '../../components/ScreenNavBar';
import CalculatorModal from '../../components/CalculatorModal';
import NotesModal from '../../components/NotesModal';
import BottomToolbar from '../../components/BottomToolbar';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useDecisionMakingQuestions } from '../../hooks/queries/useDecisionMakingQuestions';
import { useDecisionMakingAttempts } from '../../hooks/attempts/useDecisionMakingAttempts';
import { useTheme } from '../../context/ThemeContext';

const YES_NO_TYPES = ['syllogism', 'passage_syllogism', 'interpreting_info'];

// ── Venn AI context builder ───────────────────────────────────────────────────

function regionKeyToHuman(key, setLabels) {
  if (key === 'outside') return 'outside all shapes';
  if (key === 'all_three') return 'inside all three shapes';
  const parts = key.split('_');
  if (parts[parts.length - 1] === 'only') {
    const id = parts.slice(0, -1).join('_');
    return `inside ${setLabels[id] || id} only`;
  }
  const labels = parts.map((id) => setLabels[id] || id);
  return labels.length === 2
    ? `inside both ${labels[0]} and ${labels[1]}`
    : `inside ${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

function buildVennAIContext(question) {
  const stimDiagram = question.stimulusDiagram ?? question.stimulus_diagram;
  const hasOptionDiagrams = question.options?.some((o) => o.vennConfig ?? o.option_data);

  if (hasOptionDiagrams) {
    // select_diagram: student picks the correct diagram from options
    const lines = [
      '[Select-diagram question: the student must choose which option diagram correctly represents the data in the question stem]\n',
    ];
    question.options?.forEach((opt) => {
      const cfg = opt.vennConfig ?? opt.option_data;
      if (!cfg) return;
      const { diagramLayout, sets = [], regions = {} } = cfg;
      const setLabels = {};
      sets.forEach((s) => { setLabels[s.id] = s.label || s.id; });
      const shapesDesc = sets.map((s) => `${s.label || s.id} (${s.shape || 'circle'})`).join(', ');
      lines.push(`Option ${opt.label} — layout: ${diagramLayout}, shapes: ${shapesDesc}`);
      Object.entries(regions).forEach(([key, value]) => {
        lines.push(`  • ${regionKeyToHuman(key, setLabels)}: ${value}`);
      });
      lines.push('');
    });
    return lines.join('\n');
  }

  if (stimDiagram) {
    // interpret_diagram: student reads a labelled diagram and picks an answer
    const { diagramLayout, sets = [], regions = {} } = stimDiagram;
    const setLabels = {};
    sets.forEach((s) => { setLabels[s.id] = s.label || s.id; });
    const lines = [
      '[Interpret-diagram question: the student is shown a diagram with labelled regions and must identify which region matches the description]\n',
      `Diagram layout: ${diagramLayout}`,
      `Shapes: ${sets.map((s) => `${s.label || s.id} (${s.shape || 'circle'})`).join(', ')}\n`,
      'Region labels placed on the diagram:',
    ];
    Object.entries(regions).forEach(([key, value]) => {
      lines.push(`  • Label "${value}" = ${regionKeyToHuman(key, setLabels)}`);
    });
    return lines.join('\n');
  }

  return '';
}

export default function DMQuestionScreen({ route }) {
  const { index: initialIndex = 0 } = route?.params ?? {};
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [calcVisible, setCalcVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const [notes, setNotes] = useState('');
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
    setAnswers((prev) => ({ ...prev, [question.id]: val }));
  }

  function handleCheckAnswers() {
    if (!currentAnswer) return;
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
        report={{ questionId: question.id, section: 'dm' }}
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
              ? question.statements?.map((s, i) => `${i + 1}. ${s.text}`)
              : question.subtype === 'select_diagram'
              ? undefined
              : question.options?.map((o) => `${o.label}. ${o.text}`),
            correctAnswer: isYesNo
              ? undefined
              : typeof question.answer === 'object'
              ? JSON.stringify(question.answer)
              : question.answer,
            userAnswer: isYesNo
              ? undefined
              : typeof currentAnswer === 'object'
              ? JSON.stringify(currentAnswer)
              : (currentAnswer ?? ''),
            explanation: isYesNo ? undefined : question.answeringReason,
            stimulusData: question.tableData ?? undefined,
            vennDiagrams: question.type === 'venn_diagram'
              ? buildVennAIContext(question)
              : undefined,
          } : undefined}
        />

        {!isSubmitted && currentAnswer !== undefined && currentAnswer !== null && (
          <TouchableOpacity
            style={[
              styles.checkButton,
              { backgroundColor: t.sectionDM },
              (isYesNo && !allStatementsAnswered) && { backgroundColor: t.borderStrong, opacity: 0.5 },
            ]}
            onPress={handleCheckAnswers}
            disabled={isYesNo && !allStatementsAnswered}
          >
            <Text style={styles.checkButtonText}>Check Answer</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomToolbar
        onNotes={() => setNotesVisible(true)}
        onCalculator={() => setCalcVisible(true)}
        sectionColor={t.sectionDM}
      />

      <NotesModal
        visible={notesVisible}
        notes={notes}
        onChangeNotes={setNotes}
        onClear={() => setNotes('')}
        onClose={() => setNotesVisible(false)}
      />
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
