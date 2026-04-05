import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, useWindowDimensions } from 'react-native';
import BarChartRenderer from './BarChartRenderer';
import LineGraphRenderer from './LineGraphRenderer';
import PieChartRenderer from './PieChartRenderer';
import ScatterPlotRenderer from './ScatterPlotRenderer';
import NetworkDiagramRenderer from './NetworkDiagramRenderer';
import GeometryDiagramRenderer from './GeometryDiagramRenderer';
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

  const context = stimulus.context;

  let content;
  switch (stimulus.type) {
    case 'bar_chart':
      content = <ChartWithExpand><BarChartRenderer data={stimulus.data} /></ChartWithExpand>; break;
    case 'line_graph':
      content = <ChartWithExpand><LineGraphRenderer data={stimulus.data} /></ChartWithExpand>; break;
    case 'pie_chart':
      content = <ChartWithExpand><PieChartRenderer data={stimulus.data} /></ChartWithExpand>; break;
    case 'scatter_plot':
      content = <ChartWithExpand><ScatterPlotRenderer data={stimulus.data} /></ChartWithExpand>; break;
    case 'network_diagram':
      content = <ChartWithExpand><NetworkDiagramRenderer data={stimulus.data} /></ChartWithExpand>; break;
    case 'geometry_diagram':
      content = <ChartWithExpand><GeometryDiagramRenderer data={stimulus.data} /></ChartWithExpand>; break;
    case 'table':
      content = <DataTable tableData={stimulus.data} />; break;
    case 'text':
      content = <Text style={[styles.text, { color: t.textSecondary }]}>{stimulus.text}</Text>; break;
    default:
      return null;
  }

  if (!context) return content;

  return (
    <View style={styles.withContext}>
      <Text style={[styles.context, { color: t.textSecondary }]}>{context}</Text>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  multi: { gap: 16 },
  withContext: { gap: 8 },
  context: { fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
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
