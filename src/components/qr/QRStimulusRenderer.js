import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import BarChartRenderer from './BarChartRenderer';
import LineGraphRenderer from './LineGraphRenderer';
import PieChartRenderer from './PieChartRenderer';
import ScatterPlotRenderer from './ScatterPlotRenderer';
import NetworkDiagramRenderer from './NetworkDiagramRenderer';
import GeometryDiagramRenderer from './GeometryDiagramRenderer';
import DataTable from '../dm/DataTable';
import ZoomableView from '../ZoomableView';
import { useTheme } from '../../context/ThemeContext';

function ChartWithToggle({ renderChart }) {
  const [showValues, setShowValues] = useState(false);
  const { practiceTheme: t } = useTheme();
  return (
    <View>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setShowValues((v) => !v)}
          style={[styles.toggleBtn, { borderColor: showValues ? t.accent : t.border }]}
        >
          <Text style={[styles.toggleText, { color: showValues ? t.accent : t.textSecondary }]}>
            {showValues ? 'Hide values' : 'Show values'}
          </Text>
        </TouchableOpacity>
      </View>
      <ChartWithExpand>{renderChart(showValues)}</ChartWithExpand>
    </View>
  );
}

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

function FormulaText({ text, color }) {
  const parts = text.split(/\^([^\s^]+)/);
  return (
    <View style={styles.formulaRow}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <View key={i} style={styles.superscriptWrap}>
            <Text style={[styles.superscriptText, { color }]}>{part}</Text>
          </View>
        ) : (
          <Text key={i} style={[styles.formula, { color }]}>{part}</Text>
        )
      )}
    </View>
  );
}

// Returns true if a line is a formula or unit conversion that should render italic.
function isFormulaLine(line) {
  const t = line.trim();
  if (!t) return false;
  if (t.startsWith('[') && t.endsWith(']')) return true;
  if (/^Use\s+π/i.test(t)) return true;
  if (/^Compound formula:/i.test(t)) return true;
  if (/^[A-Za-z][\w\s()/%²³]+=\s/.test(t)) return true;
  return false;
}

// Lines wrapped in *...* (single asterisks) are authored markup for italic formula/conversion lines.
function stripItalicMarkers(line) {
  const t = line.trim();
  if (t.length > 2 && t.startsWith('*') && t.endsWith('*') && !t.startsWith('**')) {
    return t.slice(1, -1);
  }
  return null;
}

// Renders stem text, detecting embedded formula/conversion lines and italicising them.
function StemText({ text, color }) {
  if (!text) return null;
  const segments = text.split('\n\n');
  return (
    <View style={styles.stemBlock}>
      {segments.map((seg, si) => {
        const lines = seg.split('\n');
        return (
          <View key={si} style={si > 0 ? styles.stemPara : undefined}>
            {lines.map((line, li) => {
              const stripped = stripItalicMarkers(line);
              if (stripped !== null) {
                return <Text key={li} style={[styles.formula, { color }]}>{stripped}</Text>;
              }
              return isFormulaLine(line) ? (
                <Text key={li} style={[styles.formula, { color }]}>{line}</Text>
              ) : (
                <Text key={li} style={[styles.text, { color }]}>{line}</Text>
              );
            })}
          </View>
        );
      })}
    </View>
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
      content = <ChartWithToggle renderChart={(sv) => <BarChartRenderer data={stimulus.data} showValues={sv} />} />; break;
    case 'line_graph':
      content = <ChartWithToggle renderChart={(sv) => <LineGraphRenderer data={stimulus.data} showValues={sv} />} />; break;
    case 'pie_chart':
      content = <ChartWithExpand><PieChartRenderer data={stimulus.data} /></ChartWithExpand>; break;
    case 'scatter_plot':
      content = <ChartWithToggle renderChart={(sv) => <ScatterPlotRenderer data={stimulus.data} showValues={sv} />} />; break;
    case 'network_diagram':
      content = <ChartWithExpand><NetworkDiagramRenderer data={stimulus.data} /></ChartWithExpand>; break;
    case 'geometry_diagram':
      content = <ChartWithExpand><GeometryDiagramRenderer data={stimulus.data} /></ChartWithExpand>; break;
    case 'table':
      content = (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
          <DataTable tableData={stimulus.data} />
        </ScrollView>
      ); break;
    case 'text':
      content = <StemText text={stimulus.text} color={t.textSecondary} />; break;
    case 'formula':
      content = <FormulaText text={stimulus.text} color={t.textSecondary} />; break;
    default:
      return null;
  }

  if (!context) return content;

  return (
    <View style={styles.withContext}>
      <StemText text={context} color={t.textSecondary} />
      {stimulus.formula && (
        <FormulaText text={stimulus.formula} color={t.textSecondary} />
      )}
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  multi: { gap: 16 },
  withContext: { gap: 8 },
  stemBlock: { gap: 4 },
  stemPara: { marginTop: 6 },
  text: { fontSize: 13, lineHeight: 20 },
  formulaRow: { flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap' },
  formula: { fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  superscriptWrap: { marginBottom: 6 },
  superscriptText: { fontSize: 10, lineHeight: 12, fontStyle: 'italic' },
  toggleRow: { alignItems: 'flex-end', marginBottom: 4 },
  toggleBtn: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  toggleText: { fontSize: 11, fontWeight: '600' },
  tapHintBtn: { alignItems: 'center' },
  tapHint: { fontSize: 11, marginTop: 6, opacity: 0.7 },
  tableScroll: { width: '100%' },
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
