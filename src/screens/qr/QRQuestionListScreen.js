import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import OfflineRetry from '../../components/OfflineRetry';
import PremiumQuestionListScreen from '../../components/premium/PremiumQuestionListScreen';
import { useQuantitativeReasoningSets } from '../../hooks/queries/useQuantitativeReasoningSets';
import { useQuantitativeReasoningProgress } from '../../hooks/queries/useQuantitativeReasoningProgress';
import { useQuantitativeReasoningAttempts } from '../../hooks/attempts/useQuantitativeReasoningAttempts';
import { getTargetFlatIndex } from '../../lib/flattenQuestions';

const CACHE_KEYS = ['qr_attempts', 'qr_set_progress'];

export default function QRQuestionListScreen({ navigation }) {
  const { sets, flatQuestions, loading, error, syncing, syncProgress, refetch } = useQuantitativeReasoningSets();
  const { progressMap, reload } = useQuantitativeReasoningProgress();
  const { localAnswers } = useQuantitativeReasoningAttempts();
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const deleteProgress = async () => {
    setDeleting(true);
    try {
      await Promise.all(CACHE_KEYS.map((key) => AsyncStorage.removeItem(key)));
      reload();
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteProgress = () => {
    Alert.alert(
      'Delete Progress',
      'This will permanently delete all your Quantitative Reasoning progress and answers. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteProgress },
      ],
    );
  };

  if (error?.isOffline) {
    return <OfflineRetry onRetry={refetch} message="Connect to the internet to load questions." />;
  }

  return (
    <PremiumQuestionListScreen
      title="Quantitative Reasoning"
      items={sets}
      singularLabel="set"
      pluralLabel="sets"
      searchPlaceholder="Search sets..."
      getTitle={(item, index) => item.title ?? `Set ${index + 1}`}
      getSearchText={(item) => item.stimulus?.title}
      getStatus={(item) => progressMap[item.setId] ?? null}
      getIndex={(item) => getTargetFlatIndex(item.setId, flatQuestions, localAnswers)}
      getIsFree={(item) => item.isFree}
      getItemKey={(item) => item.id ?? item.setId}
      routeName="QRQuestion"
      navigation={navigation}
      loading={loading}
      error={error}
      syncing={syncing}
      syncProgress={syncProgress}
      deleting={deleting}
      onReset={handleDeleteProgress}
    />
  );
}
