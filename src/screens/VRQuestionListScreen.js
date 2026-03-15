import questionData from '../data/verbalReasoning/questions.json';
import SectionQuestionList from '../components/SectionQuestionList';

const PASSAGES = questionData.passages;

export default function VRQuestionListScreen({ navigation }) {
  return (
    <SectionQuestionList
      items={PASSAGES}
      getTitle={(item) => item.title}
      routeName="VRPassage"
      navigation={navigation}
    />
  );
}
