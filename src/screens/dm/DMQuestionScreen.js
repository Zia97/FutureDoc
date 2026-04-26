import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import DMQuestionRenderer from '../../components/dm/DMQuestionRenderer';
import ScreenNavBar from '../../components/ScreenNavBar';
import CalculatorModal from '../../components/CalculatorModal';
import NotesModal from '../../components/NotesModal';
import BottomToolbar from '../../components/BottomToolbar';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useDecisionMakingQuestions } from '../../hooks/queries/useDecisionMakingQuestions';
import { useDecisionMakingAttempts } from '../../hooks/attempts/useDecisionMakingAttempts';
import { useTheme } from '../../context/ThemeContext';
import { usePremiumGate } from '../../hooks/ui/usePremiumGate';
import { getPremiumTheme } from '../../theme/premiumTheme';
import {
  PremiumQuestionScaffold,
  PremiumQuestionLoading,
  QuestionTopBar,
  QuestionPanel,
  PrimaryQuestionButton,
} from '../../components/premium/PremiumQuestionScreenUI';

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
      lines.push(`Option ${opt.label} - layout: ${diagramLayout}, shapes: ${shapesDesc}`);
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

export default function DMQuestionScreen({ route, navigation }) {
  const { index: initialIndex = 0, filteredIndices = null } = route?.params ?? {};
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [calcVisible, setCalcVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const { questions, loading } = useDecisionMakingQuestions();
  const { submitAttempt, localAnswers, localSubmitted, cacheLoading } = useDecisionMakingAttempts();
  const { canAccess } = usePremiumGate((item) => item.isFree);

  useEffect(() => {
    if (!cacheLoading) {
      setAnswers(localAnswers);
      setSubmitted(localSubmitted);
    }
  }, [cacheLoading]);

  const navList = filteredIndices && filteredIndices.length > 0
    ? filteredIndices
    : questions.map((_, i) => i);
  const navPosition = navList.indexOf(currentIndex);
  const safePosition = navPosition === -1 ? 0 : navPosition;

  const question = questions[currentIndex];
  const isFirst = safePosition <= 0;
  const isLast = safePosition >= navList.length - 1;

  function goPrev() {
    if (isFirst) return;
    const prevAbs = navList[safePosition - 1];
    const prev = questions[prevAbs];
    if (prev && !canAccess(prev)) return;
    setCurrentIndex(prevAbs);
  }
  function goNext() {
    if (isLast) return;
    const nextAbs = navList[safePosition + 1];
    const next = questions[nextAbs];
    if (next && !canAccess(next)) return;
    setCurrentIndex(nextAbs);
  }

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? null : goNext,
  );

  if (loading || cacheLoading || !question) {
    return <PremiumQuestionLoading label="Loading question..." />;
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

  const sectionColor = colors.teal;

  return (
    <PremiumQuestionScaffold panHandlers={panHandlers}>
      <QuestionTopBar
        title="Decision Making"
        subtitle="Practice"
        accent={sectionColor}
        onExit={() => navigation.goBack()}
      />

      <ScreenNavBar
        title={question.title}
        meta={`Question ${safePosition + 1} of ${navList.length}`}
        onPrev={goPrev}
        onNext={goNext}
        isFirst={isFirst}
        isLast={isLast}
        color={sectionColor}
        report={{ questionId: question.id, section: 'dm' }}
      />

      <CalculatorModal visible={calcVisible} onClose={() => setCalcVisible(false)} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QuestionPanel>
          <DMQuestionRenderer
            question={question}
            answer={currentAnswer}
            onAnswer={handleAnswer}
            submitted={isSubmitted}
            questionContext={isSubmitted ? {
              questionId: question.id,
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
              isTimed: false,
            } : undefined}
          />

          {!isSubmitted && currentAnswer !== undefined && currentAnswer !== null ? (
            <PrimaryQuestionButton
              accent={sectionColor}
              onPress={handleCheckAnswers}
              disabled={isYesNo && !allStatementsAnswered}
            >
              Check Answer
            </PrimaryQuestionButton>
          ) : null}
        </QuestionPanel>
      </ScrollView>

      <BottomToolbar
        onNotes={() => setNotesVisible(true)}
        onCalculator={() => setCalcVisible(true)}
        sectionColor={sectionColor}
      />

      <NotesModal
        visible={notesVisible}
        sectionKey="dm"
        onClose={() => setNotesVisible(false)}
      />
    </PremiumQuestionScaffold>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 28,
  },
});
