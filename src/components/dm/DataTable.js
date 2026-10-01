import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';

// Two-tier sizing. Each tier is tried in order — the first one whose
// computed column widths sum to ≤ container width wins. "compact" is the
// floor; we never shrink below it, so text stays readable.
//
// charW = approximate per-character width in px at that font size/weight.
// These are slightly generous so rounding can't leave a word a pixel too wide.
const TIERS = [
  {
    name: 'default',
    headerFont: 12,
    cellFont: 13,
    headerCharW: 6.9,
    cellCharW: 6.9,
    hPad: 16,   // paddingHorizontal 8 * 2
    cushion: 6,
  },
  {
    name: 'compact',
    headerFont: 11,
    cellFont: 11,
    headerCharW: 6.1,
    cellCharW: 5.7,
    hPad: 10,   // paddingHorizontal 5 * 2
    cushion: 3,
  },
];

// Width (px) of the widest whitespace-separated token in `text`.
// Hyphens are deliberately kept inside the token — RN text layout does not
// reliably break on them, so "Semi-detached" is measured as one word.
function longestWord(text) {
  if (text == null) return '';
  let longest = '';
  for (const word of String(text).split(/\s+/)) {
    if (word.length > longest.length) longest = word;
  }
  return longest;
}

// Compute per-column min widths at a given tier, and whether they fit.
function layoutAtTier(headers, rows, tier, containerW) {
  const colMinWidths = headers.map((h, ci) => {
    const headerWord = longestWord(h);
    let wordPx = headerWord.length * tier.headerCharW;
    for (const row of rows) {
      const cellWord = longestWord(row[ci]);
      const px = cellWord.length * tier.cellCharW;
      if (px > wordPx) wordPx = px;
    }
    return Math.ceil(wordPx + tier.hPad + tier.cushion);
  });
  const totalMinW = colMinWidths.reduce((a, b) => a + b, 0);
  return { colMinWidths, totalMinW, fits: totalMinW <= containerW };
}

export default function DataTable({ tableData }) {
  const { practiceTheme: t } = useTheme();
  const { svgMultiplier } = useTextSize();
  const { headers, rows } = tableData;
  const { width: screenWidth } = useWindowDimensions();
  const targetW = screenWidth - 48;

  // Scale tier font sizes and character widths together so layout math stays consistent.
  const scaledTiers = TIERS.map((tt) => ({
    ...tt,
    headerFont: Math.round(tt.headerFont * svgMultiplier),
    cellFont: Math.round(tt.cellFont * svgMultiplier),
    headerCharW: tt.headerCharW * svgMultiplier,
    cellCharW: tt.cellCharW * svgMultiplier,
  }));

  // Pick the first tier whose natural widths fit. If none fit, use compact as floor.
  let tier, layout;
  for (const candidate of scaledTiers) {
    layout = layoutAtTier(headers, rows, candidate, targetW);
    tier = candidate;
    if (layout.fits) break;
  }

  // When content fits, distribute leftover space so the table fills targetW.
  // When it doesn't fit, use min widths and let the parent ScrollView handle overflow.
  let colWidths = layout.colMinWidths;
  let tableWidth = layout.totalMinW;
  if (layout.fits && layout.totalMinW > 0) {
    const extra = targetW - layout.totalMinW;
    colWidths = layout.colMinWidths.map(
      (w) => w + Math.floor((extra * w) / layout.totalMinW)
    );
    const used = colWidths.reduce((a, b) => a + b, 0);
    colWidths[colWidths.length - 1] += targetW - used;
    tableWidth = targetW;
  }

  const cellPadH = tier.hPad / 2;

  const renderRow = (cells, key, isHeader, bg) => (
    <View key={key} style={[styles.row, { backgroundColor: bg, width: tableWidth }]}>
      {cells.map((cell, ci) => {
        const isFirst = ci === 0;
        return (
          <View
            key={ci}
            style={[
              styles.cell,
              {
                width: colWidths[ci],
                paddingHorizontal: cellPadH,
                borderRightColor: t.borderStrong,
                borderBottomColor: t.borderStrong,
              },
              isFirst && styles.firstCol,
            ]}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontSize: isHeader ? tier.headerFont : tier.cellFont,
                fontWeight: isHeader ? '700' : isFirst ? '500' : '400',
                color: isHeader ? t.accent : t.text,
                textAlign: isFirst && !isHeader ? 'left' : 'center',
              }}
            >
              {cell}
            </Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { borderColor: t.borderStrong, width: tableWidth }]}>
      {renderRow(headers, 'header', true, t.accentDim)}
      {rows.map((row, ri) =>
        renderRow(row, ri, false, ri % 2 === 1 ? t.bgInput : t.bgCard)
      )}
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
    paddingVertical: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstCol: {
    alignItems: 'flex-start',
  },
});
