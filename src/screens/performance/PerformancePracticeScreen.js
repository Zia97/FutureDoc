import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, PremiumScreen } from '../../components/premium/PremiumPracticeUI';
import { PerformanceButton, PerformanceCard, ProLockCard, Reveal, performanceStyles as s, usePerformanceTheme } from '../../components/performance/PerformanceUI';
import { usePerformanceReport } from '../../hooks/usePerformanceReport';
import PerformanceLoading from '../../components/performance/PerformanceLoading';
import { choosePracticeQuestions } from '../../lib/performance/engine';
import VRPassageScreen from '../vr/VRPassageScreen';
import DMQuestionScreen from '../dm/DMQuestionScreen';
import QRQuestionScreen from '../qr/QRQuestionScreen';
import SJScenarioScreen from '../sj/SJScenarioScreen';

const SCREENS = { vr: VRPassageScreen, dm: DMQuestionScreen, qr: QRQuestionScreen, sj: SJScenarioScreen };
export default function PerformancePracticeScreen({ route, navigation }) {
  const { colors } = usePerformanceTheme();
  const { report, loading, error, refresh, isPro, canAnalyse, completePractice } = usePerformanceReport('practice');
  const [session, setSession] = useState(null);
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    if (!canAnalyse || session) return;
    const skill = report.details.skills.find((item) => item.id === route.params?.skillId);
    if (!skill) return;
    setSession({ section: skill.section, title: skill.label, questionIds: choosePracticeQuestions(skill, route.params?.kind === 'review' ? 'review' : 'fresh') });
  }, [canAnalyse, report, session, route.params?.skillId, route.params?.kind]);
  // Both entitlement state and a server-verified report are needed. A direct
  // navigation or revoked subscription cannot mount the question session.
  if (canAnalyse && session?.questionIds.length && !finished) {
    const Screen = SCREENS[session.section];
    return <Screen route={{ params: { index: 0 } }} navigation={navigation}
      performanceSession={{ ...session, onComplete: () => {
        completePractice(session.section, session.questionIds);
        setFinished(true);
      } }} />;
  }
  return <PremiumScreen><AppHeader title="Focused practice" navigation={navigation} />
    <ScrollView contentContainerStyle={s.content}>
      {loading ? <PerformanceLoading /> : error ? <PerformanceCard>
        <Text style={[s.body, { color: colors.textSecondary, marginBottom: 14 }]}>{error}</Text><PerformanceButton title="Try again" onPress={refresh} />
      </PerformanceCard> : !canAnalyse ? <ProLockCard pending={isPro} onUnlock={isPro ? refresh : () => navigation.navigate('Paywall')} /> : finished ? <Reveal><PerformanceCard accent={colors.mint}>
        <View style={{ alignItems: 'center', paddingVertical: 18, gap: 14 }}><Ionicons name="checkmark-circle" size={62} color={colors.mint} />
          <Text style={[s.heading, { color: colors.text }]}>Session complete</Text><Text style={[s.body, { color: colors.textSecondary, textAlign: 'center' }]}>{session.title}</Text>
        </View><PerformanceButton title="Back to my skill analysis" onPress={() => navigation.goBack()} />
      </PerformanceCard></Reveal> : <PerformanceCard><Text style={[s.title, { color: colors.text }]}>No questions available</Text>
        <Text style={[s.body, { color: colors.textSecondary, marginVertical: 12 }]}>There are no matching questions available for this session. Explore another skill or revisit its lesson.</Text><PerformanceButton title="Back to my skills" onPress={() => navigation.goBack()} />
      </PerformanceCard>}
    </ScrollView>
  </PremiumScreen>;
}
