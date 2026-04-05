import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ScreenNavBar({ title, meta, onPrev, onNext, isFirst, isLast, color }) {
  const { practiceTheme: t } = useTheme();

  return (
    <View style={[styles.navBar, { backgroundColor: t.headerBg, borderBottomColor: t.border }]}>
      <TouchableOpacity style={styles.navButton} onPress={onPrev} disabled={isFirst}>
        <Text style={[styles.navArrow, { color: isFirst ? t.borderStrong : (color || '#ffffff') }]}>‹</Text>
      </TouchableOpacity>

      <View style={styles.navCenter}>
        <Text style={[styles.navTitle, { color: '#ffffff' }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.navMeta, { color: 'rgba(255,255,255,0.65)' }]}>{meta}</Text>
      </View>

      <TouchableOpacity style={styles.navButton} onPress={onNext} disabled={isLast}>
        <Text style={[styles.navArrow, { color: isLast ? t.borderStrong : (color || '#ffffff') }]}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: 32,
    lineHeight: 36,
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  navMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
