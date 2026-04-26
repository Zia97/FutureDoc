import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import OfflineRetry from '../../components/OfflineRetry';
import PremiumQuestionListScreen from '../../components/premium/PremiumQuestionListScreen';
import { useVerbalReasoningPassages } from '../../hooks/queries/useVerbalReasoningPassages';
import { useVerbalReasoningProgress } from '../../hooks/queries/useVerbalReasoningProgress';
import { useVerbalReasoningAttempts } from '../../hooks/attempts/useVerbalReasoningAttempts';
import { getTargetFlatIndex } from '../../lib/flattenQuestions';

const CACHE_KEYS = ['vr_attempts', 'vr_passage_progress'];

export default function VRQuestionListScreen({ navigation }) {
  const { passages, flatQuestions, loading, error, syncing, syncProgress, refetch } = useVerbalReasoningPassages();
  const { progressMap, reload } = useVerbalReasoningProgress();
  const { localAnswers } = useVerbalReasoningAttempts();
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
      'This will permanently delete all your Verbal Reasoning progress and answers. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteProgress },
      ],
    );
  };

  if (error?.isOffline) {
    return <OfflineRetry onRetry={refetch} message="Connect to the internet to load passages." />;
  }

  return (
    <PremiumQuestionListScreen
      title="Verbal Reasoning"
      items={passages}
      singularLabel="passage"
      pluralLabel="passages"
      searchPlaceholder="Search passages..."
      getTitle={(item) => item.title}
      getSearchText={(item) => item.resource}
      getStatus={(item) => progressMap[item.id] ?? null}
      getIndex={(item) => getTargetFlatIndex(item.id, flatQuestions, localAnswers)}
      getIsFree={(item) => item.isFree}
      getItemKey={(item) => item.id}
      routeName="VRPassage"
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
