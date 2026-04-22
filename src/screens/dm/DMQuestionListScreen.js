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

const STATUS_FILTERS = [
  { label: 'All',         value: 'all' },
  { label: 'Not Started', value: 'not_started' },
  { label: 'Completed',   value: 'completed' },
];

const TYPE_FILTERS = [
  { label: 'All Types',              value: 'all' },
  { label: 'Syllogism',              value: 'syllogism' },
  { label: 'Logic Puzzle',           value: 'logic_puzzle' },
  { label: 'Recognising Assumptions', value: 'recognising_assumptions' },
  { label: 'Interpreting Info',      value: 'interpreting_info' },
  { label: 'Venn Diagram',           value: 'venn_diagram' },
  { label: 'Probabilistic',          value: 'probabilistic' },
];

const DIFFICULTY_FILTERS = [
  { label: 'Difficulty', value: 'all' },
  { label: 'Normal',     value: 'normal' },
  { label: 'Hard',       value: 'hard' },
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

  const [openDropdown, setOpenDropdown] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
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
      if (statusFilter !== 'all') {
        const status = progressMap[q.id] ?? null;
        if (statusFilter === 'not_started' ? status !== null : status !== statusFilter) return false;
      }
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
      return true;
    });

  const anyFilterActive = statusFilter !== 'all' || typeFilter !== 'all' || difficultyFilter !== 'all';
  const countLabel = anyFilterActive
    ? `${filteredQuestions.length} of ${questions.length}`
    : `${questions.length} ${questions.length === 1 ? 'question' : 'questions'}`;

  const statusLabel     = STATUS_FILTERS.find((f) => f.value === statusFilter)?.label ?? 'Status';
  const typeLabel       = TYPE_FILTERS.find((f) => f.value === typeFilter)?.label ?? 'Type';
  const difficultyLabel = DIFFICULTY_FILTERS.find((f) => f.value === difficultyFilter)?.label ?? 'Level';

  const toggleDropdown = (key) => setOpenDropdown((current) => (current === key ? null : key));

  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setDifficultyFilter('all');
    setOpenDropdown(null);
  };

  const filteredIndices = filteredQuestions.map((q) => q._originalIndex);

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

  const renderPill = (key, label, activeValue, options, setter, { showStatusDot = false, alignEnd = false } = {}) => {
    const isOpen = openDropdown === key;
    const isActive = activeValue !== 'all';
    return (
      <View style={styles.pillWrapper}>
        <TouchableOpacity
          style={[
            styles.pill,
            { backgroundColor: t.bgCard, borderColor: isActive ? t.sectionDM : t.border },
          ]}
          onPress={() => toggleDropdown(key)}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.pillText, { color: isActive ? t.sectionDM : t.textSecondary }]}
            numberOfLines={1}
          >
            {label}
          </Text>
          <Text style={[styles.pillCaret, { color: isActive ? t.sectionDM : t.textSecondary }]}>
            {isOpen ? '▴' : '▾'}
          </Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={[styles.dropdownMenu, alignEnd ? { right: 0 } : { left: 0 }, { backgroundColor: t.bgCard, borderColor: t.sectionDM }]}>
            {options.map((f) => {
              const selected = f.value === activeValue;
              return (
                <TouchableOpacity
                  key={f.value}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: t.border },
                    selected && { backgroundColor: t.accentDim },
                  ]}
                  onPress={() => { setter(f.value); setOpenDropdown(null); }}
                  activeOpacity={0.75}
                >
                  {showStatusDot && <StatusIndicator value={f.value} color={t.sectionDM} />}
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: t.textSecondary },
                      selected && { color: t.text, fontWeight: '600' },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bgInput }]}>
      <View style={styles.filterWrapper}>
        <Text style={[styles.countLabel, { color: t.textSecondary }]} numberOfLines={1}>
          {countLabel}
        </Text>
        <View style={styles.pillRow}>
          {renderPill('status', statusLabel, statusFilter, STATUS_FILTERS, setStatusFilter, { showStatusDot: true })}
          {renderPill('type', typeLabel, typeFilter, TYPE_FILTERS, setTypeFilter)}
          {renderPill('difficulty', difficultyLabel, difficultyFilter, DIFFICULTY_FILTERS, setDifficultyFilter, { alignEnd: true })}
          {anyFilterActive && (
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: t.danger }]}
              onPress={clearFilters}
              activeOpacity={0.75}
            >
              <Text style={[styles.clearButtonText, { color: t.danger }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SectionQuestionList
        items={filteredQuestions}
        getTitle={(item) => item.title}
        getStatus={(item) => progressMap[item.id] ?? null}
        getIndex={(item) => item._originalIndex}
        getIsFree={(item) => item.isFree}
        routeName="DMQuestion"
        navigation={navigation}
        extraNavParams={anyFilterActive ? { filteredIndices } : undefined}
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
    paddingHorizontal: 24,
    paddingTop: 12,
    zIndex: 10,
  },
  countLabel: { fontSize: 13, fontWeight: '500', marginBottom: 10 },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillWrapper: { position: 'relative' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 160,
  },
  pillText: { fontSize: 12, fontWeight: '500', marginRight: 6 },
  pillCaret: { fontSize: 11 },
  dropdownMenu: {
    position: 'absolute', top: 38, minWidth: 180,
    borderRadius: 8, borderWidth: 1, overflow: 'hidden',
    zIndex: 20,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1,
  },
  dropdownItemText: { fontSize: 14 },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  clearButtonText: { fontSize: 12, fontWeight: '600' },
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
