import { useTimedDMExamProgress } from '../../hooks/attempts/useTimedDMExamProgress';
import TimedDMResultsScreen from '../../components/TimedDMResultsScreen';

export default function TimedDMTestReviewScreen({ route, navigation }) {
  const { test } = route.params;
  const { completedAttempts } = useTimedDMExamProgress();

  const attempt = completedAttempts[test.id];
  const answers = attempt?.answerMap ?? {};

  return (
    <TimedDMResultsScreen
      questions={test.questions}
      answers={answers}
      test={test}
      onDone={() => navigation.navigate('TimedTestList', { section: 'DM', title: 'Decision Making' })}
    />
  );
}
