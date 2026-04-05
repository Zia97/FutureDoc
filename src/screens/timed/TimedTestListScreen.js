import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useTimedVRTests } from '../../hooks/queries/useTimedVRTests';
import { useTimedDMTests } from '../../hooks/queries/useTimedDMTests';
import { useTimedQRTests } from '../../hooks/queries/useTimedQRTests';
import { useTimedSJTests } from '../../hooks/queries/useTimedSJTests';
import { useTimedSJExamProgress } from '../../hooks/attempts/useTimedSJExamProgress';
import { useTimedVRExamProgress } from '../../hooks/attempts/useTimedVRExamProgress';
import { useTimedDMExamProgress } from '../../hooks/attempts/useTimedDMExamProgress';
import { useTimedQRExamProgress } from '../../hooks/attempts/useTimedQRExamProgress';

function scoreColor(pct) {
  if (pct >= 70) return '#16a34a';
  if (pct >= 50) return '#d97706';
  return '#dc2626';
}

const INSTRUCTION_ROUTE = {
  VR: 'VRInstruction',
  DM: 'DMInstruction',
  QR: 'QRInstruction',
  SJ: 'SJInstruction',
};

const SECTION_COLOR = {
  VR: '#7c3aed',
  DM: '#0891b2',
  QR: '#059669',
  SJ: '#d97706',
};

export default function TimedTestListScreen({ navigation, route }) {
  const { section, title } = route.params;
  const { theme: t } = useTheme();
  const color = SECTION_COLOR[section] ?? t.accent;

  const vr = useTimedVRTests();
  const dm = useTimedDMTests();
  const qr = useTimedQRTests();
  const sj = useTimedSJTests();
  const { completedAttempts: sjAttempts, reload: reloadSJ, deleteAttempt: deleteSJAttempt } = useTimedSJExamProgress();
  const { completedAttempts: vrAttempts, reload: reloadVR, deleteAttempt: deleteVRAttempt } = useTimedVRExamProgress();
  const { completedAttempts: dmAttempts, reload: reloadDM, deleteAttempt: deleteDMAttempt } = useTimedDMExamProgress();
  const { completedAttempts: qrAttempts, reload: reloadQR, deleteAttempt: deleteQRAttempt } = useTimedQRExamProgress();

  useFocusEffect(
    useCallback(() => {
      reloadSJ();
      reloadVR();
      reloadDM();
      reloadQR();
    }, []),
  );
  const completedAttempts = section === 'VR' ? vrAttempts : section === 'DM' ? dmAttempts : section === 'QR' ? qrAttempts : sjAttempts;
  const deleteAttempt = section === 'VR' ? deleteVRAttempt : section === 'DM' ? deleteDMAttempt : section === 'QR' ? deleteQRAttempt : deleteSJAttempt;
  const { tests, loading, error } =
    section === 'DM' ? dm :
    section === 'QR' ? qr :
    section === 'SJ' ? sj : vr;

  const handleResetAttempt = (testId, testTitle) => {
    Alert.alert(
      'Reset Test',
      `This will delete your result for "${testTitle}" and allow you to retake it. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => deleteAttempt(testId) },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgInput }]}>
        <ActivityIndicator size="large" color={color} />
        <Text style={[styles.loadingText, { color: t.textSecondary }]}>Loading tests...</Text>
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

  if (tests.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgInput }]}>
        <Text style={[styles.emptyText, { color: t.textSecondary }]}>No timed tests available yet.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.bgInput }]}>
      <FlatList
        data={tests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isCompleted = (section === 'SJ' || section === 'VR' || section === 'DM' || section === 'QR') && !!completedAttempts[item.id];
          const attempt = isCompleted ? completedAttempts[item.id] : null;
          const sc = isCompleted ? scoreColor(attempt.scorePercent) : color;
          return (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: t.bgCard, borderColor: t.border, borderLeftColor: color },
                isCompleted && { borderLeftColor: '#16a34a' },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                if (isCompleted) {
                  const reviewRoute = section === 'VR' ? 'TimedVRTestReview' : section === 'DM' ? 'TimedDMTestReview' : section === 'QR' ? 'TimedQRTestReview' : 'TimedSJTestReview';
                  navigation.navigate(reviewRoute, { test: item });
                } else {
                  navigation.navigate(INSTRUCTION_ROUTE[section] ?? 'VRInstruction', { test: item, section, title });
                }
              }}
            >
              <View style={[styles.numberBadge, { backgroundColor: isCompleted ? '#16a34a' : color }]}>
                <Text style={styles.numberText}>{isCompleted ? '✓' : index + 1}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: t.text }]}>{item.title}</Text>
                <Text style={[styles.cardMeta, { color: t.textSecondary }]}>
                  {section === 'VR'
                    ? `${item.passageCount} passages · ${item.questionCount} questions · ${item.timeMinutes} min`
                    : section === 'SJ'
                    ? `${item.scenarioCount} scenarios · ${item.questionCount} questions · ${item.timeMinutes} min`
                    : `${item.questionCount} questions · ${item.timeMinutes} min`}
                </Text>
                {isCompleted && (
                  <Text style={[styles.completedScore, { color: sc }]}>{attempt.scorePercent}% · Tap to review</Text>
                )}
              </View>
              {isCompleted && (
                <TouchableOpacity
                  style={[styles.resetButton, { borderColor: t.border }]}
                  onPress={() => handleResetAttempt(item.id, item.title)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resetText, { color: t.textMuted }]}>↺</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { color: 'red', textAlign: 'center' },
  emptyText: { fontSize: 15, textAlign: 'center' },
  list: { padding: 20, gap: 14 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  numberText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardMeta: { fontSize: 13, marginTop: 4 },
  completedScore: { fontSize: 13, marginTop: 4, fontWeight: '700' },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  resetText: { fontSize: 20, fontWeight: '600' },
});
