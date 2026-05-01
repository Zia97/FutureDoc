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
import { LEARN_FEATURE_ICON, UCAT_SECTIONS } from '../../constants/sectionVisuals';

const LEARN_SECTIONS = [
  {
    ...UCAT_SECTIONS.VR,
    description: 'Roadmap with theory, question types, traps, worked examples, and drills',
    meta: '32 lessons - 5 modules - 85 min',
    route: 'LearnVerbalReasoning',
    badge: 'Roadmap',
  },
  {
    ...UCAT_SECTIONS.DM,
    description: 'Roadmap with logic, diagrams, arguments, probability, traps, and worked examples',
    meta: '37 lessons - 6 modules - 126 min',
    route: 'LearnDecisionMaking',
    badge: 'Roadmap',
  },
  {
    ...UCAT_SECTIONS.QR,
    description: 'Roadmap with maths skills, question types, calculator strategy, traps, and worked examples',
    meta: '37 lessons - 6 modules - 158 min',
    route: 'LearnQuantitativeReasoning',
    badge: 'Roadmap',
  },
  {
    ...UCAT_SECTIONS.SJ,
    description: 'Roadmap with judgement principles, question formats, scenario themes, traps, and worked examples',
    meta: '38 lessons - 7 modules - 179 min',
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
        <RichIconBox icon={LEARN_FEATURE_ICON} accent={colors.cyan} size={54} iconSize={28} />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: colors.cyan }]}>LEARN MODE</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Lessons across every section.</Text>
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
              Pick a section to open its lesson pathway.
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
            All four sections include a full lesson pathway.
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
