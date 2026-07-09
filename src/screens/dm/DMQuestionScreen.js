import { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import DMQuestionRenderer from '../../components/dm/DMQuestionRenderer';
import ScreenNavBar from '../../components/ScreenNavBar';
import CalculatorModal from '../../components/CalculatorModal';
import NotesModal from '../../components/NotesModal';
import BottomToolbar from '../../components/BottomToolbar';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { useActiveTimer } from '../../hooks/ui/useActiveTimer';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDecisionMakingQuestions } from '../../hooks/queries/useDecisionMakingQuestions';
import { useDecisionMakingAttempts } from '../../hooks/attempts/useDecisionMakingAttempts';
import { useQuestionStats } from '../../hooks/queries/useQuestionStats';
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
import { DM_TUTOR_DEMO_QUESTION } from '../../data/demo/dmTutorDemoQuestion';
import { DM_WORKED_EXAMPLES } from '../../data/learn/dmWorkedExamples';
import { DM_LEARN_STORAGE_KEY } from '../../data/learn/learningStorageKeys';

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
    // interpret_diagram: student reads a given diagram and picks an answer
    const { diagramLayout, sets = [], regions = {} } = stimDiagram;
    const setLabels = {};
    sets.forEach((s) => { setLabels[s.id] = s.label || s.id; });
    const isStatementEvaluation = Object.values(regions).every((value) => value === '');
    if (isStatementEvaluation) {
      const lines = [
        '[Statement-evaluation diagram question: the student is shown an unlabelled diagram and must judge which option statement is true or false]\n',
        `Diagram layout: ${diagramLayout}`,
        `Shapes: ${sets.map((s) => `${s.label || s.id} (${s.shape || 'circle'})`).join(', ')}\n`,
        'Visible regions in the diagram:',
      ];
      Object.keys(regions).forEach((key) => {
        lines.push(`  • ${regionKeyToHuman(key, setLabels)}`);
      });
      return lines.join('\n');
    }

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

function buildQuestionContext(question, currentAnswer, isYesNo) {
  return {
    questionId: question.id ?? question.questionId,
    question: question.stem,
    questionType: question.type,
    section: 'dm',
    options: isYesNo
      ? question.statements?.map((s, i) => `${i + 1}. ${s.text}`)
      : question.subtype === 'select_diagram'
      ? undefined
      : question.options?.map((o) => `${o.label}. ${o.text ?? o.option_text ?? ''}`),
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
  };
}

export default function DMQuestionScreen({ route, navigation }) {
  const mode = route?.params?.mode;

  if (mode === 'tutorDemo') {
    return <DMSingleQuestionBranch question={DM_TUTOR_DEMO_QUESTION} headerTitle="AI Tutor Demo" headerSubtitle="Sample question" />;
  }

  if (mode === 'workedExample') {
    return <DMWorkedExampleBranch exampleId={route?.params?.exampleId} />;
  }

  return <DMQuestionScreenInner route={route} navigation={navigation} />;
}

// ── Worked example branch ─────────────────────────────────────────────────────
//
// Loads a single hardcoded DM question keyed by the lesson id. On answer
// commit, writes the lesson id to the DM learn storage so the lesson screen
// picks it up via useFocusEffect and unlocks the "Continue" button.

function DMWorkedExampleBranch({ exampleId }) {
  const example = exampleId ? DM_WORKED_EXAMPLES[exampleId] : null;

  const onAnswerCommit = useCallback(() => {
    if (!exampleId) return;
    AsyncStorage.getItem(DM_LEARN_STORAGE_KEY)
      .then((raw) => {
        let ids = [];
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) ids = parsed;
          } catch (_) {
            ids = [];
          }
        }
        if (ids.includes(exampleId)) return;
        const next = [...ids, exampleId];
        AsyncStorage.setItem(DM_LEARN_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      })
      .catch(() => {});
  }, [exampleId]);

  if (!example) {
    return <PremiumQuestionLoading label="Loading worked example..." />;
  }

  return (
    <DMSingleQuestionBranch
      question={example}
      headerTitle="Worked Example"
      headerSubtitle={example.title}
      onAnswerCommit={onAnswerCommit}
    />
  );
}

// ── Single-question branch ────────────────────────────────────────────────────
//
// Renders one hardcoded DM question without going through Supabase or the
// attempts cache. Used for both the AI tutor demo and the worked-example
// flow. The user can still open the calculator and notes from the toolbar.

