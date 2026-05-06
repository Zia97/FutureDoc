import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

// Anonymous users can't subscribe — RevenueCat purchases must be tied to an
// account so they're restorable across devices. Anywhere we'd normally send
// the user to the Paywall, we instead prompt them to create an account.
export function usePaywallNavigation() {
  const navigation = useNavigation();
  const { isAnonymous } = useAuth();

  return useCallback(() => {
    if (isAnonymous) {
      Alert.alert(
        'Create an account',
        'Sign up for a free account to unlock Premium. Your purchase is tied to your account so it works across devices.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Create account', onPress: () => navigation.navigate('SignUp') },
        ],
      );
      return;
    }
    navigation.navigate('Paywall');
  }, [isAnonymous, navigation]);
}
