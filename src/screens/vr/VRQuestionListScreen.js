import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import OfflineRetry from '../../components/OfflineRetry';
import PremiumQuestionListScreen from '../../components/premium/PremiumQuestionListScreen';
import { useVerbalReasoningPassages } from '../../hooks/queries/useVerbalReasoningPassages';
import { useVerbalReasoningProgress } from '../../hooks/queries/useVerbalReasoningProgress';
import { getFirstFlatIndex } from '../../lib/flattenQuestions';

const CACHE_KEYS = ['vr_attempts', 'vr_passage_progress'];

export default function VRQuestionListScreen({ navigation }) {
  const { passages, flatQuestions, loading, error, syncing, syncProgress, refetch } = useVerbalReasoningPassages();
  const { progressMap, reload } = useVerbalReasoningProgress();
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

  const resetItemProgress = async (item) => {
    try {
      const passageId = item.id;
      const attemptsRaw = await AsyncStorage.getItem('vr_attempts');
      if (attemptsRaw) {
        const attempts = JSON.parse(attemptsRaw);
        let changed = false;
        for (const [questionId, value] of Object.entries(attempts)) {
          if (value?.passageId === passageId) {
            delete attempts[questionId];
            changed = true;
          }
        }
        if (changed) {
          if (Object.keys(attempts).length === 0) {
            await AsyncStorage.removeItem('vr_attempts');
          } else {
            await AsyncStorage.setItem('vr_attempts', JSON.stringify(attempts));
          }
        }
      }

      const progressRaw = await AsyncStorage.getItem('vr_passage_progress');
      if (progressRaw) {
        const progress = JSON.parse(progressRaw);
        if (progress[passageId] !== undefined) {
          delete progress[passageId];
          if (Object.keys(progress).length === 0) {
            await AsyncStorage.removeItem('vr_passage_progress');
          } else {
            await AsyncStorage.setItem('vr_passage_progress', JSON.stringify(progress));
          }
        }
      }

      reload();
    } catch {
      Alert.alert('Error', 'Could not reset progress. Please try again.');
    }
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
      getIndex={(item) => getFirstFlatIndex(item.id, flatQuestions)}
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
      onResetItem={resetItemProgress}
      resetItemLabel="this passage"
    />
  );
}
