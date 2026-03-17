import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#16213e' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
          headerBackTitle: 'Back',
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PracticeSections"
          component={PracticeSectionsScreen}
          options={{ title: 'Practice' }}
        />
        <Stack.Screen
          name="VRQuestionList"
          component={VRQuestionListScreen}
          options={{ title: 'Verbal Reasoning' }}
        />
        <Stack.Screen
          name="VRPassage"
          component={VRPassageScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SJScenarioList"
          component={SJScenarioListScreen}
          options={{ title: 'Situational Judgement' }}
        />
        <Stack.Screen
          name="SJScenario"
          component={SJScenarioScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DMQuestionList"
          component={DMQuestionListScreen}
          options={{ title: 'Decision Making' }}
        />
        <Stack.Screen
          name="DMQuestion"
          component={DMQuestionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QRQuestionList"
          component={QRQuestionListScreen}
          options={{ title: 'Quantitative Reasoning' }}
        />
        <Stack.Screen
          name="QRQuestion"
          component={QRQuestionScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
