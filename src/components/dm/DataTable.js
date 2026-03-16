import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DataTable({ tableData }) {
  const { headers, rows } = tableData;

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={[styles.row, styles.headerRow]}>
        {headers.map((header, colIndex) => (
          <View
            key={colIndex}
            style={[styles.cell, colIndex === 0 && styles.firstCol]}
          >
            <Text style={styles.headerText}>{header}</Text>
          </View>
        ))}
      </View>

      {/* Data rows */}
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[styles.row, rowIndex % 2 === 1 && styles.altRow]}
        >
          {row.map((cell, colIndex) => (
            <View
              key={colIndex}
              style={[styles.cell, colIndex === 0 && styles.firstCol]}
            >
              <Text
                style={[
                  styles.cellText,
                  colIndex === 0 && styles.firstColText,
                ]}
              >
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
    borderColor: '#2d3748',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
  },
  headerRow: {
    backgroundColor: '#1e3a5f',
  },
  altRow: {
    backgroundColor: '#1a2035',
  },
  cell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#2d3748',
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstCol: {
    flex: 1.5,
    alignItems: 'flex-start',
  },
  headerText: {
    color: '#90cdf4',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  cellText: {
    color: '#e2e8f0',
    fontSize: 13,
    textAlign: 'center',
  },
  firstColText: {
    textAlign: 'left',
    fontWeight: '500',
  },
});
