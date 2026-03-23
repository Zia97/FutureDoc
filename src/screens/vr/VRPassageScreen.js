import { ActivityIndicator, View, StyleSheet } from 'react-native';
import PassageLayout from '../../components/PassageLayout';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import { useVerbalReasoningPassages } from '../../hooks/queries/useVerbalReasoningPassages';
import { useVerbalReasoningAttempts } from '../../hooks/attempts/useVerbalReasoningAttempts';

export default function VRPassageScreen({ route }) {
  const { index } = route.params;
  const { flatQuestions, loading } = useVerbalReasoningPassages();
  const { submitAttempt, localAnswers, cacheLoading } = useVerbalReasoningAttempts();

  if (loading || cacheLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
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

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
