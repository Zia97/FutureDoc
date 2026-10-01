import { useEffect } from 'react';
import { Alert } from 'react-native';

// ============================================================
// Blocks accidental navigation away from a screen with a confirm
// dialog. Used by the timed test screens so a stray back-tap or
// edge swipe can't destroy 20+ minutes of mid-test progress.
//
// Usage:
//   useExitWarning(navigation, !showResults);
//
// Pass `enabled = false` once the test has ended (results visible)
// so the user can navigate freely from the results screen without
// being nagged.
// ============================================================

export function useExitWarning(navigation, enabled, options = {}) {
  const {
    title = 'Exit Test?',
    message = 'If you exit now, none of your progress will be saved and you will need to re-start the test',
    stayLabel = 'Stay',
    leaveLabel = 'Exit',
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Block the navigation, then prompt. If the user confirms, replay
      // the original action so the destination they originally requested
      // is honoured (back button, swipe, programmatic navigate, etc.).
      e.preventDefault();
      Alert.alert(
        title,
        message,
        [
          { text: stayLabel, style: 'cancel' },
          {
            text: leaveLabel,
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
        { cancelable: true },
      );
    });

    return unsubscribe;
  }, [navigation, enabled, title, message, stayLabel, leaveLabel]);
}
