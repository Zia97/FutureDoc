import { useCallback, useState } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import SectionQuestionList from '../../components/SectionQuestionList';
import { useQuantitativeReasoningSets } from '../../hooks/queries/useQuantitativeReasoningSets';
import { useQuantitativeReasoningProgress } from '../../hooks/queries/useQuantitativeReasoningProgress';

const FILTERS = [
  { label: 'All',         value: 'all' },
  { label: 'Not Started', value: 'not_started' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed',   value: 'completed' },
];

function StatusIndicator({ value }) {
  const char = value === 'completed' ? '●' : value === 'in_progress' ? '◑' : value === 'not_started' ? '○' : null;
  return <Text style={indicator.circle}>{char}</Text>;
}

const indicator = StyleSheet.create({
  circle: { color: '#7c3aed', fontSize: 22, marginRight: 10, width: 26 },
});

export default function QRQuestionListScreen({ navigation }) {
  const { sets, loading, error } = useQuantitativeReasoningSets();
  const { progressMap, reload } = useQuantitativeReasoningProgress();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const filteredSets = sets
    .map((s, i) => ({ ...s, _originalIndex: i }))
    .filter((s) => {
      if (activeFilter === 'all') return true;
      const status = progressMap[s.setId] ?? null;
      if (activeFilter === 'not_started') return status === null;
      return status === activeFilter;
    });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{JSON.stringify(error)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterWrapper}>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter !== 'all' && styles.filterButtonActive]}
          onPress={() => setDropdownOpen((o) => !o)}
          activeOpacity={0.8}
        >
          <Text style={styles.filterIcon}>≡</Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.dropdownItem, f.value === activeFilter && styles.dropdownItemActive]}
                onPress={() => { setActiveFilter(f.value); setDropdownOpen(false); }}
                activeOpacity={0.75}
              >
                <StatusIndicator value={f.value} />
                <Text style={[styles.dropdownItemText, f.value === activeFilter && styles.dropdownItemTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <SectionQuestionList
        items={filteredSets}
        getTitle={(item) => item.title}
        getStatus={(item) => progressMap[item.setId] ?? null}
        getIndex={(item) => item._originalIndex}
        routeName="QRQuestion"
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#1a1a2e' },
  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  errorText:   { color: 'red', textAlign: 'center' },
  filterWrapper: { alignItems: 'flex-end', paddingHorizontal: 24, paddingTop: 12, zIndex: 10 },
  filterButton: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#16213e', borderWidth: 1, borderColor: '#333',
    justifyContent: 'center', alignItems: 'center',
  },
  filterButtonActive: { borderColor: '#7c3aed' },
  filterIcon:  { color: '#7c3aed', fontSize: 20 },
  dropdownMenu: {
    position: 'absolute', top: 46, right: 0, width: 180,
    backgroundColor: '#16213e', borderRadius: 8,
    borderWidth: 1, borderColor: '#7c3aed', overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  dropdownItemActive:     { backgroundColor: '#7c3aed22' },
  dropdownItemText:       { color: '#aaaaaa', fontSize: 14 },
  dropdownItemTextActive: { color: '#ffffff', fontWeight: '600' },
});
