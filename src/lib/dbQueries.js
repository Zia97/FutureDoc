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
        is_free,
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
        hide_labels,
        correct_answer,
        answer_reason,
        is_free,
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
        is_free,
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
        is_free,
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
        is_free,
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
      .from('timed_verbal_reasoning_tests')
      .select(`
        id,
        title,
        time_minutes,
        is_free,
        timed_verbal_reasoning_passages (
          id,
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
        )
      `)
      .order('id', { ascending: true });
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
      .select('id, title, time_minutes, is_free')
      .order('id', { ascending: true });
    if (testsError) throw testsError;

    const testIds = tests.map((t) => t.id);

    const { data: questions, error: questionsError } = await supabase
      .from('timed_decision_making_questions')
      .select('id, test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, hide_labels')
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Timed Quantitative Reasoning
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all timed QR tests with nested sets and questions.
   * Each set contains a stimulus (chart/table data) shared across its questions.
   */
  async fetchTimedQRTests() {
    const { data, error } = await supabase
      .from('timed_quantitative_reasoning_tests')
      .select(`
        id,
        title,
        time_minutes,
        is_free,
        timed_quantitative_reasoning_sets (
          id,
          set_ref,
          title,
          stimulus,
          order_index,
          timed_quantitative_reasoning_questions (
            id,
            stem,
            options,
            correct_answer,
            answer_reason,
            order_index
          )
        )
      `)
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Timed exam attempt sync (cloud-backed)
  // ─────────────────────────────────────────────────────────────────────────────
  //
  // Each section has three operations:
  //   submit  — write attempt + bulk-insert answers (upsert by user/test)
  //   load    — fetch all attempts + answers for the current user
  //   delete  — delete the attempt (cascades to answers)
  //
  // RLS guarantees user-scoping, so we never pass user_id from the client
  // for SELECT/DELETE — auth.uid() does that for us.
  //
  // The submit functions intentionally DELETE any prior attempt for the
  // same (user, test) before inserting. This matches the "reset to retake"
  // UX and avoids upsert/cascade complexity on the answers table.

  async _submitTimedExamAttempt({
    attemptsTable,
    answersTable,
    userId,
    testId,
    scorePercent,
    correctCount,
    timeTakenSeconds,
    flags,
    answers, // [{ question_id, selected_answer, ...parentRef }]
  }) {
    // Wipe any prior attempt for this (user, test) so the unique constraint
    // doesn't block resubmission, and orphan answer rows are cascaded away.
    const { error: delError } = await supabase
      .from(attemptsTable)
      .delete()
      .eq('user_id', userId)
      .eq('test_id', testId);
    if (delError) throw delError;

    const { data: attempt, error: insError } = await supabase
      .from(attemptsTable)
      .insert({
        user_id: userId,
        test_id: testId,
        score_percent: scorePercent,
        correct_count: correctCount,
        time_taken_seconds: timeTakenSeconds,
        flags: flags ?? [],
      })
      .select('id')
      .single();
    if (insError) throw insError;

    if (answers.length > 0) {
      const rows = answers.map((a) => ({
        ...a,
        exam_attempt_id: attempt.id,
        user_id: userId,
      }));
      const { error: ansError } = await supabase.from(answersTable).insert(rows);
      if (ansError) throw ansError;
    }

    return attempt.id;
  }

  // ── Verbal Reasoning ───────────────────────────────────────
  async submitTimedVRExam({ userId, testId, scorePercent, correctCount, timeTakenSeconds, flags, answers }) {
    return this._submitTimedExamAttempt({
      attemptsTable: 'timed_verbal_reasoning_exam_attempts',
      answersTable:  'timed_verbal_reasoning_question_answers',
      userId, testId, scorePercent, correctCount, timeTakenSeconds, flags,
      answers, // [{ question_id, passage_id, selected_answer }]
    });
  }

  async loadTimedVRAttempts() {
    const { data: attempts, error: aErr } = await supabase
      .from('timed_verbal_reasoning_exam_attempts')
      .select('id, test_id, submitted_at, time_taken_seconds, correct_count, score_percent, flags');
    if (aErr) throw aErr;
    if (!attempts?.length) return [];

    const ids = attempts.map((a) => a.id);
    const { data: answers, error: ansErr } = await supabase
      .from('timed_verbal_reasoning_question_answers')
      .select('exam_attempt_id, question_id, passage_id, selected_answer')
      .in('exam_attempt_id', ids);
    if (ansErr) throw ansErr;

    return attempts.map((a) => ({
      ...a,
      answers: (answers ?? []).filter((r) => r.exam_attempt_id === a.id),
    }));
  }

  async deleteTimedVRAttempt(testId) {
    const { error } = await supabase
      .from('timed_verbal_reasoning_exam_attempts')
      .delete()
      .eq('test_id', testId);
    if (error) throw error;
  }

  // ── Decision Making ────────────────────────────────────────
  async submitTimedDMExam({ userId, testId, scorePercent, correctCount, timeTakenSeconds, flags, answers }) {
    return this._submitTimedExamAttempt({
      attemptsTable: 'timed_decision_making_exam_attempts',
      answersTable:  'timed_decision_making_question_answers',
      userId, testId, scorePercent, correctCount, timeTakenSeconds, flags,
      answers, // [{ question_id, selected_answer (JSONB) }]
    });
  }

  async loadTimedDMAttempts() {
    const { data: attempts, error: aErr } = await supabase
      .from('timed_decision_making_exam_attempts')
      .select('id, test_id, submitted_at, time_taken_seconds, correct_count, score_percent, flags');
    if (aErr) throw aErr;
    if (!attempts?.length) return [];

    const ids = attempts.map((a) => a.id);
    const { data: answers, error: ansErr } = await supabase
      .from('timed_decision_making_question_answers')
      .select('exam_attempt_id, question_id, selected_answer')
      .in('exam_attempt_id', ids);
    if (ansErr) throw ansErr;

    return attempts.map((a) => ({
      ...a,
      answers: (answers ?? []).filter((r) => r.exam_attempt_id === a.id),
    }));
  }

  async deleteTimedDMAttempt(testId) {
    const { error } = await supabase
      .from('timed_decision_making_exam_attempts')
      .delete()
      .eq('test_id', testId);
    if (error) throw error;
  }

  // ── Quantitative Reasoning ─────────────────────────────────
  async submitTimedQRExam({ userId, testId, scorePercent, correctCount, timeTakenSeconds, flags, answers }) {
    return this._submitTimedExamAttempt({
      attemptsTable: 'timed_quantitative_reasoning_exam_attempts',
      answersTable:  'timed_quantitative_reasoning_question_answers',
      userId, testId, scorePercent, correctCount, timeTakenSeconds, flags,
      answers, // [{ question_id, set_id, selected_answer }]
    });
  }

  async loadTimedQRAttempts() {
    const { data: attempts, error: aErr } = await supabase
      .from('timed_quantitative_reasoning_exam_attempts')
      .select('id, test_id, submitted_at, time_taken_seconds, correct_count, score_percent, flags');
    if (aErr) throw aErr;
    if (!attempts?.length) return [];

    const ids = attempts.map((a) => a.id);
    const { data: answers, error: ansErr } = await supabase
      .from('timed_quantitative_reasoning_question_answers')
      .select('exam_attempt_id, question_id, set_id, selected_answer')
      .in('exam_attempt_id', ids);
    if (ansErr) throw ansErr;

    return attempts.map((a) => ({
      ...a,
      answers: (answers ?? []).filter((r) => r.exam_attempt_id === a.id),
    }));
  }

  async deleteTimedQRAttempt(testId) {
    const { error } = await supabase
      .from('timed_quantitative_reasoning_exam_attempts')
      .delete()
      .eq('test_id', testId);
    if (error) throw error;
  }

  // ── Situational Judgement ──────────────────────────────────
  async submitTimedSJExam({ userId, testId, scorePercent, correctCount, timeTakenSeconds, flags, answers }) {
    return this._submitTimedExamAttempt({
      attemptsTable: 'timed_situational_judgement_exam_attempts',
      answersTable:  'timed_situational_judgement_question_answers',
      userId, testId, scorePercent, correctCount, timeTakenSeconds, flags,
      answers, // [{ question_id, scenario_id, selected_answer }]
    });
  }

  async loadTimedSJAttempts() {
    const { data: attempts, error: aErr } = await supabase
      .from('timed_situational_judgement_exam_attempts')
      .select('id, test_id, submitted_at, time_taken_seconds, correct_count, score_percent, flags');
    if (aErr) throw aErr;
    if (!attempts?.length) return [];

    const ids = attempts.map((a) => a.id);
    const { data: answers, error: ansErr } = await supabase
      .from('timed_situational_judgement_question_answers')
      .select('exam_attempt_id, question_id, scenario_id, selected_answer')
      .in('exam_attempt_id', ids);
    if (ansErr) throw ansErr;

    return attempts.map((a) => ({
      ...a,
      answers: (answers ?? []).filter((r) => r.exam_attempt_id === a.id),
    }));
  }

  async deleteTimedSJAttempt(testId) {
    const { error } = await supabase
      .from('timed_situational_judgement_exam_attempts')
      .delete()
      .eq('test_id', testId);
    if (error) throw error;
  }
}

export const db = new DatabaseService();
