import React from 'react';
import { Animated, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../context/ThemeContext';
import {
  AppHeader,
  PremiumScreen,
  PremiumScrollView,
  RichIconBox,
  SectionSelectionCard,
  premiumColors,
  useFadeSlide,
  useStaggeredFade,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { LEARN_FEATURE_ICON, UCAT_SECTIONS } from '../../constants/sectionVisuals';

const LEARN_SECTIONS = [
  {
    ...UCAT_SECTIONS.VR,
    description: 'Theory, question types, traps, worked examples, and drills',
    meta: '32 lessons - 5 modules - 85 min',
    route: 'LearnVerbalReasoning',
  },
  {
    ...UCAT_SECTIONS.DM,
    description: 'Logic, diagrams, arguments, probability, traps, and worked examples',
    meta: '37 lessons - 6 modules - 126 min',
    route: 'LearnDecisionMaking',
  },
  {
    ...UCAT_SECTIONS.QR,
    description: 'Maths skills, question types, calculator strategy, traps, and worked examples',
    meta: '37 lessons - 6 modules - 158 min',
    route: 'LearnQuantitativeReasoning',
  },
  {
    ...UCAT_SECTIONS.SJ,
    description: 'Judgement principles, question formats, scenario themes, traps, and worked examples',
    meta: '38 lessons - 7 modules - 179 min',
    route: 'LearnSituationalJudgement',
  },
];

export default function LearnSectionsScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const introAnim = useFadeSlide(0, 14);
  const cardAnims = useStaggeredFade(LEARN_SECTIONS.length, 120, 70);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Learn" />

      <PremiumScrollView>
        <Animated.View style={introAnim}>

          <View style={styles.intro}>
            <Text style={[styles.heading, { color: colors.text }]}>Choose a Section</Text>
          </View>
        </Animated.View>

        {LEARN_SECTIONS.map((section, index) => {
          const accent = colors[section.accentKey] ?? premiumColors[section.accentKey] ?? colors.blue;
          const description = `${section.description}\n${section.meta}`;

          return (
            <Animated.View key={section.id} style={cardAnims[index]}>
              <SectionSelectionCard
                title={section.title}
                description={description}
                icon={section.icon}
                accent={accent}
                badge={section.badge}
                highlighted={section.id === 'VR' || section.id === 'DM' || section.id === 'QR' || section.id === 'SJ'}
                showChevron={!!section.route}
                onPress={section.route ? () => navigation.navigate(section.route) : undefined}
              />
            </Animated.View>
          );
        })}
      </PremiumScrollView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginTop: 4,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 0,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
  },
  heroTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    marginTop: 4,
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  metricPill: {
    flex: 1,
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  intro: {
    paddingBottom: 20,
  },
  heading: {
    fontSize: 35,
    lineHeight: 41,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
});
