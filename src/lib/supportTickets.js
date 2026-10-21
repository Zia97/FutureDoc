import { Platform } from 'react-native';
import { supabase } from './supabase';
import { REPORT_APP_VERSION } from './reportDiagnostics';

export const TICKET_KINDS = { support: 'Support', bug: 'Bug', question: 'Question', lesson: 'Lesson' };
export const TICKET_STATUSES = { open: 'Open', reviewing: 'Under review', resolved: 'Resolved' };

// A retry token, not an authentication credential. Retained after failed sends
// so a response lost on the network cannot produce duplicate messages.
export const supportRequestId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

async function rpc(name, params = {}) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw error;
  return data;
}

export const getSupportCounts = () => rpc('support_inbox_counts');
export const listSupportTickets = ({ admin = false, status = 'all', kind = 'all', page = 0 } = {}) =>
  rpc('support_list_tickets', { p_admin: admin, p_status: status, p_kind: kind, p_page: page });
export const getSupportTicket = (ticketId, admin = false, before = null) =>
  rpc('support_get_ticket', { p_ticket: ticketId, p_admin: admin, p_before: before });
export const markSupportRead = (ticketId, through, admin = false) =>
  rpc('support_mark_read', { p_ticket: ticketId, p_through: through, p_admin: admin });
export const replyToSupportTicket = (ticketId, body, requestId, admin = false) =>
  rpc('support_reply', { p_ticket: ticketId, p_body: body, p_request_id: requestId, p_admin: admin });
export const setSupportStatus = (ticketId, status) =>
  rpc('support_set_status', { p_ticket: ticketId, p_status: status });
export const getSupportQuestion = (ticketId, admin = false) =>
  rpc('support_get_question', { p_ticket: ticketId, p_admin: admin });
export const createSupportTicket = ({ subject, message, kind, requestId }) =>
  rpc('support_create_ticket', {
    p_subject: subject.trim(), p_message: message.trim(), p_kind: kind,
    p_request_id: requestId, p_platform: Platform.OS, p_app_version: REPORT_APP_VERSION,
  });

export function supportError(error) {
  if (error?.code === '42501') return 'This ticket is unavailable or you no longer have access.';
  return 'Could not connect to Support. Please try again.';
}
