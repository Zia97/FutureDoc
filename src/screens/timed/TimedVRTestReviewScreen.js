import { useMemo } from 'react';
import { useTimedVRExamProgress } from '../../hooks/attempts/useTimedVRExamProgress';
import TimedVRResultsScreen from '../../components/TimedVRResultsScreen';

export default function TimedVRTestReviewScreen({ route, navigation }) {
  const { test } = route.params;
  const { completedAttempts } = useTimedVRExamProgress();

  const attempt = completedAttempts[test.id];
  const answerMap = attempt?.answerMap ?? {};

  const getAnswer = (passageId, questionId) => answerMap[passageId]?.[questionId] ?? null;

  // Normalise passage shape: ensure each passage has .id and .questions with .questionId
  const passages = useMemo(
    () =>
      test.passages.map((p) => ({
        ...p,
        id: p.id,
        resource: p.resource ?? p.body,
        questions: p.questions.map((q) => ({
          ...q,
          questionId: q.questionId ?? q.id,
        })),
      })),
    [test],
  );

  return (
    <TimedVRResultsScreen
      passages={passages}
      getAnswer={getAnswer}
      flags={new Set()}
      test={test}
      onDone={() => navigation.navigate('TimedTestList', { section: 'VR', title: 'Verbal Reasoning' })}
    />
  );
}
