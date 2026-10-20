import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';
import { coachRequest, newCoachRequestId } from '../../services/coachingService';
import { Copy, Button } from '../../components/coaching/CoachUI';
import PremiumIcon from '../../components/premium/PremiumIcon';

const suggestions = ['What should I work on next?', 'What are my strengths so far?', 'How should I prepare around my exam date?'];

export default function CoachChatScreen({ navigation }) {
  const { user } = useAuth(), { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const headerHeight = useHeaderHeight(), insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [messages, setMessages] = useState([]), [text, setText] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(null);
  const pending = useRef(null), scroll = useRef(null);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  async function send(value = text) {
    const messageText = value.trim();
    if (!messageText || busy) return;
    setBusy(true); setError(null);
    if (!pending.current || pending.current.text !== messageText) pending.current = { requestId: newCoachRequestId(), text: messageText };
    const request = pending.current;
    const id = request.requestId;
    setMessages((current) => current.some((item) => item.id === id) ? current : [...current, { id, user_text: messageText, assistant_text: null }]);
    setText('');
    const history = messages.filter((item) => item.assistant_text).slice(-12).map(({ user_text, assistant_text }) => ({ user_text, assistant_text }));
    try {
      const result = await coachRequest(user.id, 'chat', { ...request, history });
      setMessages((current) => current.map((item) => item.id === id ? { ...item, assistant_text: result.reply } : item));
      pending.current = null;
      setTimeout(() => scroll.current?.scrollToEnd?.({ animated: true }), 100);
    } catch (e) {
      pending.current = null;
      setMessages((current) => current.filter((item) => item.id !== id));
      setText(messageText);
      if (e.code === 'pro_required') navigation.navigate('Paywall');
      else setError(e.message);
    } finally { setBusy(false); }
  }

  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bgTop }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={headerHeight}>
    <View style={{ flex: 1, minHeight: 0 }}>
      <ScrollView ref={scroll} style={{ flex: 1, minHeight: 0 }} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        onLayout={() => scroll.current?.scrollToEnd?.({ animated: false })}
        onContentSizeChange={() => scroll.current?.scrollToEnd?.({ animated: true })} contentContainerStyle={{ padding: 20, gap: 18, width: '100%', maxWidth: 800, alignSelf: 'center', paddingBottom: 24 }}>
      {!messages.length && <>
        <Copy title>Chat with your coach</Copy>
        <Copy muted>Ask about your next session, a question you found difficult or how your practice is going.</Copy>
        {suggestions.map((suggestion) => <Button key={suggestion} title={suggestion} secondary onPress={() => send(suggestion)} />)}
      </>}
      {messages.map((m) => <View key={m.id} style={{ gap: 4 }}>
        <LinearGradient colors={[colors.blue, hexToRgba(colors.blue, 0.78)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.userText}>{m.user_text}</Text>
        </LinearGradient>
        {m.assistant_text ? <View style={[styles.bubble, styles.coachBubble, { backgroundColor: isDark ? 'rgba(13, 26, 49, 0.96)' : 'rgba(255, 255, 255, 0.98)', borderColor: hexToRgba(colors.blue, isDark ? 0.28 : 0.18) }]}>
          <Text selectable style={[styles.coachText, { color: colors.text }]}>{m.assistant_text}</Text>
        </View> : busy ? <View style={[styles.thinking, { backgroundColor: isDark ? 'rgba(13, 26, 49, 0.96)' : 'rgba(255, 255, 255, 0.98)', borderColor: hexToRgba(colors.blue, isDark ? 0.28 : 0.18) }]}><ActivityIndicator size="small" color={colors.cyan} /><Text style={{ color: colors.textSecondary, fontSize: 12 }}>Your coach is thinking</Text></View> : null}
      </View>)}
      {error && <Copy>{error}</Copy>}
      </ScrollView>
      <View style={{ flexShrink: 0, borderTopWidth: 1, paddingBottom: keyboardVisible ? 0 : insets.bottom, borderColor: hexToRgba(colors.blue, isDark ? 0.18 : 0.16), backgroundColor: isDark ? 'rgba(4, 12, 25, 0.72)' : 'rgba(255, 255, 255, 0.86)' }}>
      <View style={styles.composer}>
        <TextInput accessibilityLabel="Message your coach" placeholder="Ask your coach…" placeholderTextColor={colors.textMuted} multiline maxLength={2000} value={text} editable={!busy} onChangeText={setText}
          scrollEnabled style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(8, 22, 43, 0.92)' : '#F7FAFF', borderColor: hexToRgba(colors.blue, isDark ? 0.32 : 0.22) }, !text.trim() && { opacity: 0.9 }]} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Send message" accessibilityState={{ disabled: busy || !text.trim() }} onPress={() => send()} disabled={busy || !text.trim()} style={[styles.sendButton, !text.trim() && { opacity: 0.45 }]}>
          <LinearGradient colors={[colors.cyan, colors.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sendGradient}>
            {busy ? <ActivityIndicator size="small" color="#fff" /> : <PremiumIcon name="chevron-right" size={24} color="#fff" strokeWidth={2.8} />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 14, paddingVertical: 10, width: '100%', maxWidth: 800, alignSelf: 'center' },
  bubble: { maxWidth: '85%', borderRadius: 18, paddingVertical: 11, paddingHorizontal: 15, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  coachBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 6, borderWidth: 1 },
  userText: { color: '#fff', fontSize: 14, lineHeight: 21, fontWeight: '500' },
  coachText: { fontSize: 14, lineHeight: 21, fontWeight: '500' },
  thinking: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 18, borderBottomLeftRadius: 6, paddingHorizontal: 14, height: 42, marginBottom: 10 },
  input: { flex: 1, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontWeight: '500', minHeight: 48, maxHeight: 110, textAlignVertical: 'top' },
  sendButton: { borderRadius: 14, overflow: 'hidden' },
  sendGradient: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
