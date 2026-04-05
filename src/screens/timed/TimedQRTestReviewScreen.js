import { useMemo } from 'react';
import { useTimedQRExamProgress } from '../../hooks/attempts/useTimedQRExamProgress';
import TimedQRResultsScreen from '../../components/TimedQRResultsScreen';

export default function TimedQRTestReviewScreen({ route, navigation }) {
  const { test } = route.params;
  const { completedAttempts } = useTimedQRExamProgress();

  const attempt = completedAttempts[test.id];
  const answerMap = attempt?.answerMap ?? {};

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
      flags={new Set()}
      test={test}
      onDone={() => navigation.navigate('TimedTestList', { section: 'QR', title: 'Quantitative Reasoning' })}
    />
  );
}
