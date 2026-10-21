import Alert from '../../services/appAlert';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';
import { useSupportRefresh } from '../../hooks/useSupportRefresh';
import { useSupportNotifications } from '../../context/SupportNotificationsContext';
import { getSupportTicket, markSupportRead, replyToSupportTicket, setSupportStatus, supportError,
  supportRequestId, TICKET_STATUSES } from '../../lib/supportTickets';
import { REPORT_REASONS, LESSON_REPORT_REASONS } from '../../lib/reportQuestion';
import { SupportButton, SupportError, SupportLayout, supportStyles } from '../../components/support/SupportUI';
import { mergeSupportMessages } from '../../utils/supportConversation';

const REASONS = Object.fromEntries([...REPORT_REASONS, ...LESSON_REPORT_REASONS].map(r => [r.id, r.label]));

export default function SupportConversationScreen({ navigation, route }) {
  const { ticketId, admin = false } = route.params;
  const { user } = useAuth();
  const { refreshCounts } = useSupportNotifications();
  const { colors } = getPremiumTheme(useTheme().isDark);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const working = useRef(false);
  const olderPending = useRef(false);
  const request = useRef(null);
  const list = useRef(null);
  const messagesRef = useRef([]);
  const generation = useRef(0);
  const lastMarked = useRef(null);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const refresh = useCallback(async (isActive = () => navigation.isFocused()) => {
    const current = ++generation.current;
    try {
      const data = await getSupportTicket(ticketId, admin);
      if (!isActive() || current !== generation.current) return;
      const merged = mergeSupportMessages(messagesRef.current, data.messages, 'latest');
      messagesRef.current = merged.messages;
      setMessages(merged.messages);
      if (!merged.keptHistory) setHasOlder(data.has_older);
      setTicket(data.ticket); setError(null);
      const through = data.messages.at(-1)?.id;
      const readKey = `${user?.id}:${ticketId}:${admin}`;
      if (through != null && (lastMarked.current?.key !== readKey || through > lastMarked.current.through)) {
        await markSupportRead(ticketId, through, admin);
        lastMarked.current = { key: readKey, through };
        refreshCounts();
      }
    } catch (e) {
      if (isActive() && current === generation.current) {
        setError(supportError(e));
        if (e?.code === '42501') { setTicket(null); setMessages([]); messagesRef.current = []; }
      }
    }
  }, [ticketId, admin, user?.id, navigation, refreshCounts]);
  useSupportRefresh(refresh);

  async function loadOlder() {
    if (olderPending.current || !hasOlder) return;
    olderPending.current = true; setLoadingOlder(true);
    const before = messagesRef.current.at(-1)?.id;
    try {
      const data = await getSupportTicket(ticketId, admin, before);
      if (messagesRef.current.some(m => m.id === before)) {
        const merged = mergeSupportMessages(messagesRef.current, data.messages, 'older');
        messagesRef.current = merged.messages; setMessages(merged.messages); setHasOlder(data.has_older);
      }
    } catch (e) { Alert.alert('Could not load messages', supportError(e)); }
    finally { olderPending.current = false; setLoadingOlder(false); }
  }

  async function send() {
    if (working.current || !draft.trim()) return;
    const body = draft.trim();
    if (request.current?.body !== body) request.current = { body, id: supportRequestId() };
    working.current = true; setBusy(true);
    try {
      await replyToSupportTicket(ticketId, body, request.current.id, admin);
      setDraft(''); request.current = null;
      await refresh();
      list.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (e) { Alert.alert('Could not send reply', supportError(e)); }
    finally { working.current = false; setBusy(false); }
  }

  async function changeStatus() {
    if (working.current) return;
    working.current = true; setBusy(true);
    try {
      await setSupportStatus(ticketId, ticket.status === 'resolved' ? 'open' : 'resolved');
      await refresh();
    } catch (e) { Alert.alert('Could not update ticket', supportError(e)); }
    finally { working.current = false; setBusy(false); }
  }

  return <SupportLayout navigation={navigation} title="Conversation">
    {error && <SupportError message={error} retry={() => refresh()} />}
    {!ticket && !error && <ActivityIndicator style={{ margin: 30 }} color={colors.cyan} />}
    {ticket && <>
      {!keyboardVisible && <View style={[styles.heading, { borderBottomColor: colors.border }]}>
        <Text style={[styles.subject, { color: colors.text }]} numberOfLines={2}>{ticket.subject}</Text>
        <Text style={[supportStyles.meta, { color: colors.textSecondary }]}>
          {admin ? `${ticket.requester || 'Deleted account'} · ` : ''}{TICKET_STATUSES[ticket.status]}
        </Text>
        {!!ticket.reasons?.length && <Text style={[supportStyles.meta, { color: colors.textMuted }]} numberOfLines={2}>
          {ticket.reasons.map(reason => REASONS[reason] || reason).join(' · ')}
        </Text>}
        <View style={styles.actions}>
          {ticket.question_id && <SupportButton title="Open question" secondary
            onPress={() => navigation.navigate('SupportQuestion', { ticketId, admin })} />}
          {admin && <SupportButton title={ticket.status === 'resolved' ? 'Reopen' : 'Resolve'}
            secondary disabled={busy} onPress={changeStatus} />}
        </View>
      </View>}
      <FlatList ref={list} inverted style={{ flex: 1 }} data={messages} keyExtractor={m => String(m.id)}
        contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
        ListFooterComponent={hasOlder ? <SupportButton title="Earlier messages" secondary busy={loadingOlder} onPress={loadOlder} /> : null}
        renderItem={({ item }) => {
          const own = admin ? item.author_role === 'admin' : item.author_role === 'user';
          const system = item.author_role === 'system';
          return <View style={[styles.bubble, { alignSelf: system ? 'center' : own ? 'flex-end' : 'flex-start',
            borderColor: colors.border, backgroundColor: hexToRgba(colors.cyan, own ? 0.13 : 0.04) }]}>
            {!system && <Text style={[styles.author, { color: colors.cyan }]}>
              {item.author_role === 'admin' ? 'UCAT Genius' : own ? 'You' : ticket.requester || 'User'}
            </Text>}
            <Text selectable style={[supportStyles.body, { color: system ? colors.textMuted : colors.text }]}>{item.body}</Text>
            <Text style={[supportStyles.meta, { color: colors.textMuted }]}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>;
        }} />
      {ticket.can_reply ? <View style={[styles.composer, { borderTopColor: colors.border }]}>
        {ticket.status === 'resolved' && <Text style={[supportStyles.meta, { color: colors.textMuted }]}>Sending a reply reopens this ticket.</Text>}
        <TextInput accessibilityLabel="Reply" style={[supportStyles.input, styles.input, { color: colors.text, borderColor: colors.border }]}
          value={draft} onChangeText={setDraft} multiline maxLength={4000} editable={!busy}
          placeholder="Write a reply" placeholderTextColor={colors.textMuted} />
        <SupportButton title="Send reply" disabled={!draft.trim()} busy={busy} onPress={send} />
      </View> : <Text style={[styles.heading, { color: colors.textMuted }]}>This account has been deleted.</Text>}
    </>}
  </SupportLayout>;
}
const styles = StyleSheet.create({
  heading: { paddingHorizontal: 20, paddingBottom: 12, gap: 6, borderBottomWidth: 1 },
  subject: { fontSize: 18, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  messages: { padding: 16, gap: 12 },
  bubble: { maxWidth: '92%', padding: 14, gap: 5, borderRadius: 16, borderWidth: 1 },
  author: { fontSize: 12, fontWeight: '700' },
  composer: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, gap: 8 },
  input: { maxHeight: 120, minHeight: 48, textAlignVertical: 'top' },
});
