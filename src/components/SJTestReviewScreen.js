import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const STATUS_ORDER = { Unseen: 0, Incomplete: 1, Answered: 2 };

export default function SJTestReviewScreen({
  questions,
  getStatus,
  flags,
  onNavigateTo,
  onEndTest,
  timerDisplay,
  isUrgent,
}) {
  const { practiceTheme: t } = useTheme();
  const insets = useSafeAreaInsets();

  const statusColor = {
    Unseen: t.danger,
    Incomplete: '#ea580c',
    Answered: t.correct,
  };

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'incomplete'
  const [sortKey, setSortKey] = useState('number');
  const [sortAsc, setSortAsc] = useState(true);

  const answeredCount = questions.filter((q) => getStatus(q) === 'Answered').length;
  const incompleteCount = questions.length - answeredCount;

  function handleSort(key) {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function sortIndicator(key) {
    if (sortKey !== key) return ' ⇅';
    return sortAsc ? ' ▲' : ' ▼';
  }

  const filteredQuestions = useMemo(() => {
    let list = [...questions];
    if (activeTab === 'incomplete') {
      list = list.filter((q) => getStatus(q) !== 'Answered');
    }
    list.sort((a, b) => {
      let result = 0;
      if (sortKey === 'number') {
        result = a.globalIndex - b.globalIndex;
      } else if (sortKey === 'status') {
        result = STATUS_ORDER[getStatus(a)] - STATUS_ORDER[getStatus(b)];
      } else if (sortKey === 'flagged') {
        result = (flags.has(b.questionId) ? 1 : 0) - (flags.has(a.questionId) ? 1 : 0);
      }
      return sortAsc ? result : -result;
    });
    return list;
  }, [questions, activeTab, sortKey, sortAsc, flags, getStatus]);

  function getScenarioTitle(q) {
    return `Scenario ${q.passageIndex + 1}`;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={t.headerBg} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.headerBg }]}>
        <Text style={styles.headerTitle}>Situational Judgement — Review</Text>
        <View style={[styles.timerBadge, { backgroundColor: isUrgent ? t.danger : t.accent }]}>
          <Text style={styles.timerText}>{timerDisplay}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All ({questions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'incomplete' && styles.tabActive]}
          onPress={() => setActiveTab('incomplete')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'incomplete' && styles.tabTextActive]}>
            Incomplete ({incompleteCount})
          </Text>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Column headers */}
      <View style={[styles.tableHeader, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
        <TouchableOpacity style={[styles.colHeaderBtn, styles.colQ]} onPress={() => handleSort('number')}>
          <Text style={styles.colHeaderText}>QUESTION{sortIndicator('number')}</Text>
        </TouchableOpacity>
        <View style={[styles.colHeaderBtn, styles.colTitle]}>
          <Text style={styles.colHeaderText}>TITLE</Text>
        </View>
        <TouchableOpacity style={[styles.colHeaderBtn, styles.colStatus]} onPress={() => handleSort('status')}>
          <Text style={styles.colHeaderText}>STATUS{sortIndicator('status')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.colHeaderBtn, styles.colFlag]} onPress={() => handleSort('flagged')}>
          <Text style={styles.colHeaderText}>FLAGGED{sortIndicator('flagged')}</Text>
        </TouchableOpacity>
      </View>

      {/* Rows */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredQuestions.map((q, idx) => {
          const status = getStatus(q);
          const flagged = flags.has(q.questionId);
          const rowBg = idx % 2 === 0 ? t.bgCard : t.bgSecondary ?? t.bg;

          return (
            <TouchableOpacity
              key={q.questionId}
              style={[styles.row, { backgroundColor: rowBg, borderBottomColor: t.border }]}
              onPress={() => onNavigateTo(q.passageIndex, q.questionIndex)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cell, styles.colQ, { color: t.text }]}>
                {q.globalIndex + 1}
              </Text>
              <Text style={[styles.cell, styles.colTitle, { color: t.textSecondary }]} numberOfLines={1}>
                {getScenarioTitle(q)}
              </Text>
              <Text style={[styles.cell, styles.colStatus, { color: statusColor[status] ?? t.text, fontWeight: '700' }]}>
                {status}
              </Text>
              <Text style={[styles.cell, styles.colFlag, { color: t.textSecondary }]}>
                {flagged ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom bar — End Test */}
      <View style={[styles.bottomBar, { backgroundColor: t.bgCard, borderTopColor: t.border, paddingBottom: insets.bottom + 8 }]}>
        <Text style={[styles.summaryText, { color: t.textSecondary }]}>
          {answeredCount} of {questions.length} answered
        </Text>
        <TouchableOpacity
          style={[styles.endButton, { backgroundColor: t.danger }]}
          onPress={onEndTest}
          activeOpacity={0.85}
        >
          <Text style={styles.endButtonText}>End Test</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  timerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  timerText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#ffffff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  infoIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  colHeaderBtn: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  colHeaderText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  colQ: { flex: 1.8 },
  colTitle: { flex: 2 },
  colStatus: { flex: 2.5 },
  colFlag: { flex: 2 },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  cell: {
    paddingVertical: 11,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  endButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  endButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
