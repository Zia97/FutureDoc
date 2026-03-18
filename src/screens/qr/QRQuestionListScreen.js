import { ActivityIndicator, View, StyleSheet } from 'react-native';
import SectionQuestionList from '../../components/SectionQuestionList';
import { useQuantitativeReasoningSets } from '../../hooks/useQuantitativeReasoningSets';

export default function QRQuestionListScreen({ navigation }) {
  const { sets, loading } = useQuantitativeReasoningSets();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SectionQuestionList
      items={sets}
      getTitle={(item) => item.title}
      routeName="QRQuestion"
      navigation={navigation}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
