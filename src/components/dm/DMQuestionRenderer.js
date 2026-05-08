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
import QuestionStatsBullets from '../QuestionStatsBullets';
import VennDiagramRenderer from './VennDiagramRenderer';
import VennDiagramKey from './VennDiagramKey';
import AITutorModal from '../AITutorModal';
import { useAITutor } from '../../hooks/ai/useAITutor';
import { useAICredits } from '../../hooks/ai/useAICredits';
import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';

const YES_NO_TYPES = ['syllogism', 'passage_syllogism', 'interpreting_info'];
const MCQ_TYPES    = ['logic_puzzle', 'recognising_assumptions', 'strongest_argument', 'probabilistic'];

// Derived question type flags — shared between stem and options renders
function useQuestionMeta(question, screenWidth) {
  const isYesNo      = YES_NO_TYPES.includes(question.type);
  const isMCQ        = MCQ_TYPES.includes(question.type);
  const isVenn       = question.type === 'venn_diagram';
  const stimDiagram  = question.stimulusDiagram ?? question.stimulus_diagram;
  const isSelectVenn = isVenn && (question.subtype === 'select_diagram' || question.options?.[0]?.option_data != null);
  const isInterpVenn = isVenn && (question.subtype === 'interpret_diagram' || stimDiagram != null);
  const vennKeySets  = isVenn
    ? (stimDiagram?.sets ?? question.options?.[0]?.vennConfig?.sets ?? question.options?.[0]?.option_data?.sets ?? null)
    : null;
  const contentWidth     = screenWidth - 40;
  const stimulusWidthPx  = contentWidth;
  const expandedWidthPx  = screenWidth  - 80;          // modal padding ~40 each side
  return { isYesNo, isMCQ, isVenn, isSelectVenn, isInterpVenn, vennKeySets, stimDiagram, contentWidth, stimulusWidthPx, expandedWidthPx };
}

