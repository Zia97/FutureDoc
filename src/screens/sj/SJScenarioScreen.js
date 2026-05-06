import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import PassageLayout from '../../components/PassageLayout';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import { PremiumQuestionLoading } from '../../components/premium/PremiumQuestionScreenUI';
import { LABEL_SETS } from '../../constants/sjLabelSets';
import { useSituationalJudgementScenarios } from '../../hooks/queries/useSituationalJudgementScenarios';
import { useSituationalJudgementAttempts } from '../../hooks/attempts/useSituationalJudgementAttempts';
import { flattenSJScenarios } from '../../lib/flattenQuestions';
import { SJ_TUTOR_DEMO_SCENARIO } from '../../data/demo/sjTutorDemoQuestion';
import { SJ_WORKED_EXAMPLES } from '../../data/learn/sjWorkedExamples';
import { SJ_LEARN_STORAGE_KEY } from '../../data/learn/learningStorageKeys';

const DEMO_FLAT_QUESTIONS = flattenSJScenarios([SJ_TUTOR_DEMO_SCENARIO]);

function renderSJOptions({ item, getOptionState, onAnswer }) {
  const labels = LABEL_SETS[item.labelSet] ?? LABEL_SETS[1];
  return labels.map((opt) => (
    <AnswerOptionButton
      key={opt}
      label={opt}
      state={getOptionState(opt)}
      onPress={() => onAnswer(opt)}
    />
  ));
}

export default function SJScenarioScreen({ route }) {
  const navigation = useNavigation();
  const mode = route?.params?.mode;

  if (mode === 'tutorDemo') {
    return (
      <PassageLayout
        flatQuestions={DEMO_FLAT_QUESTIONS}
        initialIndex={0}
        itemLabel="Scenario"
        getTitle={(item) => `Scenario ${item.stemIndex + 1}`}
        alwaysShowReason
        initialAnswers={{}}
        section="sj"
        getItemIsFree={() => true}
        getQuestionOptions={(item) => LABEL_SETS[item.labelSet] ?? LABEL_SETS[1]}
        renderOptions={renderSJOptions}
        demoMode
        demoTitle="AI Tutor Demo"
        demoSubtitle="Sample scenario"
        demoExitHint="This sample doesn't use any of your AI credits."
        onDemoExit={() => navigation.goBack()}
      />
    );
  }

  if (mode === 'workedExample') {
    return <WorkedExampleBranch exampleId={route.params?.exampleId} />;
  }

  return <SJScenarioScreenInner index={route.params.index} />;
}

function WorkedExampleBranch({ exampleId }) {
  const navigation = useNavigation();
  const example = exampleId ? SJ_WORKED_EXAMPLES[exampleId] : null;
  const flatQuestions = useMemo(
    () => (example ? flattenSJScenarios([example]) : []),
    [example],
  );

  if (!example) {
    return <PremiumQuestionLoading label="Loading worked example..." />;
  }

  function markLessonComplete() {
    AsyncStorage.getItem(SJ_LEARN_STORAGE_KEY)
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
        AsyncStorage.setItem(SJ_LEARN_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      })
      .catch(() => {});
  }

  return (
    <PassageLayout
      flatQuestions={flatQuestions}
      initialIndex={0}
      itemLabel="Scenario"
      getTitle={() => example.title ?? 'Worked example'}
      alwaysShowReason
      initialAnswers={{}}
      section="sj"
      getItemIsFree={() => true}
      getQuestionOptions={(item) => LABEL_SETS[item.labelSet] ?? LABEL_SETS[1]}
      renderOptions={renderSJOptions}
      onAnswerCommit={markLessonComplete}
      demoMode
      demoTitle="Worked Example"
      demoSubtitle={example.topic ?? example.title}
      onDemoExit={() => navigation.goBack()}
    />
  );
}

function SJScenarioScreenInner({ index }) {
  const { flatQuestions, loading } = useSituationalJudgementScenarios();
  const { submitAttempt, localAnswers, cacheLoading } = useSituationalJudgementAttempts();

  if (loading || cacheLoading) {
    return <PremiumQuestionLoading label="Loading scenario..." />;
  }

  function handleAnswerCommit(item, selectedAnswer, meta = {}) {
    const correctAnswer = item.question.answer;
    const isCorrect = correctAnswer != null ? selectedAnswer === correctAnswer : null;
    submitAttempt({
      questionId: item.question.questionId ?? item.question.id ?? item.question.itemId,
      scenarioId: item.stemId,
      selectedAnswer,
      totalQuestions: item.stemQuestionCount,
      timeSpentMs: meta.timeSpentMs ?? null,
      isCorrect,
    });
  }

  return (
    <PassageLayout
      flatQuestions={flatQuestions}
      initialIndex={index}
      itemLabel="Scenario"
      getTitle={(item) => `Scenario ${item.stemIndex + 1}`}
      alwaysShowReason
      initialAnswers={localAnswers}
      onAnswerCommit={handleAnswerCommit}
      section="sj"
      getItemIsFree={(item) => item.isFree}
      getQuestionOptions={(item) => LABEL_SETS[item.labelSet] ?? LABEL_SETS[1]}
      renderOptions={renderSJOptions}
    />
  );
}
