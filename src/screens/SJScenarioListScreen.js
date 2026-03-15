import questionData from '../data/situationalJudgement/questions.json';
import SectionQuestionList from '../components/SectionQuestionList';

const SCENARIOS = questionData.scenarios;

export default function SJScenarioListScreen({ navigation }) {
  return (
    <SectionQuestionList
      items={SCENARIOS}
      getTitle={(_, index) => `Scenario ${index + 1}`}
      routeName="SJScenario"
      navigation={navigation}
    />
  );
}
