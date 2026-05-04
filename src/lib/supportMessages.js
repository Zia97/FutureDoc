import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import { reportError } from './reportError';

function getAppVersion() {
  return (
    Constants.expoConfig?.version ??
    Constants.manifest?.version ??
    null
  );
}

/**
 * Submit an in-app support message. Inserts a row into support_messages and
 * then invokes the send-support-email edge function. The DB insert is the
 * source of truth — if email delivery fails the operator can still see the
 * message in Supabase Studio.
 *
 * The reply-to email is always the user's registered Supabase auth email —
 * the client cannot override it. Anonymous users should be blocked at the
 * UI layer before calling this.
 *
 * @param {object} args
 * @param {string} args.subject
 * @param {string} args.message
 * @param {string|null} [args.displayName]
 * @param {boolean} [args.isPremium]
 * @returns {Promise<{ ok: boolean, error?: string, emailed?: boolean }>}
 */
export async function submitSupportMessage({
  subject,
  message,
  displayName = null,
  isPremium = false,
}) {
  const trimmedSubject = String(subject ?? '').trim();
  const trimmedMessage = String(message ?? '').trim();
  if (!trimmedSubject) return { ok: false, error: 'Please add a subject.' };
  if (!trimmedMessage) return { ok: false, error: 'Please write a message.' };
  if (trimmedMessage.length > 4000) {
    return { ok: false, error: 'Message is too long (max 4000 characters).' };
  }

  // 1. Call the SECURITY DEFINER RPC. It records auth.uid() and email on
  // the server side so the client can't spoof someone else's identity.
  const { data: messageId, error: rpcError } = await supabase.rpc('submit_support_message', {
    p_subject: trimmedSubject.slice(0, 200),
    p_message: trimmedMessage,
    p_display_name: displayName,
    p_platform: Platform.OS,
    p_app_version: getAppVersion(),
    p_is_premium: !!isPremium,
  });

  if (rpcError || !messageId) {
    reportError('submitSupportMessage.insert', rpcError ?? new Error('no id'), {});
    return { ok: false, error: 'Could not send your message. Please try again.' };
  }
  const row = { id: messageId };

  // 2. Invoke the email-sending edge function. Best-effort: if it fails the
  // row is preserved so the operator can still see the message.
  try {
    const { data, error } = await supabase.functions.invoke('send-support-email', {
      body: { messageId: row.id },
    });
    if (error) {
      reportError('submitSupportMessage.invoke', error, { extra: { messageId: row.id } });
      return { ok: true, emailed: false };
    }
    return { ok: true, emailed: !!data?.emailed };
  } catch (e) {
    reportError('submitSupportMessage.invoke', e, { extra: { messageId: row.id } });
    return { ok: true, emailed: false };
  }
}
