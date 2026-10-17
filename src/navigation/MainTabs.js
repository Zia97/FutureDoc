import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import PracticeSectionsScreen from '../screens/practice/PracticeSectionsScreen';
import TimedTestListScreen from '../screens/timed/TimedTestListScreen';
import TimedPracticeSectionsScreen from '../screens/practice/TimedPracticeSectionsScreen';
import PerformanceAnalyticsScreen from '../screens/timed/PerformanceAnalyticsScreen';
import ForumScreen from '../screens/forum/ForumScreen';
import CoachHubScreen from '../screens/coaching/CoachHubScreen';
import MainTabBar from '../components/MainTabBar';

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
  { name: 'Coaching', component: CoachHubScreen, label: 'Coaching', icon: 'school', iconOutline: 'school-outline' },
  { name: 'PerformanceAnalytics', component: PerformanceAnalyticsScreen, label: 'Performance', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
  { name: 'Community', component: ForumScreen, label: 'Community', icon: 'people', iconOutline: 'people-outline' },
  { name: 'TimedTestList', component: TimedTabScreen, hidden: true },
];

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        ...(TABS.find((tab) => tab.name === route.name)?.hidden ? { tabBarButton: () => null } : {}),
      })}
      tabBar={({ navigation, state }) => (
        <MainTabBar
          navigation={navigation}
          activeTab={state.routes[state.index]?.name}
          onSelectTab={(name) => navigation.navigate(name)}
        />
      )}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}
