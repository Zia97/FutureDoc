-- Add missing columns to ai_tutor_logs
ALTER TABLE ai_tutor_logs ADD COLUMN IF NOT EXISTS question_id TEXT;
ALTER TABLE ai_tutor_logs ADD COLUMN IF NOT EXISTS is_timed BOOLEAN DEFAULT false;
