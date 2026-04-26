import React from 'react';
import { Text } from 'react-native';

import PremiumInstructionScreen from '../../components/premium/PremiumInstructionScreen';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';

const INSTRUCTION_SECONDS = 90;

export default function DMInstructionScreen({ navigation, route }) {
  const { test, section, title } = route.params;
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  return (
    <PremiumInstructionScreen
      navigation={navigation}
      sectionTitle="Decision Making"
      sectionIcon="brain"
      accent={colors.teal}
      durationSeconds={INSTRUCTION_SECONDS}
      readNotice="You have 1 minute 30 seconds to read this screen."
      table={{
        subtest: 'Decision Making',
        questions: '35',
        timeUCAT: '37 minutes',
        timeExtended: '46 mins 15 secs',
      }}
      paragraphs={[
        <Text>
          For some questions you may only select one response. Other questions require you to respond to five statements by placing a{' '}
          <Text style={{ fontWeight: '800' }}>'yes'</Text> or{' '}
          <Text style={{ fontWeight: '800' }}>'no'</Text> answer next to each statement.
        </Text>,
        'Answer every question — there is no penalty for an incorrect answer. Any unanswered question will be marked as wrong.',
        'A calculator is available during this subtest. Tap the calculator icon at the top of the screen to open it.',
        'You may find it helpful to use a pen and paper for rough working. Have these ready before you begin.',
        <Text>
          The <Text style={{ fontWeight: '800' }}>'Navigator'</Text> at the bottom of the screen lets you jump to any question within the test.
        </Text>,
      ]}
      onStart={() => navigation.replace('TimedDMTest', { test, section, title })}
    />
  );
}
