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
import { useState, useRef } from 'react';
import { useAITutor, TUTOR_ERROR } from '../hooks/useAITutor';

export default function AITutorModal({ visible, onClose, questionContext }) {
  const { messages, streamingContent, isStreaming, error, sendMessage, reset } =
    useAITutor(questionContext);

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  function handleClose() {
    reset();
    setInputText('');
    onClose();
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text || isStreaming) return;
    setInputText('');
    sendMessage(text);
  }

  function scrollToBottom() {
    flatListRef.current?.scrollToEnd({ animated: true });
  }

  // Combine committed messages with the live streaming chunk
  const displayMessages = streamingContent
    ? [...messages, { role: 'assistant', content: streamingContent, streaming: true }]
    : messages;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AI Tutor</Text>
            <Text style={styles.headerSub}>Ask me anything about this question</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={displayMessages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          ListEmptyComponent={<WelcomePrompt />}
          renderItem={({ item }) => <MessageBubble message={item} />}
        />

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
              blurOnSubmit={false}
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
      </KeyboardAvoidingView>
    </Modal>
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

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
      <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>
        {message.content}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2130',
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
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#1e2130',
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#a0aec0',
    fontSize: 14,
    fontWeight: '600',
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  welcome: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
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
