import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import OfflineRetry from '../../components/OfflineRetry';
import PremiumQuestionListScreen from '../../components/premium/PremiumQuestionListScreen';
import { useDecisionMakingQuestions } from '../../hooks/queries/useDecisionMakingQuestions';
import { useDecisionMakingProgress } from '../../hooks/queries/useDecisionMakingProgress';

const CACHE_KEYS = ['dm_attempts'];

const DM_TYPE_LABELS = {
  syllogism: 'Syllogism',
  logic_puzzle: 'Logic Puzzle',
  strongest_argument: 'Strongest Argument',
  recognising_assumptions: 'Recognising Assumptions',
  interpreting_info: 'Interpreting Information',
  venn_diagram: 'Venn Diagram',
  probabilistic: 'Probability',
};

const DM_TYPE_OPTIONS = [
  { label: 'All Types', value: 'all' },
  { label: DM_TYPE_LABELS.syllogism, value: 'syllogism' },
  { label: DM_TYPE_LABELS.logic_puzzle, value: 'logic_puzzle' },
  { label: DM_TYPE_LABELS.recognising_assumptions, value: 'recognising_assumptions' },
  { label: DM_TYPE_LABELS.interpreting_info, value: 'interpreting_info' },
  { label: DM_TYPE_LABELS.venn_diagram, value: 'venn_diagram' },
  { label: DM_TYPE_LABELS.probabilistic, value: 'probabilistic' },
];

function getDMTypeLabel(type) {
  return DM_TYPE_LABELS[type] ?? type?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) ?? null;
}

export default function DMQuestionListScreen({ navigation }) {
  const { questions, loading, error, syncing, syncProgress, refetch } = useDecisionMakingQuestions();
  const { progressMap, reload } = useDecisionMakingProgress();
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
      'This will permanently delete all your Decision Making progress and answers. This cannot be undone.',
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
      title="Decision Making"
      items={questions}
      singularLabel="question"
      pluralLabel="questions"
      searchPlaceholder="Search questions..."
      getTitle={(item, index) => item.title ?? `Question ${index + 1}`}
      getSearchText={(item) => `${getDMTypeLabel(item.type) ?? ''} ${item.type ?? ''} ${item.difficulty ?? ''}`}
      getBadgeLabel={(item) => getDMTypeLabel(item.type)}
      getStatus={(item) => progressMap[item.id] ?? null}
      getIndex={(_, index) => index}
      getIsFree={(item) => item.isFree}
      getItemKey={(item) => item.id}
      extraFilters={[
        {
          key: 'type',
          label: 'Type',
          options: DM_TYPE_OPTIONS,
          getValue: (item) => item.type,
        },
      ]}
      getExtraNavParams={(_, visibleEntries) => ({
        filteredIndices: visibleEntries.map((entry) => entry.originalIndex),
      })}
      routeName="DMQuestion"
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
