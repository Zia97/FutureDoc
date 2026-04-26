import React from 'react';
import { Animated, StatusBar, StyleSheet, Text } from 'react-native';

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

const SECTIONS = [
  {
    id: 'VR',
    title: 'Verbal Reasoning',
    description: '44 questions - 22 minutes',
    icon: 'book',
    accent: premiumColors.blue,
  },
  {
    id: 'DM',
    title: 'Decision Making',
    description: '35 questions - 37 minutes',
    icon: 'person-cog',
    accent: premiumColors.teal,
  },
  {
    id: 'QR',
    title: 'Quantitative Reasoning',
    description: '36 questions - 26 minutes',
    icon: 'calculator',
    accent: premiumColors.purple,
  },
  {
    id: 'SJ',
    title: 'Situational Judgement',
    description: '69 questions - 26 minutes',
    icon: 'stethoscope',
    accent: premiumColors.mint,
  },
];

export default function TimedPracticeSectionsScreen({ navigation }) {
  const introAnim = useFadeSlide(0);
  const cardAnims = useStaggeredFade(SECTIONS.length, 100, 70);
  const footerAnim = useFadeSlide(430);

  return (
    <PremiumScreen>
      <StatusBar barStyle="light-content" backgroundColor={premiumColors.bgTop} />
      <AppHeader navigation={navigation} title="Timed Practice" />

      <PremiumScrollView>
        <Animated.View style={[styles.intro, introAnim]}>
          <Text style={styles.heading}>Timed Practice</Text>
          <Text style={styles.subtitle}>Select a section to view timed tests</Text>
        </Animated.View>

        {SECTIONS.map((section, index) => (
          <Animated.View key={section.id} style={cardAnims[index]}>
            <SectionSelectionCard
              title={section.title}
              description={section.description}
              icon={section.icon}
              accent={section.accent}
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
