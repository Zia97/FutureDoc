import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Platform,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useRef, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { TUTOR_ERROR } from '../hooks/ai/useAITutor';
import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';
import { useTextSize } from '../context/TextSizeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';
import {
  AI_TUTOR_DEMO_QUESTIONS_KEY,
  AI_TUTOR_DEMO_QUESTION_LIMIT,
} from '../data/learn/learningStorageKeys';
import PremiumIcon from './premium/PremiumIcon';

function ScaledText({ baseStyle, style, children, ...rest }) {
  const { multiplier } = useTextSize();
  const scaled = {
    fontSize: Math.round(baseStyle.fontSize * multiplier),
    lineHeight: Math.round(baseStyle.lineHeight * multiplier),
  };
  return <Text style={[baseStyle, scaled, style]} {...rest}>{children}</Text>;
}

export default function AITutorModal({
  visible,
  onClose,
  questionContext,
  tutorState,
  inputText,
  setInputText,
  creditsRemaining,
  isPro,
  onCreditUsed,
  isDemo = false,
}) {
  const { messages, streamingContent, isStreaming, error, sendMessage: rawSendMessage } = tutorState;
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);

  const [demoQuestionsUsed, setDemoQuestionsUsed] = useState(0);
  const demoLimitReached = isDemo && demoQuestionsUsed >= AI_TUTOR_DEMO_QUESTION_LIMIT;

  useEffect(() => {
    if (!isDemo) return;
    let cancelled = false;
    AsyncStorage.getItem(AI_TUTOR_DEMO_QUESTIONS_KEY)
      .then((raw) => {
        if (cancelled) return;
        const n = Number.parseInt(raw ?? '0', 10);
        setDemoQuestionsUsed(Number.isFinite(n) && n >= 0 ? n : 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isDemo, visible]);

  function sendMessage(text) {
    if (isDemo && demoLimitReached) return;
    rawSendMessage(text);
    if (!isDemo && !isPro && onCreditUsed) onCreditUsed();
    if (isDemo) {
      setDemoQuestionsUsed((prev) => {
        const next = prev + 1;
        AsyncStorage.setItem(AI_TUTOR_DEMO_QUESTIONS_KEY, String(next)).catch(() => {});
        return next;
      });
    }
  }

  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { isOnline } = useNetwork();
  const [connectionPill, setConnectionPill] = useState(null);
  const wasOfflineRef = useRef(false);
  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      setConnectionPill('offline');
      return;
    }
    if (!wasOfflineRef.current) return;
    setConnectionPill('online');
    const timer = setTimeout(() => {
      setConnectionPill(null);
      wasOfflineRef.current = false;
    }, 1800);
    return () => clearTimeout(timer);
  }, [isOnline]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height + (Platform.OS === 'android' ? 32 : 0));
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  function handleSend() {
    const text = inputText.trim();
    if (!text || isStreaming || !isOnline) return;
    setInputText('');
    sendMessage(text);
  }

  function handleUpgrade() {
    onClose?.();
    setTimeout(() => navigation.navigate('Paywall'), 120);
  }

  function scrollToBottom() {
    flatListRef.current?.scrollToEnd({ animated: true });
  }

  const displayMessages = streamingContent
    ? [...messages, { role: 'assistant', content: streamingContent, streaming: true }]
    : messages;

  const bottomPad = keyboardHeight > 0 ? keyboardHeight : insets.bottom;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <View style={[styles.container, { backgroundColor: colors.bgBottom, paddingBottom: bottomPad }]}>
        <LinearGradient colors={gradients.screen} style={StyleSheet.absoluteFill} />

        <LinearGradient
          colors={[
            hexToRgba(colors.cyan, isDark ? 0.18 : 0.12),
            hexToRgba(colors.blue, isDark ? 0.08 : 0.06),
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGlow, { paddingTop: Math.max(insets.top, 12) + 8 }]}
        >
          <View style={styles.header}>
            <View
              style={[
                styles.headerIcon,
                {
                  borderColor: hexToRgba(colors.cyan, 0.42),
                  backgroundColor: isDark ? 'rgba(8, 22, 43, 0.86)' : 'rgba(255, 255, 255, 0.92)',
                  shadowColor: colors.cyan,
                },
              ]}
            >
              <PremiumIcon name="sparkles" size={22} color={colors.cyan} secondaryColor={colors.text} />
            </View>

            <View style={styles.headerCenter}>
              <Text style={[styles.headerEyebrow, { color: colors.cyan }]} numberOfLines={1}>
                AI GENIUS TUTOR
              </Text>
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                Ask me about this question
              </Text>
              {isDemo && (
                <View style={styles.creditRow}>
                  <View
                    style={[
                      styles.proPill,
                      {
                        borderColor: hexToRgba(colors.cyan, 0.5),
                        backgroundColor: hexToRgba(colors.cyan, isDark ? 0.14 : 0.1),
                      },
                    ]}
                  >
                    <Text style={[styles.creditText, { color: colors.cyan }]}>
                      FREE DEMO · {Math.min(demoQuestionsUsed, AI_TUTOR_DEMO_QUESTION_LIMIT)}/{AI_TUTOR_DEMO_QUESTION_LIMIT} QUESTIONS USED
                    </Text>
                  </View>
                </View>
              )}
              {!isDemo && !isPro && creditsRemaining != null && (
                <View style={styles.creditRow}>
                  <View
                    style={[
                      styles.creditPill,
                      {
                        borderColor: hexToRgba(colors.amber, 0.45),
                        backgroundColor: hexToRgba(colors.amber, isDark ? 0.14 : 0.1),
                      },
                    ]}
                  >
                    <Text style={[styles.creditText, { color: colors.amber }]}>
                      {creditsRemaining}/5 free explanations left
                    </Text>
                  </View>
                </View>
              )}
              {!isDemo && isPro && (
                <View style={styles.creditRow}>
                  <View
                    style={[
                      styles.proPill,
                      {
                        borderColor: hexToRgba(colors.cyan, 0.5),
                        backgroundColor: hexToRgba(colors.cyan, isDark ? 0.14 : 0.1),
                      },
                    ]}
                  >
                    <Text style={[styles.creditText, { color: colors.cyan }]}>PREMIUM · UNLIMITED</Text>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                {
                  borderColor: isDark ? 'rgba(122, 158, 214, 0.22)' : 'rgba(69, 94, 140, 0.24)',
                  backgroundColor: isDark ? 'rgba(17, 31, 55, 0.82)' : 'rgba(255, 255, 255, 0.86)',
                },
              ]}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close AI Tutor"
            >
              <Text style={[styles.closeBtnText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={[styles.headerDivider, { backgroundColor: hexToRgba(colors.blue, isDark ? 0.18 : 0.16) }]} />

        <FlatList
          style={{ flex: 1 }}
          ref={flatListRef}
          data={displayMessages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            questionContext ? (
              <QuestionContextCard context={questionContext} colors={colors} isDark={isDark} />
            ) : null
          }
          ListEmptyComponent={<WelcomePrompt colors={colors} isDark={isDark} />}
          renderItem={({ item }) => <MessageBubble message={item} colors={colors} isDark={isDark} />}
        />

        {error && <ErrorBanner error={error} onUpgrade={handleUpgrade} colors={colors} isDark={isDark} />}

        {!error && connectionPill && (
          <View
            style={[
              styles.connectionPill,
              {
                backgroundColor:
                  connectionPill === 'online'
                    ? hexToRgba(colors.mint, isDark ? 0.22 : 0.18)
                    : hexToRgba(colors.red, isDark ? 0.22 : 0.18),
                borderColor:
                  connectionPill === 'online'
                    ? hexToRgba(colors.mint, 0.6)
                    : hexToRgba(colors.red, 0.6),
              },
            ]}
          >
            <Text
              style={[
                styles.connectionPillText,
                { color: connectionPill === 'online' ? colors.mint : colors.red },
              ]}
            >
              {connectionPill === 'online' ? 'Back online' : 'Offline — reconnect to ask questions'}
            </Text>
          </View>
        )}

        {!error && demoLimitReached && (
          <DemoLimitPanel
            colors={colors}
            isDark={isDark}
            onDone={onClose}
            limit={AI_TUTOR_DEMO_QUESTION_LIMIT}
          />
        )}

        {!error && !demoLimitReached && (
          <View
            style={[
              styles.inputRow,
              {
                borderTopColor: hexToRgba(colors.blue, isDark ? 0.18 : 0.16),
                backgroundColor: isDark ? 'rgba(4, 12, 25, 0.72)' : 'rgba(255, 255, 255, 0.86)',
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: isDark ? 'rgba(8, 22, 43, 0.92)' : 'rgba(247, 250, 255, 1)',
                  borderColor: hexToRgba(colors.blue, isDark ? 0.32 : 0.22),
                },
                !isOnline && styles.inputDisabled,
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isOnline ? 'Ask a question...' : 'Offline'}
              placeholderTextColor={hexToRgba(colors.textSecondary, 0.7)}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              submitBehavior="blurAndSubmit"
              editable={isOnline}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { shadowColor: colors.cyan },
                (!inputText.trim() || isStreaming || !isOnline) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isStreaming || !isOnline}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.cyan, colors.blue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendBtnGradient}
              >
                {isStreaming ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <PremiumIcon name="chevron-right" size={24} color="#fff" strokeWidth={2.8} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

function QuestionContextCard({ context, colors, isDark }) {
  const { question, userAnswer, correctAnswer, explanation } = context;

  const normalize = (v) => (v == null ? '' : String(v).trim().toLowerCase());
  const userAnswered = normalize(userAnswer) !== '' && normalize(userAnswer) !== 'not answered';
  const userIsCorrect = userAnswered && normalize(userAnswer) === normalize(correctAnswer);
  const userAccent = userIsCorrect ? colors.mint : colors.red;

  return (
    <LinearGradient
      colors={
        isDark
          ? ['rgba(18, 35, 64, 0.96)', 'rgba(8, 22, 43, 0.96)', 'rgba(4, 10, 23, 0.98)']
          : ['rgba(255, 255, 255, 0.98)', 'rgba(246, 250, 255, 0.98)', 'rgba(235, 243, 255, 0.98)']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.contextCard,
        {
          borderColor: hexToRgba(colors.blue, isDark ? 0.32 : 0.22),
          shadowColor: colors.blue,
        },
      ]}
    >
      <View style={[styles.contextStripe, { backgroundColor: colors.cyan, shadowColor: colors.cyan }]} />

      {question ? (
        <>
          <Text style={[styles.contextLabel, { color: colors.cyan }]}>QUESTION</Text>
          <ScaledText baseStyle={styles.contextQuestion} style={{ color: colors.text }}>{question}</ScaledText>
          <View style={[styles.contextDivider, { backgroundColor: hexToRgba(colors.blue, 0.24) }]} />
        </>
      ) : null}

      <View style={styles.contextAnswerRow}>
        <View
          style={[
            styles.contextMarkBubble,
            {
              borderColor: hexToRgba(userAccent, 0.55),
              backgroundColor: hexToRgba(userAccent, isDark ? 0.18 : 0.12),
            },
          ]}
        >
          <Text style={[styles.contextMarkText, { color: userAccent }]}>{userIsCorrect ? '✓' : '✕'}</Text>
        </View>
        <View style={styles.contextAnswerTextWrap}>
          <Text style={[styles.contextAnswerHint, { color: colors.textMuted }]}>YOUR ANSWER</Text>
          <Text style={[styles.contextAnswerText, { color: userAccent }]}>{userAnswer || '—'}</Text>
        </View>
      </View>

      <View style={styles.contextAnswerRow}>
        <View
          style={[
            styles.contextMarkBubble,
            {
              borderColor: hexToRgba(colors.mint, 0.55),
              backgroundColor: hexToRgba(colors.mint, isDark ? 0.18 : 0.12),
            },
          ]}
        >
          <Text style={[styles.contextMarkText, { color: colors.mint }]}>✓</Text>
        </View>
        <View style={styles.contextAnswerTextWrap}>
          <Text style={[styles.contextAnswerHint, { color: colors.textMuted }]}>CORRECT ANSWER</Text>
          <Text style={[styles.contextAnswerText, { color: colors.mint }]}>{correctAnswer || '—'}</Text>
        </View>
      </View>

      {explanation ? (
        <>
          <View style={[styles.contextDivider, { backgroundColor: hexToRgba(colors.blue, 0.24) }]} />
          <Text style={[styles.contextLabel, { color: colors.cyan }]}>EXPLANATION</Text>
          <ScaledText baseStyle={styles.contextExplanation} style={{ color: colors.textSecondary }}>{explanation}</ScaledText>
        </>
      ) : null}
    </LinearGradient>
  );
}

function WelcomePrompt({ colors, isDark }) {
  return (
    <View style={styles.welcome}>
      <View
        style={[
          styles.welcomeIcon,
          {
            borderColor: hexToRgba(colors.cyan, 0.45),
            backgroundColor: hexToRgba(colors.cyan, isDark ? 0.14 : 0.1),
            shadowColor: colors.cyan,
          },
        ]}
      >
        <PremiumIcon name="sparkles" size={32} color={colors.cyan} secondaryColor={colors.text} />
      </View>
      <Text style={[styles.welcomeTitle, { color: colors.text }]}>Still confused?</Text>
      <ScaledText baseStyle={styles.welcomeText} style={{ color: colors.textSecondary }}>
        Tell me what part you don't understand and I'll help you work through it.
      </ScaledText>
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
    return (
      <Text key={i} style={baseStyle}>
        {part}
      </Text>
    );
  });
}

function MessageBubble({ message, colors, isDark }) {
  const { multiplier } = useTextSize();
  const isUser = message.role === 'user';
  const bubbleScaled = {
    fontSize: Math.round(styles.bubbleText.fontSize * multiplier),
    lineHeight: Math.round(styles.bubbleText.lineHeight * multiplier),
  };
  const baseStyle = [styles.bubbleText, bubbleScaled, { color: isUser ? '#fff' : colors.text }];

  if (isUser) {
    return (
      <LinearGradient
        colors={[colors.blue, hexToRgba(colors.blue, 0.78)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.bubble, styles.userBubble, { shadowColor: colors.blue }]}
      >
        <Text style={baseStyle}>{renderFormattedText(message.content, baseStyle)}</Text>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.bubble,
        styles.aiBubble,
        {
          backgroundColor: isDark ? 'rgba(13, 26, 49, 0.96)' : 'rgba(255, 255, 255, 0.98)',
          borderColor: hexToRgba(colors.blue, isDark ? 0.28 : 0.18),
        },
      ]}
    >
      <Text style={baseStyle}>
        {renderFormattedText(message.content, baseStyle)}
        {message.streaming && <Text style={[styles.cursor, { color: colors.cyan }]}>▌</Text>}
      </Text>
    </View>
  );
}

function DemoLimitPanel({ colors, isDark, onDone, limit }) {
  return (
    <LinearGradient
      colors={[
        hexToRgba(colors.cyan, isDark ? 0.18 : 0.12),
        isDark ? 'rgba(8, 17, 33, 0.96)' : 'rgba(255, 255, 255, 0.96)',
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.demoLimit,
        {
          borderColor: hexToRgba(colors.cyan, 0.55),
          shadowColor: colors.cyan,
        },
      ]}
    >
      <Text style={[styles.demoLimitTitle, { color: colors.cyan }]}>
        Demo limit reached
      </Text>
      <Text style={[styles.demoLimitText, { color: colors.textSecondary }]}>
        You've asked the maximum of {limit} demo questions. In real practice, the AI tutor
        works on every question — for now, head back and continue with the lesson.
      </Text>
      <TouchableOpacity
        style={[styles.demoLimitBtn, { shadowColor: colors.cyan }]}
        onPress={onDone}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.cyan, colors.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.demoLimitBtnGradient}
        >
          <Text style={styles.demoLimitBtnText}>Back to lesson</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

function ErrorBanner({ error, onUpgrade, colors, isDark }) {
  const isLimit = error === TUTOR_ERROR.LIFETIME_LIMIT;
  const isOffline = error === TUTOR_ERROR.OFFLINE;
  const isTutorDisabled = error === TUTOR_ERROR.TUTOR_DISABLED;
  const isDemoDisabled = error === TUTOR_ERROR.DEMO_DISABLED;
  const showUpgrade = isLimit || isDemoDisabled;

  let title;
  let body;
  if (isLimit) {
    title = 'Usage limit reached';
    body = "You've used all 5 free AI explanations. Upgrade for unlimited AI Tutor access.";
  } else if (isOffline) {
    title = "You're offline";
    body = 'Reconnect to the internet to ask the AI tutor. Your message was not sent.';
  } else if (isTutorDisabled) {
    title = 'AI tutor temporarily unavailable';
    body = "We've paused the AI tutor while we look into something. Please try again in a little while.";
  } else if (isDemoDisabled) {
    title = 'Free demo paused';
    body = "We've paused the free AI tutor demo. Sign up for Premium to keep unlimited access on every question.";
  } else {
    title = 'Something went wrong';
    body = 'Could not reach the AI tutor. Check your connection and try again.';
  }

  const accent = isLimit || isDemoDisabled ? colors.amber : isTutorDisabled ? colors.cyan : colors.red;

  return (
    <LinearGradient
      colors={[hexToRgba(accent, isDark ? 0.18 : 0.12), isDark ? 'rgba(8, 17, 33, 0.96)' : 'rgba(255, 255, 255, 0.96)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.errorBanner,
        {
          borderColor: hexToRgba(accent, 0.6),
          shadowColor: accent,
        },
      ]}
    >
      <Text style={[styles.errorTitle, { color: accent }]}>{title}</Text>
      <Text style={[styles.errorText, { color: colors.textSecondary }]}>{body}</Text>
      {showUpgrade && onUpgrade && (
        <TouchableOpacity
          style={[styles.upgradeBtn, { shadowColor: colors.cyan }]}
          onPress={onUpgrade}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.cyan, colors.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.upgradeBtnGradient}
          >
            <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGlow: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 12,
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  creditRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  creditPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  proPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  creditText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerDivider: {
    height: 1,
  },
  messageList: {
    padding: 18,
    paddingBottom: 12,
    flexGrow: 1,
  },
  contextCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 18,
    marginBottom: 18,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 18,
  },
  contextStripe: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.9 : 0,
    shadowRadius: 10,
  },
  contextLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  contextQuestion: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    marginBottom: 14,
  },
  contextDivider: {
    height: 1,
    marginBottom: 14,
    marginTop: 2,
  },
  contextExplanation: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  contextAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  contextMarkBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextMarkText: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 14,
  },
  contextAnswerTextWrap: {
    flex: 1,
  },
  contextAnswerHint: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  contextAnswerText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  welcome: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'ios' ? 0.28 : 0,
    shadowRadius: 12,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  cursor: {
    fontWeight: '900',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: '500',
    maxHeight: 110,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  sendBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'ios' ? 0.32 : 0,
    shadowRadius: 12,
  },
  sendBtnGradient: {
    width: 48,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  errorBanner: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 14,
  },
  errorTitle: {
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  upgradeBtn: {
    marginTop: 14,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: 12,
  },
  upgradeBtnGradient: {
    paddingVertical: 13,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  connectionPill: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
  },
  connectionPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  demoLimit: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 14,
  },
  demoLimitTitle: {
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  demoLimitText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  demoLimitBtn: {
    marginTop: 14,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: 12,
  },
  demoLimitBtnGradient: {
    paddingVertical: 13,
    alignItems: 'center',
  },
  demoLimitBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
