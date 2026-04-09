import { useMemo } from 'react';
import { useTimedDMExamProgress } from '../../hooks/attempts/useTimedDMExamProgress';
import TimedDMResultsScreen from '../../components/TimedDMResultsScreen';

export default function TimedDMTestReviewScreen({ route, navigation }) {
  const { test } = route.params;
  const { completedAttempts } = useTimedDMExamProgress();

  const attempt = completedAttempts[test.id];
  const answers = attempt?.answerMap ?? {};
  const flags = useMemo(() => new Set(attempt?.flags ?? []), [attempt]);

  return (
    <TimedDMResultsScreen
      questions={test.questions}
      answers={answers}
      flags={flags}
      test={test}
      onDone={() => navigation.navigate('TimedTestList', { section: 'DM', title: 'Decision Making' })}
    />
  );
}
