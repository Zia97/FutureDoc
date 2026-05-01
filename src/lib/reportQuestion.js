import { Platform } from 'react-native';
import { supabase } from './supabase';
import { reportError } from './reportError';

export const REPORT_REASONS = [
  { id: 'wrong_answer',        label: 'Wrong answer' },
  { id: 'ambiguous',           label: 'Ambiguous wording' },
  { id: 'typo',                label: 'Typo / formatting' },
  { id: 'image_broken',        label: 'Image / diagram broken' },
  { id: 'explanation_unclear', label: 'Explanation unclear' },
  { id: 'other',               label: 'Other' },
];

export const LESSON_REPORT_REASONS = [
  { id: 'inaccurate_content',     label: 'Inaccurate content' },
  { id: 'confusing_explanation',  label: 'Confusing explanation' },
  { id: 'typo',                   label: 'Typo / formatting' },
  { id: 'broken_interaction',     label: 'Broken interaction' },
  { id: 'missing_detail',         label: 'Missing / incomplete detail' },
  { id: 'other',                  label: 'Other' },
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
  const trimmedComment = String(comment ?? '').trim();
  if (!trimmedComment) {
    return { ok: false, error: 'Please add comments describing the issue.' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('question_reports').insert({
    question_id: questionId,
    section,
    test_id: testId,
    is_timed: isTimed,
    user_id: user?.id ?? null,
    reasons,
    comment: trimmedComment,
    platform: Platform.OS,
  });

  if (error) {
    reportError('submitQuestionReport', error, { extra: { questionId, section } });
    return { ok: false, error: 'Could not submit your report. Please try again.' };
  }
  return { ok: true };
}

/**
 * Submit a lesson report.
 *
 * @param {object} args
 * @param {string} args.lessonId
 * @param {string} [args.lessonTitle]
 * @param {'dm'|'qr'|'sj'|'vr'} args.section
 * @param {string[]} args.reasons
 * @param {string} args.comment
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function submitLessonReport({
  lessonId,
  lessonTitle = null,
  section,
  reasons = [],
  comment = '',
}) {
  if (!lessonId) return { ok: false, error: 'Missing lessonId' };
  if (!section)  return { ok: false, error: 'Missing section' };
  const trimmedComment = String(comment ?? '').trim();
  if (!trimmedComment) {
    return { ok: false, error: 'Please add comments describing the issue.' };
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('lesson_reports').insert({
    lesson_id: lessonId,
    lesson_title: lessonTitle,
    section,
    user_id: user?.id ?? null,
    reasons,
    comment: trimmedComment,
    platform: Platform.OS,
  });

  if (error) {
    reportError('submitLessonReport', error, { extra: { lessonId, section } });
    return { ok: false, error: 'Could not submit your report. Please try again.' };
  }
  return { ok: true };
}
