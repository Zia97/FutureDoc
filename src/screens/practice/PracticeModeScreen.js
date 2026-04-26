import React from 'react';
import { Alert, Animated, StatusBar, StyleSheet, Text } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import {
  AppHeader,
  PracticeModeCard,
  PremiumFooter,
  PremiumScreen,
  PremiumScrollView,
  premiumColors,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';

export default function PracticeModeScreen({ navigation }) {
  const { isAnonymous } = useAuth();

  const introAnim = useFadeSlide(0);
  const card1Anim = useFadeSlide(110);
  const card2Anim = useFadeSlide(190);
  const footerAnim = useFadeSlide(280);

  const handleTimedPractice = () => {
    if (isAnonymous) {
      Alert.alert(
        'Create an account',
        'Timed practice simulates real UCAT conditions and saves your results so you can track progress. Create a free account to unlock it.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Create account', onPress: () => navigation.navigate('SignUp') },
        ],
      );
      return;
    }

    navigation.navigate('TimedPracticeSections');
  };

  return (
    <PremiumScreen>
      <StatusBar barStyle="light-content" backgroundColor={premiumColors.bgTop} />
      <AppHeader navigation={navigation} title="Practice" />

      <PremiumScrollView>
        <Animated.View style={[styles.intro, introAnim]}>
          <Text style={styles.heading}>How do you want to practise?</Text>
          <Text style={styles.subtitle}>Choose a practice mode that fits your goals.</Text>
        </Animated.View>

        <Animated.View style={card1Anim}>
          <PracticeModeCard
            title="Normal Practice"
            description="Browse and attempt questions at your own pace."
            icon="pencil"
            accent={premiumColors.cyan}
            highlighted
            onPress={() => navigation.navigate('PracticeSections')}
          />
        </Animated.View>

        <Animated.View style={card2Anim}>
          <PracticeModeCard
            title="Timed Practice"
            description="Sit timed tests under real UCAT conditions."
            icon="timer"
            accent={premiumColors.red}
            badge={isAnonymous ? 'Account required' : null}
            onPress={handleTimedPractice}
          />
        </Animated.View>

        <Animated.View style={footerAnim}>
          <PremiumFooter style={styles.footer} />
        </Animated.View>
      </PremiumScrollView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  intro: {
    paddingTop: 6,
    paddingBottom: 26,
  },
  heading: {
    color: premiumColors.text,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '900',
    maxWidth: 330,
  },
  subtitle: {
    color: premiumColors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    maxWidth: 320,
  },
  footer: {
    marginTop: 24,
  },
});