// Renders the stem, data table, diagram stimulus — everything except the answer inputs
export function DMStemContent({ question, showLabel = true }) {
  const { width: screenWidth } = useWindowDimensions();
  const { practiceTheme: t, isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { multiplier } = useTextSize();
  const sectionColor = colors.teal;
  const [diagramExpanded, setDiagramExpanded] = useState(false);
  const { isInterpVenn, vennKeySets, stimDiagram, stimulusWidthPx, expandedWidthPx } = useQuestionMeta(question, screenWidth);

  const stemScaled = {
    fontSize: Math.round(styles.stem.fontSize * multiplier),
    lineHeight: Math.round(styles.stem.lineHeight * multiplier),
  };

  return (
    <View style={styles.container}>
      {showLabel && <Text style={[styles.sectionLabel, { color: sectionColor }]}>STEM</Text>}
      <Text style={[styles.stem, stemScaled, { color: colors.text }]}>{question.stem}</Text>

      {vennKeySets && !question.hideLabels && <VennDiagramKey sets={vennKeySets} />}

      {question.tableData && <DataTable tableData={question.tableData} />}

      {isInterpVenn && (
        <>
          <TouchableOpacity
            style={[
              styles.vennStimulus,
              {
                backgroundColor: isDark ? 'rgba(9, 22, 43, 0.72)' : 'rgba(255, 255, 255, 0.82)',
                borderColor: colors.border,
              },
            ]}
            onPress={() => setDiagramExpanded(true)}
            activeOpacity={0.85}
          >
            <VennDiagramRenderer vennConfig={stimDiagram} widthPx={stimulusWidthPx} bakedGeometry={question.stimulusVennGeometry} />
            <Text style={[styles.tapHint, { color: sectionColor }]}>Tap to expand</Text>
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
              <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ZoomableView maxZoom={4}>
                  <VennDiagramRenderer vennConfig={stimDiagram} widthPx={expandedWidthPx} bakedGeometry={question.stimulusVennGeometry} />
                </ZoomableView>
                <Text style={[styles.modalDismiss, { color: sectionColor }]}>Tap anywhere to close</Text>
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      )}
    </View>
  );
}

// Renders only the answer inputs (MCQ options, yes/no statements, venn option grid)
export function DMOptionsContent({
  question,
  answer,
  onAnswer,
  submitted,
  timedMode = false,
  onTeachMe,
  showLabel = true,
  getStatementStats,
  statementUserTimesMs,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const { practiceTheme: t, isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const sectionColor = colors.teal;
  const { isYesNo, isMCQ, isSelectVenn, isInterpVenn, contentWidth } = useQuestionMeta(question, screenWidth);

  function mcqOptionState(label) {
    if (timedMode) return label === answer ? 'selected' : 'idle';
    if (!submitted) return label === answer ? 'selected' : 'idle';
    if (label === question.answer) return 'correct';
    if (label === answer) return 'incorrect';
    return 'idle';
  }

  const optionsLabel = showLabel ? <Text style={[styles.sectionLabel, { color: sectionColor }]}>{isYesNo ? 'QUESTIONS' : 'OPTIONS'}</Text> : null;

  if (isSelectVenn) {
    // Pass the full available content width as the maximum to the adaptive baker.
    // The baker grows each diagram only as wide as needed for 12px labels,
    // so simple diagrams stay compact while dense 5-set ones use the full width.
    const optionWidthPx = contentWidth - 24;

    return (
      <View style={styles.vennGrid}>
        {optionsLabel}
        {question.options.map((opt) => {
          let borderColor = colors.border;
          if (!timedMode && submitted && opt.label === question.answer) borderColor = t.correct;
          else if (!timedMode && submitted && opt.label === answer)     borderColor = t.incorrect;
          else if (opt.label === answer)                                borderColor = sectionColor;
          const cfg = opt.vennConfig ?? opt.option_data;
          return (
            <TouchableOpacity
              key={opt.label}
              style={[
                styles.vennOption,
                {
                  backgroundColor: isDark ? 'rgba(9, 22, 43, 0.72)' : 'rgba(255, 255, 255, 0.82)',
                  borderColor,
                },
              ]}
              onPress={() => !submitted && onAnswer(opt.label)}
              activeOpacity={0.8}
              disabled={submitted}
            >
              <Text style={[styles.vennOptionLabel, { color: sectionColor }]}>{opt.label}</Text>
              <VennDiagramRenderer vennConfig={cfg} widthPx={optionWidthPx} bakedGeometry={opt.vennGeometry} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  if (isInterpVenn || isMCQ) {
    return (
      <View style={styles.mcqOptions}>
        {optionsLabel}
        {question.options.map((opt) => (
          <AnswerOptionButton
            key={opt.label}
            label={`${opt.label}.  ${opt.text}`}
            state={mcqOptionState(opt.label)}
            onPress={() => onAnswer(opt.label)}
          />
        ))}
      </View>
    );
  }

  if (isYesNo) {
    return (
      <View style={styles.yesNoContainer}>
        {optionsLabel}
        <YesNoStatements
          statements={question.statements}
          answers={answer}
          onAnswer={(index, val) => onAnswer({ ...(answer || {}), [index]: val })}
          submitted={submitted}
          timedMode={timedMode}
          onTeachMe={onTeachMe}
          getStatementStats={getStatementStats}
          statementUserTimesMs={statementUserTimesMs}
        />
      </View>
    );
  }

  return null;
}

export default function DMQuestionRenderer({
  question,
  answer,
  onAnswer,
  submitted,
  questionContext,
  timedMode = false,
  questionStats = null,
  questionUserTimeMs = null,
  getStatementStats,
  statementUserTimesMs,
}) {
  const { practiceTheme: t, isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { multiplier } = useTextSize();
  const sectionColor = colors.teal;
  const explanationScaled = {
    fontSize: Math.round(styles.explanationText.fontSize * multiplier),
    lineHeight: Math.round(styles.explanationText.lineHeight * multiplier),
  };
  const [tutorVisible, setTutorVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeTutorContext, setActiveTutorContext] = useState(null);
  const tutorState = useAITutor(activeTutorContext);
  const { creditsRemaining, isPro: isPremium, decrement: decrementCredits } = useAICredits();

  const isYesNo  = YES_NO_TYPES.includes(question.type);
  const isCorrect = isYesNo
    ? JSON.stringify(answer) === JSON.stringify(question.answer)
    : answer === question.answer;

  function handleStatementTeachMe(index) {
    const statement = question.statements[index];
    setActiveTutorContext({
      questionId: questionContext?.questionId ?? question.questionId ?? question.id,
      question: `${question.stem}\n\nStatement ${index + 1}: "${statement.text}"`,
      questionType: question.type,
      section: questionContext?.section ?? 'dm',
      correctAnswer: statement.answer,
      userAnswer: answer?.[index] ?? '',
      explanation: statement.reason ?? '',
      isTimed: questionContext?.isTimed ?? false,
    });
    setInputText('');
    setTutorVisible(true);
  }

  function handleMCQTeachMe() {
    setActiveTutorContext(questionContext);
    setInputText('');
    setTutorVisible(true);
  }

  return (
    <View style={styles.container}>
      <DMStemContent question={question} />

      <DMOptionsContent
        question={question}
        answer={answer}
        onAnswer={onAnswer}
        submitted={submitted}
        timedMode={timedMode}
        questionContext={questionContext}
        onTeachMe={questionContext ? handleStatementTeachMe : undefined}
        getStatementStats={getStatementStats}
        statementUserTimesMs={statementUserTimesMs}
      />

      {submitted && !timedMode && !isYesNo && (
        <View style={[styles.explanation, { backgroundColor: hexToRgba(sectionColor, isDark ? 0.12 : 0.08), borderLeftColor: sectionColor }]}>
          <Text style={[styles.explanationLabel, { color: sectionColor }]}>Explanation</Text>
          <Text style={[styles.explanationText, explanationScaled, { color: colors.textSecondary }]}>{question.answeringReason}</Text>
          <QuestionStatsBullets userTimeMs={questionUserTimeMs} stats={questionStats} />
          {questionContext && (
            <TouchableOpacity
              style={[
                styles.teachMeBtn,
                {
                  backgroundColor: isDark ? 'rgba(9, 22, 43, 0.86)' : 'rgba(255, 255, 255, 0.92)',
                  borderColor: colors.border,
                },
              ]}
              onPress={handleMCQTeachMe}
            >
              <Text style={[styles.teachMeBtnText, { color: colors.text }]}>Teach Me</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {activeTutorContext && !timedMode && (
        <AITutorModal
          visible={tutorVisible}
          onClose={() => setTutorVisible(false)}
          questionContext={activeTutorContext}
          tutorState={tutorState}
          inputText={inputText}
          setInputText={setInputText}
          creditsRemaining={creditsRemaining}
          isPro={isPremium}
          onCreditUsed={decrementCredits}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  yesNoContainer: { gap: 8 },
  stem: { fontSize: 15, lineHeight: 23, fontWeight: '500' },
  mcqOptions: { gap: 10 },
  vennGrid: {
    gap: 12,
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
