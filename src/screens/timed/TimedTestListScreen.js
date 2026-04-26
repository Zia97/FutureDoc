import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import SyncBanner from '../../components/SyncBanner';
import OfflineRetry from '../../components/OfflineRetry';
import PremiumIcon from '../../components/premium/PremiumIcon';
import { AppHeader, PremiumScreen } from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme, hexToRgba, premiumColors } from '../../theme/premiumTheme';

const INSTRUCTION_ROUTE = {
  VR: 'VRInstruction',
  DM: 'DMInstruction',
  QR: 'QRInstruction',
  SJ: 'SJInstruction',
};

const REVIEW_ROUTE = {
  VR: 'TimedVRTestReview',
  DM: 'TimedDMTestReview',
  QR: 'TimedQRTestReview',
  SJ: 'TimedSJTestReview',
};

const SECTION_META = {
  VR: { accentKey: 'blue', label: 'Verbal Reasoning' },
  DM: { accentKey: 'teal', label: 'Decision Making' },
  QR: { accentKey: 'purple', label: 'Quantitative Reasoning' },
  SJ: { accentKey: 'mint', label: 'Situational Judgement' },
};

function formatScoreForCard(section, pct) {
  if (section === 'SJ') return { display: `${pct}%`, scaled: null };
  let scaled;
  if (section === 'VR') scaled = getVRScaledScore(pct);
  else if (section === 'DM') scaled = getDMScaledScore(pct);
  else scaled = getQRScaledScore(pct);
  return { display: String(scaled), scaled };
}

function sjScoreColor(pct) {
  if (pct >= 70) return '#16a34a';
  if (pct >= 50) return '#d97706';
  return '#dc2626';
}

function VRList(props) {
  const { tests, loading, error, syncing, syncProgress, refetch } = useTimedVRTests();
  const progress = useTimedVRExamProgress();
  return <TimedListBody {...props} tests={tests} loading={loading} error={error} progress={progress} syncing={syncing} syncProgress={syncProgress} refetch={refetch} />;
}

function DMList(props) {
  const { tests, loading, error, syncing, syncProgress, refetch } = useTimedDMTests();
  const progress = useTimedDMExamProgress();
  return <TimedListBody {...props} tests={tests} loading={loading} error={error} progress={progress} syncing={syncing} syncProgress={syncProgress} refetch={refetch} />;
}

function QRList(props) {
  const { tests, loading, error, syncing, syncProgress, refetch } = useTimedQRTests();
  const progress = useTimedQRExamProgress();
  return <TimedListBody {...props} tests={tests} loading={loading} error={error} progress={progress} syncing={syncing} syncProgress={syncProgress} refetch={refetch} />;
}

function SJList(props) {
  const { tests, loading, error, syncing, syncProgress, refetch } = useTimedSJTests();
  const progress = useTimedSJExamProgress();
  return <TimedListBody {...props} tests={tests} loading={loading} error={error} progress={progress} syncing={syncing} syncProgress={syncProgress} refetch={refetch} />;
}

const SECTION_COMPONENT = {
  VR: VRList,
  DM: DMList,
  QR: QRList,
  SJ: SJList,
};

export default function TimedTestListScreen({ navigation, route }) {
  const { section, title } = route.params;
  const Component = SECTION_COMPONENT[section] ?? VRList;
  return <Component navigation={navigation} section={section} title={title} />;
}

