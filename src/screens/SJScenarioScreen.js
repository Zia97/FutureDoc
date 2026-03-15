import questionData from '../data/situationalJudgement/questions.json';
import PassageLayout from '../components/PassageLayout';
import AnswerOptionButton from '../components/AnswerOptionButton';
import { LABEL_SETS } from '../constants/sjLabelSets';

const SCENARIOS = questionData.scenarios;

export default function SJScenarioScreen({ route }) {
  const { index } = route.params;

  return (
    <PassageLayout
      items={SCENARIOS}
      initialIndex={index}
      itemLabel="Scenario"
      getTitle={(_, i) => `Scenario ${i + 1}`}
      getId={(item) => item.scenarioId}
      alwaysShowReason
      renderOptions={({ item, getOptionState, onAnswer }) =>
        LABEL_SETS[item.labelSet].map((opt) => (
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
