import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';

export function formatForumTime(value) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function ForumAvatar({ name, size = 40 }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  return (
    <View style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: hexToRgba(colors.blue, 0.16), borderColor: hexToRgba(colors.blue, 0.34) },
    ]}>
      <Text style={[styles.avatarText, { color: colors.blue, fontSize: size * 0.4 }]}>{name?.trim()?.[0]?.toUpperCase() ?? '?'}</Text>
    </View>
  );
}

export default function ForumPostCard({ post, onPress, compact = false, embedded = false, onLike, liking = false }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const isPending = ['pending', 'moderating', 'pending_review'].includes(post.status);
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      {...(onPress ? { activeOpacity: 0.88, onPress } : {})}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(9, 23, 45, 0.94)' : 'rgba(255,255,255,0.96)',
          borderColor: embedded ? 'transparent' : (isPending ? hexToRgba(colors.amber, 0.48) : colors.border),
          opacity: isPending ? 0.86 : 1,
        },
        embedded && styles.embedded,
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={compact ? 2 : undefined}>{post.title}</Text>
      <Text
        style={[styles.body, { color: colors.textSecondary }]}
        numberOfLines={compact ? 3 : undefined}
        ellipsizeMode="tail"
      >
        {post.body}
      </Text>

      <View style={styles.authorRow}>
        <ForumAvatar name={post.author?.displayName} size={32} />
        <View style={styles.authorCopy}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {post.author?.displayName ?? 'Deleted user'}
              {!post.author?.isAnonymised && post.author?.tag ? (
                <Text style={{ color: colors.textMuted }}>#{post.author.tag}</Text>
              ) : null}
            </Text>
            {post.author?.isAdmin ? (
              <View style={[styles.adminBadge, { backgroundColor: hexToRgba(colors.purple, 0.12), borderColor: hexToRgba(colors.purple, 0.35) }]}>
                <Text style={[styles.adminText, { color: colors.purple }]}>ADMIN</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{formatForumTime(post.createdAt)}</Text>
        </View>
        {isPending ? (
          <View style={[styles.pendingBadge, { backgroundColor: hexToRgba(colors.amber, 0.12), borderColor: hexToRgba(colors.amber, 0.35) }]}>
            <Ionicons name="sparkles-outline" size={13} color={colors.amber} />
            <Text style={[styles.pendingText, { color: colors.amber }]}>
              {post.status === 'pending_review' ? 'Review' : 'Checking'}
            </Text>
          </View>
        ) : null}
      </View>
      {post.status === 'pending_review' && post.moderationMessage ? (
        <View style={[styles.reviewNote, { backgroundColor: hexToRgba(colors.amber, 0.09), borderColor: hexToRgba(colors.amber, 0.3) }]}>
          <Text style={[styles.reviewNoteText, { color: colors.amber }]}>{post.moderationMessage}</Text>
        </View>
      ) : null}

      {post.images?.length ? (
        <View style={styles.imagesRow}>
          {post.images.slice(0, 2).map((image) => image.uri ? (
            <Image key={image.id ?? image.path ?? image.uri} source={{ uri: image.uri }} style={styles.image} resizeMode="cover" />
          ) : null)}
        </View>
      ) : null}

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={17} color={colors.textMuted} />
          <Text style={[styles.footerText, { color: colors.textMuted }]}>{post.replyCount ?? 0} replies</Text>
        </View>
        <TouchableOpacity
          style={styles.footerItem}
          disabled={!onLike || liking || isPending}
          onPress={(event) => { event?.stopPropagation?.(); onLike?.(); }}
          accessibilityLabel={`${post.likedByMe ? 'Remove like from' : 'Like'} post`}
        >
          <Ionicons name={post.likedByMe ? 'heart' : 'heart-outline'} size={18} color={post.likedByMe ? colors.red : colors.textMuted} />
          <Text style={[styles.footerText, { color: post.likedByMe ? colors.red : colors.textMuted }]}>{post.likeCount ?? 0}</Text>
        </TouchableOpacity>
        {post.isLocked ? (
          <View style={styles.footerItem}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.amber} />
            <Text style={[styles.footerText, { color: colors.amber }]}>Locked</Text>
          </View>
        ) : null}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 13 },
  embedded: { borderWidth: 0, borderRadius: 0, marginBottom: 0, padding: 0, backgroundColor: 'transparent' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12 },
  avatar: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '900' },
  authorCopy: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  name: { fontSize: 14, fontWeight: '800', flexShrink: 1 },
  meta: { fontSize: 12, marginTop: 2 },
  adminBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  adminText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  pendingBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, flexDirection: 'row', gap: 4, alignItems: 'center' },
  pendingText: { fontSize: 10, fontWeight: '900' },
  title: { fontSize: 19, lineHeight: 25, fontWeight: '900' },
  body: { fontSize: 14, lineHeight: 21, marginTop: 7 },
  reviewNote: { borderWidth: 1, borderRadius: 11, padding: 9, marginTop: 10 },
  reviewNoteText: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
  imagesRow: { flexDirection: 'row', gap: 8, marginTop: 13 },
  image: { flex: 1, height: 150, borderRadius: 13, backgroundColor: '#0B1423' },
  footer: { marginTop: 14, paddingTop: 11, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, fontWeight: '700' },
});
