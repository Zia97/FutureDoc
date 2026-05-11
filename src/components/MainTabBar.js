import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationState } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';

const TABS = [
  { name: 'Home', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { name: 'PracticeSections', label: 'Practice', icon: 'book', iconOutline: 'book-outline' },
  { name: 'TimedTestList', label: 'Timed', icon: 'timer', iconOutline: 'timer-outline' },
  { name: 'PerformanceAnalytics', label: 'Analytics', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
  { name: 'Profile', label: 'Profile', icon: 'person', iconOutline: 'person-outline' },
];

const BAR_CONTENT_HEIGHT = 56;
const TOP_PAD = 6;
const ANDROID_MIN_BOTTOM_PAD = 8;
const IOS_MIN_BOTTOM_PAD = 6;

// Renders a static visual copy of MainTabs' bar for screens that live outside the
// tab navigator. Tapping a tab resets to MainTabs > <tab>. Keep style in sync
// with src/navigation/MainTabs.js.
export default function MainTabBar({ navigation, activeTab }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const insets = useSafeAreaInsets();

  // Detect current tab inside MainTabs when no explicit activeTab prop is given.
  const detectedTab = useNavigationState((state) => {
    if (!state) return null;
    const mainTabsRoute = state.routes.find((r) => r.name === 'MainTabs');
    if (!mainTabsRoute?.state) return null;
    const idx = mainTabsRoute.state.index ?? 0;
    return mainTabsRoute.state.routeNames?.[idx] ?? null;
  });
  const current = activeTab ?? detectedTab;

  const bottomPad = Math.max(
    insets.bottom,
    Platform.OS === 'ios' ? IOS_MIN_BOTTOM_PAD : ANDROID_MIN_BOTTOM_PAD,
  );

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: isDark ? 'rgba(7, 19, 39, 0.96)' : 'rgba(255, 255, 255, 0.96)',
          borderTopColor: hexToRgba(colors.blue, isDark ? 0.18 : 0.16),
          paddingTop: TOP_PAD,
          paddingBottom: bottomPad,
          height: BAR_CONTENT_HEIGHT + bottomPad,
        },
      ]}
    >
      {TABS.map((tab) => {
        const focused = tab.name === current;
        const color = focused ? colors.blue : colors.textMuted;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.item}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MainTabs', { screen: tab.name })}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            <Ionicons name={focused ? tab.icon : tab.iconOutline} size={22} color={color} />
            <Text style={[styles.label, { color }]} numberOfLines={1}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
