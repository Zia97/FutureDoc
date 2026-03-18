import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import SectionQuestionList from '../../components/SectionQuestionList';
import { useSituationalJudgementScenarios } from '../../hooks/useSituationalJudgementScenarios';

export default function SJScenarioListScreen({ navigation }) {
  const { scenarios, loading, error } = useSituationalJudgementScenarios();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading scenarios...</Text>
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
      items={scenarios}
      getTitle={(_, index) => `Scenario ${index + 1}`}
      routeName="SJScenario"
      navigation={navigation}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#888' },
  error: { color: 'red', textAlign: 'center' },
});
