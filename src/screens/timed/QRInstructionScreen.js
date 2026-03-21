import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const INSTRUCTION_SECONDS = 120;

export default function QRInstructionScreen({ navigation, route }) {
  const { test, section, title } = route.params;
  const { theme: t } = useTheme();
  const insets = useSafeAreaInsets();
  const [secondsLeft, setSecondsLeft] = useState(INSTRUCTION_SECONDS);
  const timerRef = useRef(null);

  const startTest = () => {
    clearInterval(timerRef.current);
    navigation.replace('TimedQRTest', { test, section, title });
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          navigation.replace('TimedQRTest', { test, section, title });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timerLabel = `${mins}:${secs.toString().padStart(2, '0')}`;
  const isUrgent = secondsLeft <= 30;

  return (
    <View style={[styles.container, { backgroundColor: t.bgInput }]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.headerBg} />

      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: t.headerBg }]}>
        <Text style={styles.headerTitle}>Quantitative Reasoning</Text>
        <View style={[styles.timerBadge, { backgroundColor: isUrgent ? '#dc2626' : '#1d4ed8' }]}>
          <Text style={styles.timerText}>{timerLabel}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.readNotice, { color: t.textSecondary }]}>
          You have 2 minutes to read this screen.
        </Text>

        <Text style={[styles.sectionTitle, { color: t.text }]}>
          QUANTITATIVE REASONING INSTRUCTIONS
        </Text>

        {/* Table */}
        <View style={[styles.table, { borderColor: t.border }]}>

          {/* Header row */}
          <View style={[styles.tableRow, { borderBottomColor: t.border, backgroundColor: t.accentDim }]}>
            <View style={[styles.headerCell, { flex: 3, borderRightColor: t.border }]}>
              <Text style={[styles.tableHeader, { color: t.text }]}>Subtest</Text>
            </View>
            <View style={[styles.headerCell, { flex: 2, borderRightColor: t.border }]}>
              <Text style={[styles.tableHeader, { color: t.text }]}>Questions</Text>
            </View>
            <View style={[styles.headerCell, { flex: 4 }]}>
              <Text style={[styles.tableHeader, { color: t.text }]}>Time</Text>
            </View>
          </View>

          {/* Data row */}
          <View style={[styles.tableRow, { borderBottomWidth: 0, backgroundColor: t.bgCard }]}>
            <View style={[styles.dataCell, { flex: 3, borderRightColor: t.border }]}>
              <Text style={[styles.dataCellText, { color: t.text, fontWeight: '700' }]}>Quantitative Reasoning</Text>
            </View>
            <View style={[styles.dataCell, { flex: 2, borderRightColor: t.border }]}>
              <Text style={[styles.dataCellText, { color: t.text, textAlign: 'center', fontWeight: '600' }]}>36</Text>
            </View>
            <View style={[styles.dataCell, { flex: 4 }]}>
              <Text style={[styles.dataCellText, { color: t.text }]}>26 minutes</Text>
              <Text style={[styles.dataCellLabel, { color: t.textSecondary }]}>UCAT</Text>
              <View style={[styles.timeDivider, { borderTopColor: t.border }]} />
              <Text style={[styles.dataCellText, { color: t.text }]}>32 mins 30 secs</Text>
              <Text style={[styles.dataCellLabel, { color: t.textSecondary }]}>UCAT +25%</Text>
            </View>
          </View>

        </View>

        <Text style={[styles.bodyText, { color: t.text }]}>
          For each question you may only select one response.
        </Text>

        <Text style={[styles.bodyText, { color: t.text }]}>
          Answer every question — there is no penalty for an incorrect answer. Any unanswered question will be marked as wrong.
        </Text>

        <Text style={[styles.bodyText, { color: t.text }]}>
          A calculator is available during this subtest. Tap the calculator icon at the top of the screen to open it.
        </Text>

        <Text style={[styles.bodyText, { color: t.text }]}>
          You may find it helpful to use a pen and paper for rough working. Have these ready before you begin.
        </Text>

        <Text style={[styles.bodyText, { color: t.text }]}>
          The <Text style={{ fontWeight: '700' }}>'Navigator'</Text> at the bottom of the screen lets you jump to any question within the test.
        </Text>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.footer, { backgroundColor: t.bgCard, borderTopColor: t.border, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: t.accent }]}
          onPress={startTest}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>Start Test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  timerBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  content: {
    padding: 22,
    paddingBottom: 12,
    gap: 18,
  },
  readNotice: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tableHeader: {
    fontSize: 13,
    fontWeight: '700',
    padding: 10,
    textAlign: 'center',
  },
  headerCell: {
    borderRightWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataCell: {
    borderRightWidth: 1,
    padding: 10,
    justifyContent: 'center',
  },
  dataCellText: {
    fontSize: 13,
  },
  dataCellLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  timeDivider: {
    borderTopWidth: 1,
    marginVertical: 6,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  startButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
