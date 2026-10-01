import { useMemo } from 'react';
import { useTimedQRExamProgress } from '../../hooks/attempts/useTimedQRExamProgress';
import TimedQRResultsScreen from '../../components/TimedQRResultsScreen';

export default function TimedQRTestReviewScreen({ route, navigation }) {
  const { test } = route.params;
  const { completedAttempts } = useTimedQRExamProgress();

  const attempt = completedAttempts[test.id];
  const answerMap = attempt?.answerMap ?? {};
  const flags = useMemo(() => new Set(attempt?.flags ?? []), [attempt]);

  const getAnswer = (setId, questionId) => answerMap[setId]?.[questionId] ?? null;

  const sets = useMemo(
    () =>
      test.sets.map((s) => ({
        ...s,
        setId: s.setId,
        questions: s.questions.map((q) => ({
          ...q,
          questionId: q.questionId ?? q.id,
        })),
      })),
    [test],
  );

  return (
    <TimedQRResultsScreen
      sets={sets}
      getAnswer={getAnswer}
      flags={flags}
      test={test}
      onDone={() => navigation.goBack()}
    />
  );
}
