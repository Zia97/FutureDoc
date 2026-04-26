import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import OfflineRetry from '../../components/OfflineRetry';
import PremiumQuestionListScreen from '../../components/premium/PremiumQuestionListScreen';
import { useSituationalJudgementScenarios } from '../../hooks/queries/useSituationalJudgementScenarios';
import { useSituationalJudgementProgress } from '../../hooks/queries/useSituationalJudgementProgress';
import { getFirstFlatIndex } from '../../lib/flattenQuestions';

const CACHE_KEYS = ['sj_attempts', 'sj_scenario_progress'];

export default function SJScenarioListScreen({ navigation }) {
  const { scenarios, flatQuestions, loading, error, syncing, syncProgress, refetch } = useSituationalJudgementScenarios();
  const { progressMap, reload } = useSituationalJudgementProgress();
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
      'This will permanently delete all your Situational Judgement progress and answers. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteProgress },
      ],
    );
  };

  const resetItemProgress = async (item) => {
    try {
      const scenarioId = item.id;
      const attemptsRaw = await AsyncStorage.getItem('sj_attempts');
      if (attemptsRaw) {
        const attempts = JSON.parse(attemptsRaw);
        let changed = false;
        for (const [questionId, value] of Object.entries(attempts)) {
          if (value?.scenarioId === scenarioId) {
            delete attempts[questionId];
            changed = true;
          }
        }
        if (changed) {
          if (Object.keys(attempts).length === 0) {
            await AsyncStorage.removeItem('sj_attempts');
          } else {
            await AsyncStorage.setItem('sj_attempts', JSON.stringify(attempts));
          }
        }
      }

      const progressRaw = await AsyncStorage.getItem('sj_scenario_progress');
      if (progressRaw) {
        const progress = JSON.parse(progressRaw);
        if (progress[scenarioId] !== undefined) {
          delete progress[scenarioId];
          if (Object.keys(progress).length === 0) {
            await AsyncStorage.removeItem('sj_scenario_progress');
          } else {
            await AsyncStorage.setItem('sj_scenario_progress', JSON.stringify(progress));
          }
        }
      }

      reload();
    } catch {
      Alert.alert('Error', 'Could not reset progress. Please try again.');
    }
  };

  if (error?.isOffline) {
    return <OfflineRetry onRetry={refetch} message="Connect to the internet to load scenarios." />;
  }

  return (
    <PremiumQuestionListScreen
      title="Situational Judgement"
      items={scenarios}
      singularLabel="scenario"
      pluralLabel="scenarios"
      searchPlaceholder="Search scenarios..."
      getTitle={(item, index) => item.title ?? item.name ?? `Scenario ${index + 1}`}
      getSearchText={(item) => item.resource}
      getStatus={(item) => progressMap[item.id] ?? null}
      getIndex={(item) => getFirstFlatIndex(item.id, flatQuestions)}
      getIsFree={(item) => item.isFree}
      getItemKey={(item) => item.id}
      routeName="SJScenario"
      navigation={navigation}
      loading={loading}
      error={error}
      syncing={syncing}
      syncProgress={syncProgress}
      deleting={deleting}
      onReset={handleDeleteProgress}
      onResetItem={resetItemProgress}
      resetItemLabel="this scenario"
    />
  );
}
