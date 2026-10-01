import React from 'react';
import { Text } from 'react-native';

import PremiumInstructionScreen from '../../components/premium/PremiumInstructionScreen';
import { useTheme } from '../../context/ThemeContext';
import { UCAT_SECTIONS } from '../../constants/sectionVisuals';
import { getPremiumTheme } from '../../theme/premiumTheme';

const INSTRUCTION_SECONDS = 120;

export default function QRInstructionScreen({ navigation, route }) {
  const { test, section, title } = route.params;
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  return (
    <PremiumInstructionScreen
      navigation={navigation}
      sectionTitle={UCAT_SECTIONS.QR.title}
      sectionIcon={UCAT_SECTIONS.QR.icon}
      accent={colors[UCAT_SECTIONS.QR.accentKey]}
      durationSeconds={INSTRUCTION_SECONDS}
      readNotice="You have 2 minutes to read this screen."
      table={{
        subtest: 'Quantitative Reasoning',
        questions: '36',
        timeUCAT: '26 minutes',
        timeExtended: '32 mins 30 secs',
      }}
      paragraphs={[
        'For each question you may only select one response.',
        'Answer every question — there is no penalty for an incorrect answer. Any unanswered question will be marked as wrong.',
        'A calculator is available during this subtest. Tap the calculator icon at the top of the screen to open it.',
        'You may find it helpful to use a pen and paper for rough working. Have these ready before you begin.',
        <Text>
          The <Text style={{ fontWeight: '800' }}>'Navigator'</Text> at the bottom of the screen lets you jump to any question within the test.
        </Text>,
      ]}
      onStart={() => navigation.replace('TimedQRTest', { test, section, title })}
    />
  );
}
