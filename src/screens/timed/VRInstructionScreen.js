import React from 'react';
import { Text } from 'react-native';

import PremiumInstructionScreen from '../../components/premium/PremiumInstructionScreen';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';

const INSTRUCTION_SECONDS = 90;

export default function VRInstructionScreen({ navigation, route }) {
  const { test, section, title } = route.params;
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  return (
    <PremiumInstructionScreen
      navigation={navigation}
      sectionTitle="Verbal Reasoning"
      sectionIcon="book"
      accent={colors.blue}
      durationSeconds={INSTRUCTION_SECONDS}
      readNotice="You have 1 minute 30 seconds to read this screen."
      table={{
        subtest: 'Verbal Reasoning',
        questions: '44',
        timeUCAT: '22 minutes',
        timeExtended: '27 mins 30 secs',
      }}
      paragraphs={[
        'For each question you may only select one response.',
        'It is in your best interest to answer all questions as there is no penalty for guessing. Unanswered questions will be scored as incorrect.',
        <Text>
          The <Text style={{ fontWeight: '800' }}>'Navigator'</Text> function at the bottom right of the screen allows you to navigate to questions within the subtest.
        </Text>,
      ]}
      credit="Source: Pearson VUE"
      onStart={() => navigation.replace('TimedVRTest', { test, section, title })}
    />
  );
}
