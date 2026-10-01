import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { AppHeader, PremiumScreen } from '../../components/premium/PremiumPracticeUI';
import { ForumAvatar } from '../../components/forum/ForumPostCard';
import { listBlockedForumMembers, unblockForumMember } from '../../lib/forum';
import { getPremiumTheme } from '../../theme/premiumTheme';

export default function ForumBlockedUsersScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setMembers(await listBlockedForumMembers()); }
    catch (error) { Alert.alert('Could not load blocked users', error.message); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const unblock = async (member) => {
    try {
      await unblockForumMember(member.memberId);
      setMembers((current) => current.filter((item) => item.memberId !== member.memberId));
    } catch (error) { Alert.alert('Could not unblock', error.message); }
  };

  return (
    <PremiumScreen>
      <AppHeader navigation={navigation} title="Blocked users" />
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.cyan} /></View> : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.memberId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: isDark ? 'rgba(8,21,41,0.94)' : '#fff', borderColor: colors.border }]}>
              <ForumAvatar name={item.displayName} />
              <Text style={[styles.name, { color: colors.text }]}>{item.displayName}<Text style={{ color: colors.textMuted }}>#{item.tag}</Text></Text>
              <TouchableOpacity style={[styles.button, { borderColor: colors.border }]} onPress={() => unblock(item)}>
                <Text style={[styles.buttonText, { color: colors.blue }]}>Unblock</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="people-outline" size={43} color={colors.textMuted} /><Text style={[styles.emptyTitle, { color: colors.text }]}>No blocked users</Text><Text style={[styles.emptyText, { color: colors.textMuted }]}>People you block will appear here.</Text></View>}
        />
      )}
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderRadius: 17, padding: 13, marginBottom: 10 },
  name: { flex: 1, fontSize: 14, fontWeight: '800' },
  button: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { fontSize: 12, fontWeight: '900' },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 17, fontWeight: '900', marginTop: 12 },
  emptyText: { fontSize: 13, marginTop: 5 },
});
