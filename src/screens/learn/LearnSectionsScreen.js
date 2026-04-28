import React from 'react';
import { Animated, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../context/ThemeContext';
import {
  AppHeader,
  PremiumIcon,
  PremiumScreen,
  PremiumScrollView,
  RichIconBox,
  SectionSelectionCard,
  hexToRgba,
  premiumColors,
  useFadeSlide,
  useStaggeredFade,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';

const LEARN_SECTIONS = [
  {
    id: 'VR',
    title: 'Verbal Reasoning',
    description: 'Roadmap with theory, question types, traps, worked examples, and drills',
    meta: '16 lessons - 4 modules - 40 min',
    icon: 'book',
    accentKey: 'blue',
    route: 'LearnVerbalReasoning',
    badge: 'Roadmap',
  },
  {
    id: 'DM',
    title: 'Decision Making',
    description: 'Roadmap with logic, diagrams, arguments, probability, traps, and worked examples',
    meta: '27 lessons - 5 modules - 55 min',
    icon: 'person-cog',
    accentKey: 'teal',
    route: 'LearnDecisionMaking',
    badge: 'Roadmap',
  },
  {
    id: 'QR',
    title: 'Quantitative Reasoning',
    description: 'Roadmap with maths skills, question types, calculator strategy, traps, and worked examples',
    meta: '25 lessons - 5 modules - 45 min',
    icon: 'calculator',
    accentKey: 'purple',
    route: 'LearnQuantitativeReasoning',
    badge: 'Roadmap',
  },
  {
    id: 'SJ',
    title: 'Situational Judgement',
    description: 'Roadmap with judgement principles, question formats, scenario themes, traps, and worked examples',
    meta: '31 lessons - 7 modules - 55 min',
    icon: 'stethoscope',
    accentKey: 'mint',
    route: 'LearnSituationalJudgement',
    badge: 'Roadmap',
  },
];

function LearnHero({ colors, gradients, isDark }) {
  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroCard, { borderColor: colors.border, shadowColor: colors.cyan }]}
    >
      <View style={styles.heroTopRow}>
        <RichIconBox icon="brain" accent={colors.cyan} size={54} iconSize={28} />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: colors.cyan }]}>LEARN MODE</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Build the method before the timer starts.</Text>
        </View>
      </View>

      <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
        Short lesson modules with theory, question-type previews, worked examples, and quick practice prompts.
      </Text>

      <View style={styles.metricRow}>
        {[
          ['4', 'Sections'],
          ['5 min', 'Lesson blocks'],
          ['4', 'Demo modules'],
        ].map(([value, label]) => (
          <View
            key={label}
            style={[
              styles.metricPill,
              {
                backgroundColor: isDark ? 'rgba(5, 12, 26, 0.54)' : 'rgba(255, 255, 255, 0.7)',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

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
          <LearnHero colors={colors} gradients={gradients} isDark={isDark} />

          <View style={styles.intro}>
            <Text style={[styles.heading, { color: colors.text }]}>Choose a Section</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Open a section to build the method before moving into practice.
            </Text>
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

        <View
          style={[
            styles.noteCard,
            {
              backgroundColor: isDark ? 'rgba(8, 20, 38, 0.72)' : 'rgba(255, 255, 255, 0.76)',
              borderColor: hexToRgba(colors.cyan, isDark ? 0.24 : 0.2),
            },
          ]}
        >
          <PremiumIcon name="notes" size={23} color={colors.cyan} />
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            All four sections now include a structured learning roadmap. Pick a section to build the method before moving into practice.
          </Text>
        </View>
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
  noteCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
