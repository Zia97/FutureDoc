import React from 'react';
import { Text } from 'react-native';

import PremiumInstructionScreen from '../../components/premium/PremiumInstructionScreen';
import { useTheme } from '../../context/ThemeContext';
import { UCAT_SECTIONS } from '../../constants/sectionVisuals';
import { getPremiumTheme } from '../../theme/premiumTheme';

const INSTRUCTION_SECONDS = 90;

export default function SJInstructionScreen({ navigation, route }) {
  const { test, section, title } = route.params;
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  return (
    <PremiumInstructionScreen
      navigation={navigation}
      sectionTitle={UCAT_SECTIONS.SJ.title}
      sectionIcon={UCAT_SECTIONS.SJ.icon}
      accent={colors[UCAT_SECTIONS.SJ.accentKey]}
      durationSeconds={INSTRUCTION_SECONDS}
      readNotice="You have 1 minute 30 seconds to read this screen."
      table={{
        subtest: 'Situational Judgement',
        questions: '69',
        timeUCAT: '26 minutes',
        timeExtended: '32 mins 30 secs',
      }}
      paragraphs={[
        'For some questions you may only select one response. Others require you to choose the most and least appropriate action to take in response to the scenario, from the three actions provided.',
        'Answer every question — there is no penalty for an incorrect answer. Any unanswered question will be marked as wrong.',
        <Text>
          The <Text style={{ fontWeight: '800' }}>'Navigator'</Text> at the bottom of the screen lets you jump to any question within the test.
        </Text>,
      ]}
      onStart={() => navigation.replace('TimedSJTest', { test, section, title })}
    />
  );
}
