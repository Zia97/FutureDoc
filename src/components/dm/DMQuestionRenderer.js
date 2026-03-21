import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import AnswerOptionButton from '../AnswerOptionButton';
import ZoomableView from '../ZoomableView';
import DataTable from './DataTable';
import YesNoStatements from './YesNoStatements';
import VennDiagramRenderer, { getCanvasSize } from './VennDiagramRenderer';
import AITutorModal from '../AITutorModal';
import { useAITutor } from '../../hooks/ai/useAITutor';
import { useTheme } from '../../context/ThemeContext';

const YES_NO_TYPES = ['syllogism', 'interpreting_info'];
const MCQ_TYPES    = ['logic_puzzle', 'strongest_argument', 'probabilistic'];

export default function DMQuestionRenderer({ question, answer, onAnswer, submitted, questionContext }) {
  const { width: screenWidth } = useWindowDimensions();
  const { practiceTheme: t } = useTheme();
  const [diagramExpanded, setDiagramExpanded] = useState(false);
  const [tutorVisible, setTutorVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const tutorState = useAITutor(questionContext);

  const isYesNo      = YES_NO_TYPES.includes(question.type);
  const isMCQ        = MCQ_TYPES.includes(question.type);
  const isVenn       = question.type === 'venn_diagram';
  const isSelectVenn = isVenn && question.subtype === 'select_diagram';
  const isInterpVenn = isVenn && question.subtype === 'interpret_diagram';

  const isCorrect = isYesNo
    ? JSON.stringify(answer) === JSON.stringify(question.answer)
    : answer === question.answer;

  const contentWidth = screenWidth - 40;
  const stimulusCanvas = getCanvasSize(question.stimulusDiagram?.diagramLayout, question.stimulusDiagram);
  const stimulusScale  = Math.min(1.2, contentWidth / stimulusCanvas.width);
  const expandedScale  = Math.min(2.2, (screenWidth - 48) / stimulusCanvas.width);

  function mcqOptionState(label) {
    if (!submitted) return 'idle';
    if (label === question.answer) return 'correct';
    if (label === answer) return 'incorrect';
    return 'idle';
  }

  return (
    <View style={styles.container}>
      {question.tableData && <DataTable tableData={question.tableData} />}

      <Text style={[styles.stem, { color: t.text }]}>{question.stem}</Text>

      {isSelectVenn && (
        <View style={styles.vennGrid}>
          {question.options.map((opt) => {
            let borderColor = t.borderStrong;
            if (submitted && opt.label === question.answer) borderColor = t.correct;
            else if (submitted && opt.label === answer)     borderColor = t.incorrect;
            else if (!submitted && opt.label === answer)    borderColor = t.accent;

            return (
              <TouchableOpacity
                key={opt.label}
                style={[styles.vennOption, { backgroundColor: t.bgCard, borderColor }]}
                onPress={() => !submitted && onAnswer(opt.label)}
                activeOpacity={0.8}
                disabled={submitted}
              >
                <Text style={[styles.vennOptionLabel, { color: t.accent }]}>{opt.label}</Text>
                <VennDiagramRenderer vennConfig={opt.vennConfig} scale={0.864} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {isInterpVenn && (
        <>
          <TouchableOpacity
            style={[styles.vennStimulus, { backgroundColor: t.bgCard, borderColor: t.border }]}
            onPress={() => setDiagramExpanded(true)}
            activeOpacity={0.85}
          >
            <VennDiagramRenderer vennConfig={question.stimulusDiagram} scale={stimulusScale} />
            <Text style={[styles.tapHint, { color: t.accent }]}>Tap to expand</Text>
          </TouchableOpacity>

          <Modal
            visible={diagramExpanded}
            transparent
            animationType="fade"
            onRequestClose={() => setDiagramExpanded(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setDiagramExpanded(false)}
              activeOpacity={1}
            >
              <View style={[styles.modalCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
                <ZoomableView maxZoom={4}>
                  <VennDiagramRenderer vennConfig={question.stimulusDiagram} scale={expandedScale} />
                </ZoomableView>
                <Text style={[styles.modalDismiss, { color: t.accent }]}>Tap anywhere to close</Text>
              </View>
            </TouchableOpacity>
          </Modal>

          <View style={styles.mcqOptions}>
            {question.options.map((opt) => (
              <AnswerOptionButton
                key={opt.label}
                label={`${opt.label}.  ${opt.text}`}
                state={mcqOptionState(opt.label)}
                onPress={() => onAnswer(opt.label)}
              />
            ))}
          </View>
        </>
      )}

      {isMCQ && (
        <View style={styles.mcqOptions}>
          {question.options.map((opt) => (
            <AnswerOptionButton
              key={opt.label}
              label={`${opt.label}.  ${opt.text}`}
              state={mcqOptionState(opt.label)}
              onPress={() => onAnswer(opt.label)}
            />
          ))}
        </View>
      )}

      {isYesNo && (
        <YesNoStatements
          statements={question.statements}
          answers={answer}
          onAnswer={(index, val) => onAnswer({ ...(answer || {}), [index]: val })}
          submitted={submitted}
        />
      )}

      {submitted && (
        <View style={[styles.explanation, { backgroundColor: t.bgCard, borderLeftColor: t.sectionDM }]}>
          <Text style={[styles.explanationLabel, { color: t.accent }]}>Explanation</Text>
          <Text style={[styles.explanationText, { color: t.textSecondary }]}>{question.answeringReason}</Text>
          {!isCorrect && questionContext && (
            <TouchableOpacity
              style={[styles.teachMeBtn, { backgroundColor: t.bgInput, borderColor: t.borderStrong }]}
              onPress={() => setTutorVisible(true)}
            >
              <Text style={[styles.teachMeBtnText, { color: t.text }]}>Teach Me</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {questionContext && (
        <AITutorModal
          visible={tutorVisible}
          onClose={() => setTutorVisible(false)}
          questionContext={questionContext}
          tutorState={tutorState}
          inputText={inputText}
          setInputText={setInputText}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  stem: { fontSize: 15, lineHeight: 23, fontWeight: '500' },
  mcqOptions: { gap: 10 },
  vennGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  vennOption: {
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  vennOptionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  vennStimulus: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  tapHint: { fontSize: 11, marginTop: 8, opacity: 0.7 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  modalDismiss: { fontSize: 12, marginTop: 14, opacity: 0.7 },
  explanation: {
    borderRadius: 10,
    borderLeftWidth: 3,
    padding: 14,
  },
  explanationLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  explanationText: { fontSize: 14, lineHeight: 21 },
  teachMeBtn: {
    marginTop: 14,
    alignSelf: 'flex-end',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  teachMeBtnText: { fontSize: 13, fontWeight: '600' },
});
