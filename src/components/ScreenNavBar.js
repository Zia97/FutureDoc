import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ScreenNavBar({ title, meta, onPrev, onNext, isFirst, isLast, color, onCalculator }) {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navButton} onPress={onPrev} disabled={isFirst}>
        <Text style={[styles.navArrow, { color }, isFirst && styles.disabled]}>‹</Text>
      </TouchableOpacity>

      <View style={styles.navCenter}>
        <Text style={styles.navTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.navMeta}>{meta}</Text>
      </View>

      {onCalculator && (
        <TouchableOpacity style={styles.navButton} onPress={onCalculator}>
          <Text style={[styles.calcIcon, { color }]}>⊞</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.navButton} onPress={onNext} disabled={isLast}>
        <Text style={[styles.navArrow, { color }, isLast && styles.disabled]}>›</Text>
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
    borderBottomColor: '#16213e',
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
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  navMeta: {
    color: '#a0aec0',
    fontSize: 12,
    marginTop: 2,
  },
  calcIcon: {
    fontSize: 22,
    lineHeight: 26,
  },
  disabled: {
    color: '#2d3748',
  },
});
