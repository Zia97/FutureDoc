CREATE TABLE IF NOT EXISTS ai_tutor_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  section TEXT,
  question_type TEXT,
  question_id TEXT,
  question_text TEXT,
  user_answer TEXT,
  correct_answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_tutor_logs_user_created ON ai_tutor_logs (user_id, created_at DESC);

ALTER TABLE ai_tutor_logs ENABLE ROW LEVEL SECURITY;
