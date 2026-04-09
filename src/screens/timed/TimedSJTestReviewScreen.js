import { useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTimedSJExamProgress } from '../../hooks/attempts/useTimedSJExamProgress';
import TimedSJResultsScreen from '../../components/TimedSJResultsScreen';

export default function TimedSJTestReviewScreen({ route, navigation }) {
  const { test } = route.params;
  const { completedAttempts } = useTimedSJExamProgress();

  const attempt = completedAttempts[test.id];
  const answerMap = attempt?.answerMap ?? {};
  const flags = useMemo(() => new Set(attempt?.flags ?? []), [attempt]);

  const getAnswer = (scenarioId, itemId) => answerMap[scenarioId]?.[itemId] ?? null;

  const scenarios = useMemo(
    () => test.scenarios.map((s) => ({ ...s, questions: s.items })),
    [test],
  );

  return (
    <TimedSJResultsScreen
      scenarios={scenarios}
      getAnswer={getAnswer}
      flags={flags}
      test={test}
      onDone={() => navigation.navigate('TimedTestList', { section: 'SJ', title: 'Situational Judgement' })}
    />
  );
}
