import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import PassageLayout from '../../components/PassageLayout';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import { PremiumQuestionLoading } from '../../components/premium/PremiumQuestionScreenUI';
import { useVerbalReasoningPassages } from '../../hooks/queries/useVerbalReasoningPassages';
import { useVerbalReasoningAttempts } from '../../hooks/attempts/useVerbalReasoningAttempts';
import { flattenVRPassages } from '../../lib/flattenQuestions';
import { VR_TUTOR_DEMO_PASSAGE } from '../../data/demo/vrTutorDemoQuestion';
import { VR_WORKED_EXAMPLES } from '../../data/learn/vrWorkedExamples';
import { VR_LEARN_STORAGE_KEY } from '../../data/learn/learningStorageKeys';

const DEMO_FLAT_QUESTIONS = flattenVRPassages([VR_TUTOR_DEMO_PASSAGE]);

function renderVRAnswerOptions({ question, getOptionState, onAnswer }) {
  return question.options.map((opt) => (
    <AnswerOptionButton
      key={opt}
      label={opt}
      state={getOptionState(opt)}
      onPress={() => onAnswer(opt)}
    />
  ));
}

export default function VRPassageScreen({ route }) {
  const navigation = useNavigation();
  const mode = route.params?.mode;

  if (mode === 'tutorDemo') {
    return (
      <PassageLayout
        flatQuestions={DEMO_FLAT_QUESTIONS}
        initialIndex={0}
        itemLabel="Passage"
        getTitle={(item) => item.stemTitle}
        initialAnswers={{}}
        section="vr"
        getItemIsFree={() => true}
        getQuestionOptions={(item, question) => question.options}
        renderOptions={renderVRAnswerOptions}
        demoMode
        demoTitle="AI Tutor Demo"
        demoSubtitle="Sample question"
        demoExitHint="This sample doesn't use any of your AI credits."
        onDemoExit={() => navigation.goBack()}
      />
    );
  }

  if (mode === 'workedExample') {
    return <WorkedExampleBranch exampleId={route.params?.exampleId} />;
  }

  return <VRPassageScreenInner index={route.params.index} />;
}

function WorkedExampleBranch({ exampleId }) {
  const navigation = useNavigation();
  const example = exampleId ? VR_WORKED_EXAMPLES[exampleId] : null;
  const flatQuestions = useMemo(
    () => (example ? flattenVRPassages([example]) : []),
    [example],
  );

  if (!example) {
    return <PremiumQuestionLoading label="Loading worked example..." />;
  }

  function markLessonComplete() {
    AsyncStorage.getItem(VR_LEARN_STORAGE_KEY)
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
        AsyncStorage.setItem(VR_LEARN_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      })
      .catch(() => {});
  }

  return (
    <PassageLayout
      flatQuestions={flatQuestions}
      initialIndex={0}
      itemLabel="Passage"
      getTitle={(item) => item.stemTitle}
      initialAnswers={{}}
      section="vr"
      getItemIsFree={() => true}
      getQuestionOptions={(item, question) => question.options}
      renderOptions={renderVRAnswerOptions}
      onAnswerCommit={markLessonComplete}
      demoMode
      demoTitle="Worked Example"
      demoSubtitle={example.topic}
      onDemoExit={() => navigation.goBack()}
    />
  );
}

function VRPassageScreenInner({ index }) {
  const { flatQuestions, loading } = useVerbalReasoningPassages();
  const { submitAttempt, localAnswers, cacheLoading } = useVerbalReasoningAttempts();

  if (loading || cacheLoading) {
    return <PremiumQuestionLoading label="Loading passage..." />;
  }

  function handleAnswerCommit(item, selectedAnswer, meta = {}) {
    const correctAnswer = item.question.answer;
    const isCorrect = correctAnswer != null ? selectedAnswer === correctAnswer : null;
    submitAttempt({
      questionId: item.question.questionId ?? item.question.id ?? item.question.itemId,
      passageId: item.stemId,
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
      itemLabel="Passage"
      getTitle={(item) => item.stemTitle}
      initialAnswers={localAnswers}
      onAnswerCommit={handleAnswerCommit}
      section="vr"
      getItemIsFree={(item) => item.isFree}
      getQuestionOptions={(item, question) => question.options}
      renderOptions={renderVRAnswerOptions}
    />
  );
}
