import React from 'react';
import { Animated, StatusBar, StyleSheet, Text } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import {
  AppHeader,
  PremiumFooter,
  PremiumScreen,
  PremiumScrollView,
  SectionSelectionCard,
  premiumColors,
  useFadeSlide,
  useStaggeredFade,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';

const SECTIONS = [
  {
    id: 'VR',
    title: 'Verbal Reasoning',
    description: '44 questions - 22 minutes',
    icon: 'book',
    accent: premiumColors.blue,
    accentKey: 'blue',
  },
  {
    id: 'DM',
    title: 'Decision Making',
    description: '35 questions - 37 minutes',
    icon: 'person-cog',
    accent: premiumColors.teal,
    accentKey: 'teal',
  },
  {
    id: 'QR',
    title: 'Quantitative Reasoning',
    description: '36 questions - 26 minutes',
    icon: 'calculator',
    accent: premiumColors.purple,
    accentKey: 'purple',
  },
  {
    id: 'SJ',
    title: 'Situational Judgement',
    description: '69 questions - 26 minutes',
    icon: 'stethoscope',
    accent: premiumColors.mint,
    accentKey: 'mint',
  },
];

export default function TimedPracticeSectionsScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const introAnim = useFadeSlide(0);
  const cardAnims = useStaggeredFade(SECTIONS.length, 100, 70);
  const footerAnim = useFadeSlide(430);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Timed Practice" />

      <PremiumScrollView>
        <Animated.View style={[styles.intro, introAnim]}>
          <Text style={[styles.heading, { color: colors.text }]}>Timed Practice</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select a section to view timed tests</Text>
        </Animated.View>

        {SECTIONS.map((section, index) => (
          <Animated.View key={section.id} style={cardAnims[index]}>
            <SectionSelectionCard
              title={section.title}
              description={section.description}
              icon={section.icon}
              accent={colors[section.accentKey] ?? section.accent}
              onPress={() => navigation.navigate('TimedTestList', { section: section.id, title: section.title })}
            />
          </Animated.View>
        ))}

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
    paddingBottom: 24,
  },
  heading: {
    color: premiumColors.text,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
  },
  subtitle: {
    color: premiumColors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  footer: {
    marginTop: 18,
  },
});
