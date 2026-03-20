import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

import HomeScreen from '../screens/menus/HomeScreen';
import PracticeSectionsScreen from '../screens/menus/PracticeSectionsScreen';
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

const screenOptions = {
  headerStyle: { backgroundColor: '#16213e' },
  headerTintColor: '#ffffff',
  headerTitleStyle: { fontWeight: '700' },
  headerBackTitle: 'Back',
  animation: 'slide_from_right',
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PracticeSections" component={PracticeSectionsScreen} options={{ title: 'Practice' }} />
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

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#16213e', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4a9eff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
