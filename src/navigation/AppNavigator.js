import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PracticeSectionsScreen from '../screens/PracticeSectionsScreen';
import VRQuestionListScreen from '../screens/VRQuestionListScreen';
import VRPassageScreen from '../screens/VRPassageScreen';
import SJScenarioListScreen from '../screens/SJScenarioListScreen';
import SJScenarioScreen from '../screens/SJScenarioScreen';
import DMQuestionListScreen from '../screens/DMQuestionListScreen';
import DMQuestionScreen from '../screens/DMQuestionScreen';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
