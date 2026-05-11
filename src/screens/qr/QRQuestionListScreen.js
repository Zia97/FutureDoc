import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import OfflineRetry from '../../components/OfflineRetry';
import PremiumQuestionListScreen from '../../components/premium/PremiumQuestionListScreen';
import { useQuantitativeReasoningSets } from '../../hooks/queries/useQuantitativeReasoningSets';
import { useQuantitativeReasoningProgress } from '../../hooks/queries/useQuantitativeReasoningProgress';
import { getFirstFlatIndex } from '../../lib/flattenQuestions';

const CACHE_KEYS = ['qr_attempts', 'qr_set_progress'];

export default function QRQuestionListScreen({ navigation }) {
  const { sets, flatQuestions, loading, error, syncing, syncProgress, refetch } = useQuantitativeReasoningSets();
  const { progressMap, reload } = useQuantitativeReasoningProgress();
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

  const resetItemProgress = async (item) => {
    try {
      const setId = item.setId;
      const attemptsRaw = await AsyncStorage.getItem('qr_attempts');
      if (attemptsRaw) {
        const attempts = JSON.parse(attemptsRaw);
        let changed = false;
        for (const [questionId, value] of Object.entries(attempts)) {
          if (value?.setId === setId) {
            delete attempts[questionId];
            changed = true;
          }
        }
        if (changed) {
          if (Object.keys(attempts).length === 0) {
            await AsyncStorage.removeItem('qr_attempts');
          } else {
            await AsyncStorage.setItem('qr_attempts', JSON.stringify(attempts));
          }
        }
      }

      const progressRaw = await AsyncStorage.getItem('qr_set_progress');
      if (progressRaw) {
        const progress = JSON.parse(progressRaw);
        if (progress[setId] !== undefined) {
          delete progress[setId];
          if (Object.keys(progress).length === 0) {
            await AsyncStorage.removeItem('qr_set_progress');
          } else {
            await AsyncStorage.setItem('qr_set_progress', JSON.stringify(progress));
          }
        }
      }

      reload();
    } catch {
      Alert.alert('Error', 'Could not reset progress. Please try again.');
    }
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
      getIndex={(item) => getFirstFlatIndex(item.setId, flatQuestions)}
      getIsFree={(item) => item.isFree}
      getItemKey={(item) => item.id ?? item.setId}
      bookmarksConfig={{
        section: 'qr',
        getFlatQuestions: () => flatQuestions,
        getQuestionId: (fq) => fq.question.questionId ?? fq.question.id,
        getFlatTitle: (fq) => {
          const pos = (fq.flatIndex - fq.stemFirstFlatIndex) + 1;
          return `${fq.stemTitle ?? 'Set'} — Q${pos} of ${fq.stemQuestionCount}`;
        },
        getFlatNavIndex: (fq) => fq.flatIndex,
      }}
      routeName="QRQuestion"
      navigation={navigation}
      loading={loading}
      error={error}
      syncing={syncing}
      syncProgress={syncProgress}
      deleting={deleting}
      onReset={handleDeleteProgress}
      onResetItem={resetItemProgress}
      resetItemLabel="this set"
    />
  );
}
