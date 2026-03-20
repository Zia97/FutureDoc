import { useCallback, useState } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import SectionQuestionList from '../../components/SectionQuestionList';
import { useSituationalJudgementScenarios } from '../../hooks/queries/useSituationalJudgementScenarios';
import { useSituationalJudgementProgress } from '../../hooks/queries/useSituationalJudgementProgress';
import { useTheme } from '../../context/ThemeContext';

const FILTERS = [
  { label: 'All',         value: 'all' },
  { label: 'Not Started', value: 'not_started' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed',   value: 'completed' },
];

function StatusIndicator({ value, color }) {
  const char = value === 'completed' ? '●' : value === 'in_progress' ? '◑' : value === 'not_started' ? '○' : null;
  return <Text style={[indicator.circle, { color }]}>{char}</Text>;
}

const indicator = StyleSheet.create({
  circle: { fontSize: 22, marginRight: 10, width: 26 },
});

export default function SJScenarioListScreen({ navigation }) {
  const { scenarios, loading, error } = useSituationalJudgementScenarios();
  const { progressMap, reload } = useSituationalJudgementProgress();
  const { theme: t } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const filteredScenarios = scenarios
    .map((s, i) => ({ ...s, _originalIndex: i }))
    .filter((s) => {
      if (activeFilter === 'all') return true;
      const status = progressMap[s.id] ?? null;
      if (activeFilter === 'not_started') return status === null;
      return status === activeFilter;
    });

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgInput }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={[styles.loadingText, { color: t.textSecondary }]}>Loading scenarios...</Text>
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
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: t.bgCard, borderColor: activeFilter !== 'all' ? t.sectionSJ : t.border }]}
          onPress={() => setDropdownOpen((o) => !o)}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterIcon, { color: t.sectionSJ }]}>≡</Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={[styles.dropdownMenu, { backgroundColor: t.bgCard, borderColor: t.sectionSJ }]}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.dropdownItem, { borderBottomColor: t.border }, f.value === activeFilter && { backgroundColor: t.accentDim }]}
                onPress={() => { setActiveFilter(f.value); setDropdownOpen(false); }}
                activeOpacity={0.75}
              >
                <StatusIndicator value={f.value} color={t.sectionSJ} />
                <Text style={[styles.dropdownItemText, { color: t.textSecondary }, f.value === activeFilter && { color: t.text, fontWeight: '600' }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <SectionQuestionList
        items={filteredScenarios}
        getTitle={(_, index) => `Scenario ${index + 1}`}
        getStatus={(item) => progressMap[item.id] ?? null}
        getIndex={(item) => item._originalIndex}
        routeName="SJScenario"
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { color: 'red', textAlign: 'center' },
  filterWrapper: { alignItems: 'flex-end', paddingHorizontal: 24, paddingTop: 12, zIndex: 10 },
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
});
