import React from 'react';
import { Animated, StatusBar, StyleSheet, Text } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import {
  AppHeader,
  PracticeModeCard,
  PremiumFooter,
  PremiumScreen,
  PremiumScrollView,
  premiumColors,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';

export default function PracticeModeScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const introAnim = useFadeSlide(0);
  const card1Anim = useFadeSlide(110);
  const card2Anim = useFadeSlide(190);
  const footerAnim = useFadeSlide(280);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Practice" />

      <PremiumScrollView>
        <Animated.View style={[styles.intro, introAnim]}>
          <Text style={[styles.heading, { color: colors.text }]}>How do you want to practise?</Text>
        </Animated.View>

        <Animated.View style={card1Anim}>
          <PracticeModeCard
            title="Normal Practice"
            description="Browse and attempt questions at your own pace."
            icon="pencil"
            accent={colors.cyan}
            highlighted
            onPress={() => navigation.navigate('PracticeSections')}
          />
        </Animated.View>

        <Animated.View style={card2Anim}>
          <PracticeModeCard
            title="Timed Practice"
            description="Sit timed tests under real UCAT conditions."
            icon="timer"
            accent={colors.red}
            onPress={() => navigation.navigate('TimedPracticeSections')}
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
