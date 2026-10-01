import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { AppHeader, PremiumScreen } from '../../components/premium/PremiumPracticeUI';
import {
  getForumAdminQueue,
  moderateForumContentAsAdmin,
  resolveForumReport,
  searchForumMembers,
  setForumBan,
} from '../../lib/forum';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';
import { returnToCommunity } from '../../navigation/forumNavigation';

export default function ForumAdminScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [queue, setQueue] = useState({ pending: [], reports: [] });
  const [members, setMembers] = useState([]);
  const [memberQuery, setMemberQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [data, memberRows] = await Promise.all([getForumAdminQueue(), searchForumMembers(memberQuery)]);
      if (!data) {
        Alert.alert('Access denied', 'This screen is only available to super admins.', [{ text: 'OK', onPress: () => returnToCommunity(navigation) }]);
        return;
      }
      setQueue(data);
      setMembers(memberRows);
    } catch (error) { Alert.alert('Could not load queue', error.message); }
    finally { setLoading(false); }
  }, [navigation]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (tab !== 'users') return undefined;
    const timer = setTimeout(() => searchForumMembers(memberQuery).then(setMembers).catch(() => {}), 300);
    return () => clearTimeout(timer);
  }, [memberQuery, tab]);

  const performAction = async () => {
    if (!action) return;
    setSaving(true);
    try {
      if (action.kind === 'content') {
        await moderateForumContentAsAdmin(action.item.type, action.item.id, action.value, reason.trim() || null);
      } else if (action.kind === 'ban') {
        const until = action.value === 'ban7' ? new Date(Date.now() + 7 * 86400000).toISOString() : null;
        await setForumBan(action.item.memberId, {
          permanent: action.value === 'permanent',
          until,
          reason: action.value === 'unban' ? null : (reason.trim() || 'Community guideline violation'),
        });
      } else if (action.kind === 'report') {
        await resolveForumReport(action.item.id, action.value, reason.trim() || null);
      }
      setAction(null);
      setReason('');
      await load();
    } catch (error) { Alert.alert('Action failed', error.message); }
    finally { setSaving(false); }
  };

  const data = tab === 'pending' ? queue.pending ?? [] : tab === 'reports' ? queue.reports ?? [] : members;

  const openBanChoice = (item) => Alert.alert('Restrict forum posting', 'Choose how long this member cannot post.', [
    { text: 'Cancel', style: 'cancel' },
    { text: '7 days', onPress: () => setAction({ kind: 'ban', value: 'ban7', item }) },
    { text: 'Permanent', style: 'destructive', onPress: () => setAction({ kind: 'ban', value: 'permanent', item }) },
  ]);

  const renderPending = ({ item }) => (
    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(8,21,41,0.94)' : '#fff', borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.type, { color: colors.amber }]}>{item.type?.toUpperCase()}</Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={6}>{item.body}</Text>
      {item.moderationMessage ? <Text style={[styles.note, { color: colors.amber }]}>{item.moderationMessage}</Text> : null}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.teal }]} onPress={() => setAction({ kind: 'content', value: 'publish', item })}><Text style={styles.actionText}>Publish</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.red }]} onPress={() => setAction({ kind: 'content', value: 'delete', item })}><Text style={styles.actionText}>Delete</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.purple }]} onPress={() => openBanChoice(item)}><Text style={styles.actionText}>Ban user</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderReport = ({ item }) => (
    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(8,21,41,0.94)' : '#fff', borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.type, { color: colors.red }]}>{item.reason?.replaceAll('_', ' ').toUpperCase()}</Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>{item.targetType}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.preview || 'Reported content'}</Text>
      {item.details ? <Text style={[styles.body, { color: colors.textSecondary }]}>{item.details}</Text> : null}
      <View style={styles.actions}>
        {item.postId ? <TouchableOpacity style={[styles.actionOutline, { borderColor: colors.border }]} onPress={() => navigation.navigate('ForumThread', { postId: item.postId })}><Ionicons name="eye-outline" size={17} color={colors.text} /><Text style={[styles.outlineText, { color: colors.text }]}>Open</Text></TouchableOpacity> : null}
        {item.targetType !== 'member' ? <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.red }]} onPress={() => setAction({ kind: 'content', value: 'delete', item: { ...item, type: item.targetType, id: item.targetId } })}><Text style={styles.actionText}>Delete content</Text></TouchableOpacity> : null}
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.teal }]} onPress={() => setAction({ kind: 'report', value: 'resolved', item })}><Text style={styles.actionText}>Resolve</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.actionOutline, { borderColor: colors.border }]} onPress={() => setAction({ kind: 'report', value: 'dismissed', item })}><Text style={[styles.outlineText, { color: colors.textMuted }]}>Dismiss</Text></TouchableOpacity>
        {item.memberId ? <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.purple }]} onPress={() => openBanChoice(item)}><Text style={styles.actionText}>Ban user</Text></TouchableOpacity> : null}
      </View>
    </View>
  );

  const renderMember = ({ item }) => (
    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(8,21,41,0.94)' : '#fff', borderColor: item.isBanned ? hexToRgba(colors.red, 0.45) : colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.title, { color: colors.text, marginTop: 0 }]}>{item.displayName}<Text style={{ color: colors.textMuted }}>#{item.tag}</Text></Text>
        {item.isBanned ? <Text style={[styles.type, { color: colors.red }]}>BANNED</Text> : null}
      </View>
      <Text style={[styles.body, { color: colors.textMuted }]}>{item.email}</Text>
      <Text style={[styles.note, { color: colors.textSecondary }]}>{item.postCount} posts · {item.replyCount} replies{item.banReason ? ` · ${item.banReason}` : ''}</Text>
      <View style={styles.actions}>
        {item.isBanned ? (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.teal }]} onPress={() => setAction({ kind: 'ban', value: 'unban', item })}><Text style={styles.actionText}>Remove ban</Text></TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.purple }]} onPress={() => openBanChoice(item)}><Text style={styles.actionText}>Ban user</Text></TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <PremiumScreen>
      <AppHeader navigation={navigation} title="Forum moderation" />
      <View style={[styles.tabs, { borderColor: colors.border, backgroundColor: isDark ? '#08172C' : '#fff' }]}>
        {[['pending', `Review (${queue.pending?.length ?? 0})`], ['reports', `Reports (${queue.reports?.length ?? 0})`], ['users', 'Users']].map(([value, label]) => (
          <TouchableOpacity key={value} style={[styles.tab, tab === value && { backgroundColor: hexToRgba(colors.blue, 0.15) }]} onPress={() => setTab(value)}>
            <Text style={[styles.tabText, { color: tab === value ? colors.blue : colors.textMuted }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'users' ? (
        <View style={[styles.search, { borderColor: colors.border, backgroundColor: isDark ? '#08172C' : '#fff' }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput style={[styles.searchInput, { color: colors.text }]} value={memberQuery} onChangeText={setMemberQuery} placeholder="Search name, tag or email" placeholderTextColor={colors.textMuted} />
        </View>
      ) : null}
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.cyan} /></View> : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id ?? item.memberId}
          renderItem={tab === 'pending' ? renderPending : tab === 'reports' ? renderReport : renderMember}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="checkmark-circle-outline" size={44} color={colors.teal} /><Text style={[styles.emptyText, { color: colors.textSecondary }]}>Queue clear</Text></View>}
        />
      )}

      <Modal visible={!!action} transparent animationType="fade" onRequestClose={() => setAction(null)}>
        <View style={styles.backdrop}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#09172D' : '#fff', borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Moderator action</Text>
            <Text style={[styles.modalHelper, { color: colors.textSecondary }]}>Add a clear internal reason. This is kept in the audit log.</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#06101F' : '#F4F7FB' }]}
              value={reason}
              onChangeText={setReason}
              placeholder="Reason or review notes"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, { borderColor: colors.border }]} onPress={() => setAction(null)} disabled={saving}><Text style={[styles.outlineText, { color: colors.text }]}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: action?.value === 'delete' || action?.kind === 'ban' ? colors.red : colors.blue }]} onPress={performAction} disabled={saving}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Confirm</Text>}</TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', marginHorizontal: 18, borderWidth: 1, borderRadius: 14, padding: 4 },
  tab: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '900' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 45, borderWidth: 1, borderRadius: 13, marginHorizontal: 18, marginTop: 10, paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 14 },
  list: { padding: 18, paddingBottom: 35 },
  card: { borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  type: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  date: { fontSize: 10 },
  title: { fontSize: 16, fontWeight: '900', marginTop: 9 },
  body: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  note: { fontSize: 11, lineHeight: 17, marginTop: 9 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  actionButton: { minHeight: 38, borderRadius: 11, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  actionOutline: { minHeight: 38, borderRadius: 11, paddingHorizontal: 13, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  outlineText: { fontSize: 12, fontWeight: '900' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 15, fontWeight: '800', marginTop: 10 },
  backdrop: { flex: 1, backgroundColor: 'rgba(2,5,12,0.74)', justifyContent: 'center', padding: 22 },
  modal: { borderWidth: 1, borderRadius: 21, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  modalHelper: { fontSize: 13, lineHeight: 18, marginTop: 5 },
  input: { minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderRadius: 13, padding: 12, marginTop: 15 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 15 },
  modalButton: { flex: 1, minHeight: 46, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