function DMSingleQuestionBranch({ question, headerTitle, headerSubtitle, onAnswerCommit }) {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const sectionColor = colors.teal;

  const [answer, setAnswer] = useState(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [calcVisible, setCalcVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);

  const isYesNo = YES_NO_TYPES.includes(question.type);

  const allStatementsAnswered =
    isYesNo &&
    question.statements &&
    answer &&
    question.statements.every((_, i) => answer[i] !== undefined);

  function handleAnswer(val) {
    if (submitted) return;
    setAnswer(val);
  }

  function handleCheckAnswers() {
    if (answer === undefined || answer === null) return;
    setSubmitted(true);
    onAnswerCommit?.();
  }

  return (
    <PremiumQuestionScaffold panHandlers={null}>
      <QuestionTopBar
        title={headerTitle}
        subtitle={headerSubtitle}
        accent={sectionColor}
        onExit={() => navigation.goBack()}
      />

      <ScreenNavBar
        title={question.title}
        meta=""
        onPrev={null}
        onNext={null}
        isFirst
        isLast
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
            answer={answer}
            onAnswer={handleAnswer}
            submitted={submitted}
            questionContext={submitted ? buildQuestionContext(question, answer, isYesNo) : undefined}
          />

          {!submitted && answer !== undefined && answer !== null ? (
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

// ── Regular practice flow ─────────────────────────────────────────────────────

function DMQuestionScreenInner({ route, navigation }) {
  const { index: initialIndex = 0, filteredIndices = null } = route?.params ?? {};
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [calcVisible, setCalcVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const { questions, loading } = useDecisionMakingQuestions();
  const { submitAttempt, localAnswers, localSubmitted, localTimesMs, cacheLoading } = useDecisionMakingAttempts();
  const { canAccess } = usePremiumGate((item) => item.isFree);
  const { getStats } = useQuestionStats('dm');
  const [userTimesMs, setUserTimesMs] = useState({});
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks('dm');

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

  const timer = useActiveTimer({ resetKey: question?.id });

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

    const timeSpentMs = Math.max(0, timer.getElapsedMs());
    setUserTimesMs((prev) => ({ ...prev, [question.id]: timeSpentMs }));

    let statementCorrectness = null;
    if (isYesNo && Array.isArray(question.statements) && currentAnswer && typeof currentAnswer === 'object') {
      statementCorrectness = {};
      question.statements.forEach((st, i) => {
        if (st?.answer != null && currentAnswer[i] != null) {
          statementCorrectness[i] = currentAnswer[i] === st.answer;
        }
      });
    } else if (!isYesNo && question.answer != null) {
      statementCorrectness =
        typeof question.answer === 'object'
          ? JSON.stringify(currentAnswer) === JSON.stringify(question.answer)
          : currentAnswer === question.answer;
    }

    submitAttempt({
      questionId: question.id,
      answer: currentAnswer,
      timeSpentMs,
      statementCorrectness,
    });
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

      <CalculatorModal visible={calcVisible} onClose={() => { setCalcVisible(false); timer.resume(); }} />

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
            questionContext={isSubmitted ? buildQuestionContext(question, currentAnswer, isYesNo) : undefined}
            questionStats={getStats(question.id, null)}
            questionUserTimeMs={userTimesMs[question.id] ?? localTimesMs[question.id] ?? null}
            getStatementStats={(idx) => getStats(question.id, idx)}
            statementUserTimesMs={
              isYesNo && Array.isArray(question.statements)
                ? question.statements.reduce((acc, _, i) => {
                    acc[i] = userTimesMs[question.id] ?? localTimesMs[question.id] ?? null;
                    return acc;
                  }, {})
                : null
            }
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
        onNotes={() => { timer.pause(); setNotesVisible(true); }}
        onCalculator={() => { timer.pause(); setCalcVisible(true); }}
        onBookmark={() => toggleBookmark(question.id)}
        isBookmarked={isBookmarked(question.id)}
        onPrev={goPrev}
        onNext={goNext}
        isFirst={isFirst}
        isLast={isLast}
        sectionColor={sectionColor}
      />

      <NotesModal
        visible={notesVisible}
        sectionKey="dm"
        onClose={() => { setNotesVisible(false); timer.resume(); }}
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
