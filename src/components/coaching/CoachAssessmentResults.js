import React, { useMemo, useState } from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { sessionSections } from '../../lib/coaching/sessionState';
import { coachResultsSection } from '../../lib/coaching/resultsView';
import { PremiumScreen } from '../premium/PremiumPracticeUI';
import { resultsStyles } from '../premium/PremiumResultsUI';
import { Segments } from '../performance/PerformanceUI';
import TimedVRResultsScreen from '../TimedVRResultsScreen';
import TimedDMResultsScreen from '../TimedDMResultsScreen';
import TimedQRResultsScreen from '../TimedQRResultsScreen';
import TimedSJResultsScreen from '../TimedSJResultsScreen';
import { Button, SessionReport } from './CoachUI';

const RESULT_SCREENS = { vr: TimedVRResultsScreen, dm: TimedDMResultsScreen, qr: TimedQRResultsScreen, sj: TimedSJResultsScreen };

export default function CoachAssessmentResults({ session, onPlan, onContinue, onDone, busy = false, initialReview = false }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const sections = useMemo(() => sessionSections(session), [session.questions]);
  const [reviewSection, setReviewSection] = useState(initialReview ? sections[0] : null);
  const section = sections.length === 1 ? sections[0] : reviewSection;
  const data = useMemo(() => section ? coachResultsSection(session, section) : null, [session, section]);
  if (section) {
    const Results = RESULT_SCREENS[section];
    return <Results key={section} {...data} isTimed={false} showUcatScore={false}
      summaryContent={sections.length > 1 ? <Segments values={sections.map((id) => ({ id, label: id.toUpperCase() }))}
        value={section} onChange={setReviewSection} /> : null}
      actions={sections.length === 1 ? <View style={{ gap: 12 }}>
        {onPlan && <Button title="See my personal plan" onPress={onPlan} />}
        {onContinue && <Button title="Continue with another set" disabled={busy} onPress={onContinue} />}
      </View> : null}
      onDone={sections.length > 1 ? () => setReviewSection(null) : onDone} />;
  }
  return <PremiumScreen>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
    <SafeAreaView style={resultsStyles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[resultsStyles.scrollContent, { gap: 17 }]} showsVerticalScrollIndicator={false}>
        <SessionReport report={session.report} />
        {onPlan && <Button title="See my personal plan" onPress={onPlan} />}
        {onDone && <Button title="Back to coaching" secondary onPress={onDone} />}
        <Button title="Review my answers" secondary onPress={() => setReviewSection(sections[0])} />
      </ScrollView>
    </SafeAreaView>
  </PremiumScreen>;
}
