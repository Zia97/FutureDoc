import { ActivityIndicator, View, StyleSheet } from 'react-native';
import PassageLayout from '../../components/PassageLayout';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import { LABEL_SETS } from '../../constants/sjLabelSets';
import { useSituationalJudgementScenarios } from '../../hooks/queries/useSituationalJudgementScenarios';
import { useSituationalJudgementAttempts } from '../../hooks/attempts/useSituationalJudgementAttempts';

export default function SJScenarioScreen({ route }) {
  const { index } = route.params;
  const { scenarios, loading } = useSituationalJudgementScenarios();
  const { submitAttempt, localAnswers, cacheLoading } = useSituationalJudgementAttempts();

  if (loading || cacheLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  function handleAnswerCommit(scenarioId, questionId, selectedAnswer) {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    submitAttempt({
      questionId,
      scenarioId,
      selectedAnswer,
      totalQuestions: scenario.questions.length,
    });
  }

  return (
    <PassageLayout
      items={scenarios}
      initialIndex={index}
      itemLabel="Scenario"
      getTitle={(_, i) => `Scenario ${i + 1}`}
      getId={(item) => item.id}
      alwaysShowReason
      initialAnswers={localAnswers}
      onAnswerCommit={handleAnswerCommit}
      section="sj"
      renderOptions={({ item, getOptionState, onAnswer }) =>
        LABEL_SETS[item.labelSet].map((opt) => (
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
