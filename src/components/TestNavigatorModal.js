import { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const STATUS_COLOR = {
  Unseen: '#dc2626',
  Incomplete: '#ea580c',
  Answered: '#16a34a',
};

// Lower = higher priority when sorting ascending
const STATUS_ORDER = { Unseen: 0, Incomplete: 1, Answered: 2 };

export default function TestNavigatorModal({
  visible,
  questions,
  getStatus,
  flags,
  onNavigateTo,
  onClose,
}) {
  const { practiceTheme: t } = useTheme();
  const [sortKey, setSortKey] = useState('number');
  const [sortAsc, setSortAsc] = useState(true);

  const unseenCount = questions.filter((q) => getStatus(q) !== 'Answered').length;

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

  const sortedQuestions = useMemo(() => {
    const copy = [...questions];
    copy.sort((a, b) => {
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
    return copy;
  }, [questions, sortKey, sortAsc, flags, getStatus]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.panel, { backgroundColor: t.bgCard, borderColor: t.border }]}>

          {/* Header */}
          <View style={[styles.header, { backgroundColor: t.headerBg }]}>
            <Text style={styles.headerText}>
              Navigator - select a question to go to it
            </Text>
          </View>

          {/* Table column headers — tappable to sort */}
          <View style={[styles.tableHeader, { backgroundColor: t.accent, borderBottomColor: t.border }]}>
            <TouchableOpacity style={[styles.colHeaderBtn, styles.colNum]} onPress={() => handleSort('number')}>
              <Text style={styles.colHeader}>Question #{sortIndicator('number')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.colHeaderBtn, styles.colStatus]} onPress={() => handleSort('status')}>
              <Text style={styles.colHeader}>Status{sortIndicator('status')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.colHeaderBtn, styles.colFlag]} onPress={() => handleSort('flagged')}>
              <Text style={styles.colHeader}>Flagged{sortIndicator('flagged')}</Text>
            </TouchableOpacity>
          </View>

          {/* Rows */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator>
            {sortedQuestions.map((q, idx) => {
              const status = getStatus(q);
              const flagged = flags.has(q.questionId);
              const rowBg = idx % 2 === 0 ? t.bgCard : t.bgSecondary;

              return (
                <TouchableOpacity
                  key={q.questionId}
                  style={[styles.row, { backgroundColor: rowBg, borderBottomColor: t.border }]}
                  onPress={() => {
                    onNavigateTo(q.passageIndex, q.questionIndex);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cell, styles.colNum, { color: t.text }]}>
                    Question {q.globalIndex + 1}
                  </Text>
                  <Text style={[styles.cell, styles.colStatus, { color: STATUS_COLOR[status] ?? t.text }]}>
                    {status}
                  </Text>
                  <View style={[styles.cell, styles.colFlag]}>
                    <Text style={[styles.flagIcon, { color: flagged ? '#f59e0b' : t.borderStrong }]}>
                      {flagged ? '⚑' : '⚐'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: t.headerBg, borderTopColor: t.border }]}>
            <Text style={styles.footerCount}>{unseenCount} Unseen/Incomplete</Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: t.bgCard, borderColor: t.borderStrong }]}
              onPress={onClose}
            >
              <Text style={[styles.closeText, { color: t.text }]}>Close</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  panel: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  colHeaderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  colHeader: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  colNum: {
    flex: 2.5,
  },
  colStatus: {
    flex: 2,
  },
  colFlag: {
    flex: 1.5,
  },
  list: {
    maxHeight: 420,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cell: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  flagIcon: {
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  footerCount: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
  closeButton: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
