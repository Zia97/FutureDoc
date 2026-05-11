import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';

import HomeScreen from '../screens/home/HomeScreen';
import PracticeSectionsScreen from '../screens/practice/PracticeSectionsScreen';
import TimedTestListScreen from '../screens/timed/TimedTestListScreen';
import TimedPracticeSectionsScreen from '../screens/practice/TimedPracticeSectionsScreen';
import PerformanceAnalyticsScreen from '../screens/timed/PerformanceAnalyticsScreen';
import ProfileScreen from '../screens/home/ProfileScreen';

const Tab = createBottomTabNavigator();

function TimedTabScreen({ navigation, route }) {
  if (route.params?.section) {
    return <TimedTestListScreen navigation={navigation} route={route} />;
  }
  return <TimedPracticeSectionsScreen navigation={navigation} route={route} />;
}

const TABS = [
  { name: 'Home', component: HomeScreen, label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { name: 'PracticeSections', component: PracticeSectionsScreen, label: 'Practice', icon: 'book', iconOutline: 'book-outline' },
  { name: 'TimedTestList', component: TimedTabScreen, label: 'Timed', icon: 'timer', iconOutline: 'timer-outline' },
  { name: 'PerformanceAnalytics', component: PerformanceAnalyticsScreen, label: 'Analytics', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
  { name: 'Profile', component: ProfileScreen, label: 'Profile', icon: 'person', iconOutline: 'person-outline' },
];

const BAR_CONTENT_HEIGHT = 56;
const TOP_PAD = 6;
const ANDROID_MIN_BOTTOM_PAD = 8;
const IOS_MIN_BOTTOM_PAD = 6;

export default function MainTabs() {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const insets = useSafeAreaInsets();

  const bottomPad = Math.max(
    insets.bottom,
    Platform.OS === 'ios' ? IOS_MIN_BOTTOM_PAD : ANDROID_MIN_BOTTOM_PAD,
  );
  const barHeight = BAR_CONTENT_HEIGHT + bottomPad;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find((tt) => tt.name === route.name);
        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.blue,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: isDark ? 'rgba(7, 19, 39, 0.96)' : 'rgba(255, 255, 255, 0.96)',
            borderTopColor: hexToRgba(colors.blue, isDark ? 0.18 : 0.16),
            borderTopWidth: 0.5,
            height: barHeight,
            paddingTop: TOP_PAD,
            paddingBottom: bottomPad,
            paddingHorizontal: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? tab.icon : tab.iconOutline} size={22} color={color} />
          ),
          tabBarLabel: tab.label,
        };
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}
