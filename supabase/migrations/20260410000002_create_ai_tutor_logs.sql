CREATE TABLE IF NOT EXISTS ai_tutor_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  section TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup: who's sending the most today?
CREATE INDEX idx_ai_tutor_logs_user_created ON ai_tutor_logs (user_id, created_at DESC);

-- RLS: only service role can insert/read (edge function uses service role key)
ALTER TABLE ai_tutor_logs ENABLE ROW LEVEL SECURITY;
