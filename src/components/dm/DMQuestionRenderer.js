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

const YES_NO_TYPES = ['syllogism', 'interpreting_info'];
const MCQ_TYPES    = ['logic_puzzle', 'strongest_argument', 'probabilistic'];

/**
 * Routes a DM question to the correct answer UI based on question.type.
 *
 * Props:
 *   question   — question object from JSON
 *   answer     — current answer state:
 *                  MCQ / venn select_diagram: string label e.g. 'A'
 *                  Yes/No: object keyed by statement index e.g. { 0: 'Yes', 2: 'No' }
 *   onAnswer   — (value) => void — called with the new answer value
 *   submitted  — boolean
 */
export default function DMQuestionRenderer({ question, answer, onAnswer, submitted }) {
  const { width: screenWidth } = useWindowDimensions();
  const [diagramExpanded, setDiagramExpanded] = useState(false);

  const isYesNo      = YES_NO_TYPES.includes(question.type);
  const isMCQ        = MCQ_TYPES.includes(question.type);
  const isVenn       = question.type === 'venn_diagram';
  const isSelectVenn = isVenn && question.subtype === 'select_diagram';
  const isInterpVenn = isVenn && question.subtype === 'interpret_diagram';

  const contentWidth = screenWidth - 40; // 20px padding each side
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
      {/* Optional table */}
      {question.tableData && <DataTable tableData={question.tableData} />}

      {/* Stem */}
      <Text style={styles.stem}>{question.stem}</Text>

      {/* ── Venn: select the correct diagram ─────────────────────────── */}
      {isSelectVenn && (
        <View style={styles.vennGrid}>
          {question.options.map((opt) => {
            let borderColor = '#2d3748';
            if (submitted && opt.label === question.answer) borderColor = '#38a169';
            else if (submitted && opt.label === answer)     borderColor = '#e53e3e';
            else if (!submitted && opt.label === answer)    borderColor = '#4a9eff';

            return (
              <TouchableOpacity
                key={opt.label}
                style={[styles.vennOption, { borderColor }]}
                onPress={() => !submitted && onAnswer(opt.label)}
                activeOpacity={0.8}
                disabled={submitted}
              >
                <Text style={styles.vennOptionLabel}>{opt.label}</Text>
                <VennDiagramRenderer vennConfig={opt.vennConfig} scale={0.864} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ── Venn: interpret a given diagram ──────────────────────────── */}
      {isInterpVenn && (
        <>
          <TouchableOpacity
            style={styles.vennStimulus}
            onPress={() => setDiagramExpanded(true)}
            activeOpacity={0.85}
          >
            <VennDiagramRenderer
              vennConfig={question.stimulusDiagram}
              scale={stimulusScale}
            />
            <Text style={styles.tapHint}>Tap to expand</Text>
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
              <View style={styles.modalCard}>
                <ZoomableView maxZoom={4}>
                  <VennDiagramRenderer
                    vennConfig={question.stimulusDiagram}
                    scale={expandedScale}
                  />
                </ZoomableView>
                <Text style={styles.modalDismiss}>Tap anywhere to close</Text>
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

      {/* ── Standard MCQ ─────────────────────────────────────────────── */}
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

      {/* ── Yes / No statements ──────────────────────────────────────── */}
      {isYesNo && (
        <YesNoStatements
          statements={question.statements}
          answers={answer}
          onAnswer={(index, val) => onAnswer({ ...(answer || {}), [index]: val })}
          submitted={submitted}
        />
      )}

      {/* ── Explanation (shown after submission) ─────────────────────── */}
      {submitted && (
        <View style={styles.explanation}>
          <Text style={styles.explanationLabel}>Explanation</Text>
          <Text style={styles.explanationText}>{question.answeringReason}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  stem: {
    color: '#e2e8f0',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
  },
  mcqOptions: {
    gap: 10,
  },
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
    backgroundColor: '#16213e',
    alignItems: 'center',
  },
  vennOptionLabel: {
    color: '#90cdf4',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  vennStimulus: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#16213e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  tapHint: {
    color: '#4a9eff',
    fontSize: 11,
    marginTop: 8,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2d3748',
    padding: 20,
    alignItems: 'center',
  },
  modalDismiss: {
    color: '#4a9eff',
    fontSize: 12,
    marginTop: 14,
    opacity: 0.7,
  },
  explanation: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0891b2',
    padding: 14,
  },
  explanationLabel: {
    color: '#90cdf4',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  explanationText: {
    color: '#a0aec0',
    fontSize: 14,
    lineHeight: 21,
  },
});
