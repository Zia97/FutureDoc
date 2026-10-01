import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { recordAppLaunch } from './src/services/reviewPromptService';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { TextSizeProvider } from './src/context/TextSizeContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { NetworkProvider } from './src/context/NetworkContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://ac8a8f0d6edd1b60ac1abcfb5b545a95@o4511226267303936.ingest.de.sentry.io/4511226271236176',
  enabled: !__DEV__,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  integrations: [Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function App() {
  useEffect(() => {
    recordAppLaunch();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <NetworkProvider>
            <ThemeProvider>
              <TextSizeProvider>
                <AuthProvider>
                  <SubscriptionProvider>
                    <AppNavigator />
                  </SubscriptionProvider>
                </AuthProvider>
              </TextSizeProvider>
            </ThemeProvider>
          </NetworkProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
