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
import { useSubscription } from '../../context/SubscriptionContext';
import { useTimedVRTests } from '../../hooks/queries/useTimedVRTests';
import { useTimedDMTests } from '../../hooks/queries/useTimedDMTests';
import { useTimedQRTests } from '../../hooks/queries/useTimedQRTests';
import { useTimedSJTests } from '../../hooks/queries/useTimedSJTests';
import { useTimedSJExamProgress } from '../../hooks/attempts/useTimedSJExamProgress';
import { useTimedVRExamProgress } from '../../hooks/attempts/useTimedVRExamProgress';
import { useTimedDMExamProgress } from '../../hooks/attempts/useTimedDMExamProgress';
import { useTimedQRExamProgress } from '../../hooks/attempts/useTimedQRExamProgress';
import {
  getVRScaledScore,
  getDMScaledScore,
  getQRScaledScore,
  scoreColor as scaledScoreColor,
} from '../../lib/ucatScoring';

// Score formatter shared across the four sections. VR/DM/QR show their
// estimated UCAT scaled score (300–900). UK SJ is intentionally left as
// a percentage because it's reported as bands, not a scaled number.
function formatScoreForCard(section, pct) {
  if (section === 'SJ') return { display: `${pct}%`, scaled: null };
  let scaled;
  if (section === 'VR') scaled = getVRScaledScore(pct);
  else if (section === 'DM') scaled = getDMScaledScore(pct);
  else scaled = getQRScaledScore(pct);
  return { display: String(scaled), scaled };
}

// Fallback colour bands for SJ (which lacks a scaled score). VR/DM/QR
// route through scaledScoreColor from ucatScoring.
function sjScoreColor(pct) {
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

export default function TimedTestListScreen({ navigation, route }) {
  const { section, title } = route.params;
  const { theme: t } = useTheme();
  const { isPro } = useSubscription();
  const color = t.accent;

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
      `This will delete your result for "${testTitle}" and remove it from your performance analytics. You'll be able to retake the test. This cannot be undone.`,
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

  const completedCount = Object.keys(completedAttempts ?? {}).length;
  const ANALYTICS_ROUTE = { VR: 'VRAnalytics', QR: 'QRAnalytics' };
  const analyticsRoute = ANALYTICS_ROUTE[section];
  const showAnalyticsEntry = !!analyticsRoute && completedCount > 0;
  const analyticsLocked = !isPro;

  return (
    <View style={[styles.container, { backgroundColor: t.bgInput }]}>
      <FlatList
        data={tests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          showAnalyticsEntry ? (
            <View>
              <TouchableOpacity
                style={[
                  styles.analyticsCard,
                  { backgroundColor: t.bgCard, borderColor: t.border, borderLeftColor: t.accent },
                  analyticsLocked && { opacity: 0.7 },
                ]}
                activeOpacity={0.85}
                onPress={() =>
                  analyticsLocked
                    ? navigation.navigate('Paywall')
                    : navigation.navigate(analyticsRoute, { tests })
                }
              >
                <View style={[styles.analyticsBadge, { backgroundColor: analyticsLocked ? '#6b7280' : t.accent }]}>
                  <Text style={styles.analyticsBadgeText}>{analyticsLocked ? '🔒' : '📊'}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: t.text }]}>Performance Analytics</Text>
                  {analyticsLocked && (
                    <Text style={[styles.lockedLabel, { color: t.accent }]}>Premium</Text>
                  )}
                </View>
                <Text style={[styles.rowChevron, { color: t.textSecondary }]}>›</Text>
              </TouchableOpacity>
              <View style={[styles.headerDivider, { backgroundColor: t.border }]} />
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const isCompleted = (section === 'SJ' || section === 'VR' || section === 'DM' || section === 'QR') && !!completedAttempts[item.id];
          const attempt = isCompleted ? completedAttempts[item.id] : null;
          const isLocked = !item.isFree && !isPro;
          const formatted = isCompleted ? formatScoreForCard(section, attempt.scorePercent) : null;
          // Colour by scaled score where we have one (VR/DM/QR); SJ falls
          // back to its percent-based band thresholds.
          const sc = isCompleted
            ? formatted.scaled != null
              ? scaledScoreColor(formatted.scaled, t)
              : sjScoreColor(attempt.scorePercent)
            : color;
          return (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: t.bgCard, borderColor: t.border, borderLeftColor: isLocked ? t.border : color },
                isCompleted && { borderLeftColor: '#16a34a' },
                isLocked && { opacity: 0.7 },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                if (isLocked) {
                  navigation.navigate('Paywall');
                  return;
                }
                if (isCompleted) {
                  const reviewRoute = section === 'VR' ? 'TimedVRTestReview' : section === 'DM' ? 'TimedDMTestReview' : section === 'QR' ? 'TimedQRTestReview' : 'TimedSJTestReview';
                  navigation.navigate(reviewRoute, { test: item });
                } else {
                  navigation.navigate(INSTRUCTION_ROUTE[section] ?? 'VRInstruction', { test: item, section, title });
                }
              }}
            >
              <View style={[styles.numberBadge, { backgroundColor: isCompleted ? '#16a34a' : isLocked ? '#6b7280' : color }]}>
                <Text style={styles.numberText}>{isCompleted ? '✓' : isLocked ? '🔒' : index + 1}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: t.text }]}>{item.title}</Text>
                {isLocked && (
                  <Text style={[styles.lockedLabel, { color: t.accent }]}>Premium</Text>
                )}
                {isCompleted && (
                  <Text style={[styles.completedScore, { color: sc }]}>
                    Score: {formatted.display} · Tap to review
                  </Text>
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
  lockedLabel: { fontSize: 12, marginTop: 4, fontWeight: '700' },
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
  analyticsCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  analyticsBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  analyticsBadgeText: { fontSize: 20 },
  rowChevron: { fontSize: 26, fontWeight: '300', marginLeft: 8 },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 14,
    marginBottom: 4,
    opacity: 0.6,
  },
});
