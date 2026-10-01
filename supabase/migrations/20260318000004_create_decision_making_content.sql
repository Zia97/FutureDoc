-- DM has 5 question types with two distinct answer patterns:
--
--   Option-based (single answer):
--     logic_puzzle, strongest_argument, venn_diagram
--     → options stored in dm_question_options; correct_answer is the chosen label e.g. "A"
--
--   Statement-based (one Yes/No answer per statement):
--     syllogism, interpreting_info
--     → statements stored in dm_question_statements; correct_answer on dm_questions is null
--
-- interpreting_info also carries a data table stored as JSONB in table_data.
-- venn_diagram options carry complex diagram config stored as JSONB in option_data.

CREATE TYPE dm_question_type AS ENUM (
  'syllogism',
  'logic_puzzle',
  'strongest_argument',
  'interpreting_info',
  'venn_diagram'
);

CREATE TABLE decision_making_questions (
  id             UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT             NOT NULL,
  type           dm_question_type NOT NULL,
  stem           TEXT             NOT NULL,
  table_data     JSONB,           -- only populated for interpreting_info
  correct_answer TEXT,            -- label e.g. "A" for option-based types; null for statement-based
  answer_reason  TEXT             NOT NULL,
  order_index    SMALLINT         NOT NULL,
  created_at     TIMESTAMPTZ      NOT NULL DEFAULT now()
);

-- Options for logic_puzzle, strongest_argument, venn_diagram
CREATE TABLE decision_making_question_options (
  id           UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID     NOT NULL REFERENCES decision_making_questions(id) ON DELETE CASCADE,
  label        CHAR(1)  NOT NULL,  -- "A", "B", "C", "D"
  option_text  TEXT     NOT NULL,
  option_data  JSONB,              -- vennConfig for venn_diagram; null otherwise
  order_index  SMALLINT NOT NULL
);

-- Statements for syllogism, interpreting_info
CREATE TABLE decision_making_question_statements (
  id              UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id     UUID     NOT NULL REFERENCES decision_making_questions(id) ON DELETE CASCADE,
  statement_text  TEXT     NOT NULL,
  correct_answer  TEXT     NOT NULL,  -- "Yes" or "No"
  order_index     SMALLINT NOT NULL
);

CREATE INDEX idx_dm_options_question_id    ON decision_making_question_options    (question_id);
CREATE INDEX idx_dm_statements_question_id ON decision_making_question_statements (question_id);
