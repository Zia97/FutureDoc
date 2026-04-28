import { useNavigation } from '@react-navigation/native';

import PassageLayout from '../../components/PassageLayout';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import { PremiumQuestionLoading } from '../../components/premium/PremiumQuestionScreenUI';
import { useVerbalReasoningPassages } from '../../hooks/queries/useVerbalReasoningPassages';
import { useVerbalReasoningAttempts } from '../../hooks/attempts/useVerbalReasoningAttempts';
import { flattenVRPassages } from '../../lib/flattenQuestions';
import { VR_TUTOR_DEMO_PASSAGE } from '../../data/demo/vrTutorDemoQuestion';

const DEMO_FLAT_QUESTIONS = flattenVRPassages([VR_TUTOR_DEMO_PASSAGE]);

export default function VRPassageScreen({ route }) {
  const navigation = useNavigation();
  const isDemo = route.params?.mode === 'tutorDemo';

  if (isDemo) {
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
        renderOptions={({ question, getOptionState, onAnswer }) =>
          question.options.map((opt) => (
            <AnswerOptionButton
              key={opt}
              label={opt}
              state={getOptionState(opt)}
              onPress={() => onAnswer(opt)}
            />
          ))
        }
        demoMode
        onDemoExit={() => navigation.goBack()}
      />
    );
  }

  return <VRPassageScreenInner index={route.params.index} />;
}

function VRPassageScreenInner({ index }) {
  const { flatQuestions, loading } = useVerbalReasoningPassages();
  const { submitAttempt, localAnswers, cacheLoading } = useVerbalReasoningAttempts();

  if (loading || cacheLoading) {
    return <PremiumQuestionLoading label="Loading passage..." />;
  }

  function handleAnswerCommit(item, selectedAnswer) {
    submitAttempt({
      questionId: item.question.questionId,
      passageId: item.stemId,
      selectedAnswer,
      totalQuestions: item.stemQuestionCount,
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
      renderOptions={({ question, getOptionState, onAnswer }) =>
        question.options.map((opt) => (
          <AnswerOptionButton
            key={opt}
            label={opt}
            state={getOptionState(opt)}
            onPress={() => onAnswer(opt)}
          />
        ))
      }
    />
  );
}
