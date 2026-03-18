import { ActivityIndicator, View, StyleSheet } from 'react-native';
import PassageLayout from '../../components/PassageLayout';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import { LABEL_SETS } from '../../constants/sjLabelSets';
import { useSituationalJudgementScenarios } from '../../hooks/useSituationalJudgementScenarios';

export default function SJScenarioScreen({ route }) {
  const { index } = route.params;
  const { scenarios, loading } = useSituationalJudgementScenarios();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PassageLayout
      items={scenarios}
      initialIndex={index}
      itemLabel="Scenario"
      getTitle={(_, i) => `Scenario ${i + 1}`}
      getId={(item) => item.id}
      alwaysShowReason
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
