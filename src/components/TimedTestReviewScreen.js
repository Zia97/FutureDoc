import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';
import { PremiumScreen } from './premium/PremiumPracticeUI';
import PremiumIcon from './premium/PremiumIcon';

const STATUS_ORDER = { Unseen: 0, Incomplete: 1, Answered: 2 };

export default function TimedTestReviewScreen({
  questions,
  getStatus,
  flags,
  onNavigateTo,
  onEndTest,
  timerDisplay,
  isUrgent,
  title = 'Situational Judgement',
}) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const insets = useSafeAreaInsets();

  const statusColors = {
    Unseen: colors.red,
    Incomplete: colors.amber,
    Answered: isDark ? '#34D399' : '#059669',
  };

  const [activeTab, setActiveTab] = useState('all');
  const [sortKey, setSortKey] = useState('number');
  const [sortAsc, setSortAsc] = useState(true);

  const answeredCount = questions.filter((q) => getStatus(q) === 'Answered').length;
  const incompleteCount = questions.length - answeredCount;
  const flaggedCount = questions.filter((q) => {
    const qid = q.question?.questionId ?? q.question?.itemId ?? q.questionId;
    return flags.has(qid);
  }).length;

  function handleSort(key) {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function sortIndicator(key) {
    if (sortKey !== key) return null;
    return (
      <PremiumIcon
        name="chevron-down"
        size={11}
        color={colors.blue}
        strokeWidth={2.6}
        style={sortAsc ? null : { transform: [{ rotate: '180deg' }] }}
      />
    );
  }

  const filteredQuestions = useMemo(() => {
    let list = [...questions];
    if (activeTab === 'incomplete') {
      list = list.filter((q) => getStatus(q) !== 'Answered');
    } else if (activeTab === 'flagged') {
      list = list.filter((q) => {
        const qid = q.question?.questionId ?? q.question?.itemId ?? q.questionId;
        return flags.has(qid);
      });
    }
    list.sort((a, b) => {
      let result = 0;
      if (sortKey === 'number') {
        result = a.flatIndex - b.flatIndex;
      } else if (sortKey === 'status') {
        result = STATUS_ORDER[getStatus(a)] - STATUS_ORDER[getStatus(b)];
      } else if (sortKey === 'flagged') {
        const aId = a.question?.questionId ?? a.question?.itemId ?? a.questionId;
        const bId = b.question?.questionId ?? b.question?.itemId ?? b.questionId;
        result = (flags.has(bId) ? 1 : 0) - (flags.has(aId) ? 1 : 0);
      }
      return sortAsc ? result : -result;
    });
    return list;
  }, [questions, activeTab, sortKey, sortAsc, flags, getStatus]);

  const timerColor = isUrgent ? colors.red : colors.blue;

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerEyebrow, { color: colors.blue }]}>END OF TEST REVIEW</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <View
            style={[
              styles.timerPill,
              {
                borderColor: hexToRgba(timerColor, isDark ? 0.54 : 0.36),
                backgroundColor: hexToRgba(timerColor, isDark ? 0.15 : 0.1),
              },
            ]}
          >
            <PremiumIcon name="timer" size={15} color={timerColor} strokeWidth={2.3} />
            <Text style={[styles.timerText, { color: timerColor }]}>{timerDisplay}</Text>
          </View>
        </View>

        {/* Stat cards */}
        <View style={styles.statRow}>
          <StatCard
            label="Answered"
            value={answeredCount}
            total={questions.length}
            color={statusColors.Answered}
            isDark={isDark}
          />
          <StatCard
            label="Incomplete"
            value={incompleteCount}
            total={questions.length}
            color={statusColors.Incomplete}
            isDark={isDark}
          />
          <StatCard
            label="Flagged"
            value={flaggedCount}
            total={questions.length}
            color={colors.amber}
            isDark={isDark}
          />
        </View>

        {/* Tabs */}
        <View style={[styles.tabBar, { backgroundColor: hexToRgba(colors.blue, isDark ? 0.07 : 0.04), borderColor: colors.border }]}>
          <TabButton
            label={`All (${questions.length})`}
            active={activeTab === 'all'}
            onPress={() => setActiveTab('all')}
            colors={colors}
            isDark={isDark}
          />
          <TabButton
            label={`Incomplete (${incompleteCount})`}
            active={activeTab === 'incomplete'}
            onPress={() => setActiveTab('incomplete')}
            colors={colors}
            isDark={isDark}
          />
          <TabButton
            label={`Flagged (${flaggedCount})`}
            active={activeTab === 'flagged'}
            onPress={() => setActiveTab('flagged')}
            colors={colors}
            isDark={isDark}
          />
        </View>

        {/* Column headers */}
        <View style={[styles.tableHeader, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.colHeaderBtn, styles.colQ]} onPress={() => handleSort('number')} activeOpacity={0.7}>
            <Text style={[styles.colHeaderText, { color: sortKey === 'number' ? colors.blue : colors.textSecondary }]}>Question</Text>
            {sortIndicator('number')}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.colHeaderBtn, styles.colStatus]} onPress={() => handleSort('status')} activeOpacity={0.7}>
            <Text style={[styles.colHeaderText, { color: sortKey === 'status' ? colors.blue : colors.textSecondary }]}>Status</Text>
            {sortIndicator('status')}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.colHeaderBtn, styles.colFlag]} onPress={() => handleSort('flagged')} activeOpacity={0.7}>
            <Text style={[styles.colHeaderText, { color: sortKey === 'flagged' ? colors.blue : colors.textSecondary }]}>Flag</Text>
            {sortIndicator('flagged')}
          </TouchableOpacity>
        </View>

        {/* Rows */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator>
          {filteredQuestions.map((q, idx) => {
            const status = getStatus(q);
            const qid = q.question?.questionId ?? q.question?.itemId ?? q.questionId;
            const flagged = flags.has(qid);
            const statusColor = statusColors[status] ?? colors.text;

            return (
              <TouchableOpacity
                key={q.flatIndex}
                style={[
                  styles.row,
                  {
                    borderBottomColor: colors.border,
                    backgroundColor: idx % 2 === 0 ? 'transparent' : hexToRgba(colors.blue, isDark ? 0.04 : 0.025),
                  },
                ]}
                onPress={() => onNavigateTo(q.flatIndex)}
                activeOpacity={0.7}
              >
                <View style={[styles.cell, styles.colQ, styles.numCell]}>
                  <View style={[styles.numBadge, { borderColor: hexToRgba(colors.blue, 0.32), backgroundColor: hexToRgba(colors.blue, isDark ? 0.12 : 0.08) }]}>
                    <Text style={[styles.numBadgeText, { color: colors.blue }]}>{q.flatIndex + 1}</Text>
                  </View>
                </View>
                <View style={[styles.cell, styles.colStatus]}>
                  <View style={[styles.statusBadge, { backgroundColor: hexToRgba(statusColor, isDark ? 0.18 : 0.12), borderColor: hexToRgba(statusColor, 0.38) }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
                  </View>
                </View>
                <View style={[styles.cell, styles.colFlag]}>
                  <PremiumIcon
                    name="flag"
                    size={17}
                    color={flagged ? colors.amber : (isDark ? hexToRgba(colors.textMuted, 0.5) : hexToRgba(colors.textMuted, 0.6))}
                    strokeWidth={2.2}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
          {filteredQuestions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No questions to show</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Bottom bar */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: isDark ? 'rgba(7, 19, 39, 0.92)' : 'rgba(255, 255, 255, 0.92)',
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <View style={styles.bottomSummary}>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              {answeredCount}/{questions.length}
            </Text>
            <Text style={[styles.summarySubtext, { color: colors.textSecondary }]}>answered</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'End Exam',
                'Are you sure you want to end the exam? You will not be able to change your answers.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'End Exam', style: 'destructive', onPress: onEndTest },
                ],
              )
            }
            activeOpacity={0.86}
            style={styles.endButtonWrap}
          >
            <LinearGradient
              colors={[colors.red, hexToRgba(colors.red, 0.78)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.endButton}
            >
              <Text style={styles.endButtonText}>End Test</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </PremiumScreen>
  );
}

function StatCard({ label, value, total, color, isDark }) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: hexToRgba(color, isDark ? 0.12 : 0.08),
          borderColor: hexToRgba(color, 0.36),
        },
      ]}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
      <Text style={[styles.statTotal, { color: hexToRgba(color, 0.78) }]}>of {total}</Text>
    </View>
  );
}

function TabButton({ label, active, onPress, colors, isDark }) {
  return (
    <TouchableOpacity
      style={[
        styles.tab,
        active && {
          backgroundColor: hexToRgba(colors.blue, isDark ? 0.18 : 0.12),
          borderColor: hexToRgba(colors.blue, 0.42),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <Text
        style={[
          styles.tabText,
          { color: active ? colors.blue : colors.textSecondary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  timerPill: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  statTotal: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 14,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginHorizontal: 14,
  },
  colHeaderBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colHeaderText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  colQ: { flex: 1.6 },
  colStatus: { flex: 2.4 },
  colFlag: { flex: 1 },
  list: {
    flex: 1,
    marginHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  numCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numBadge: {
    minWidth: 36,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bottomSummary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  summarySubtext: {
    fontSize: 13,
    fontWeight: '700',
  },
  endButtonWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.18 : 0,
    shadowRadius: 10,
  },
  endButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
