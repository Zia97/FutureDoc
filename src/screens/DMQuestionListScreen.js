import questionsData from '../data/decisionMaking/questions.json';
import SectionQuestionList from '../components/SectionQuestionList';

const QUESTIONS = questionsData.questions;

export default function DMQuestionListScreen({ navigation }) {
  return (
    <SectionQuestionList
      items={QUESTIONS}
      getTitle={(item) => item.title}
      routeName="DMQuestion"
      navigation={navigation}
    />
  );
}
