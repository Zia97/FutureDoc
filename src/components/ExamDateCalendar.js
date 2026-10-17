import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';
import { PremiumIcon, hexToRgba, premiumColors } from './premium/PremiumPracticeUI';
import { getPremiumTheme } from '../theme/premiumTheme';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Use local date parts so choosing a day never shifts it across time zones.
export function formatLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalISO(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return formatLocalISO(date) === value ? date : null;
}

function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function ExamDateCalendar({ selected, onSelectDay }) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const today = useMemo(() => startOfDay(new Date()), []);
  const initialMonth = selected && selected >= today ? selected : today;
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const canGoBack = viewYear > today.getFullYear()
    || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const goPrev = () => {
    if (!canGoBack) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else setViewMonth((month) => month - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else setViewMonth((month) => month + 1);
  };

  return <LinearGradient
    colors={gradients.glass}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.calendarCard, { borderColor: colors.border }]}
  >
    <View style={styles.calendarHeader}>
      <TouchableOpacity
        onPress={goPrev}
        disabled={!canGoBack}
        style={[styles.navButton, {
          borderColor: hexToRgba(colors.blue, 0.32),
          backgroundColor: isDark ? 'rgba(8, 18, 36, 0.78)' : 'rgba(255, 255, 255, 0.92)',
          opacity: canGoBack ? 1 : 0.35,
        }]}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
      >
        <PremiumIcon name="chevron-left" size={18} color={colors.text} strokeWidth={2.4} />
      </TouchableOpacity>
      <Text style={[styles.monthLabel, { color: colors.text }]}>{MONTHS[viewMonth]} {viewYear}</Text>
      <TouchableOpacity
        onPress={goNext}
        style={[styles.navButton, {
          borderColor: hexToRgba(colors.blue, 0.32),
          backgroundColor: isDark ? 'rgba(8, 18, 36, 0.78)' : 'rgba(255, 255, 255, 0.92)',
        }]}
        accessibilityRole="button"
        accessibilityLabel="Next month"
      >
        <PremiumIcon name="chevron-right" size={18} color={colors.text} strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
    <View style={styles.weekRow}>
      {WEEKDAYS.map((day, index) => <View key={`${day}-${index}`} style={styles.weekCell}>
        <Text style={[styles.weekText, { color: colors.textMuted }]}>{day}</Text>
      </View>)}
    </View>
    <View style={styles.daysGrid}>
      {grid.map((date, index) => {
        if (!date) return <View key={`b-${index}`} style={styles.dayCell} />;
        const isPast = date < today;
        const isToday = isSameDay(date, today);
        const isSelected = !!selected && isSameDay(date, selected);
        let backgroundColor = 'transparent';
        let borderColor = 'transparent';
        let textColor = colors.text;
        if (isSelected) {
          backgroundColor = colors.blue;
          textColor = '#fff';
        } else if (isToday) {
          borderColor = hexToRgba(colors.cyan, 0.7);
          textColor = colors.cyan;
        } else if (isPast) textColor = hexToRgba(colors.textMuted, 0.45);
        return <TouchableOpacity
          key={`d-${index}`}
          style={styles.dayCell}
          activeOpacity={isPast ? 1 : 0.7}
          onPress={() => onSelectDay(date)}
          disabled={isPast}
          accessibilityRole="button"
          accessibilityLabel={`Select ${formatLocalISO(date)}`}
        >
          <View style={[styles.dayInner, {
            backgroundColor,
            borderColor,
            borderWidth: borderColor === 'transparent' ? 0 : 1.5,
          }]}>
            <Text style={[styles.dayText, { color: textColor }]}>{date.getDate()}</Text>
          </View>
        </TouchableOpacity>;
      })}
    </View>
  </LinearGradient>;
}

const styles = StyleSheet.create({
  calendarCard: { borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 18 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navButton: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontSize: 16, fontWeight: '800', color: premiumColors.text },
  weekRow: { flexDirection: 'row', paddingVertical: 6 },
  weekCell: { flex: 1, alignItems: 'center' },
  weekText: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: premiumColors.textMuted },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  dayInner: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 14, fontWeight: '700' },
});
