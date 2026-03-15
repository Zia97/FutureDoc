import questionData from '../data/verbalReasoning/questions.json';
import PassageLayout from '../components/PassageLayout';
import AnswerOptionButton from '../components/AnswerOptionButton';

const PASSAGES = questionData.passages;

export default function VRPassageScreen({ route }) {
  const { index } = route.params;

  return (
    <PassageLayout
      items={PASSAGES}
      initialIndex={index}
      itemLabel="Passage"
      getTitle={(item) => item.title}
      getId={(item) => item.passageId}
      renderOptions={({ question, getOptionState, onAnswer }) =>
        question.options.map((opt) => (
          <AnswerOptionButton
            key={opt}
            label={opt}
            state={getOptionState(opt)}
            onPress={() => onAnswer(opt)}
          />
        ))
      }
    />
  );
}
