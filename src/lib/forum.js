import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';

import { supabase } from './supabase';
import { reportError } from './reportError';

export const FORUM_MAX_IMAGES = 2;
export const FORUM_GUIDELINES_VERSION = '2026-09-28';

const submissionListeners = new Set();
function emitSubmission(event) {
  submissionListeners.forEach((listener) => {
    try { listener(event); } catch {}
  });
}

export function subscribeToForumSubmissions(listener) {
  submissionListeners.add(listener);
  return () => submissionListeners.delete(listener);
}

const friendlyErrors = {
  display_name_required: 'Please choose a display name before entering the community.',
  not_authenticated: 'Please sign in again before opening the community.',
  guidelines_required: 'Please accept the community guidelines first.',
  forum_banned: 'Your account is currently restricted from posting in the community.',
  forum_read_only: 'The community is temporarily read-only.',
  rate_limit_cooldown: 'Please wait a moment before posting again.',
  rate_limit_reached: 'You have reached the posting limit. Please try again later.',
  invalid_title: 'Titles must be between 5 and 120 characters.',
  invalid_body: 'Posts must be between 10 and 5,000 characters.',
  invalid_reply: 'Replies must be between 1 and 2,000 characters.',
  reply_unavailable: 'That comment is no longer available to reply to.',
  like_target_not_found: 'That item is no longer available to like.',
  image_limit_reached: 'You can attach up to two screenshots.',
  invalid_image: 'That screenshot could not be accepted.',
  thread_unavailable: 'This discussion is no longer accepting replies.',
};

function errorCode(error) {
  const message = String(error?.message ?? '');
  return Object.keys(friendlyErrors).find((key) => message.includes(key));
}

export function forumErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return friendlyErrors[errorCode(error)] ?? fallback;
}

function appHeaders() {
  return {
    'x-app-version': Constants.expoConfig?.version ?? 'unknown',
    'x-platform': Platform.OS,
  };
}

export async function getForumState() {
  const { data, error } = await supabase.rpc('forum_get_my_state');
  if (error) throw error;
  return data;
}

export async function acceptForumGuidelines(version = FORUM_GUIDELINES_VERSION) {
  const { error } = await supabase.rpc('forum_accept_guidelines', { p_version: version });
  if (error) throw error;
}

async function addSignedImageUrls(items) {
  const paths = [];
  for (const item of items ?? []) {
    for (const image of item.images ?? []) if (image.path) paths.push(image.path);
  }
  if (!paths.length) return items ?? [];

  const { data, error } = await supabase.storage.from('forum-media').createSignedUrls(paths, 3600);
  if (error) {
    reportError('forum.signImages', error);
    return items ?? [];
  }
  const urls = new Map((data ?? []).map((row) => [row.path, row.signedUrl]));
  return (items ?? []).map((item) => ({
    ...item,
    images: (item.images ?? []).map((image) => ({ ...image, uri: urls.get(image.path) ?? null })),
  }));
}

export async function listForumPosts({ query = '', before = null, limit = 20 } = {}) {
  const { data, error } = await supabase.rpc('forum_list_posts', {
    p_query: query.trim() || null,
    p_before: before,
    p_limit: limit,
  });
  if (error) throw error;
  return addSignedImageUrls(Array.isArray(data) ? data : []);
}

export async function getForumThread(postId) {
  const { data, error } = await supabase.rpc('forum_get_thread', { p_post_id: postId });
  if (error) throw error;
  if (!data?.post) return null;
  const [post] = await addSignedImageUrls([data.post]);
  return { ...data, post };
}

export async function pickForumImages(remaining = FORUM_MAX_IMAGES) {
  // Android's system photo picker grants access only to the selected files and
  // does not need broad library permission. iOS still requires the explicit
  // photo-library prompt configured in app.json.
  if (Platform.OS === 'ios') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new Error('Photo access is needed to attach screenshots.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: Math.max(1, Math.min(remaining, FORUM_MAX_IMAGES)),
    quality: 1,
    exif: false,
  });
  if (result.canceled) return [];

  const output = [];
  for (const asset of result.assets.slice(0, remaining)) {
    const longest = Math.max(asset.width ?? 0, asset.height ?? 0);
    const resize = longest > 2000
      ? (asset.width >= asset.height ? { width: 2000 } : { height: 2000 })
      : null;
    const manipulated = await ImageManipulator.manipulateAsync(
      asset.uri,
      resize ? [{ resize }] : [],
      { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG },
    );
    const blob = await (await fetch(manipulated.uri)).blob();
    if (blob.size > 5242880) throw new Error('Each screenshot must be smaller than 5 MB.');
    output.push({
      uri: manipulated.uri,
      width: manipulated.width,
      height: manipulated.height,
      byteSize: blob.size,
      mimeType: 'image/jpeg',
    });
  }
  return output;
}

