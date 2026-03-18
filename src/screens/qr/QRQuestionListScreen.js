import setsData from '../../data/quantitativeReasoning/questions.json';
import SectionQuestionList from '../../components/SectionQuestionList';

const SETS = setsData.sets;

export default function QRQuestionListScreen({ navigation }) {
  return (
    <SectionQuestionList
      items={SETS}
      getTitle={(item) => item.title}
      routeName="QRQuestion"
      navigation={navigation}
    />
  );
}
