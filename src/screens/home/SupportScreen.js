import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';
import { useSupportRefresh } from '../../hooks/useSupportRefresh';
import { useSupportNotifications } from '../../context/SupportNotificationsContext';
import SupportUnreadBadge from '../../components/support/SupportUnreadBadge';
import { listSupportTickets, supportError, TICKET_KINDS, TICKET_STATUSES } from '../../lib/supportTickets';
import { SupportButton, SupportError, SupportFilters, SupportLayout } from '../../components/support/SupportUI';

const STATUS_FILTERS = [['all', 'All'], ['unread', 'Unread'], ['open', 'Open'], ['resolved', 'Resolved']];
const KIND_FILTERS = [['all', 'All types'], ...Object.entries(TICKET_KINDS)];

export default function SupportScreen({ navigation, route }) {
  const admin = route.name === 'ManageSupport';
  const { user } = useAuth();
  const { counts } = useSupportNotifications();
  const unread = admin ? counts.admin_unread : counts.unread;
  const { colors } = getPremiumTheme(useTheme().isDark);
  const [status, setStatus] = useState('all');
  const [kind, setKind] = useState('all');
  const [page, setPage] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const generation = useRef(0);
  const refresh = useCallback(async (isActive = () => true) => {
    const request = ++generation.current;
    try {
      const data = await listSupportTickets({ admin, status, kind, page });
      if (isActive() && request === generation.current) { setResult(data); setError(null); }
    } catch (e) {
      if (isActive() && request === generation.current) {
        setError(supportError(e));
        if (e?.code === '42501') setResult(null);
      }
    } finally {
      if (isActive() && request === generation.current) setRefreshing(false);
    }
  }, [admin, status, kind, page, user?.id, unread]);
  useSupportRefresh(refresh);

  function changeFilter(setter, value) {
    generation.current++;
    setResult(null); setError(null); setPage(0); setter(value);
  }
  function changePage(next) {
    generation.current++;
    setResult(null); setError(null); setPage(next);
  }

  return <SupportLayout navigation={navigation} title={admin ? 'Manage support' : 'Support'} unreadCount={unread}>
    {!admin && <View style={styles.action}><SupportButton title="New ticket" onPress={() => navigation.navigate('NewSupportTicket')} /></View>}
    <SupportFilters options={STATUS_FILTERS} value={status} onChange={value => { if (value !== status) changeFilter(setStatus, value); }} />
    {admin && <SupportFilters options={KIND_FILTERS} value={kind} onChange={value => { if (value !== kind) changeFilter(setKind, value); }} />}
    {error && <SupportError message={error} retry={() => refresh()} />}
    {!result && !error ? <ActivityIndicator style={styles.loader} color={colors.cyan} /> :
      <FlatList style={styles.ticketList} data={result?.tickets ?? []} keyExtractor={item => item.id}
        contentContainerStyle={styles.list} refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); refresh(); }}
        ListEmptyComponent={!error ? <Text style={[styles.empty, { color: colors.textSecondary }]}>{status === 'all' ? 'No tickets yet' : 'No matching tickets'}</Text> : null}
        renderItem={({ item }) => <TouchableOpacity accessibilityRole="button"
          accessibilityLabel={`${item.subject}, ${TICKET_STATUSES[item.status]}${item.unread ? ', unread' : ''}`}
          style={[styles.row, { borderColor: item.unread ? colors.red : colors.border, backgroundColor: hexToRgba(colors.cyan, 0.04) }]}
          onPress={() => navigation.navigate('SupportConversation', { ticketId: item.id, admin })}>
          <View style={styles.rowHeading}>
            <Text style={[styles.subject, { color: colors.text }]} numberOfLines={2}>{item.subject}</Text>
            <SupportUnreadBadge count={item.unread ? 1 : 0} dot />
          </View>
          {admin && <Text style={{ color: colors.textSecondary }}>{item.requester}</Text>}
          <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>{item.last_message}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: colors.cyan }]}>{TICKET_KINDS[item.kind]} · {TICKET_STATUSES[item.status]}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{new Date(item.updated_at).toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>}
        ListFooterComponent={(page > 0 || (result?.total ?? 0) > 30) ? <View style={styles.pagination}>
          <SupportButton title="Previous" secondary disabled={page === 0} onPress={() => changePage(page - 1)} />
          <Text style={{ color: colors.textSecondary }}>Page {page + 1}</Text>
          <SupportButton title="Next" secondary disabled={(page + 1) * 30 >= (result?.total ?? 0)} onPress={() => changePage(page + 1)} />
        </View> : null} />}
  </SupportLayout>;
}

const styles = StyleSheet.create({
  action: { paddingHorizontal: 20, paddingBottom: 10 },
  loader: { marginTop: 40 },
  ticketList: { flex: 1 },
  list: { padding: 20, gap: 12, flexGrow: 1 },
  row: { padding: 16, borderWidth: 1, borderRadius: 16, gap: 8 },
  rowHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subject: { flex: 1, fontSize: 16, fontWeight: '700' },
  preview: { fontSize: 14, lineHeight: 20 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  meta: { fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 35 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
});