async function uploadPostImages(postId, images) {
  if (!images?.length) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');

  const registered = [];
  const uploadedPaths = [];
  try {
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      const path = `${user.id}/${postId}/${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}.jpg`;
      const bytes = await (await fetch(image.uri)).arrayBuffer();
      const { error: uploadError } = await supabase.storage.from('forum-media').upload(path, bytes, {
        contentType: image.mimeType,
        upsert: false,
      });
      if (uploadError) throw uploadError;
      uploadedPaths.push(path);
      const { data: attachmentId, error: registerError } = await supabase.rpc('forum_register_attachment', {
        p_post_id: postId,
        p_storage_path: path,
        p_mime_type: image.mimeType,
        p_byte_size: image.byteSize,
        p_width: image.width,
        p_height: image.height,
      });
      if (registerError) throw registerError;
      registered.push({ id: attachmentId, path, uri: image.uri, width: image.width, height: image.height });
    }
    return registered;
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from('forum-media').remove(uploadedPaths).catch(() => {});
    }
    throw error;
  }
}

export async function moderateForumContent(targetType, targetId) {
  const { data, error } = await supabase.functions.invoke('moderate-forum-content', {
    body: { targetType, targetId },
    headers: appHeaders(),
  });
  if (error) throw error;
  return data;
}

export async function createForumPost({ title, body, images = [], onPending }) {
  const { data: pending, error } = await supabase.rpc('forum_create_pending_post', {
    p_title: title,
    p_body: body,
  });
  if (error) throw error;

  const optimistic = { ...pending, images: images.map((image, index) => ({ ...image, id: `local-${index}` })) };
  onPending?.(optimistic);
  emitSubmission({ type: 'post_pending', post: optimistic });

  let uploaded;
  try {
    uploaded = await uploadPostImages(pending.id, images);
  } catch (submissionError) {
    reportError('forum.uploadPost', submissionError, { extra: { postId: pending.id } });
    await deleteOwnForumContent('post', pending.id).catch(() => {});
    emitSubmission({ type: 'post_removed', postId: pending.id, message: 'Your screenshots could not be uploaded.' });
    throw submissionError;
  }

  try {
    const moderation = await moderateForumContent('post', pending.id);
    const nextPost = {
      ...pending,
      images: uploaded,
      status: moderation?.status ?? 'pending_review',
      moderationMessage: moderation?.message ?? null,
    };
    if (moderation?.status === 'rejected') {
      emitSubmission({ type: 'post_removed', postId: pending.id, message: moderation.message });
    } else {
      emitSubmission({ type: 'post_updated', post: nextPost });
    }
    return { post: nextPost, moderation };
  } catch (moderationError) {
    reportError('forum.moderatePost', moderationError, { extra: { postId: pending.id } });
    const queuedPost = { ...pending, images: uploaded, status: 'pending' };
    emitSubmission({ type: 'post_updated', post: queuedPost });
    return { post: queuedPost, moderation: { status: 'pending', retryNeeded: true } };
  }
}

export async function createForumReply({ postId, body, parentReplyId = null, onPending }) {
  const { data: pending, error } = await supabase.rpc('forum_create_pending_reply', {
    p_post_id: postId,
    p_body: body,
    p_parent_reply_id: parentReplyId,
  });
  if (error) throw error;
  onPending?.(pending);
  emitSubmission({ type: 'reply_pending', reply: pending });
  let moderation;
  try {
    moderation = await moderateForumContent('reply', pending.id);
  } catch (moderationError) {
    reportError('forum.moderateReply', moderationError, { extra: { replyId: pending.id } });
    return { reply: pending, moderation: { status: 'pending', retryNeeded: true } };
  }
  const nextReply = {
    ...pending,
    status: moderation?.status ?? 'pending_review',
    moderationMessage: moderation?.message ?? null,
  };
  if (moderation?.status === 'rejected') {
    emitSubmission({ type: 'reply_removed', replyId: pending.id, postId, message: moderation.message });
  } else {
    emitSubmission({ type: 'reply_updated', reply: nextReply });
  }
  return { reply: nextReply, moderation };
}

