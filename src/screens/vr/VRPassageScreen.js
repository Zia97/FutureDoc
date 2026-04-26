import PassageLayout from '../../components/PassageLayout';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import { PremiumQuestionLoading } from '../../components/premium/PremiumQuestionScreenUI';
import { useVerbalReasoningPassages } from '../../hooks/queries/useVerbalReasoningPassages';
import { useVerbalReasoningAttempts } from '../../hooks/attempts/useVerbalReasoningAttempts';

export default function VRPassageScreen({ route }) {
  const { index } = route.params;
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

