import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { QuestionPanel, SectionLabel, QuestionText, QuestionDivider, FlagButton } from '../premium/PremiumQuestionScreenUI';
import { DMStemContent, DMOptionsContent } from '../dm/DMQuestionRenderer';
import QRStimulusRenderer from '../qr/QRStimulusRenderer';
import AnswerOptionButton from '../AnswerOptionButton';

// Shared by the four timed subtests and all coaching sessions. This component
// deliberately has no tutor, explanations, grading or submission side effects.
export default function TimedQuestionPanel({ section, accent, context, text, stimulus, dmQuestion, choices = [], answer, flagged, onAnswer, onToggleFlag }) {
  const { colors } = getPremiumTheme(useTheme().isDark);
  if (section === 'dm') return <QuestionPanel>
    <SectionLabel accent={accent}>Stem</SectionLabel>
    <DMStemContent question={dmQuestion} showLabel={false} />
    <QuestionDivider />
    <View style={styles.questionHeader}>
      <SectionLabel accent={accent}>Options</SectionLabel>
      <FlagButton active={flagged} onPress={onToggleFlag} accent={colors.amber} />
    </View>
    <DMOptionsContent question={dmQuestion} answer={answer} onAnswer={onAnswer} submitted={false} timedMode showLabel={false} />
  </QuestionPanel>;

  return <QuestionPanel>
    <SectionLabel accent={accent}>{section === 'vr' ? 'Passage' : section === 'sj' ? 'Scenario' : 'Stem'}</SectionLabel>
    {section === 'qr' ? <QRStimulusRenderer stimulus={stimulus} /> : <QuestionText muted>{context}</QuestionText>}
    <QuestionDivider />
    <View style={styles.questionHeader}>
      {section === 'qr' ? <View style={styles.questionCopy}><SectionLabel accent={accent}>Question</SectionLabel><QuestionText>{text}</QuestionText></View> : <SectionLabel accent={accent}>Question</SectionLabel>}
      <FlagButton active={flagged} onPress={onToggleFlag} accent={colors.amber} />
    </View>
    {section !== 'qr' && <QuestionText>{text}</QuestionText>}
    <View style={styles.options}>
      {choices.map((choice) => <AnswerOptionButton key={choice.value} label={choice.label}
        state={answer === choice.value ? 'selected' : 'idle'} onPress={() => onAnswer(choice.value)} />)}
    </View>
  </QuestionPanel>;
}

const styles = StyleSheet.create({
  questionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  questionCopy: { flex: 1, minWidth: 0 },
  options: { gap: 10, marginTop: 16 },
});
