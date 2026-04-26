import { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';
import PremiumIcon from './premium/PremiumIcon';

const STATUS_ORDER = { Unseen: 0, Incomplete: 1, Answered: 2 };

export default function TestNavigatorModal({
  visible,
  questions,
  getStatus,
  flags,
  onNavigateTo,
  onClose,
}) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [sortKey, setSortKey] = useState('number');
  const [sortAsc, setSortAsc] = useState(true);

  const statusColors = {
    Unseen: colors.red,
    Incomplete: colors.amber,
    Answered: isDark ? '#34D399' : '#059669',
  };

  const answeredCount = questions.filter((q) => getStatus(q) === 'Answered').length;
  const incompleteCount = questions.filter((q) => getStatus(q) === 'Incomplete').length;
  const unseenCount = questions.filter((q) => getStatus(q) === 'Unseen').length;

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
        name={sortAsc ? 'chevron-down' : 'chevron-down'}
        size={11}
        color={colors.blue}
        strokeWidth={2.6}
        style={sortAsc ? null : { transform: [{ rotate: '180deg' }] }}
      />
    );
  }

  const sortedQuestions = useMemo(() => {
    const copy = [...questions];
    copy.sort((a, b) => {
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
    return copy;
  }, [questions, sortKey, sortAsc, flags, getStatus]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: isDark ? '#02050C' : '#F8FBFF' }]}>
        <View style={[styles.panelWrap, { shadowColor: colors.blue }]}>
          <LinearGradient
            colors={isDark
              ? ['#142646', '#0A162D', '#050C1A']
              : ['#FFFFFF', '#F4F9FF', '#E8F1FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.panel, { borderColor: hexToRgba(colors.blue, isDark ? 0.32 : 0.22) }]}
          >
            <View style={[styles.accentBar, { backgroundColor: colors.blue }]} />

            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[styles.headerEyebrow, { color: colors.blue }]}>NAVIGATOR</Text>
                <Text style={[styles.headerText, { color: colors.text }]}>Jump to question</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeIcon, { borderColor: colors.border, backgroundColor: hexToRgba(colors.blue, isDark ? 0.1 : 0.06) }]}
                accessibilityLabel="Close navigator"
                accessibilityRole="button"
                activeOpacity={0.78}
              >
                <PremiumIcon name="x" size={18} color={colors.text} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <View style={styles.statRow}>
              <StatPill label="Answered" value={answeredCount} color={statusColors.Answered} isDark={isDark} />
              <StatPill label="Incomplete" value={incompleteCount} color={statusColors.Incomplete} isDark={isDark} />
              <StatPill label="Unseen" value={unseenCount} color={statusColors.Unseen} isDark={isDark} />
            </View>

            <View style={[styles.tableHeader, { borderTopColor: colors.border, borderBottomColor: colors.border, backgroundColor: hexToRgba(colors.blue, isDark ? 0.06 : 0.04) }]}>
              <TouchableOpacity style={[styles.colHeaderBtn, styles.colNum]} onPress={() => handleSort('number')} activeOpacity={0.7}>
                <Text style={[styles.colHeader, { color: sortKey === 'number' ? colors.blue : colors.textSecondary }]}>Question</Text>
                {sortIndicator('number')}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.colHeaderBtn, styles.colStatus]} onPress={() => handleSort('status')} activeOpacity={0.7}>
                <Text style={[styles.colHeader, { color: sortKey === 'status' ? colors.blue : colors.textSecondary }]}>Status</Text>
                {sortIndicator('status')}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.colHeaderBtn, styles.colFlag]} onPress={() => handleSort('flagged')} activeOpacity={0.7}>
                <Text style={[styles.colHeader, { color: sortKey === 'flagged' ? colors.blue : colors.textSecondary }]}>Flag</Text>
                {sortIndicator('flagged')}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator>
              {sortedQuestions.map((q, idx) => {
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
                    onPress={() => {
                      onNavigateTo(q.flatIndex);
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.cell, styles.colNum, styles.numCell]}>
                      <View style={[styles.numBadge, { borderColor: hexToRgba(colors.blue, 0.32), backgroundColor: hexToRgba(colors.blue, isDark ? 0.12 : 0.08) }]}>
                        <Text style={[styles.numBadgeText, { color: colors.blue }]}>{q.flatIndex + 1}</Text>
                      </View>
                      <Text style={[styles.numLabel, { color: colors.text }]}>Question</Text>
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
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Text style={[styles.footerCount, { color: colors.textSecondary }]}>
                {answeredCount} of {questions.length} answered
              </Text>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.86}
                style={styles.closeButtonWrap}
              >
                <LinearGradient
                  colors={[colors.blue, hexToRgba(colors.blue, 0.78)]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

function StatPill({ label, value, color, isDark }) {
  return (
    <View
      style={[
        styles.statPill,
        {
          backgroundColor: hexToRgba(color, isDark ? 0.12 : 0.08),
          borderColor: hexToRgba(color, 0.36),
        },
      ]}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  panelWrap: {
    width: '100%',
    maxHeight: '88%',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: Platform.OS === 'ios' ? 0.35 : 0,
    shadowRadius: 32,
    borderRadius: 22,
  },
  panel: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentBar: {
    height: 3,
    opacity: 0.85,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 3,
  },
  headerText: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  closeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  statPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  colHeaderBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  colNum: { flex: 2.6 },
  colStatus: { flex: 2.4 },
  colFlag: { flex: 1.2 },
  list: {
    maxHeight: 380,
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
    gap: 10,
  },
  numBadge: {
    minWidth: 32,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  numLabel: {
    fontSize: 13,
    fontWeight: '700',
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  closeButtonWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButton: {
    paddingHorizontal: 22,
    paddingVertical: 9,
  },
  closeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
