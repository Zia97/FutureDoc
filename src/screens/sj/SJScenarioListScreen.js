import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import OfflineRetry from '../../components/OfflineRetry';
import PremiumQuestionListScreen from '../../components/premium/PremiumQuestionListScreen';
import { useSituationalJudgementScenarios } from '../../hooks/queries/useSituationalJudgementScenarios';
import { useSituationalJudgementProgress } from '../../hooks/queries/useSituationalJudgementProgress';
import { useSituationalJudgementAttempts } from '../../hooks/attempts/useSituationalJudgementAttempts';
import { getTargetFlatIndex } from '../../lib/flattenQuestions';

const CACHE_KEYS = ['sj_attempts', 'sj_scenario_progress'];

export default function SJScenarioListScreen({ navigation }) {
  const { scenarios, flatQuestions, loading, error, syncing, syncProgress, refetch } = useSituationalJudgementScenarios();
  const { progressMap, reload } = useSituationalJudgementProgress();
  const { localAnswers } = useSituationalJudgementAttempts();
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
      getIndex={(item) => getTargetFlatIndex(item.id, flatQuestions, localAnswers)}
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
    />
  );
}
