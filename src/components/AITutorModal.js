import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRef } from 'react';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TUTOR_ERROR } from '../hooks/ai/useAITutor';

export default function AITutorModal({ visible, onClose, questionContext, tutorState, inputText, setInputText }) {
  const { messages, streamingContent, isStreaming, error, sendMessage } = tutorState;

  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  const scrollGesture = Gesture.Native();

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .simultaneousWithExternalGesture(scrollGesture)
    .onEnd((e) => {
      if (e.translationY > 80 && e.velocityY > 0) {
        onClose();
      }
    });

  function handleSend() {
    const text = inputText.trim();
    if (!text || isStreaming) return;
    setInputText('');
    sendMessage(text);
  }

  function scrollToBottom() {
    flatListRef.current?.scrollToEnd({ animated: true });
  }

  const displayMessages = streamingContent
    ? [...messages, { role: 'assistant', content: streamingContent, streaming: true }]
    : messages;

  const containerStyle = [styles.container, { paddingBottom: insets.bottom }];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={containerStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <GestureDetector gesture={panGesture}>
          <View style={styles.swipeLayer}>
            {/* Drag handle */}
            <View style={[styles.handleWrap, { paddingTop: Platform.OS === 'android' ? insets.top + 8 : 12 }]}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>AI Genius Chat</Text>
                <Text style={styles.headerSub}>Ask me anything about this question</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={12}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <GestureDetector gesture={scrollGesture}>
              <FlatList
                ref={flatListRef}
                data={displayMessages}
                keyExtractor={(_, i) => String(i)}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={scrollToBottom}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={questionContext ? <QuestionContextCard context={questionContext} /> : null}
                ListEmptyComponent={<WelcomePrompt />}
                renderItem={({ item }) => <MessageBubble message={item} />}
              />
            </GestureDetector>

            {/* Error banner */}
            {error && <ErrorBanner error={error} />}

            {/* Input */}
            {!error && (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Ask a question..."
                  placeholderTextColor="#718096"
                  multiline
                  maxLength={500}
                  onSubmitEditing={handleSend}
                  submitBehavior="blurAndSubmit"
                />
                <TouchableOpacity
                  style={[styles.sendBtn, (!inputText.trim() || isStreaming) && styles.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={!inputText.trim() || isStreaming}
                >
                  {isStreaming ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.sendBtnText}>Send</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </GestureDetector>
      </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

function QuestionContextCard({ context }) {
  const { question, userAnswer, correctAnswer, explanation } = context;

  return (
    <View style={styles.contextCard}>
      {question ? (
        <>
          <Text style={styles.contextLabel}>Question</Text>
          <Text style={styles.contextQuestion}>{question}</Text>
          <View style={styles.contextDivider} />
        </>
      ) : null}

      <View style={styles.contextAnswerRow}>
        <Text style={styles.contextAnswerMark}>✗</Text>
        <View style={styles.contextAnswerTextWrap}>
          <Text style={styles.contextAnswerHint}>Your answer</Text>
          <Text style={[styles.contextAnswerText, styles.contextAnswerWrong]}>
            {userAnswer || '—'}
          </Text>
        </View>
      </View>

      <View style={styles.contextAnswerRow}>
        <Text style={[styles.contextAnswerMark, styles.contextCorrectMark]}>✓</Text>
        <View style={styles.contextAnswerTextWrap}>
          <Text style={styles.contextAnswerHint}>Correct answer</Text>
          <Text style={[styles.contextAnswerText, styles.contextAnswerCorrect]}>
            {correctAnswer || '—'}
          </Text>
        </View>
      </View>

      {explanation ? (
        <>
          <View style={styles.contextDivider} />
          <Text style={styles.contextLabel}>EXPLANATION</Text>
          <Text style={styles.contextExplanation}>{explanation}</Text>
        </>
      ) : null}
    </View>
  );
}

function WelcomePrompt() {
  return (
    <View style={styles.welcome}>
      <Text style={styles.welcomeTitle}>Still confused?</Text>
      <Text style={styles.welcomeText}>
        Tell me what part you don't understand and I'll help you work through it.
      </Text>
    </View>
  );
}

function renderFormattedText(text, baseStyle) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={[baseStyle, { fontWeight: '700' }]}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={i} style={baseStyle}>{part}</Text>;
  });
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const baseStyle = [styles.bubbleText, isUser ? styles.userText : styles.aiText];
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
      <Text style={baseStyle}>
        {renderFormattedText(message.content, baseStyle)}
        {message.streaming && <Text style={styles.cursor}>▌</Text>}
      </Text>
    </View>
  );
}

function ErrorBanner({ error }) {
  const isLimit = error === TUTOR_ERROR.DAILY_LIMIT || error === TUTOR_ERROR.LIFETIME_LIMIT;
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorTitle}>
        {isLimit ? 'Usage limit reached' : 'Something went wrong'}
      </Text>
      <Text style={styles.errorText}>
        {error === TUTOR_ERROR.LIFETIME_LIMIT
          ? "You've used all 3 free AI sessions. Upgrade to Premium for 10 sessions per day."
          : error === TUTOR_ERROR.DAILY_LIMIT
          ? "You've reached your 10 daily AI sessions. Come back tomorrow or manage your plan."
          : 'Could not reach the AI tutor. Check your connection and try again.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
  swipeLayer: {
    flex: 1,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2a2f45',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2130',
    gap: 10,
  },
  headerCenter: {
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: '#718096',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSub: {
    color: '#718096',
    fontSize: 12,
    marginTop: 2,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  contextCard: {
    backgroundColor: '#161a27',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2f45',
  },
  contextLabel: {
    color: '#4a5568',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  contextQuestion: {
    color: '#cbd5e0',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  contextDivider: {
    height: 1,
    backgroundColor: '#2a2f45',
    marginBottom: 12,
  },
  contextExplanation: {
    color: '#a0aec0',
    fontSize: 13,
    lineHeight: 19,
  },
  contextAnswerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  contextAnswerMark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e53e3e',
    width: 16,
    marginTop: 1,
  },
  contextCorrectMark: {
    color: '#38a169',
  },
  contextAnswerTextWrap: {
    flex: 1,
  },
  contextAnswerHint: {
    color: '#4a5568',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  contextAnswerText: {
    fontSize: 13,
    lineHeight: 19,
  },
  contextAnswerWrong: {
    color: '#fc8181',
  },
  contextAnswerCorrect: {
    color: '#68d391',
  },
  welcome: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  welcomeTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    color: '#718096',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#3b5bdb',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#1e2130',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#e2e8f0',
  },
  cursor: {
    color: '#a0aec0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e2130',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e2130',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#3b5bdb',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 64,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  errorBanner: {
    margin: 16,
    padding: 16,
    backgroundColor: '#2a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e53e3e',
  },
  errorTitle: {
    color: '#fc8181',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
  },
  errorText: {
    color: '#a0aec0',
    fontSize: 13,
    lineHeight: 20,
  },
});
