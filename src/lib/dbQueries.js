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
  // Verbal Reasoning — Content
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
  // Verbal Reasoning — Progress
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all VR question attempts for a user.
   * Used to hydrate local storage when device cache is missing.
   * @param {string} userId
   */
  async fetchVRAttempts(userId) {
    const { data, error } = await supabase
      .from('verbal_reasoning_question_attempts')
      .select('question_id, passage_id, selected_answer')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  /**
   * Fetches the passage-level progress rows for a user.
   * Returns passage_id and status ('in_progress' | 'completed') for each attempted passage.
   * @param {string} userId
   */
  async fetchVRPassageProgress(userId) {
    const { data, error } = await supabase
      .from('verbal_reasoning_passage_progress')
      .select('passage_id, status')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  /**
   * Inserts a single VR question attempt. Ignores duplicate key errors (code 23505)
   * so retries after a lost network response are safe.
   * @param {string} userId
   * @param {string} questionId
   * @param {string} passageId
   * @param {string} selectedAnswer
   */
  async insertVRAttempt(userId, questionId, passageId, selectedAnswer) {
    const { error } = await supabase
      .from('verbal_reasoning_question_attempts')
      .insert({ user_id: userId, question_id: questionId, passage_id: passageId, selected_answer: selectedAnswer });
    if (error && error.code !== '23505') throw error;
  }

  /**
   * Counts how many VR questions a user has answered within a specific passage.
   * Used to derive the passage completion status after each attempt.
   * @param {string} userId
   * @param {string} passageId
   * @returns {Promise<number>}
   */
  async countVRAttemptsForPassage(userId, passageId) {
    const { count, error } = await supabase
      .from('verbal_reasoning_question_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('passage_id', passageId);
    if (error) throw error;
    return count;
  }

  /**
   * Upserts the passage-level progress row for a user, updating status and answered count.
   * Conflicts on (user_id, passage_id) are resolved by updating the existing row.
   * @param {string} userId
   * @param {string} passageId
   * @param {'in_progress'|'completed'} status
   * @param {number} answeredCount
   * @param {number} totalQuestions
   */
  async upsertVRPassageProgress(userId, passageId, status, answeredCount, totalQuestions) {
    const { error } = await supabase
      .from('verbal_reasoning_passage_progress')
      .upsert(
        { user_id: userId, passage_id: passageId, status, answered_count: answeredCount, total_questions: totalQuestions, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,passage_id' },
      );
    if (error) throw error;
  }

  /**
   * Deletes all VR attempt and progress rows for a user.
   * Called when the user resets their VR progress from the profile screen.
   * @param {string} userId
   */
  async deleteVRProgress(userId) {
    const { error: e1 } = await supabase.from('verbal_reasoning_question_attempts').delete().eq('user_id', userId);
    if (e1) throw e1;
    const { error: e2 } = await supabase.from('verbal_reasoning_passage_progress').delete().eq('user_id', userId);
    if (e2) throw e2;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Decision Making — Content
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
  // Decision Making — Progress
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all DM question attempts for a user.
   * Used to hydrate local storage when device cache is missing.
   * @param {string} userId
   */
  async fetchDMAttempts(userId) {
    const { data, error } = await supabase
      .from('decision_making_question_attempts')
      .select('question_id, answer')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  /**
   * Inserts a single DM question attempt. Answer is stored as JSONB to support
   * both MCQ (string) and Yes/No statement (object) answer types.
   * Ignores duplicate key errors so retries are safe.
   * @param {string} userId
   * @param {string} questionId
   * @param {string|object} answer
   */
  async insertDMAttempt(userId, questionId, answer) {
    const { error } = await supabase
      .from('decision_making_question_attempts')
      .insert({ user_id: userId, question_id: questionId, answer });
    if (error && error.code !== '23505') throw error;
  }

  /**
   * Deletes all DM attempt rows for a user.
   * Called when the user resets their DM progress from the profile screen.
   * @param {string} userId
   */
  async deleteDMProgress(userId) {
    const { error } = await supabase.from('decision_making_question_attempts').delete().eq('user_id', userId);
    if (error) throw error;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Quantitative Reasoning — Content
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
  // Quantitative Reasoning — Progress
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all QR question attempts for a user.
   * Used to hydrate local storage when device cache is missing.
   * @param {string} userId
   */
  async fetchQRAttempts(userId) {
    const { data, error } = await supabase
      .from('quantitative_reasoning_question_attempts')
      .select('question_id, set_id, selected_answer')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  /**
   * Fetches the set-level progress rows for a user.
   * Returns set_id and status ('in_progress' | 'completed') for each attempted set.
   * @param {string} userId
   */
  async fetchQRSetProgress(userId) {
    const { data, error } = await supabase
      .from('quantitative_reasoning_set_progress')
      .select('set_id, status')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  /**
   * Inserts a single QR question attempt. Ignores duplicate key errors so retries are safe.
   * @param {string} userId
   * @param {string} questionId
   * @param {string} setId
   * @param {string} selectedAnswer
   */
  async insertQRAttempt(userId, questionId, setId, selectedAnswer) {
    const { error } = await supabase
      .from('quantitative_reasoning_question_attempts')
      .insert({ user_id: userId, question_id: questionId, set_id: setId, selected_answer: selectedAnswer });
    if (error && error.code !== '23505') throw error;
  }

  /**
   * Counts how many QR questions a user has answered within a specific set.
   * Used to derive the set completion status after each attempt.
   * @param {string} userId
   * @param {string} setId
   * @returns {Promise<number>}
   */
  async countQRAttemptsForSet(userId, setId) {
    const { count, error } = await supabase
      .from('quantitative_reasoning_question_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('set_id', setId);
    if (error) throw error;
    return count;
  }

  /**
   * Upserts the set-level progress row for a user, updating status and answered count.
   * Conflicts on (user_id, set_id) are resolved by updating the existing row.
   * @param {string} userId
   * @param {string} setId
   * @param {'in_progress'|'completed'} status
   * @param {number} answeredCount
   * @param {number} totalQuestions
   */
  async upsertQRSetProgress(userId, setId, status, answeredCount, totalQuestions) {
    const { error } = await supabase
      .from('quantitative_reasoning_set_progress')
      .upsert(
        { user_id: userId, set_id: setId, status, answered_count: answeredCount, total_questions: totalQuestions, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,set_id' },
      );
    if (error) throw error;
  }

  /**
   * Deletes all QR attempt and progress rows for a user.
   * Called when the user resets their QR progress from the profile screen.
   * @param {string} userId
   */
  async deleteQRProgress(userId) {
    const { error: e1 } = await supabase.from('quantitative_reasoning_question_attempts').delete().eq('user_id', userId);
    if (e1) throw e1;
    const { error: e2 } = await supabase.from('quantitative_reasoning_set_progress').delete().eq('user_id', userId);
    if (e2) throw e2;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Situational Judgement — Content
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
  // Timed Situational Judgement — Content
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
  // Situational Judgement — Progress
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all SJ question attempts for a user.
   * Used to hydrate local storage when device cache is missing.
   * @param {string} userId
   */
  async fetchSJAttempts(userId) {
    const { data, error } = await supabase
      .from('situational_judgement_question_attempts')
      .select('question_id, scenario_id, selected_answer')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  /**
   * Fetches the scenario-level progress rows for a user.
   * Returns scenario_id and status ('in_progress' | 'completed') for each attempted scenario.
   * @param {string} userId
   */
  async fetchSJScenarioProgress(userId) {
    const { data, error } = await supabase
      .from('situational_judgement_scenario_progress')
      .select('scenario_id, status')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  /**
   * Inserts a single SJ question attempt. Ignores duplicate key errors so retries are safe.
   * @param {string} userId
   * @param {string} questionId
   * @param {string} scenarioId
   * @param {string} selectedAnswer
   */
  async insertSJAttempt(userId, questionId, scenarioId, selectedAnswer) {
    const { error } = await supabase
      .from('situational_judgement_question_attempts')
      .insert({ user_id: userId, question_id: questionId, scenario_id: scenarioId, selected_answer: selectedAnswer });
    if (error && error.code !== '23505') throw error;
  }

  /**
   * Counts how many SJ questions a user has answered within a specific scenario.
   * Used to derive the scenario completion status after each attempt.
   * @param {string} userId
   * @param {string} scenarioId
   * @returns {Promise<number>}
   */
  async countSJAttemptsForScenario(userId, scenarioId) {
    const { count, error } = await supabase
      .from('situational_judgement_question_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('scenario_id', scenarioId);
    if (error) throw error;
    return count;
  }

  /**
   * Upserts the scenario-level progress row for a user, updating status and answered count.
   * Conflicts on (user_id, scenario_id) are resolved by updating the existing row.
   * @param {string} userId
   * @param {string} scenarioId
   * @param {'in_progress'|'completed'} status
   * @param {number} answeredCount
   * @param {number} totalQuestions
   */
  async upsertSJScenarioProgress(userId, scenarioId, status, answeredCount, totalQuestions) {
    const { error } = await supabase
      .from('situational_judgement_scenario_progress')
      .upsert(
        { user_id: userId, scenario_id: scenarioId, status, answered_count: answeredCount, total_questions: totalQuestions, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,scenario_id' },
      );
    if (error) throw error;
  }

  /**
   * Deletes all SJ attempt and progress rows for a user.
   * Called when the user resets their SJ progress from the profile screen.
   * @param {string} userId
   */
  async deleteSJProgress(userId) {
    const { error: e1 } = await supabase.from('situational_judgement_question_attempts').delete().eq('user_id', userId);
    if (e1) throw e1;
    const { error: e2 } = await supabase.from('situational_judgement_scenario_progress').delete().eq('user_id', userId);
    if (e2) throw e2;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Timed Situational Judgement — Progress
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Inserts the exam attempt row. Returns the new attempt UUID.
   * Called once when the student ends the exam.
   */
  async insertTimedSJExamAttempt(userId, testId, timeTakenSeconds, correctCount, scorePercent) {
    const { data, error } = await supabase
      .from('timed_situational_judgement_exam_attempts')
      .insert({
        user_id: userId,
        test_id: testId,
        time_taken_seconds: timeTakenSeconds,
        correct_count: correctCount,
        score_percent: scorePercent,
      })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  /**
   * Bulk-inserts all question answers for an exam attempt.
   * Called immediately after insertTimedSJExamAttempt.
   * @param {string} examAttemptId
   * @param {string} userId
   * @param {{ questionId, scenarioId, selectedAnswer, isCorrect }[]} answers
   */
  async insertTimedSJQuestionAnswers(examAttemptId, userId, answers) {
    const rows = answers.map(({ questionId, scenarioId, selectedAnswer }) => ({
      exam_attempt_id: examAttemptId,
      user_id: userId,
      question_id: questionId,
      scenario_id: scenarioId,
      selected_answer: selectedAnswer,
    }));
    const { error } = await supabase
      .from('timed_situational_judgement_question_answers')
      .insert(rows);
    if (error) throw error;
  }

  /**
   * Fetches all completed exam attempts for a user.
   * Used by the test list screen to show scores.
   * @param {string} userId
   */
  async fetchTimedSJExamAttempts(userId) {
    const { data, error } = await supabase
      .from('timed_situational_judgement_exam_attempts')
      .select('test_id, score_percent, correct_count, total_questions, submitted_at, time_taken_seconds')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  /**
   * Deletes a user's exam attempt for a specific test.
   * Cascades to delete all question answers for that attempt.
   * @param {string} userId
   * @param {number} testId
   */
  async deleteTimedSJExamAttempt(userId, testId) {
    const { error } = await supabase
      .from('timed_situational_judgement_exam_attempts')
      .delete()
      .eq('user_id', userId)
      .eq('test_id', testId);
    if (error) throw error;
  }
  // ─────────────────────────────────────────────────────────────────────────────
  // Timed Verbal Reasoning — Content
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
  // Timed Verbal Reasoning — Progress
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Inserts the exam attempt row. Returns the new attempt UUID.
   */
  async insertTimedVRExamAttempt(userId, testId, timeTakenSeconds, correctCount, scorePercent) {
    const { data, error } = await supabase
      .from('timed_verbal_reasoning_exam_attempts')
      .insert({
        user_id: userId,
        test_id: testId,
        time_taken_seconds: timeTakenSeconds,
        correct_count: correctCount,
        score_percent: scorePercent,
      })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  /**
   * Bulk-inserts all question answers for a VR exam attempt.
   * @param {string} examAttemptId
   * @param {string} userId
   * @param {{ questionId, passageId, selectedAnswer, isCorrect }[]} answers
   */
  async insertTimedVRQuestionAnswers(examAttemptId, userId, answers) {
    const rows = answers.map(({ questionId, passageId, selectedAnswer }) => ({
      exam_attempt_id: examAttemptId,
      user_id: userId,
      question_id: questionId,
      passage_id: passageId,
      selected_answer: selectedAnswer,
    }));
    const { error } = await supabase
      .from('timed_verbal_reasoning_question_answers')
      .insert(rows);
    if (error) throw error;
  }

  /**
   * Deletes a user's VR exam attempt for a specific test. Cascades to delete all answers.
   */
  async deleteTimedVRExamAttempt(userId, testId) {
    const { error } = await supabase
      .from('timed_verbal_reasoning_exam_attempts')
      .delete()
      .eq('user_id', userId)
      .eq('test_id', testId);
    if (error) throw error;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Timed Decision Making — Content
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Timed Decision Making — Progress
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches all completed exam attempts for a user.
   * @param {string} userId
   */
  async fetchTimedDMExamAttempts(userId) {
    const { data, error } = await supabase
      .from('timed_decision_making_exam_attempts')
      .select('test_id, score_percent, correct_count, submitted_at, time_taken_seconds')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }

  /**
   * Inserts the exam attempt row. Returns the new attempt UUID.
   */
  async insertTimedDMExamAttempt(userId, testId, timeTakenSeconds, correctCount, scorePercent) {
    const { data, error } = await supabase
      .from('timed_decision_making_exam_attempts')
      .insert({
        user_id: userId,
        test_id: testId,
        time_taken_seconds: timeTakenSeconds,
        correct_count: correctCount,
        score_percent: scorePercent,
      })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  /**
   * Bulk-inserts all question answers for a DM exam attempt.
   * @param {string} examAttemptId
   * @param {string} userId
   * @param {{ questionId: string, selectedAnswer: string|object, isCorrect: boolean }[]} answers
   */
  async insertTimedDMQuestionAnswers(examAttemptId, userId, answers) {
    const rows = answers.map(({ questionId, selectedAnswer, isCorrect }) => ({
      exam_attempt_id: examAttemptId,
      user_id: userId,
      question_id: questionId,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
    }));
    const { error } = await supabase
      .from('timed_decision_making_question_answers')
      .insert(rows);
    if (error) throw error;
  }

  /**
   * Deletes a user's DM exam attempt for a specific test. Cascades to delete all answers.
   */
  async deleteTimedDMExamAttempt(userId, testId) {
    const { error } = await supabase
      .from('timed_decision_making_exam_attempts')
      .delete()
      .eq('user_id', userId)
      .eq('test_id', testId);
    if (error) throw error;
  }
}

export const db = new DatabaseService();
