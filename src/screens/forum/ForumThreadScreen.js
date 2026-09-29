import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import ForumPostCard, { ForumAvatar, formatForumTime } from '../../components/forum/ForumPostCard';
import ForumReportModal from '../../components/forum/ForumReportModal';
import { returnToCommunity } from '../../navigation/forumNavigation';
import {
  blockForumMember,
  createForumReply,
  deleteOwnForumContent,
  forumErrorMessage,
  getForumState,
  getForumThread,
  moderateForumContentAsAdmin,
  reportForumContent,
  retryPendingModeration,
  setForumBan,
  subscribeToForumSubmissions,
  toggleForumLike,
} from '../../lib/forum';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';

function ReplyCard({ reply, own, depth, onReply, onLike, onReport, onReportUser, onBlock, onDelete }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const pending = ['pending', 'moderating', 'pending_review'].includes(reply.status);
  return (
    <View style={[styles.replyCard, { borderLeftColor: pending ? hexToRgba(colors.amber, 0.7) : colors.border, marginLeft: Math.min(depth, 3) * 15 }]}>
      <View style={styles.replyTop}>
        <ForumAvatar name={reply.author?.displayName} size={35} />
        <View style={styles.replyIdentity}>
          <Text style={[styles.replyName, { color: colors.text }]}>
            {reply.author?.displayName ?? 'Deleted user'}{!reply.author?.isAnonymised && reply.author?.tag ? <Text style={{ color: colors.textMuted }}>#{reply.author.tag}</Text> : null}
          </Text>
          <Text style={[styles.replyTime, { color: colors.textMuted }]}>{formatForumTime(reply.createdAt)}</Text>
        </View>
        {pending ? <Text style={[styles.checking, { color: colors.amber }]}>{reply.status === 'pending_review' ? 'IN REVIEW' : 'CHECKING'}</Text> : null}
      </View>
      <Text style={[styles.replyBody, { color: colors.textSecondary }]}>{reply.body}</Text>
      {reply.status === 'pending_review' && reply.moderationMessage ? (
        <Text style={[styles.replyReviewNote, { color: colors.amber }]}>{reply.moderationMessage}</Text>
      ) : null}
      {!pending ? (
        <View style={styles.replyActions}>
          <TouchableOpacity onPress={onLike} style={styles.smallAction}>
            <Ionicons name={reply.likedByMe ? 'heart' : 'heart-outline'} size={16} color={reply.likedByMe ? colors.red : colors.textMuted} />
            <Text style={[styles.smallText, { color: reply.likedByMe ? colors.red : colors.textMuted }]}>{reply.likeCount ?? 0}</Text>
          </TouchableOpacity>
          {onReply ? (
            <TouchableOpacity onPress={onReply} style={styles.smallAction}>
              <Ionicons name="arrow-undo-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.smallText, { color: colors.textMuted }]}>Reply</Text>
            </TouchableOpacity>
          ) : null}
          {own ? (
            <TouchableOpacity onPress={onDelete} style={styles.smallAction}><Ionicons name="trash-outline" size={16} color={colors.red} /><Text style={[styles.smallText, { color: colors.red }]}>Delete</Text></TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={onReport} style={styles.smallAction}><Ionicons name="flag-outline" size={16} color={colors.textMuted} /><Text style={[styles.smallText, { color: colors.textMuted }]}>Report reply</Text></TouchableOpacity>
              <TouchableOpacity onPress={onReportUser} style={styles.smallAction}><Ionicons name="person-remove-outline" size={16} color={colors.textMuted} /><Text style={[styles.smallText, { color: colors.textMuted }]}>Report user</Text></TouchableOpacity>
              <TouchableOpacity onPress={onBlock} style={styles.smallAction}><Ionicons name="ban-outline" size={16} color={colors.textMuted} /><Text style={[styles.smallText, { color: colors.textMuted }]}>Block user</Text></TouchableOpacity>
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

export default function ForumThreadScreen({ navigation, route }) {
  const postId = route.params?.postId;
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [thread, setThread] = useState(null);
  const [forumState, setForumState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [replying, setReplying] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportSaving, setReportSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const load = useCallback(async () => {
    try {
      const [state, value] = await Promise.all([getForumState(), getForumThread(postId)]);
      setForumState(state);
      setThread(value);
      value?.replies?.filter((reply) => ['pending', 'moderating'].includes(reply.status)).forEach((reply) => retryPendingModeration('reply', reply.id));
    } catch (error) { Alert.alert('Could not load discussion', forumErrorMessage(error)); }
    finally { setLoading(false); }
  }, [postId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => subscribeToForumSubmissions((event) => {
    if (event.type === 'reply_pending' && event.reply.postId === postId) {
      setThread((current) => current ? { ...current, replies: [...current.replies, event.reply] } : current);
    } else if (event.type === 'reply_updated') {
      setThread((current) => current ? { ...current, replies: current.replies.map((reply) => reply.id === event.reply.id ? { ...reply, ...event.reply } : reply) } : current);
    } else if (event.type === 'reply_removed') {
      setThread((current) => current ? { ...current, replies: current.replies.filter((reply) => reply.id !== event.replyId) } : current);
      Alert.alert('Reply not published', event.message || 'This reply did not meet the community guidelines.');
    } else if (event.type === 'post_removed' && event.postId === postId) {
      Alert.alert('Post not published', event.message || 'This post did not meet the community guidelines.', [{ text: 'OK', onPress: () => returnToCommunity(navigation) }]);
    } else if (event.type === 'post_updated' && event.post.id === postId) {
      setThread((current) => current ? { ...current, post: { ...current.post, ...event.post } } : current);
    } else if (event.type === 'post_status' && event.targetId === postId) {
      if (event.status === 'rejected') returnToCommunity(navigation);
      else setThread((current) => current ? { ...current, post: { ...current.post, status: event.status, moderationMessage: event.message ?? null } } : current);
    } else if (event.type === 'reply_status') {
      setThread((current) => current ? {
        ...current,
        replies: event.status === 'rejected'
          ? current.replies.filter((reply) => reply.id !== event.targetId)
          : current.replies.map((reply) => reply.id === event.targetId
            ? { ...reply, status: event.status, moderationMessage: event.message ?? null }
            : reply),
      } : current);
    }
  }), [navigation, postId]);

  const sendReply = async () => {
    const text = replyBody.trim();
    if (!text) return;
    setReplying(true);
    setReplyBody('');
    try {
      await createForumReply({ postId, body: text, parentReplyId: replyTarget?.id ?? null });
      setReplyTarget(null);
    } catch (error) {
      setReplyBody(text);
      Alert.alert('Could not reply', forumErrorMessage(error));
    } finally { setReplying(false); }
  };

  const toggleLike = async (targetType, target) => {
    const key = targetType === 'post' ? 'post' : 'replies';
    const previous = { likedByMe: !!target.likedByMe, likeCount: target.likeCount ?? 0 };
    const optimistic = { likedByMe: !previous.likedByMe, likeCount: Math.max(0, previous.likeCount + (previous.likedByMe ? -1 : 1)) };
    setThread((current) => {
      if (!current) return current;
      if (key === 'post') return { ...current, post: { ...current.post, ...optimistic } };
      return { ...current, replies: current.replies.map((reply) => reply.id === target.id ? { ...reply, ...optimistic } : reply) };
    });
    try {
      const result = await toggleForumLike(targetType, target.id);
      setThread((current) => {
        if (!current) return current;
        if (key === 'post') return { ...current, post: { ...current.post, likedByMe: result.liked, likeCount: result.likeCount } };
        return { ...current, replies: current.replies.map((reply) => reply.id === target.id ? { ...reply, likedByMe: result.liked, likeCount: result.likeCount } : reply) };
      });
    } catch (error) {
      setThread((current) => {
        if (!current) return current;
        if (key === 'post') return { ...current, post: { ...current.post, ...previous } };
        return { ...current, replies: current.replies.map((reply) => reply.id === target.id ? { ...reply, ...previous } : reply) };
      });
      Alert.alert('Could not update like', forumErrorMessage(error));
    }
  };

  const submitReport = async (reason, details) => {
    if (!reportTarget) return;
    setReportSaving(true);
    try {
      await reportForumContent({ ...reportTarget, reason, details });
      setReportTarget(null);
      Alert.alert('Report sent', 'Thank you. An administrator will review it.');
    } catch (error) { Alert.alert('Could not report', forumErrorMessage(error)); }
    finally { setReportSaving(false); }
  };

  const blockMember = (member) => Alert.alert(
    `Block ${member.displayName}?`,
    'Their posts and replies will be hidden from you. Reporting is a separate action.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block user', style: 'destructive', onPress: async () => {
        try { await blockForumMember(member.id); returnToCommunity(navigation); }
        catch (error) { Alert.alert('Could not block', forumErrorMessage(error)); }
      } },
    ],
  );

  const deleteContent = (type, id) => Alert.alert('Delete content?', 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try {
        await deleteOwnForumContent(type, id);
        if (type === 'post') returnToCommunity(navigation);
        else setThread((current) => ({ ...current, replies: current.replies.filter((reply) => reply.id !== id) }));
      } catch (error) { Alert.alert('Could not delete', forumErrorMessage(error)); }
    } },
  ]);

  const adminDelete = () => Alert.alert('Remove this post?', 'It will disappear for all students and the action will be audited.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: async () => {
      try { await moderateForumContentAsAdmin('post', post.id, 'delete', 'Removed in thread by administrator'); returnToCommunity(navigation); }
      catch (error) { Alert.alert('Could not remove', error.message); }
    } },
  ]);

  const adminToggleLock = async () => {
    try { await moderateForumContentAsAdmin('post', post.id, post.isLocked ? 'unlock' : 'lock', 'Thread moderation'); await load(); }
    catch (error) { Alert.alert('Could not update thread', error.message); }
  };

  const adminBan = () => Alert.alert('Ban this member from posting?', 'Their learning access will not be affected.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Ban', style: 'destructive', onPress: async () => {
      try { await setForumBan(post.author.id, { permanent: true, reason: 'Community guideline violation' }); Alert.alert('Posting restricted'); }
      catch (error) { Alert.alert('Could not ban', error.message); }
    } },
  ]);

  if (loading) return <PremiumScreen><AppHeader navigation={navigation} title="Discussion" /><View style={styles.center}><ActivityIndicator size="large" color={colors.cyan} /></View></PremiumScreen>;
  if (!thread?.post) return <PremiumScreen><AppHeader navigation={navigation} title="Discussion" /><View style={styles.center}><Text style={{ color: colors.text }}>This discussion is unavailable.</Text></View></PremiumScreen>;

  const post = thread.post;
  const ownPost = forumState?.memberId === post.author?.id;
  const canReply = post.status === 'published' && !post.isLocked && forumState?.postingEnabled && !forumState?.isBanned;
  const replies = thread.replies ?? [];
  const repliesById = new Map(replies.map((reply) => [reply.id, reply]));
  const getReplyDepth = (reply) => {
    let depth = 0;
    let parentId = reply.parentReplyId;
    const seen = new Set([reply.id]);
    while (parentId && !seen.has(parentId) && depth < 3) {
      seen.add(parentId);
      depth += 1;
      parentId = repliesById.get(parentId)?.parentReplyId;
    }
    return depth;
  };

  return (
    <PremiumScreen applyBottomInset>
      <AppHeader navigation={navigation} title="Discussion" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.conversation, { backgroundColor: isDark ? 'rgba(9, 23, 45, 0.94)' : '#fff', borderColor: colors.border }]}>
              <ForumPostCard post={post} embedded onLike={() => toggleLike('post', post)} />
              <View style={styles.postActions}>
                {forumState?.isAdmin ? (
                  <>
                    <TouchableOpacity style={[styles.action, { borderColor: hexToRgba(colors.red, 0.35) }]} onPress={adminDelete}>
                      <Ionicons name="trash-outline" size={17} color={colors.red} /><Text style={[styles.actionText, { color: colors.red }]}>Admin remove</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.action, { borderColor: colors.border }]} onPress={adminToggleLock}>
                      <Ionicons name={post.isLocked ? 'lock-open-outline' : 'lock-closed-outline'} size={17} color={colors.amber} /><Text style={[styles.actionText, { color: colors.amber }]}>{post.isLocked ? 'Unlock' : 'Lock'}</Text>
                    </TouchableOpacity>
                    {!ownPost ? <TouchableOpacity style={[styles.action, { borderColor: colors.border }]} onPress={adminBan}><Ionicons name="ban-outline" size={17} color={colors.purple} /><Text style={[styles.actionText, { color: colors.purple }]}>Ban user</Text></TouchableOpacity> : null}
                  </>
                ) : null}
                {ownPost ? (
                  <TouchableOpacity style={[styles.action, { borderColor: hexToRgba(colors.red, 0.35) }]} onPress={() => deleteContent('post', post.id)}>
                    <Ionicons name="trash-outline" size={17} color={colors.red} /><Text style={[styles.actionText, { color: colors.red }]}>Delete post</Text>
                  </TouchableOpacity>
                ) : post.status === 'published' ? (
                  <>
                    <TouchableOpacity style={[styles.action, { borderColor: colors.border }]} onPress={() => setReportTarget({ targetType: 'post', targetId: post.id })}>
                      <Ionicons name="flag-outline" size={17} color={colors.textMuted} /><Text style={[styles.actionText, { color: colors.textMuted }]}>Report post</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.action, { borderColor: colors.border }]} onPress={() => setReportTarget({ targetType: 'member', targetId: post.author.id })}>
                      <Ionicons name="person-remove-outline" size={17} color={colors.textMuted} /><Text style={[styles.actionText, { color: colors.textMuted }]}>Report user</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.action, { borderColor: colors.border }]} onPress={() => blockMember(post.author)}>
                      <Ionicons name="ban-outline" size={17} color={colors.textMuted} /><Text style={[styles.actionText, { color: colors.textMuted }]}>Block user</Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
              {post.images?.length ? (
                <View style={styles.previewButtons}>{post.images.map((image) => image.uri ? (
                  <TouchableOpacity key={image.id ?? image.path} onPress={() => setImagePreview(image.uri)} style={styles.previewButton}>
                    <Ionicons name="expand-outline" size={16} color={colors.cyan} /><Text style={[styles.previewText, { color: colors.cyan }]}>View screenshot</Text>
                  </TouchableOpacity>
                ) : null)}</View>
              ) : null}
              <Text style={[styles.repliesHeading, { color: colors.text, borderTopColor: colors.border }]}>{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</Text>
              {replies.length ? replies.map((item) => (
                <ReplyCard
                  key={item.id}
                  reply={item}
                  depth={getReplyDepth(item)}
                  own={forumState?.memberId === item.author?.id}
                  onLike={() => toggleLike('reply', item)}
                  onReply={canReply ? () => setReplyTarget(item) : undefined}
                  onReport={() => setReportTarget({ targetType: 'reply', targetId: item.id })}
                  onReportUser={() => setReportTarget({ targetType: 'member', targetId: item.author.id })}
                  onBlock={() => blockMember(item.author)}
                  onDelete={() => deleteContent('reply', item.id)}
                />
              )) : <Text style={[styles.noReplies, { color: colors.textMuted }]}>No replies yet. Add something helpful.</Text>}
          </View>
        </ScrollView>

        {canReply ? (
          <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: isDark ? '#071326' : '#F7FAFE' }]}>
            {replyTarget ? (
              <View style={[styles.replyingTo, { backgroundColor: hexToRgba(colors.blue, 0.1) }]}>
                <Text style={[styles.replyingToText, { color: colors.textSecondary }]} numberOfLines={1}>Replying to {replyTarget.author?.displayName ?? 'comment'}</Text>
                <TouchableOpacity onPress={() => setReplyTarget(null)} accessibilityLabel="Cancel comment reply"><Ionicons name="close" size={17} color={colors.textMuted} /></TouchableOpacity>
              </View>
            ) : null}
            <TextInput
              style={[styles.replyInput, { color: colors.text, backgroundColor: isDark ? '#0B1C35' : '#fff', borderColor: colors.border }]}
              value={replyBody}
              onChangeText={setReplyBody}
              placeholder="Write a helpful reply…"
              placeholderTextColor={colors.textMuted}
              placeholder={replyTarget ? 'Write a reply...' : 'Write a helpful reply...'}
              maxLength={2000}
              multiline
            />
            <TouchableOpacity style={[styles.send, { backgroundColor: colors.blue }]} onPress={sendReply} disabled={replying || !replyBody.trim()}>
              {replying ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={19} color="#fff" />}
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <ForumReportModal visible={!!reportTarget} onClose={() => setReportTarget(null)} onSubmit={submitReport} saving={reportSaving} />
      <Modal visible={!!imagePreview} transparent animationType="fade" onRequestClose={() => setImagePreview(null)}>
        <TouchableOpacity style={styles.imageBackdrop} activeOpacity={1} onPress={() => setImagePreview(null)}>
          {imagePreview ? <Image source={{ uri: imagePreview }} style={styles.fullImage} resizeMode="contain" /> : null}
          <View style={styles.closePreview}><Ionicons name="close" size={27} color="#fff" /></View>
        </TouchableOpacity>
      </Modal>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 18, paddingBottom: 20 },
  conversation: { borderWidth: 1, borderRadius: 20, padding: 16 },
  postActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 10 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  actionText: { fontSize: 11, fontWeight: '800' },
  previewButtons: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  previewButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  previewText: { fontSize: 11, fontWeight: '800' },
  repliesHeading: { fontSize: 17, fontWeight: '900', marginTop: 17, marginBottom: 7, paddingTop: 15, borderTopWidth: StyleSheet.hairlineWidth },
  noReplies: { textAlign: 'center', fontSize: 13, paddingVertical: 28 },
  replyCard: { borderLeftWidth: 2, paddingLeft: 12, paddingVertical: 12, marginTop: 2 },
  replyTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  replyIdentity: { flex: 1 },
  replyName: { fontSize: 13, fontWeight: '800' },
  replyTime: { fontSize: 11, marginTop: 2 },
  checking: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  replyBody: { fontSize: 14, lineHeight: 21, marginTop: 11 },
  replyReviewNote: { fontSize: 11, lineHeight: 16, fontWeight: '700', marginTop: 9 },
  replyActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginTop: 12 },
  smallAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  smallText: { fontSize: 11, fontWeight: '800' },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, padding: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 9, flexWrap: 'wrap' },
  replyingTo: { width: '100%', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  replyingToText: { flex: 1, fontSize: 12, fontWeight: '700' },
  replyInput: { flex: 1, maxHeight: 110, minHeight: 44, borderWidth: 1, borderRadius: 15, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14 },
  send: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  imageBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', alignItems: 'center', justifyContent: 'center' },
  fullImage: { width: '100%', height: '88%' },
  closePreview: { position: 'absolute', top: 52, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
});
