import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { getSupportQuestion, supportError } from '../../lib/supportTickets';
import { useSupportRefresh } from '../../hooks/useSupportRefresh';
import { SupportError, SupportLayout, supportStyles as styles } from '../../components/support/SupportUI';
import { DMStemContent, DMOptionsContent } from '../../components/dm/DMQuestionRenderer';
import QRStimulusRenderer from '../../components/qr/QRStimulusRenderer';
import { LABEL_SETS } from '../../constants/sjLabelSets';

export default function SupportQuestionScreen({ route, navigation }) {
  const { ticketId, admin = false } = route.params;
  const { colors } = getPremiumTheme(useTheme().isDark);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const refresh = useCallback(async (isActive = () => true) => {
    try {
      const result = await getSupportQuestion(ticketId, admin);
      if (isActive()) { setData(result); setError(null); }
    } catch (e) { if (isActive()) { setData(null); setError(supportError(e)); } }
  }, [ticketId, admin]);
  useSupportRefresh(refresh);
  const q = data?.question;
  const choices = q?.section === 'sj' ? LABEL_SETS[q.labelSet] ?? LABEL_SETS[1] : q?.options ?? [];
  return <SupportLayout navigation={navigation} title="Reported question">
    {error && <SupportError message={error} retry={() => refresh()} />}
    {!data && !error && <ActivityIndicator style={{ margin: 30 }} color={colors.cyan} />}
    {data && !data.available && <Text style={[styles.padded, { color: colors.textSecondary }]}>{data.reason}</Text>}
    {q && <ScrollView contentContainerStyle={styles.padded}>
      <Text style={[styles.meta, { color: colors.textMuted }]}>{q.section.toUpperCase()} · {q.isTimed ? `Timed${q.testId != null ? ` · Test ${q.testId}` : ''}` : 'Practice'}</Text>
      {data.parent_missing && <Text style={{ color: colors.red }}>The passage or stimulus is no longer available.</Text>}
      {q.section === 'dm' ? <>
        <DMStemContent question={q} />
        {q.statements?.length ? q.statements.map((statement, index) => <View key={index} style={[styles.input, { borderColor: colors.border, gap: 8 }]}>
          <Text selectable style={[styles.body, { color: colors.text }]}>{statement.text}</Text>
          {data.answers_visible && <>
            <Text style={[styles.label, { color: colors.cyan }]}>Answer: {statement.answer}</Text>
            {!!statement.reason && <Text selectable style={[styles.body, { color: colors.text }]}>{statement.reason}</Text>}
          </>}
        </View>) : <View pointerEvents="none">
          <DMOptionsContent question={q} answer={null} onAnswer={() => {}}
            submitted={data.answers_visible} timedMode={!data.answers_visible} />
        </View>}
      </> : <>
        {q.section === 'qr' ? <QRStimulusRenderer stimulus={q.stimulus} /> :
          <Text selectable style={[styles.body, { color: colors.text }]}>{q.context}</Text>}
        <Text selectable style={[styles.body, { color: colors.text, fontWeight: '700' }]}>{q.stem}</Text>
        {choices.map((choice, index) => {
          const text = typeof choice === 'string' ? choice : `${choice.label}. ${choice.text ?? choice.option_text ?? ''}`;
          return <View key={index} style={[styles.input, { borderColor: colors.border }]}>
            <Text style={[styles.body, { color: colors.text }]}>{text}</Text>
          </View>;
        })}
      </>}
      {data.answers_visible ? <>
        {q.answer != null && <Text selectable style={[styles.label, { color: colors.cyan }]}>
          Answer: {typeof q.answer === 'string' ? q.answer : JSON.stringify(q.answer)}
        </Text>}
        {!!q.answeringReason && <Text selectable style={[styles.body, { color: colors.text }]}>{q.answeringReason}</Text>}
      </> : <Text style={[styles.meta, { color: colors.textMuted }]}>Answers are available after this test has been submitted and synced.</Text>}
    </ScrollView>}
  </SupportLayout>;
}
