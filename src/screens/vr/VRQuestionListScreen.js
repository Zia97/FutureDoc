import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import SectionQuestionList from '../../components/SectionQuestionList';
import { useVerbalReasoningPassages } from '../../hooks/useVerbalReasoningPassages';

export default function VRQuestionListScreen({ navigation }) {
  const { passages, loading, error } = useVerbalReasoningPassages();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
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
      items={passages}
      getTitle={(item) => item.title}
      routeName="VRPassage"
      navigation={navigation}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: 'red', textAlign: 'center' },
});
