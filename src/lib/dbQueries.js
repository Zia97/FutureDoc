import { supabase } from './supabase';

class DatabaseService {

  // ─────────────────────────────────────────────────────────────────────────────
  // Shared
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches the current content version number for a given section.
   * Used to determine whether the local content cache is stale and needs refreshing.
   * @param {string} section - e.g. 'verbal_reasoning', 'decision_making'
   */
  async getContentVersion(section) {
    const { data, error } = await supabase
      .from('content_versions')
      .select('version')
      .eq('section', section)
      .single();
    if (error) throw error;
    return data;
  }

  async getAllContentVersions() {
    const { data, error } = await supabase
      .from('content_versions')
      .select('section, version');
    if (error) throw error;
    return data; // [{ section, version }, ...]
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Verbal Reasoning
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all VR passages with their nested questions, ordered by creation date.
   * This is the full content fetch used to populate the VR section.
   */
  async fetchVRPassages() {
    const { data, error } = await supabase
      .from('verbal_reasoning_passages')
      .select(`
        id,
        title,
        body,
        verbal_reasoning_questions (
          id,
          question_text,
          options,
          correct_answer,
          answer_reason,
          order_index
        )
      `)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Decision Making
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all DM questions with their nested options and statements, ordered by order_index.
   * Options are used for MCQ/venn types; statements are used for Yes/No types.
   */
  async fetchDMQuestions() {
    const { data, error } = await supabase
      .from('decision_making_questions')
      .select(`
        id,
        title,
        type,
        stem,
        table_data,
        stimulus_diagram,
        correct_answer,
        answer_reason,
        decision_making_question_options (
          id,
          label,
          option_text,
          option_data,
          order_index
        ),
        decision_making_question_statements (
          id,
          statement_text,
          correct_answer,
          order_index
        )
      `)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Quantitative Reasoning
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all QR sets with their nested questions, ordered by creation date.
   * Each set contains a stimulus (chart/table data) and associated questions.
   */
  async fetchQRSets() {
    const { data, error } = await supabase
      .from('quantitative_reasoning_sets')
      .select(`
        id,
        title,
        stimulus,
        quantitative_reasoning_questions (
          id,
          question_text,
          options,
          correct_answer,
          answer_reason,
          order_index
        )
      `)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Situational Judgement
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all SJ scenarios with their nested questions, ordered by creation date.
   * label_set determines which fixed answer options are shown in the UI (not stored in DB).
   */
  async fetchSJScenarios() {
    const { data, error } = await supabase
      .from('situational_judgement_scenarios')
      .select(`
        id,
        body,
        situational_judgement_questions (
          id,
          question_text,
          correct_answer,
          answer_reason,
          order_index,
          label_set
        )
      `)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Timed Situational Judgement
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all timed SJ tests with nested scenarios and questions.
   * label_set on each question determines which fixed answer options are shown (1=importance, 2=appropriateness).
   */
  async fetchTimedSJTests() {
    const { data, error } = await supabase
      .from('timed_situational_judgement_tests')
      .select(`
        id,
        title,
        time_minutes,
        timed_situational_judgement_scenarios (
          id,
          body,
          created_at,
          timed_situational_judgement_questions (
            id,
            question_text,
            correct_answer,
            answer_reason,
            order_index,
            label_set
          )
        )
      `)
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Timed Verbal Reasoning
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all timed VR tests with passages and nested questions.
   */
  async fetchTimedVRTests() {
    const { data, error } = await supabase
      .from('timed_verbal_reasoning_passages')
      .select(`
        id,
        test_id,
        title,
        body,
        order_index,
        timed_verbal_reasoning_questions (
          id,
          question_text,
          options,
          correct_answer,
          answer_reason,
          order_index
        )
      `)
      .order('test_id', { ascending: true })
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Timed Decision Making
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all timed DM tests with nested questions, options, and statements.
   */
  async fetchTimedDMTests() {
    const { data: tests, error: testsError } = await supabase
      .from('timed_decision_making_tests')
      .select('id, title, time_minutes')
      .order('id', { ascending: true });
    if (testsError) throw testsError;

    const testIds = tests.map((t) => t.id);

    const { data: questions, error: questionsError } = await supabase
      .from('timed_decision_making_questions')
      .select('id, test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index')
      .in('test_id', testIds)
      .order('order_index', { ascending: true });
    if (questionsError) throw questionsError;

    const questionIds = questions.map((q) => q.id);

    const { data: options, error: optionsError } = await supabase
      .from('timed_decision_making_question_options')
      .select('id, question_id, label, option_text, option_data, order_index')
      .in('question_id', questionIds)
      .order('order_index', { ascending: true });
    if (optionsError) throw optionsError;

    const { data: statements, error: statementsError } = await supabase
      .from('timed_decision_making_question_statements')
      .select('id, question_id, statement_text, correct_answer, answer_reason, order_index')
      .in('question_id', questionIds)
      .order('order_index', { ascending: true });
    if (statementsError) throw statementsError;

    const optionsByQuestion = options.reduce((acc, o) => {
      (acc[o.question_id] ??= []).push(o);
      return acc;
    }, {});
    const statementsByQuestion = statements.reduce((acc, s) => {
      (acc[s.question_id] ??= []).push(s);
      return acc;
    }, {});

    const questionsByTest = questions.reduce((acc, q) => {
      (acc[q.test_id] ??= []).push({
        ...q,
        timed_decision_making_question_options: optionsByQuestion[q.id] ?? [],
        timed_decision_making_question_statements: statementsByQuestion[q.id] ?? [],
      });
      return acc;
    }, {});

    return tests.map((t) => ({
      ...t,
      timed_decision_making_questions: questionsByTest[t.id] ?? [],
    }));
  }
}

export const db = new DatabaseService();
