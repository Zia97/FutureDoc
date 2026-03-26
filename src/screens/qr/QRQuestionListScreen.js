import { useCallback, useState } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import SectionQuestionList from '../../components/SectionQuestionList';
import { useQuantitativeReasoningSets } from '../../hooks/queries/useQuantitativeReasoningSets';
import { useQuantitativeReasoningProgress } from '../../hooks/queries/useQuantitativeReasoningProgress';
import { useQuantitativeReasoningAttempts } from '../../hooks/attempts/useQuantitativeReasoningAttempts';
import { getTargetFlatIndex } from '../../lib/flattenQuestions';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const CACHE_KEYS = ['qr_attempts', 'qr_pending_sync', 'qr_set_progress'];
const DB_TABLES = ['quantitative_reasoning_question_attempts', 'quantitative_reasoning_set_progress'];

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

export default function QRQuestionListScreen({ navigation }) {
  const { sets, flatQuestions, loading, error } = useQuantitativeReasoningSets();
  const { progressMap, reload } = useQuantitativeReasoningProgress();
  const { localAnswers } = useQuantitativeReasoningAttempts();
  const { theme: t } = useTheme();
  const { user } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

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

  const deleteProgress = async () => {
    setDeleting(true);
    try {
      await Promise.all(CACHE_KEYS.map((key) => AsyncStorage.removeItem(key)));
      for (const table of DB_TABLES) {
        const { error: dbError } = await supabase.from(table).delete().eq('user_id', user.id);
        if (dbError) throw dbError;
      }
      reload();
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredSets = sets.filter((s) => {
    if (activeFilter === 'all') return true;
    const status = progressMap[s.setId] ?? null;
    if (activeFilter === 'not_started') return status === null;
    return status === activeFilter;
  });

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgInput }]}>
        <ActivityIndicator size="large" color={t.accent} />
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
          style={[styles.filterButton, { backgroundColor: t.bgCard, borderColor: activeFilter !== 'all' ? t.sectionQR : t.border }]}
          onPress={() => setDropdownOpen((o) => !o)}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterIcon, { color: t.sectionQR }]}>≡</Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={[styles.dropdownMenu, { backgroundColor: t.bgCard, borderColor: t.sectionQR }]}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.dropdownItem, { borderBottomColor: t.border }, f.value === activeFilter && { backgroundColor: t.accentDim }]}
                onPress={() => { setActiveFilter(f.value); setDropdownOpen(false); }}
                activeOpacity={0.75}
              >
                <StatusIndicator value={f.value} color={t.sectionQR} />
                <Text style={[styles.dropdownItemText, { color: t.textSecondary }, f.value === activeFilter && { color: t.text, fontWeight: '600' }]}>
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
        getIndex={(item) => getTargetFlatIndex(item.setId, flatQuestions, localAnswers)}
        routeName="QRQuestion"
        navigation={navigation}
        listFooter={
          <View style={[styles.deleteBanner, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            <View style={styles.deleteBannerInfo}>
              <Text style={[styles.deleteBannerTitle, { color: t.text }]}>Reset Progress</Text>
              <Text style={[styles.deleteBannerSub, { color: t.textMuted }]}>Delete all answers for this section</Text>
            </View>
            <TouchableOpacity
              style={[styles.deleteBtn, { borderColor: t.danger }]}
              onPress={handleDeleteProgress}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting
                ? <ActivityIndicator size="small" color={t.danger} />
                : <Text style={[styles.deleteBtnText, { color: t.danger }]}>Reset</Text>
              }
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  deleteBanner: {
    marginTop: 32,
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteBannerInfo: { flex: 1, marginRight: 12 },
  deleteBannerTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  deleteBannerSub: { fontSize: 12 },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 13, fontWeight: '600' },
});
