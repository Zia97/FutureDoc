-- ============================================================
-- AI Tutor: user profiles, usage limits, and context memory
-- ============================================================

-- User profiles: subscription tier
CREATE TABLE user_profiles (
  user_id      UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium   BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own profile"
  ON user_profiles
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- ============================================================

-- AI usage tracking: enforces tier limits
-- Free users:    3 lifetime calls total
-- Premium users: 10 calls per day (resets daily)
CREATE TABLE user_ai_usage (
  user_id         UUID  PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lifetime_count  INT   NOT NULL DEFAULT 0,
  daily_count     INT   NOT NULL DEFAULT 0,
  daily_reset_at  DATE  NOT NULL DEFAULT current_date
);

ALTER TABLE user_ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own usage"
  ON user_ai_usage
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================

-- AI context memory: tracks which topics the user struggles with
-- struggles JSONB shape: { "venn_diagrams": 4, "syllogisms": 2, ... }
CREATE TABLE user_ai_context (
  user_id     UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  struggles   JSONB       NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_ai_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own context"
  ON user_ai_context
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