export async function toggleForumLike(targetType, targetId) {
  const { data, error } = await supabase.rpc('forum_toggle_like', {
    p_target_type: targetType,
    p_target_id: targetId,
  });
  if (error) throw error;
  return data;
}

export async function retryPendingModeration(targetType, targetId) {
  try {
    const result = await moderateForumContent(targetType, targetId);
    emitSubmission({ type: `${targetType}_status`, targetId, ...result });
    return result;
  }
  catch (error) {
    reportError('forum.retryModeration', error, { extra: { targetType, targetId } });
    return null;
  }
}

export async function reportForumContent({ targetType, targetId, reason, details = '' }) {
  const { data: reportId, error } = await supabase.rpc('forum_report_content', {
    p_target_type: targetType,
    p_target_id: targetId,
    p_reason: reason,
    p_details: details,
  });
  if (error) throw error;
  supabase.functions.invoke('notify-forum-report', { body: { reportId } }).catch((notifyError) => {
    reportError('forum.notifyReport', notifyError, { extra: { reportId } });
  });
}

export async function blockForumMember(memberId) {
  const { error } = await supabase.rpc('forum_block_member', { p_member_id: memberId });
  if (error) throw error;
}

export async function listBlockedForumMembers() {
  const { data, error } = await supabase.rpc('forum_list_blocked_members');
  if (error) throw error;
  return data ?? [];
}

export async function unblockForumMember(memberId) {
  const { error } = await supabase.rpc('forum_unblock_member', { p_member_id: memberId });
  if (error) throw error;
}

export async function deleteOwnForumContent(targetType, targetId) {
  const { error } = await supabase.rpc('forum_delete_own_content', {
    p_target_type: targetType,
    p_target_id: targetId,
  });
  if (error) throw error;

  if (targetType === 'post') {
    // Remove the post from any mounted lists before the optional storage
    // cleanup completes, so deletion feels immediate.
    emitSubmission({ type: 'post_deleted', postId: targetId });
    supabase.functions.invoke('cleanup-forum-media', { body: { postId: targetId } })
      .then(({ error: cleanupError }) => {
        if (cleanupError) reportError('forum.cleanupMedia', cleanupError, { extra: { postId: targetId } });
      })
      .catch((cleanupError) => reportError('forum.cleanupMedia', cleanupError, { extra: { postId: targetId } }));
  }
}

export async function getForumAdminQueue() {
  const { data, error } = await supabase.rpc('forum_admin_get_queue');
  if (error) throw error;
  return data;
}

export async function searchForumMembers(query = '') {
  const { data, error } = await supabase.rpc('forum_admin_search_members', {
    p_query: query.trim() || null,
    p_limit: 30,
  });
  if (error) throw error;
  return data ?? [];
}

export async function moderateForumContentAsAdmin(targetType, targetId, action, reason = null) {
  const { error } = await supabase.rpc('forum_admin_moderate_content', {
    p_target_type: targetType,
    p_target_id: targetId,
    p_action: action,
    p_reason: reason,
  });
  if (error) throw error;
  if (targetType === 'post' && action === 'delete') {
    emitSubmission({ type: 'post_deleted', postId: targetId });
    supabase.functions.invoke('cleanup-forum-media', { body: { postId: targetId } })
      .then(({ error: cleanupError }) => {
        if (cleanupError) reportError('forum.adminCleanupMedia', cleanupError, { extra: { postId: targetId } });
      })
      .catch((cleanupError) => reportError('forum.adminCleanupMedia', cleanupError, { extra: { postId: targetId } }));
  }
}

export async function setForumBan(memberId, { permanent = true, until = null, reason = null } = {}) {
  const { error } = await supabase.rpc('forum_admin_set_ban', {
    p_member_id: memberId,
    p_permanent: permanent,
    p_until: until,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function resolveForumReport(reportId, status, notes = null) {
  const { error } = await supabase.rpc('forum_admin_resolve_report', {
    p_report_id: reportId,
    p_status: status,
    p_notes: notes,
  });
  if (error) throw error;
}
