import { ActivityIndicator, View, StyleSheet } from 'react-native';
import PassageLayout from '../../components/PassageLayout';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import { useVerbalReasoningPassages } from '../../hooks/queries/useVerbalReasoningPassages';

export default function VRPassageScreen({ route }) {
  const { index } = route.params;
  const { passages, loading } = useVerbalReasoningPassages();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PassageLayout
      items={passages}
      initialIndex={index}
      itemLabel="Passage"
      getTitle={(item) => item.title}
      getId={(item) => item.id}
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
