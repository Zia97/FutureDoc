import React, { useState } from 'react';
import { Animated, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
import { UCAT_SECTIONS } from '../../constants/sectionVisuals';

const SECTIONS = [
  {
    ...UCAT_SECTIONS.VR,
    description: 'Reading comprehension and critical analysis',
    accent: premiumColors.blue,
    route: 'VRQuestionList',
  },
  {
    ...UCAT_SECTIONS.DM,
    description: 'Logic puzzles, arguments and diagrams',
    accent: premiumColors.teal,
    route: 'DMQuestionList',
  },
  {
    ...UCAT_SECTIONS.QR,
    description: 'Numerical problem solving and data interpretation',
    accent: premiumColors.purple,
    route: 'QRQuestionList',
  },
  {
    ...UCAT_SECTIONS.SJ,
    description: 'Professional scenarios and ethical judgement',
    accent: premiumColors.mint,
    route: 'SJScenarioList',
  },
];

export default function PracticeSectionsScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [mode, setMode] = useState('questions');
  const introAnim = useFadeSlide(0);
  const cardAnims = useStaggeredFade(SECTIONS.length, 100, 70);
  const footerAnim = useFadeSlide(430);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Practice" />

      <PremiumScrollView>
        <Animated.View style={[styles.intro, introAnim]}>
          <Text style={[styles.heading, { color: colors.text }]}>Choose a section</Text>
        </Animated.View>

        <View style={[styles.modeSwitch, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
          {[{ id: 'questions', label: 'Question practice' }, { id: 'timed', label: 'Timed tests' }].map((option) => {
            const selected = mode === option.id;
            return <TouchableOpacity key={option.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setMode(option.id)}
              style={[styles.modeOption, selected && { backgroundColor: colors.blue }]}>
              <Text style={{ color: selected ? '#fff' : colors.textSecondary, fontSize: 13, fontWeight: '700' }}>{option.label}</Text>
            </TouchableOpacity>;
          })}
        </View>

        {SECTIONS.map((section, index) => (
          <Animated.View key={section.id} style={cardAnims[index]}>
            <SectionSelectionCard
              title={section.title}
              description={mode === 'timed' ? 'Timed tests under exam conditions' : section.description}
              icon={section.icon}
              accent={colors[section.accentKey] ?? section.accent}
              onPress={() => mode === 'timed'
                ? navigation.navigate('TimedTestList', { section: section.id, title: section.title })
                : navigation.navigate(section.route)}
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
  modeSwitch: { flexDirection: 'row', borderRadius: 15, borderWidth: 1, padding: 4, marginBottom: 8 },
  modeOption: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 11, paddingHorizontal: 8 },
  footer: {
    marginTop: 18,
  },
});
