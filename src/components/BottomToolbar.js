import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';
import PremiumIcon from './premium/PremiumIcon';

export default function BottomToolbar({ onNotes, onCalculator, onPause, onNavigator, onBookmark, isBookmarked, sectionColor }) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const accent = sectionColor ?? colors.blue;
  const iconColor = isDark ? '#FFFFFF' : '#0F172A';

  const actions = [
    onPause ? { key: 'pause', icon: 'pause', onPress: onPause, label: 'Pause test' } : null,
    onBookmark ? {
      key: 'bookmark',
      icon: isBookmarked ? 'bookmark-filled' : 'bookmark',
      onPress: onBookmark,
      label: isBookmarked ? 'Remove bookmark' : 'Bookmark question',
      iconColorOverride: isBookmarked ? accent : undefined,
    } : null,
    onNotes ? { key: 'notes', icon: 'notes', onPress: onNotes, label: 'Open notes' } : null,
    onCalculator ? { key: 'calculator', icon: 'calculator', onPress: onCalculator, label: 'Open calculator' } : null,
    onNavigator ? { key: 'navigator', icon: 'list', onPress: onNavigator, label: 'Open question navigator' } : null,
  ].filter(Boolean);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: isDark ? 'rgba(7, 19, 39, 0.86)' : 'rgba(255, 255, 255, 0.88)',
            borderColor: colors.border,
          },
        ]}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={[
              styles.button,
              {
                borderColor: hexToRgba(accent, 0.34),
                backgroundColor: hexToRgba(accent, isDark ? 0.12 : 0.08),
              },
            ]}
            onPress={action.onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <PremiumIcon name={action.icon} size={21} color={action.iconColorOverride ?? iconColor} strokeWidth={2.2} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  bar: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 12,
    gap: 10,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
