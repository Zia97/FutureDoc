import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useContentVersionCheck } from '../services/contentUpdateService';
import { checkForceUpdate } from '../services/appVersionGate';
import { useTimedExamSyncOnForeground } from '../hooks/useTimedExamSyncOnForeground';

import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import SetDisplayNameScreen from '../screens/auth/SetDisplayNameScreen';
import ToSAcceptanceScreen, { TOS_FLAG_KEY } from '../screens/onboarding/ToSAcceptanceScreen';
import ExamDateScreen from '../screens/onboarding/ExamDateScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import ForceUpdateScreen from '../screens/onboarding/ForceUpdateScreen';
import SuspendedScreen from '../screens/onboarding/SuspendedScreen';
import HeaderAuthButton from '../components/HeaderAuthButton';
import {
  EXAM_DATE_KEY,
  WELCOME_SEEN_KEY,
} from '../services/onboardingFlags';

import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/home/ProfileScreen';
import AboutUCATScreen from '../screens/home/AboutUCATScreen';
import PaywallScreen from '../screens/home/PaywallScreen';
import PrivacyPolicyScreen from '../screens/home/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/home/TermsOfServiceScreen';
import SupportScreen from '../screens/home/SupportScreen';
import DecisionMakingLearnScreen from '../screens/learn/DecisionMakingLearnScreen';
import DecisionMakingLessonScreen from '../screens/learn/DecisionMakingLessonScreen';
import LearnSectionsScreen from '../screens/learn/LearnSectionsScreen';
import QuantitativeReasoningLearnScreen from '../screens/learn/QuantitativeReasoningLearnScreen';
import QuantitativeReasoningLessonScreen from '../screens/learn/QuantitativeReasoningLessonScreen';
import SituationalJudgementLearnScreen from '../screens/learn/SituationalJudgementLearnScreen';
import SituationalJudgementLessonScreen from '../screens/learn/SituationalJudgementLessonScreen';
import VerbalReasoningLessonScreen from '../screens/learn/VerbalReasoningLessonScreen';
import VerbalReasoningLearnScreen from '../screens/learn/VerbalReasoningLearnScreen';
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
      <Stack.Screen name="LearnSections" component={LearnSectionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LearnVerbalReasoning" component={VerbalReasoningLearnScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LearnVRLesson" component={VerbalReasoningLessonScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LearnDecisionMaking" component={DecisionMakingLearnScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LearnDMLesson" component={DecisionMakingLessonScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LearnQuantitativeReasoning" component={QuantitativeReasoningLearnScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LearnQRLesson" component={QuantitativeReasoningLessonScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LearnSituationalJudgement" component={SituationalJudgementLearnScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LearnSJLesson" component={SituationalJudgementLessonScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PracticeMode" component={PracticeModeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PracticeSections" component={PracticeSectionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TimedPracticeSections" component={TimedPracticeSectionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TimedTestList" component={TimedTestListScreen} options={{ headerShown: false }} />
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
      <Stack.Screen name="PerformanceAnalytics" component={PerformanceAnalyticsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VRAnalytics" component={VRAnalyticsScreen} options={{ title: 'VR Performance' }} />
      <Stack.Screen name="QRAnalytics" component={QRAnalyticsScreen} options={{ title: 'QR Performance' }} />
      <Stack.Screen name="DMAnalytics" component={DMAnalyticsScreen} options={{ title: 'DM Performance' }} />
      <Stack.Screen name="SJAnalytics" component={SJAnalyticsScreen} options={{ title: 'SJ Performance' }} />
      <Stack.Screen name="VRQuestionList" component={VRQuestionListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VRPassage" component={VRPassageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SJScenarioList" component={SJScenarioListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SJScenario" component={SJScenarioScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DMQuestionList" component={DMQuestionListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DMQuestion" component={DMQuestionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="QRQuestionList" component={QRQuestionListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="QRQuestion" component={QRQuestionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExamDate" component={ExamDateScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="AboutUCAT" component={AboutUCATScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Paywall" component={PaywallScreen} options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: false }} />
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

function DisplayNameStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SetDisplayName" component={SetDisplayNameScreen} />
    </Stack.Navigator>
  );
}

// Mounted whenever there's no signed-in user. SignUp is the landing screen —
// every user must register before reaching the app.
function AuthGateStack() {
  return (
    <Stack.Navigator initialRouteName="SignUp" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function ExamDateStack({ onComplete }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExamDate">
        {() => <ExamDateScreen onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function WelcomeStack({ onComplete }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome">
        {() => <WelcomeScreen onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading, passwordRecovery, displayName, displayNameLoading, suspension } = useAuth();
  const { theme: t } = useTheme();
  const [tosAccepted, setTosAccepted] = useState(null); // null = unknown (loading)
  const [examDateSet, setExamDateSet] = useState(null);
  const [welcomeSeen, setWelcomeSeenState] = useState(null);
  const [versionGate, setVersionGate] = useState(null); // null = unknown, { updateRequired, storeUrl } once resolved

  useEffect(() => {
    AsyncStorage.multiGet([TOS_FLAG_KEY, EXAM_DATE_KEY, WELCOME_SEEN_KEY])
      .then((entries) => {
        const map = Object.fromEntries(entries);
        setTosAccepted(map[TOS_FLAG_KEY] === 'true');
        setExamDateSet(map[EXAM_DATE_KEY] != null);
        setWelcomeSeenState(map[WELCOME_SEEN_KEY] === 'true');
      })
      .catch(() => {
        setTosAccepted(false);
        setExamDateSet(false);
        setWelcomeSeenState(false);
      });
  }, []);

  // Fail-open version check: any error resolves to no update required so a
  // Supabase outage cannot lock users out of the app. Re-runs on foreground
  // so an emergency min-version bump reaches users who keep the app backgrounded.
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    let cancelled = false;
    const runCheck = () => {
      checkForceUpdate()
        .then((result) => { if (!cancelled) setVersionGate(result); })
        .catch(() => { if (!cancelled && versionGate === null) setVersionGate({ updateRequired: false, storeUrl: null }); });
    };
    runCheck();
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        runCheck();
      }
      appState.current = next;
    });
    return () => { cancelled = true; sub.remove(); };
  }, []);

  // If a returning verified user is already signed in but pre-dates the ToS flag,
  // they implicitly accepted at signup — silently mark and skip the modal.
  useEffect(() => {
    if (tosAccepted === false && user) {
      AsyncStorage.setItem(TOS_FLAG_KEY, 'true').then(() => setTosAccepted(true));
    }
  }, [tosAccepted, user]);

  // Hold the loader until suspension state is resolved — otherwise a
  // suspended user briefly sees Home before the gate kicks in.
  const suspensionPending = !!user && suspension?.loading;

  if (
    loading
    || tosAccepted === null
    || examDateSet === null
    || welcomeSeen === null
    || versionGate === null
    || suspensionPending
  ) {
    return (
      <View style={{ flex: 1, backgroundColor: t.headerBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  if (versionGate.updateRequired) {
    return <ForceUpdateScreen storeUrl={versionGate.storeUrl} />;
  }

  if (suspension?.isSuspended) {
    return <SuspendedScreen reason={suspension.reason} suspendedAt={suspension.suspendedAt} />;
  }

  if (!tosAccepted) {
    return <ToSAcceptanceScreen onAccepted={() => setTosAccepted(true)} />;
  }

  // Users must have a display_name set before entering the app. Email signups
  // stage it in user_metadata and AuthContext promotes it to user_profiles on
  // first verified sign-in; OAuth users hit this screen.
  const needsDisplayName = user && !displayNameLoading && !displayName;

  const getStack = () => {
    if (passwordRecovery) return <RecoveryStack />;
    if (!user) return <AuthGateStack />;
    if (needsDisplayName) return <DisplayNameStack />;
    if (!examDateSet) {
      return <ExamDateStack onComplete={() => setExamDateSet(true)} />;
    }
    if (!welcomeSeen) {
      return <WelcomeStack onComplete={() => setWelcomeSeenState(true)} />;
    }
    return <AppStack />;
  };

  return (
    <NavigationContainer>
      {getStack()}
    </NavigationContainer>
  );
}