function StatCard({ label, count, color, isDark, colors }) {
  return (
    <View
      style={[
        styles.statCard,
        {
          borderColor: hexToRgba(color, 0.45),
          backgroundColor: hexToRgba(color, isDark ? 0.08 : 0.06),
        },
      ]}
    >
      <Text style={[styles.statCount, { color }]} numberOfLines={1}>{count}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function TimedListBody({ navigation, section, title, tests, loading, error, progress, syncing, syncProgress, refetch }) {
  const { theme: t, isDark } = useTheme();
  const { isPro } = useSubscription();
  const { colors } = getPremiumTheme(isDark);
  const insets = useSafeAreaInsets();
  const sectionAccent = colors[SECTION_META[section]?.accentKey ?? 'blue'] ?? colors.blue;

  const { completedAttempts, reload, deleteAttempt } = progress;
  const [activeFilter, setActiveFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const headerTitle = title ?? SECTION_META[section]?.label ?? 'Timed Tests';

  const indexedTests = useMemo(() => (
    (tests ?? []).map((item, originalIndex) => {
      const status = completedAttempts[item.id] ? 'completed' : 'not_started';
      return {
        item,
        originalIndex,
        title: String(item.title ?? `Test ${originalIndex + 1}`),
        status,
      };
    })
  ), [tests, completedAttempts]);

  const stats = useMemo(() => indexedTests.reduce((acc, entry) => {
    if (entry.status === 'completed') acc.completed += 1;
    else acc.notStarted += 1;
    return acc;
  }, { notStarted: 0, completed: 0 }), [indexedTests]);

  const visibleTests = useMemo(() => (
    indexedTests.filter((entry) => activeFilter === 'all' || entry.status === activeFilter)
  ), [activeFilter, indexedTests]);

  const filterOptions = useMemo(() => ([
    { label: 'All Tests', value: 'all' },
    { label: 'Not Started', value: 'not_started' },
    { label: 'Completed', value: 'completed' },
  ]), []);

  const activeFilterLabel = filterOptions.find((option) => option.value === activeFilter)?.label ?? filterOptions[0].label;

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

  const screenHeader = <AppHeader navigation={navigation} title={headerTitle} />;

  if (loading) {
    return (
      <PremiumScreen>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
        {screenHeader}
        <SyncBanner visible={syncing} progress={syncProgress} label="Updating tests..." />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={sectionAccent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading tests...</Text>
        </View>
      </PremiumScreen>
    );
  }

  if (error) {
    if (error?.isOffline) {
      return <OfflineRetry onRetry={refetch} message="Connect to the internet to load timed tests." />;
    }
    return (
      <PremiumScreen>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
        {screenHeader}
        <View style={styles.centered}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Something went wrong</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{JSON.stringify(error)}</Text>
        </View>
      </PremiumScreen>
    );
  }

  const renderItem = ({ item: entry, index }) => {
    const item = entry.item;
    const isCompleted = entry.status === 'completed';
    const attempt = isCompleted ? completedAttempts[item.id] : null;
    const isLocked = !item.isFree && !isPro;
    const formatted = isCompleted ? formatScoreForCard(section, attempt.scorePercent) : null;
    const completedColor = isCompleted
      ? formatted.scaled != null
        ? scaledScoreColor(formatted.scaled, t)
        : sjScoreColor(attempt.scorePercent)
      : null;
    const rowColor = isLocked ? colors.amber : isCompleted ? completedColor : sectionAccent;
    const rowGradient = isDark
      ? [hexToRgba(rowColor, 0.16), 'rgba(7, 20, 39, 0.94)', 'rgba(4, 10, 24, 0.98)']
      : [hexToRgba(rowColor, 0.08), 'rgba(255, 255, 255, 0.98)', 'rgba(247, 250, 255, 0.98)'];

    return (
      <TouchableOpacity
        activeOpacity={0.82}
        style={[styles.rowTouch, isLocked && styles.lockedRow]}
        onPress={() => {
          if (isLocked) {
            navigation.navigate('Paywall');
            return;
          }
          if (isCompleted) {
            navigation.navigate(REVIEW_ROUTE[section] ?? 'TimedVRTestReview', { test: item });
          } else {
            navigation.navigate(INSTRUCTION_ROUTE[section] ?? 'VRInstruction', { test: item, section, title });
          }
        }}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={rowGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[
            styles.rowCard,
            {
              borderColor: hexToRgba(rowColor, isCompleted ? 0.7 : 0.5),
              shadowColor: rowColor,
            },
          ]}
        >
          <View style={[styles.rowAccent, { backgroundColor: rowColor }]} />
          <Text style={[styles.rowNumber, { color: rowColor }]} numberOfLines={1}>
            {isLocked ? 'PRO' : index + 1}
          </Text>
          <View style={[styles.rowDivider, { backgroundColor: hexToRgba(rowColor, 0.22) }]} />
          <View style={styles.rowCopy}>
            <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>
              {entry.title}
            </Text>
            {isLocked ? (
              <View style={[styles.tag, { borderColor: hexToRgba(colors.amber, 0.4), backgroundColor: hexToRgba(colors.amber, 0.1) }]}>
                <Text style={[styles.tagText, { color: colors.amber }]}>Premium</Text>
              </View>
            ) : isCompleted ? (
              <View style={[styles.tag, { borderColor: hexToRgba(completedColor, 0.45), backgroundColor: hexToRgba(completedColor, 0.1) }]}>
                <Text style={[styles.tagText, { color: completedColor }]}>
                  Score {formatted.display} · Tap to review
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.rowStatusCluster}>
            {isLocked ? (
              <PremiumIcon name="lock" size={28} color={colors.amber} strokeWidth={1.9} />
            ) : isCompleted ? (
              <PremiumIcon name="check" size={28} color={completedColor} strokeWidth={2.4} />
            ) : (
              <PremiumIcon name="chevron-right" size={26} color={sectionAccent} strokeWidth={2.4} />
            )}
            {!isLocked && isCompleted ? (
              <TouchableOpacity
                onPress={(event) => {
                  event.stopPropagation?.();
                  handleResetAttempt(item.id, item.title);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Reset test attempt"
              >
                <PremiumIcon name="refresh" size={20} color={colors.textMuted} strokeWidth={2.2} />
              </TouchableOpacity>
            ) : null}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      {screenHeader}
      <SyncBanner visible={syncing} progress={syncProgress} label="Updating tests..." />
      <FlatList
        data={visibleTests}
        keyExtractor={(entry) => String(entry.item.id ?? entry.originalIndex)}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 8) + 28 },
        ]}
        ListHeaderComponent={(
          <View style={styles.headerWrap}>
            <View style={styles.statsRow}>
              <StatCard label="Total" count={indexedTests.length} color={sectionAccent} isDark={isDark} colors={colors} />
              <StatCard label="Not Started" count={stats.notStarted} color={colors.blue} isDark={isDark} colors={colors} />
              <StatCard label="Completed" count={stats.completed} color={'#62E76B'} isDark={isDark} colors={colors} />
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity
                onPress={() => setFilterOpen((open) => !open)}
                activeOpacity={0.84}
                style={[
                  styles.filterButton,
                  {
                    borderColor: hexToRgba(sectionAccent, 0.62),
                    backgroundColor: isDark ? 'rgba(7, 19, 39, 0.86)' : 'rgba(255, 255, 255, 0.86)',
                  },
                  activeFilter !== 'all' && { backgroundColor: hexToRgba(sectionAccent, isDark ? 0.14 : 0.1) },
                ]}
                accessibilityRole="button"
              >
                <PremiumIcon name="filter" size={20} color={colors.text} strokeWidth={2.2} />
                <Text style={[styles.filterText, { color: colors.text }]} numberOfLines={1}>
                  {activeFilterLabel}
                </Text>
                <PremiumIcon
                  name="chevron-down"
                  size={17}
                  color={filterOpen ? colors.cyan : sectionAccent}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderItem={renderItem}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {indexedTests.length === 0 ? 'No timed tests available yet' : 'No tests match your filters'}
            </Text>
            <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
              {indexedTests.length === 0 ? 'Check back soon — new tests are on the way.' : 'Try changing the search or filter.'}
            </Text>
          </View>
        )}
      />

      {filterOpen ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setFilterOpen(false)}
          style={styles.dropdownOverlay}
        >
          <View
            style={[
              styles.dropdownMenu,
              {
                borderColor: hexToRgba(sectionAccent, isDark ? 0.56 : 0.32),
                backgroundColor: isDark ? 'rgba(5, 15, 32, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                shadowColor: sectionAccent,
              },
            ]}
            pointerEvents="box-none"
          >
            {filterOptions.map((option) => {
              const selected = option.value === activeFilter;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setActiveFilter(option.value);
                    setFilterOpen(false);
                  }}
                  activeOpacity={0.78}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: hexToRgba(sectionAccent, isDark ? 0.12 : 0.1) },
                    selected && { backgroundColor: hexToRgba(sectionAccent, isDark ? 0.13 : 0.09) },
                  ]}
                >
                  <PremiumIcon
                    name={option.value === 'completed' ? 'check' : option.value === 'all' ? 'filter' : 'circle'}
                    size={18}
                    color={selected ? sectionAccent : colors.textSecondary}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.dropdownText,
                      { color: colors.textSecondary },
                      selected && { color: sectionAccent },
                    ]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      ) : null}
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  loadingText: {
    color: premiumColors.textSecondary,
    fontSize: 15,
    marginTop: 14,
    fontWeight: '600',
  },
  errorTitle: {
    color: premiumColors.text,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },
  errorText: {
    color: premiumColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 18,
  },
  headerWrap: {
    paddingTop: 0,
    paddingBottom: 10,
    zIndex: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    minHeight: 72,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 11,
    justifyContent: 'center',
  },
  statCount: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 30,
  },
  filterButton: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  filterText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    elevation: 200,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 250,
    right: 18,
    width: 208,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: 24,
    elevation: 24,
  },
  dropdownItem: {
    minHeight: 45,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
  },
  dropdownText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: '700',
  },
  rowTouch: {
    marginBottom: 13,
    borderRadius: 18,
  },
  lockedRow: {
    opacity: 0.72,
  },
  rowCard: {
    minHeight: 88,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 13,
    paddingLeft: 14,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'ios' ? 0.14 : 0,
    shadowRadius: 18,
    elevation: 0,
  },
  rowAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  rowNumber: {
    width: 44,
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
  },
  rowDivider: {
    width: 1,
    height: 56,
    marginLeft: 9,
    marginRight: 13,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  rowTitle: {
    color: premiumColors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  tag: {
    alignSelf: 'flex-start',
    marginTop: 7,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },
  rowStatusCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyState: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  emptyTitle: {
    color: premiumColors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyBody: {
    color: premiumColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});
