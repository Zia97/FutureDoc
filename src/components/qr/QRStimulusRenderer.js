import { View, Text, StyleSheet } from 'react-native';
import BarChartRenderer from './BarChartRenderer';
import LineGraphRenderer from './LineGraphRenderer';
import PieChartRenderer from './PieChartRenderer';
import DataTable from '../dm/DataTable';

export default function QRStimulusRenderer({ stimulus }) {
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
      return <BarChartRenderer data={stimulus.data} />;
    case 'line_graph':
      return <LineGraphRenderer data={stimulus.data} />;
    case 'pie_chart':
      return <PieChartRenderer data={stimulus.data} />;
    case 'table':
      return <DataTable tableData={stimulus.data} />;
    case 'text':
      return <Text style={styles.text}>{stimulus.text}</Text>;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  multi: {
    gap: 16,
  },
  text: {
    color: '#cbd5e0',
    fontSize: 14,
    lineHeight: 22,
  },
});
