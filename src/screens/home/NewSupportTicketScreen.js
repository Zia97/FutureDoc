import Alert from '../../services/appAlert';
import React, { useRef, useState } from 'react';
import { ScrollView, Text, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { createSupportTicket, supportError, supportRequestId } from '../../lib/supportTickets';
import { SupportButton, SupportFilters, SupportLayout, supportStyles as styles } from '../../components/support/SupportUI';

export default function NewSupportTicketScreen({ navigation }) {
  const { colors } = getPremiumTheme(useTheme().isDark);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState('support');
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const request = useRef(null);
  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.border }];

  async function send() {
    if (sending.current) return;
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Add a subject and message', 'Describe what you need help with.');
      return;
    }
    const key = JSON.stringify({ subject: subject.trim(), message: message.trim(), kind });
    if (request.current?.key !== key) request.current = { key, id: supportRequestId() };
    sending.current = true; setBusy(true);
    try {
      const ticketId = await createSupportTicket({ subject, message, kind, requestId: request.current.id });
      if (!ticketId) throw new Error('Missing ticket');
      if (navigation.isFocused()) navigation.replace('SupportConversation', { ticketId, admin: false });
    } catch (e) {
      Alert.alert('Could not create ticket', supportError(e));
    } finally { sending.current = false; setBusy(false); }
  }

  return <SupportLayout navigation={navigation} title="New ticket">
    <SupportFilters options={[['support', 'Support request'], ['bug', 'Report a bug']]} value={kind}
      onChange={value => { if (!sending.current) setKind(value); }} />
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={styles.padded}>
      <Text style={[styles.label, { color: colors.text }]}>Subject</Text>
      <TextInput accessibilityLabel="Subject" style={inputStyle} value={subject} onChangeText={setSubject}
        maxLength={120} editable={!busy} placeholder="Brief summary" placeholderTextColor={colors.textMuted} />
      <Text style={[styles.label, { color: colors.text }]}>Message</Text>
      <TextInput accessibilityLabel="Message" style={[inputStyle, { minHeight: 160, textAlignVertical: 'top' }]}
        value={message} onChangeText={setMessage} multiline maxLength={4000} editable={!busy}
        placeholder={kind === 'bug' ? 'What happened, and what did you expect?' : 'What do you need help with?'}
        placeholderTextColor={colors.textMuted} />
      <SupportButton title="Create ticket" busy={busy} onPress={send} />
    </ScrollView>
  </SupportLayout>;
}
