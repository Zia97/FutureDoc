import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const SIZE = 20;
const MID = SIZE / 2;
const R = 8;
const STROKE_W = 1.5;

function KeyShape({ shape, stroke }) {
  const props = { stroke, strokeWidth: STROKE_W, fill: 'none' };

  switch (shape) {
    case 'circle':
      return <Circle cx={MID} cy={MID} r={R} {...props} />;
    case 'square':
    case 'rectangle':
      return <Rect x={MID - R} y={MID - R} width={R * 2} height={R * 2} {...props} />;
    case 'triangle': {
      const pts = `${MID},${MID - R} ${MID - R},${MID + R} ${MID + R},${MID + R}`;
      return <Polygon points={pts} {...props} />;
    }
    case 'diamond': {
      const pts = `${MID},${MID - R} ${MID + R},${MID} ${MID},${MID + R} ${MID - R},${MID}`;
      return <Polygon points={pts} {...props} />;
    }
    case 'pentagon': {
      const pts = Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        return `${MID + R * Math.cos(angle)},${MID + R * Math.sin(angle)}`;
      }).join(' ');
      return <Polygon points={pts} {...props} />;
    }
    case 'hexagon': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        return `${MID + R * Math.cos(angle)},${MID + R * Math.sin(angle)}`;
      }).join(' ');
      return <Polygon points={pts} {...props} />;
    }
    case 'octagon': {
      const pts = Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
        return `${MID + R * Math.cos(angle)},${MID + R * Math.sin(angle)}`;
      }).join(' ');
      return <Polygon points={pts} {...props} />;
    }
    default:
      return <Circle cx={MID} cy={MID} r={R} {...props} />;
  }
}

export default function VennDiagramKey({ sets }) {
  const { practiceTheme: t } = useTheme();

  if (!sets || sets.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: t.bgCard, borderColor: t.border }]}>
      <Text style={[styles.keyLabel, { color: t.textSecondary }]}>Key</Text>
      <View style={styles.items}>
        {sets.map((s) => (
          <View key={s.id} style={styles.item}>
            <Svg width={SIZE} height={SIZE}>
              <KeyShape shape={s.shape || 'circle'} stroke={t.text} />
            </Svg>
            <Text style={[styles.itemLabel, { color: t.text }]}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  keyLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});
