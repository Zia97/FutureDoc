import { ActivityIndicator, View, StyleSheet } from 'react-native';
import PassageLayout from '../../components/PassageLayout';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import { useVerbalReasoningPassages } from '../../hooks/queries/useVerbalReasoningPassages';
import { useVerbalReasoningAttempts } from '../../hooks/attempts/useVerbalReasoningAttempts';

export default function VRPassageScreen({ route }) {
  const { index } = route.params;
  const { passages, loading } = useVerbalReasoningPassages();
  const { submitAttempt, localAnswers, cacheLoading } = useVerbalReasoningAttempts();

  if (loading || cacheLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  function handleAnswerCommit(passageId, questionId, selectedAnswer) {
    const passage = passages.find((p) => p.id === passageId);
    if (!passage) return;
    submitAttempt({
      questionId,
      passageId,
      selectedAnswer,
      totalQuestions: passage.questions.length,
    });
  }

  return (
    <PassageLayout
      items={passages}
      initialIndex={index}
      itemLabel="Passage"
      getTitle={(item) => item.title}
      getId={(item) => item.id}
      initialAnswers={localAnswers}
      onAnswerCommit={handleAnswerCommit}
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
