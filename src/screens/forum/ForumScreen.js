import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { AppHeader, PremiumScreen } from '../../components/premium/PremiumPracticeUI';
import ForumPostCard from '../../components/forum/ForumPostCard';
import ForumGuidelinesModal from '../../components/forum/ForumGuidelinesModal';
import {
  acceptForumGuidelines,
  forumErrorMessage,
  getForumState,
  listForumPosts,
  retryPendingModeration,
  subscribeToForumSubmissions,
  toggleForumLike,
} from '../../lib/forum';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';
import { reportError } from '../../lib/reportError';

export default function ForumScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [forumState, setForumState] = useState(null);
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [guidelinesVisible, setGuidelinesVisible] = useState(false);
  const [guidelinesSaving, setGuidelinesSaving] = useState(false);
  const retrying = useRef(new Set());

  const load = useCallback(async ({ refresh = false, search = appliedQuery } = {}) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const [state, rows] = await Promise.all([
        getForumState(),
        listForumPosts({ query: search }),
      ]);
      setForumState(state);
      setPosts(rows);
      setHasMore(rows.length >= 20);

      rows.filter((post) => ['pending', 'moderating'].includes(post.status) && !retrying.current.has(post.id)).forEach((post) => {
        retrying.current.add(post.id);
        retryPendingModeration('post', post.id).finally(() => retrying.current.delete(post.id));
      });
    } catch (error) {
      reportError('ForumScreen.load', error, { extra: { query: search } });
      Alert.alert('Could not load community', forumErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [appliedQuery]);

  useFocusEffect(useCallback(() => { load({ refresh: true }); }, [load]));

  useEffect(() => {
    const timer = setTimeout(() => setAppliedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => { if (!loading) load({ search: appliedQuery }); }, [appliedQuery]);

  useEffect(() => subscribeToForumSubmissions((event) => {
    if (event.type === 'post_pending') {
      setPosts((current) => [event.post, ...current.filter((post) => post.id !== event.post.id)]);
    } else if (event.type === 'post_updated') {
      setPosts((current) => current.map((post) => post.id === event.post.id ? { ...post, ...event.post } : post));
    } else if (event.type === 'post_removed') {
      setPosts((current) => current.filter((post) => post.id !== event.postId));
      Alert.alert('Post not published', event.message || 'This post did not meet the community guidelines.');
    } else if (event.type === 'post_deleted') {
      setPosts((current) => current.filter((post) => post.id !== event.postId));
    } else if (event.type === 'post_status') {
      if (event.status === 'rejected') {
        setPosts((current) => current.filter((post) => post.id !== event.targetId));
        Alert.alert('Post not published', event.message || 'This post did not meet the community guidelines.');
      } else {
        setPosts((current) => current.map((post) => post.id === event.targetId
          ? { ...post, status: event.status, moderationMessage: event.message ?? null }
          : post));
      }
    }
  }), []);

  const loadMore = async () => {
    if (loadingMore || !hasMore || !posts.length) return;
    setLoadingMore(true);
    try {
      const rows = await listForumPosts({ query: appliedQuery, before: posts[posts.length - 1]?.createdAt });
      setPosts((current) => [...current, ...rows.filter((row) => !current.some((item) => item.id === row.id))]);
      setHasMore(rows.length >= 20);
    } catch {} finally { setLoadingMore(false); }
  };

  const openComposer = () => {
    if (!forumState?.hasAcceptedGuidelines) {
      setGuidelinesVisible(true);
      return;
    }
    if (forumState?.isBanned) {
      Alert.alert('Posting restricted', forumState.banReason || 'Your account cannot currently post in the community.');
      return;
    }
    navigation.navigate('CreateForumPost');
  };

  const acceptGuidelines = async () => {
    setGuidelinesSaving(true);
    try {
      await acceptForumGuidelines(forumState?.guidelinesVersion);
      setForumState((current) => ({ ...current, hasAcceptedGuidelines: true }));
      setGuidelinesVisible(false);
      navigation.navigate('CreateForumPost');
    } catch (error) {
      Alert.alert('Could not save', forumErrorMessage(error));
    } finally { setGuidelinesSaving(false); }
  };

  const togglePostLike = async (post) => {
    if (post.status !== 'published') return;
    const previous = { likedByMe: !!post.likedByMe, likeCount: post.likeCount ?? 0 };
    const optimistic = { likedByMe: !previous.likedByMe, likeCount: Math.max(0, previous.likeCount + (previous.likedByMe ? -1 : 1)) };
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, ...optimistic } : item));
    try {
      const result = await toggleForumLike('post', post.id);
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, likedByMe: result.liked, likeCount: result.likeCount } : item));
    } catch (error) {
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, ...previous } : item));
      Alert.alert('Could not update like', forumErrorMessage(error));
    }
  };

  const header = (
    <View>
      <View style={styles.heroRow}>
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: colors.cyan }]}>UCAT COMMUNITY</Text>
          <Text style={[styles.heading, { color: colors.text }]}>Learn together</Text>
          <Text style={[styles.intro, { color: colors.textSecondary }]}>Ask questions, share techniques and support other students.</Text>
        </View>
        {forumState?.isAdmin ? (
          <TouchableOpacity
            style={[styles.adminButton, { borderColor: hexToRgba(colors.purple, 0.42), backgroundColor: hexToRgba(colors.purple, 0.12) }]}
            onPress={() => navigation.navigate('ForumAdmin')}
          >
            <Ionicons name="shield-checkmark-outline" size={21} color={colors.purple} />
            <Text style={[styles.adminButtonText, { color: colors.purple }]}>Admin</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.adminButton, { borderColor: colors.border, backgroundColor: hexToRgba(colors.blue, 0.08) }]}
          onPress={() => navigation.navigate('ForumBlockedUsers')}
        >
          <Ionicons name="ban-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.adminButtonText, { color: colors.textMuted }]}>Blocked</Text>
        </TouchableOpacity>
      </View>

      {!forumState?.hasAcceptedGuidelines ? (
        <TouchableOpacity style={[styles.notice, { borderColor: hexToRgba(colors.amber, 0.4), backgroundColor: hexToRgba(colors.amber, 0.1) }]} onPress={() => setGuidelinesVisible(true)}>
          <Ionicons name="information-circle-outline" size={21} color={colors.amber} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>Read and accept the community guidelines before posting.</Text>
        </TouchableOpacity>
      ) : null}

      <View style={[styles.search, { backgroundColor: isDark ? 'rgba(7,18,36,0.92)' : '#fff', borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Search discussions"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          maxLength={100}
        />
        {query ? <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={colors.textMuted} /></TouchableOpacity> : null}
      </View>
    </View>
  );

  if (loading && !posts.length) {
    return (
      <PremiumScreen>
        <AppHeader navigation={navigation} title="Community" />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.cyan} /></View>
      </PremiumScreen>
    );
  }

  if (forumState && !forumState.readEnabled) {
    return (
      <PremiumScreen>
        <AppHeader navigation={navigation} title="Community" />
        <View style={styles.center}>
          <Ionicons name="construct-outline" size={46} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Community is temporarily unavailable</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Please check back shortly.</Text>
        </View>
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen>
      <AppHeader navigation={navigation} title="Community" />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ForumPostCard post={item} compact onPress={() => navigation.navigate('ForumThread', { postId: item.id })} onLike={() => togglePostLike(item)} />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={42} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{appliedQuery ? 'No matching discussions' : 'Start the first discussion'}</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Questions, tips and thoughtful discussion are welcome.</Text>
          </View>
        )}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.more} color={colors.cyan} /> : <View style={styles.bottomSpace} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ refresh: true })} tintColor={colors.cyan} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: forumState?.postingEnabled ? colors.blue : colors.border, shadowColor: colors.blue }]}
        onPress={openComposer}
        disabled={!forumState?.postingEnabled}
        accessibilityLabel="Create a forum post"
      >
        <Ionicons name="create-outline" size={25} color="#fff" />
      </TouchableOpacity>

      <ForumGuidelinesModal
        visible={guidelinesVisible}
        saving={guidelinesSaving}
        onClose={() => setGuidelinesVisible(false)}
        onAccept={acceptGuidelines}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 18, paddingBottom: 90 },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  heroCopy: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.6 },
  heading: { fontSize: 29, lineHeight: 35, fontWeight: '900', marginTop: 4 },
  intro: { fontSize: 14, lineHeight: 21, marginTop: 6, maxWidth: 290 },
  adminButton: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 9, alignItems: 'center', gap: 3 },
  adminButtonText: { fontSize: 10, fontWeight: '900' },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 13 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, minHeight: 48, marginBottom: 18 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  empty: { alignItems: 'center', paddingVertical: 70, paddingHorizontal: 25 },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginTop: 13 },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 6 },
  fab: { position: 'absolute', right: 20, bottom: 25, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.34, shadowRadius: 14, elevation: 6 },
  more: { marginVertical: 20 },
  bottomSpace: { height: 18 },
});
