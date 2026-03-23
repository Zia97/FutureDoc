import { ActivityIndicator, View, StyleSheet } from 'react-native';
import PassageLayout from '../../components/PassageLayout';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import { LABEL_SETS } from '../../constants/sjLabelSets';
import { useSituationalJudgementScenarios } from '../../hooks/queries/useSituationalJudgementScenarios';
import { useSituationalJudgementAttempts } from '../../hooks/attempts/useSituationalJudgementAttempts';

export default function SJScenarioScreen({ route }) {
  const { index } = route.params;
  const { flatQuestions, loading } = useSituationalJudgementScenarios();
  const { submitAttempt, localAnswers, cacheLoading } = useSituationalJudgementAttempts();

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
      scenarioId: item.stemId,
      selectedAnswer,
      totalQuestions: item.stemQuestionCount,
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
      getQuestionOptions={(item) => LABEL_SETS[item.labelSet] ?? LABEL_SETS[1]}
      renderOptions={({ item, getOptionState, onAnswer }) =>
        (LABEL_SETS[item.labelSet] ?? LABEL_SETS[1]).map((opt) => (
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
