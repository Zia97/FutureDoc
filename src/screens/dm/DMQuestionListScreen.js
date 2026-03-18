import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import SectionQuestionList from '../../components/SectionQuestionList';
import { useDecisionMakingQuestions } from '../../hooks/queries/useDecisionMakingQuestions';

export default function DMQuestionListScreen({ navigation }) {
  const { questions, loading, error } = useDecisionMakingQuestions();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{JSON.stringify(error)}</Text>
      </View>
    );
  }

  return (
    <SectionQuestionList
      items={questions}
      getTitle={(item) => item.title}
      routeName="DMQuestion"
      navigation={navigation}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#888' },
  error: { color: 'red', textAlign: 'center' },
});
