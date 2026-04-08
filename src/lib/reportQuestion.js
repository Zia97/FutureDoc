import { Platform } from 'react-native';
import { supabase } from './supabase';

export const REPORT_REASONS = [
  { id: 'wrong_answer',        label: 'Wrong answer' },
  { id: 'ambiguous',           label: 'Ambiguous wording' },
  { id: 'typo',                label: 'Typo / formatting' },
  { id: 'image_broken',        label: 'Image / diagram broken' },
  { id: 'explanation_unclear', label: 'Explanation unclear' },
  { id: 'other',               label: 'Other' },
];

/**
 * Submit a question report.
 *
 * @param {object} args
 * @param {string} args.questionId  UUID of the question being reported
 * @param {'dm'|'qr'|'sj'|'vr'} args.section
 * @param {number} [args.testId]    Timed test id (only for timed tests)
 * @param {boolean} [args.isTimed]  True if reported from a timed test
 * @param {string[]} args.reasons   Selected preset reason ids
 * @param {string} [args.comment]   Free-text comment
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function submitQuestionReport({
  questionId,
  section,
  testId = null,
  isTimed = false,
  reasons = [],
  comment = '',
}) {
  if (!questionId) return { ok: false, error: 'Missing questionId' };
  if (!section)    return { ok: false, error: 'Missing section' };
  if (reasons.length === 0 && !comment.trim()) {
    return { ok: false, error: 'Please pick a reason or add a comment' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('question_reports').insert({
    question_id: questionId,
    section,
    test_id: testId,
    is_timed: isTimed,
    user_id: user?.id ?? null,
    reasons,
    comment: comment.trim() || null,
    platform: Platform.OS,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
