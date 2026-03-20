import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function DataTable({ tableData }) {
  const { practiceTheme: t } = useTheme();
  const { headers, rows } = tableData;

  return (
    <View style={[styles.container, { borderColor: t.borderStrong }]}>
      <View style={[styles.row, { backgroundColor: t.accentDim }]}>
        {headers.map((header, colIndex) => (
          <View key={colIndex} style={[styles.cell, { borderRightColor: t.borderStrong, borderBottomColor: t.borderStrong }, colIndex === 0 && styles.firstCol]}>
            <Text style={[styles.headerText, { color: t.accent }]}>{header}</Text>
          </View>
        ))}
      </View>

      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { backgroundColor: rowIndex % 2 === 1 ? t.bgInput : t.bgCard }]}>
          {row.map((cell, colIndex) => (
            <View key={colIndex} style={[styles.cell, { borderRightColor: t.borderStrong, borderBottomColor: t.borderStrong }, colIndex === 0 && styles.firstCol]}>
              <Text style={[styles.cellText, { color: t.text }, colIndex === 0 && styles.firstColText]}>
                {cell}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstCol: {
    flex: 1.5,
    alignItems: 'flex-start',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 13,
    textAlign: 'center',
  },
  firstColText: {
    textAlign: 'left',
    fontWeight: '500',
  },
});
