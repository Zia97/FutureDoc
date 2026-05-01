// AsyncStorage keys for the Learning Pathway lesson completion sets,
// one per UCAT section.

export const VR_LEARN_STORAGE_KEY = '@futuredoc/vr_learning_completed_lessons';
export const DM_LEARN_STORAGE_KEY = '@futuredoc/dm_learning_completed_lessons';
export const QR_LEARN_STORAGE_KEY = '@futuredoc/qr_learning_completed_lessons';
export const SJ_LEARN_STORAGE_KEY = '@futuredoc/sj_learning_completed_lessons';

// Single key for in-lesson mini question answers across all sections.
// Lesson IDs are already namespaced (vr-*, dm-*, qr-*, sj-*) so one map is fine.
export const LEARN_MINI_ANSWERS_KEY = '@futuredoc/learn_mini_answers';

// Tracks how many questions the user has asked the AI tutor across ALL
// in-lesson tutor demos. Capped at AI_TUTOR_DEMO_QUESTION_LIMIT.
export const AI_TUTOR_DEMO_QUESTIONS_KEY = '@futuredoc/ai_tutor_demo_questions_used';
export const AI_TUTOR_DEMO_QUESTION_LIMIT = 2;
