import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';

export default function SupportUnreadBadge({ count, dot = false, floating = false, style }) {
  const { colors } = getPremiumTheme(useTheme().isDark);
  if (!count || count < 1) return null;
  return <View pointerEvents="none" accessible accessibilityLabel={`${count} unread support ${count === 1 ? 'ticket' : 'tickets'}`}
    accessibilityLiveRegion="polite"
    style={[styles.badge, dot && styles.dot, floating && styles.floating,
      floating && { borderWidth: 2, borderColor: colors.bgTop }, style]}>
    {!dot && <Text style={styles.count}>{count > 99 ? '99+' : count}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  badge: { minWidth: 22, minHeight: 22, paddingHorizontal: 6, borderRadius: 12,
    backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  count: { color: '#FFFFFF', fontSize: 12, lineHeight: 18, fontWeight: '800' },
  dot: { width: 12, height: 12, minWidth: 12, minHeight: 12, paddingHorizontal: 0, borderRadius: 6 },
  floating: { position: 'absolute', top: -2, right: -2 },
});
