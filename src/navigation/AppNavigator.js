import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useContentVersionCheck } from '../services/contentUpdateService';
import { useTimedExamSyncOnForeground } from '../hooks/useTimedExamSyncOnForeground';

import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import ToSAcceptanceScreen, { TOS_FLAG_KEY } from '../screens/onboarding/ToSAcceptanceScreen';
import HeaderAuthButton from '../components/HeaderAuthButton';

import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/home/ProfileScreen';
import AboutUCATScreen from '../screens/home/AboutUCATScreen';
import PaywallScreen from '../screens/home/PaywallScreen';
import PrivacyPolicyScreen from '../screens/home/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/home/TermsOfServiceScreen';
import PracticeModeScreen from '../screens/practice/PracticeModeScreen';
import PracticeSectionsScreen from '../screens/practice/PracticeSectionsScreen';
import TimedPracticeSectionsScreen from '../screens/practice/TimedPracticeSectionsScreen';
import TimedTestListScreen from '../screens/timed/TimedTestListScreen';
import VRInstructionScreen from '../screens/timed/VRInstructionScreen';
import TimedVRTestScreen from '../screens/timed/TimedVRTestScreen';
import TimedDMTestScreen from '../screens/timed/TimedDMTestScreen';
import DMInstructionScreen from '../screens/timed/DMInstructionScreen';
import QRInstructionScreen from '../screens/timed/QRInstructionScreen';
import TimedQRTestScreen from '../screens/timed/TimedQRTestScreen';
import SJInstructionScreen from '../screens/timed/SJInstructionScreen';
import TimedSJTestScreen from '../screens/timed/TimedSJTestScreen';
import TimedSJTestReviewScreen from '../screens/timed/TimedSJTestReviewScreen';
import TimedVRTestReviewScreen from '../screens/timed/TimedVRTestReviewScreen';
import TimedDMTestReviewScreen from '../screens/timed/TimedDMTestReviewScreen';
import TimedQRTestReviewScreen from '../screens/timed/TimedQRTestReviewScreen';
import VRAnalyticsScreen from '../screens/timed/VRAnalyticsScreen';
import QRAnalyticsScreen from '../screens/timed/QRAnalyticsScreen';
import DMAnalyticsScreen from '../screens/timed/DMAnalyticsScreen';
import SJAnalyticsScreen from '../screens/timed/SJAnalyticsScreen';
import PerformanceAnalyticsScreen from '../screens/timed/PerformanceAnalyticsScreen';
import VRQuestionListScreen from '../screens/vr/VRQuestionListScreen';
import VRPassageScreen from '../screens/vr/VRPassageScreen';
import SJScenarioListScreen from '../screens/sj/SJScenarioListScreen';
import SJScenarioScreen from '../screens/sj/SJScenarioScreen';
import DMQuestionListScreen from '../screens/dm/DMQuestionListScreen';
import DMQuestionScreen from '../screens/dm/DMQuestionScreen';
import QRQuestionListScreen from '../screens/qr/QRQuestionListScreen';
import QRQuestionScreen from '../screens/qr/QRQuestionScreen';

const Stack = createNativeStackNavigator();

function AppStack() {
  const { theme: t } = useTheme();
  useContentVersionCheck();
  useTimedExamSyncOnForeground();

  const screenOptions = {
    headerStyle: { backgroundColor: t.headerBg },
    headerTintColor: '#ffffff',
    headerTitleStyle: { fontWeight: '700' },
    headerBackTitle: 'Back',
    animation: 'slide_from_right',
    headerRight: () => <HeaderAuthButton />,
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
      <Stack.Screen name="TimedVRTest" component={TimedVRTestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TimedDMTest" component={TimedDMTestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TimedQRTest" component={TimedQRTestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TimedSJTest" component={TimedSJTestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TimedSJTestReview" component={TimedSJTestReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TimedVRTestReview" component={TimedVRTestReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TimedDMTestReview" component={TimedDMTestReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TimedQRTestReview" component={TimedQRTestReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PerformanceAnalytics" component={PerformanceAnalyticsScreen} options={{ title: 'Performance Analytics' }} />
      <Stack.Screen name="VRAnalytics" component={VRAnalyticsScreen} options={{ title: 'VR Performance' }} />
      <Stack.Screen name="QRAnalytics" component={QRAnalyticsScreen} options={{ title: 'QR Performance' }} />
      <Stack.Screen name="DMAnalytics" component={DMAnalyticsScreen} options={{ title: 'DM Performance' }} />
      <Stack.Screen name="SJAnalytics" component={SJAnalyticsScreen} options={{ title: 'SJ Performance' }} />
      <Stack.Screen name="VRQuestionList" component={VRQuestionListScreen} options={{ title: 'Verbal Reasoning' }} />
      <Stack.Screen name="VRPassage" component={VRPassageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SJScenarioList" component={SJScenarioListScreen} options={{ title: 'Situational Judgement' }} />
      <Stack.Screen name="SJScenario" component={SJScenarioScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DMQuestionList" component={DMQuestionListScreen} options={{ title: 'Decision Making' }} />
      <Stack.Screen name="DMQuestion" component={DMQuestionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="QRQuestionList" component={QRQuestionListScreen} options={{ title: 'Quantitative Reasoning' }} />
      <Stack.Screen name="QRQuestion" component={QRQuestionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', headerRight: undefined }} />
      <Stack.Screen name="AboutUCAT" component={AboutUCATScreen} options={{ title: 'About the UCAT' }} />
      <Stack.Screen name="Paywall" component={PaywallScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ title: 'Terms of Service' }} />
      {/* Reachable from Profile for anonymous users who want to link an account or sign in. */}
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function RecoveryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading, passwordRecovery } = useAuth();
  const { theme: t } = useTheme();
  const [tosAccepted, setTosAccepted] = useState(null); // null = unknown (loading)

  useEffect(() => {
    AsyncStorage.getItem(TOS_FLAG_KEY)
      .then((v) => setTosAccepted(v === 'true'))
      .catch(() => setTosAccepted(false));
  }, []);

  // If a returning verified user is already signed in but pre-dates the ToS flag,
  // they implicitly accepted at signup — silently mark and skip the modal.
  useEffect(() => {
    if (tosAccepted === false && user && !user.is_anonymous) {
      AsyncStorage.setItem(TOS_FLAG_KEY, 'true').then(() => setTosAccepted(true));
    }
  }, [tosAccepted, user]);

  if (loading || tosAccepted === null) {
    return (
      <View style={{ flex: 1, backgroundColor: t.headerBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  if (!tosAccepted) {
    return <ToSAcceptanceScreen onAccepted={() => setTosAccepted(true)} />;
  }

  const getStack = () => {
    if (passwordRecovery) return <RecoveryStack />;
    return <AppStack />;
  };

  return (
    <NavigationContainer>
      {getStack()}
    </NavigationContainer>
  );
}
