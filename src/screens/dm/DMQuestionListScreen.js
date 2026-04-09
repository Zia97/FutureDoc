import { useCallback, useState } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import SectionQuestionList from '../../components/SectionQuestionList';
import { useDecisionMakingQuestions } from '../../hooks/queries/useDecisionMakingQuestions';
import { useDecisionMakingProgress } from '../../hooks/queries/useDecisionMakingProgress';
import { useTheme } from '../../context/ThemeContext';

const CACHE_KEYS = ['dm_attempts'];

const FILTERS = [
  { label: 'All',         value: 'all' },
  { label: 'Not Started', value: 'not_started' },
  { label: 'Completed',   value: 'completed' },
];

function StatusIndicator({ value, color }) {
  const char = value === 'completed' ? '●' : value === 'not_started' ? '○' : null;
  return <Text style={[indicator.circle, { color }]}>{char}</Text>;
}

const indicator = StyleSheet.create({
  circle: { fontSize: 22, marginRight: 10, width: 26 },
});

export default function DMQuestionListScreen({ navigation }) {
  const { questions, loading, error } = useDecisionMakingQuestions();
  const { progressMap, reload } = useDecisionMakingProgress();
  const { theme: t } = useTheme();
  const insets = useSafeAreaInsets();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

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

  const filteredQuestions = questions
    .map((q, i) => ({ ...q, _originalIndex: i }))
    .filter((q) => {
      if (activeFilter === 'all') return true;
      const status = progressMap[q.id] ?? null;
      if (activeFilter === 'not_started') return status === null;
      return status === activeFilter;
    });

  const activeFilterLabel = FILTERS.find((f) => f.value === activeFilter)?.label;
  const countLabel = activeFilter === 'all'
    ? `${questions.length} ${questions.length === 1 ? 'question' : 'questions'}`
    : `${filteredQuestions.length} of ${questions.length} · ${activeFilterLabel}`;

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgInput }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={[styles.loadingText, { color: t.textSecondary }]}>Loading questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgInput }]}>
        <Text style={styles.errorText}>{JSON.stringify(error)}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bgInput }]}>
      <View style={styles.filterWrapper}>
        <Text style={[styles.countLabel, { color: t.textSecondary }]} numberOfLines={1}>
          {countLabel}
        </Text>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: t.bgCard, borderColor: activeFilter !== 'all' ? t.sectionDM : t.border }]}
          onPress={() => setDropdownOpen((o) => !o)}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterIcon, { color: t.sectionDM }]}>≡</Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={[styles.dropdownMenu, { backgroundColor: t.bgCard, borderColor: t.sectionDM }]}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.dropdownItem, { borderBottomColor: t.border }, f.value === activeFilter && { backgroundColor: t.accentDim }]}
                onPress={() => { setActiveFilter(f.value); setDropdownOpen(false); }}
                activeOpacity={0.75}
              >
                <StatusIndicator value={f.value} color={t.sectionDM} />
                <Text style={[styles.dropdownItemText, { color: t.textSecondary }, f.value === activeFilter && { color: t.text, fontWeight: '600' }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <SectionQuestionList
        items={filteredQuestions}
        getTitle={(item) => item.title}
        getStatus={(item) => progressMap[item.id] ?? null}
        getIndex={(item) => item._originalIndex}
        getIsFree={(item) => item.isFree}
        routeName="DMQuestion"
        navigation={navigation}
      />

      <View style={[styles.bottomPanel, { backgroundColor: t.headerBg, paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: t.danger }]}
          onPress={handleDeleteProgress}
          disabled={deleting}
          activeOpacity={0.8}
        >
          {deleting
            ? <ActivityIndicator size="small" color={t.danger} />
            : <Text style={[styles.deleteBtnText, { color: t.danger }]}>Reset Progress</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { color: 'red', textAlign: 'center' },
  filterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    zIndex: 10,
  },
  countLabel: { fontSize: 13, fontWeight: '500', flex: 1, marginRight: 12 },
  filterButton: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },
  filterIcon: { fontSize: 20 },
  dropdownMenu: {
    position: 'absolute', top: 46, right: 0, width: 180,
    borderRadius: 8, borderWidth: 1, overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1,
  },
  dropdownItemText: { fontSize: 14 },
  bottomPanel: {
    paddingTop: 14,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  deleteBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 12, fontWeight: '600' },
});
