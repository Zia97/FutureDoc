import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, useWindowDimensions } from 'react-native';
import BarChartRenderer from './BarChartRenderer';
import LineGraphRenderer from './LineGraphRenderer';
import PieChartRenderer from './PieChartRenderer';
import DataTable from '../dm/DataTable';
import ZoomableView from '../ZoomableView';
import { useTheme } from '../../context/ThemeContext';

function ChartWithExpand({ children }) {
  const [expanded, setExpanded] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 48;
  const { practiceTheme: t } = useTheme();

  return (
    <>
      <View>
        {children}
        <TouchableOpacity
          style={styles.tapHintBtn}
          onPress={() => setExpanded(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tapHint, { color: t.accent }]}>⤢ Tap to expand</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={expanded}
        transparent
        animationType="fade"
        onRequestClose={() => setExpanded(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setExpanded(false)}
          activeOpacity={1}
        >
          <View style={[styles.modalCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            <ZoomableView maxZoom={4}>
              <View style={{ width: chartWidth }}>
                {children}
              </View>
            </ZoomableView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function QRStimulusRenderer({ stimulus }) {
  const { practiceTheme: t } = useTheme();

  if (!stimulus) return null;

  if (stimulus.type === 'multi') {
    return (
      <View style={styles.multi}>
        {stimulus.items.map((item, i) => (
          <QRStimulusRenderer key={i} stimulus={item} />
        ))}
      </View>
    );
  }

  switch (stimulus.type) {
    case 'bar_chart':
      return <ChartWithExpand><BarChartRenderer data={stimulus.data} /></ChartWithExpand>;
    case 'line_graph':
      return <ChartWithExpand><LineGraphRenderer data={stimulus.data} /></ChartWithExpand>;
    case 'pie_chart':
      return <ChartWithExpand><PieChartRenderer data={stimulus.data} /></ChartWithExpand>;
    case 'table':
      return <DataTable tableData={stimulus.data} />;
    case 'text':
      return <Text style={[styles.text, { color: t.textSecondary }]}>{stimulus.text}</Text>;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  multi: { gap: 16 },
  text: { fontSize: 14, lineHeight: 22 },
  tapHintBtn: { alignItems: 'center' },
  tapHint: { fontSize: 11, marginTop: 6, opacity: 0.7 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
});
