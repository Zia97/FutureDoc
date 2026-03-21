import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

import HomeScreen from '../screens/menus/HomeScreen';
import PracticeModeScreen from '../screens/menus/PracticeModeScreen';
import PracticeSectionsScreen from '../screens/menus/PracticeSectionsScreen';
import TimedPracticeSectionsScreen from '../screens/menus/TimedPracticeSectionsScreen';
import TimedTestListScreen from '../screens/timed/TimedTestListScreen';
import VRInstructionScreen from '../screens/timed/VRInstructionScreen';
import DMInstructionScreen from '../screens/timed/DMInstructionScreen';
import QRInstructionScreen from '../screens/timed/QRInstructionScreen';
import SJInstructionScreen from '../screens/timed/SJInstructionScreen';
import VRQuestionListScreen from '../screens/vr/VRQuestionListScreen';
import VRPassageScreen from '../screens/vr/VRPassageScreen';
import SJScenarioListScreen from '../screens/sj/SJScenarioListScreen';
import SJScenarioScreen from '../screens/sj/SJScenarioScreen';
import DMQuestionListScreen from '../screens/dm/DMQuestionListScreen';
import DMQuestionScreen from '../screens/dm/DMQuestionScreen';
import QRQuestionListScreen from '../screens/qr/QRQuestionListScreen';
import QRQuestionScreen from '../screens/qr/QRQuestionScreen';
import ProfileScreen from '../screens/menus/ProfileScreen';
import AboutUCATScreen from '../screens/menus/AboutUCATScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  const { theme: t } = useTheme();

  const screenOptions = {
    headerStyle: { backgroundColor: t.headerBg },
    headerTintColor: '#ffffff',
    headerTitleStyle: { fontWeight: '700' },
    headerBackTitle: 'Back',
    animation: 'slide_from_right',
  };

  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PracticeMode" component={PracticeModeScreen} options={{ title: 'Practice' }} />
      <Stack.Screen name="PracticeSections" component={PracticeSectionsScreen} options={{ title: 'Normal Practice' }} />
      <Stack.Screen name="TimedPracticeSections" component={TimedPracticeSectionsScreen} options={{ title: 'Timed Practice' }} />
      <Stack.Screen name="TimedTestList" component={TimedTestListScreen} options={({ route }) => ({ title: route.params?.title ?? 'Timed Tests' })} />
      <Stack.Screen name="VRInstruction" component={VRInstructionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DMInstruction" component={DMInstructionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="QRInstruction" component={QRInstructionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SJInstruction" component={SJInstructionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VRQuestionList" component={VRQuestionListScreen} options={{ title: 'Verbal Reasoning' }} />
      <Stack.Screen name="VRPassage" component={VRPassageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SJScenarioList" component={SJScenarioListScreen} options={{ title: 'Situational Judgement' }} />
      <Stack.Screen name="SJScenario" component={SJScenarioScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DMQuestionList" component={DMQuestionListScreen} options={{ title: 'Decision Making' }} />
      <Stack.Screen name="DMQuestion" component={DMQuestionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="QRQuestionList" component={QRQuestionListScreen} options={{ title: 'Quantitative Reasoning' }} />
      <Stack.Screen name="QRQuestion" component={QRQuestionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="AboutUCAT" component={AboutUCATScreen} options={{ title: 'About the UCAT' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme: t } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.headerBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
