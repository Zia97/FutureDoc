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
      .order('is_free', { ascending: false })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  /**
   * Fetches VR passages in pages. Returns { data, hasMore }.
   * page is 0-indexed. pageSize defaults to 20.
   */
  async fetchVRPassagesPage(page = 0, pageSize = 20, onProgress) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
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
      .order('is_free', { ascending: false })
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to);
    if (error) throw error;
    onProgress?.();
    return { data: data ?? [], hasMore: data?.length === pageSize };
  }

  async fetchAllVRPassagesPaginated(onProgress) {
    const all = [];
    let page = 0;
    while (true) {
      const { data, hasMore } = await this.fetchVRPassagesPage(page, 20, onProgress);
      all.push(...data);
      if (!hasMore) break;
      page++;
    }
    return all;
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
        difficulty,
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
          venn_geometry,
          order_index
        ),
        decision_making_question_statements (
          id,
          statement_text,
          correct_answer,
          answer_reason,
          order_index
        )
      `)
      .order('is_free', { ascending: false })
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data;
  }

  async fetchDMQuestionsPage(page = 0, pageSize = 20, onProgress) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('decision_making_questions')
      .select(`
        id,
        title,
        type,
        difficulty,
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
          venn_geometry,
          order_index
        ),
        decision_making_question_statements (
          id,
          statement_text,
          correct_answer,
          answer_reason,
          order_index
        )
      `)
      .order('is_free', { ascending: false })
      .order('order_index', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to);
    if (error) throw error;
    onProgress?.();
    return { data: data ?? [], hasMore: data?.length === pageSize };
  }

  async fetchAllDMQuestionsPaginated(onProgress) {
    const all = [];
    let page = 0;
    while (true) {
      const { data, hasMore } = await this.fetchDMQuestionsPage(page, 20, onProgress);
      all.push(...data);
      if (!hasMore) break;
      page++;
    }
    return all;
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
      .order('is_free', { ascending: false })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async fetchQRSetsPage(page = 0, pageSize = 20, onProgress) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
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
      .order('is_free', { ascending: false })
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to);
    if (error) throw error;
    onProgress?.();
    return { data: data ?? [], hasMore: data?.length === pageSize };
  }

  async fetchAllQRSetsPaginated(onProgress) {
    const all = [];
    let page = 0;
    while (true) {
      const { data, hasMore } = await this.fetchQRSetsPage(page, 20, onProgress);
      all.push(...data);
      if (!hasMore) break;
      page++;
    }
    return all;
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
      .order('is_free', { ascending: false })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async fetchSJScenariosPage(page = 0, pageSize = 20, onProgress) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
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
      .order('is_free', { ascending: false })
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to);
    if (error) throw error;
    onProgress?.();
    return { data: data ?? [], hasMore: data?.length === pageSize };
  }

  async fetchAllSJScenariosPaginated(onProgress) {
    const all = [];
    let page = 0;
    while (true) {
      const { data, hasMore } = await this.fetchSJScenariosPage(page, 20, onProgress);
      all.push(...data);
      if (!hasMore) break;
      page++;
    }
    return all;
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
            label_set,
            difficulty
          )
        )
      `)
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  async fetchTimedSJTestsPage(page = 0, pageSize = 5, onProgress) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
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
            label_set,
            difficulty
          )
        )
      `)
      .order('id', { ascending: true })
      .range(from, to);
    if (error) throw error;
    onProgress?.();
    return { data: data ?? [], hasMore: data?.length === pageSize };
  }

  async fetchAllTimedSJTestsPaginated(onProgress) {
    const all = [];
    let page = 0;
    while (true) {
      const { data, hasMore } = await this.fetchTimedSJTestsPage(page, 5, onProgress);
      all.push(...data);
      if (!hasMore) break;
      page++;
    }
    return all;
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
            order_index,
            difficulty
          )
        )
      `)
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  async fetchTimedVRTestsPage(page = 0, pageSize = 5, onProgress) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
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
            order_index,
            difficulty
          )
        )
      `)
      .order('id', { ascending: true })
      .range(from, to);
    if (error) throw error;
    onProgress?.();
    return { data: data ?? [], hasMore: data?.length === pageSize };
  }

  async fetchAllTimedVRTestsPaginated(onProgress) {
    const all = [];
    let page = 0;
    while (true) {
      const { data, hasMore } = await this.fetchTimedVRTestsPage(page, 5, onProgress);
      all.push(...data);
      if (!hasMore) break;
      page++;
    }
    return all;
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
      .select('id, test_id, title, type, stem, table_data, stimulus_diagram, venn_geometry, correct_answer, answer_reason, order_index, hide_labels, difficulty')
      .in('test_id', testIds)
      .order('order_index', { ascending: true });
    if (questionsError) throw questionsError;

    const questionIds = questions.map((q) => q.id);

    const { data: options, error: optionsError } = await supabase
      .from('timed_decision_making_question_options')
      .select('id, question_id, label, option_text, option_data, venn_geometry, order_index')
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

  async fetchTimedDMTestsPage(page = 0, pageSize = 5, onProgress) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data: tests, error: testsError } = await supabase
      .from('timed_decision_making_tests')
      .select('id, title, time_minutes, is_free')
      .order('id', { ascending: true })
      .range(from, to);
    if (testsError) throw testsError;
    if (!tests?.length) {
      onProgress?.();
      return { data: [], hasMore: false };
    }

    const testIds = tests.map((t) => t.id);

    const { data: questions, error: questionsError } = await supabase
      .from('timed_decision_making_questions')
      .select('id, test_id, title, type, stem, table_data, stimulus_diagram, venn_geometry, correct_answer, answer_reason, order_index, hide_labels, difficulty')
      .in('test_id', testIds)
      .order('order_index', { ascending: true });
    if (questionsError) throw questionsError;

    const questionIds = questions.map((q) => q.id);

    const { data: options, error: optionsError } = await supabase
      .from('timed_decision_making_question_options')
      .select('id, question_id, label, option_text, option_data, venn_geometry, order_index')
      .in('question_id', questionIds)
      .order('order_index', { ascending: true });
    if (optionsError) throw optionsError;

    const { data: statements, error: statementsError } = await supabase
      .from('timed_decision_making_question_statements')
      .select('id, question_id, statement_text, correct_answer, answer_reason, order_index')
      .in('question_id', questionIds)
      .order('order_index', { ascending: true });
    if (statementsError) throw statementsError;

    const optionsByQuestion = (options ?? []).reduce((acc, o) => {
      (acc[o.question_id] ??= []).push(o);
      return acc;
    }, {});
    const statementsByQuestion = (statements ?? []).reduce((acc, s) => {
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

    const data = tests.map((t) => ({
      ...t,
      timed_decision_making_questions: questionsByTest[t.id] ?? [],
    }));

    onProgress?.();
    return { data, hasMore: tests.length === pageSize };
  }

  async fetchAllTimedDMTestsPaginated(onProgress) {
    const all = [];
    let page = 0;
    while (true) {
      const { data, hasMore } = await this.fetchTimedDMTestsPage(page, 5, onProgress);
      all.push(...data);
      if (!hasMore) break;
      page++;
    }
    return all;
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
            order_index,
            difficulty
          )
        )
      `)
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  }

  async fetchTimedQRTestsPage(page = 0, pageSize = 5, onProgress) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
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
            order_index,
            difficulty
          )
        )
      `)
      .order('id', { ascending: true })
      .range(from, to);
    if (error) throw error;
    onProgress?.();
    return { data: data ?? [], hasMore: data?.length === pageSize };
  }

  async fetchAllTimedQRTestsPaginated(onProgress) {
    const all = [];
    let page = 0;
    while (true) {
      const { data, hasMore } = await this.fetchTimedQRTestsPage(page, 5, onProgress);
      all.push(...data);
      if (!hasMore) break;
      page++;
    }
    return all;
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
    rpcFn,
    testId,
    scorePercent,
    correctCount,
    timeTakenSeconds,
    flags,
    answers, // [{ question_id, selected_answer, ...parentRef, time_ms }]
    analyticsSummary,
  }) {
    // Single atomic server-side transaction: delete any prior attempt for
    // (auth.uid(), test) + insert the attempt + insert all answers. This
    // replaces the old delete → insert-attempt → insert-answers sequence of
    // separate requests, which could leave an attempt row with zero answer
    // rows if the connection dropped between steps (rendered as 0 / scaled
    // 300 on review). user_id is derived from auth.uid() inside the function,
    // so the client never sends it.
    const { data, error } = await supabase.rpc(rpcFn, {
      p_test_id: testId,
      p_score_percent: scorePercent,
      p_correct_count: correctCount,
      p_time_taken_seconds: timeTakenSeconds,
      p_flags: flags ?? [],
      p_answers: answers ?? [],
      p_analytics: analyticsSummary ?? null,
    });
    if (error) throw error;
    return data; // new attempt uuid
  }

  // ── Verbal Reasoning ───────────────────────────────────────
  async submitTimedVRExam({ testId, scorePercent, correctCount, timeTakenSeconds, flags, answers, analyticsSummary }) {
    return this._submitTimedExamAttempt({
      rpcFn: 'submit_timed_vr_exam',
      testId, scorePercent, correctCount, timeTakenSeconds, flags,
      answers, // [{ question_id, passage_id, selected_answer, time_ms }]
      analyticsSummary,
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

  /**
   * Loads VR analytics from pre-aggregated summaries stored on attempt rows.
   * Single query, no answer-table joins.
   */
  async loadVRAnalytics() {
    const { data, error } = await supabase
      .from('timed_verbal_reasoning_exam_attempts')
      .select('id, test_id, submitted_at, time_taken_seconds, correct_count, score_percent, analytics_summary')
      .order('submitted_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  // ── Decision Making ────────────────────────────────────────
  async submitTimedDMExam({ testId, scorePercent, correctCount, timeTakenSeconds, flags, answers, analyticsSummary }) {
    return this._submitTimedExamAttempt({
      rpcFn: 'submit_timed_dm_exam',
      testId, scorePercent, correctCount, timeTakenSeconds, flags,
      answers, // [{ question_id, selected_answer (JSONB), time_ms }]
      analyticsSummary,
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

  /**
   * Loads DM analytics from pre-aggregated summaries stored on attempt rows.
   * Single query, no answer-table joins.
   */
  async loadDMAnalytics() {
    const { data, error } = await supabase
      .from('timed_decision_making_exam_attempts')
      .select('id, test_id, submitted_at, time_taken_seconds, correct_count, score_percent, analytics_summary')
      .order('submitted_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  // ── Quantitative Reasoning ─────────────────────────────────
  async submitTimedQRExam({ testId, scorePercent, correctCount, timeTakenSeconds, flags, answers, analyticsSummary }) {
    return this._submitTimedExamAttempt({
      rpcFn: 'submit_timed_qr_exam',
      testId, scorePercent, correctCount, timeTakenSeconds, flags,
      answers, // [{ question_id, set_id, selected_answer, time_ms }]
      analyticsSummary,
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

  /**
   * Loads QR analytics from pre-aggregated summaries stored on attempt rows.
   * Single query, no answer-table joins.
   */
  async loadQRAnalytics() {
    const { data, error } = await supabase
      .from('timed_quantitative_reasoning_exam_attempts')
      .select('id, test_id, submitted_at, time_taken_seconds, correct_count, score_percent, analytics_summary')
      .order('submitted_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  // ── Situational Judgement ──────────────────────────────────
  async submitTimedSJExam({ testId, scorePercent, correctCount, timeTakenSeconds, flags, answers, analyticsSummary }) {
    return this._submitTimedExamAttempt({
      rpcFn: 'submit_timed_sj_exam',
      testId, scorePercent, correctCount, timeTakenSeconds, flags,
      answers, // [{ question_id, scenario_id, selected_answer, time_ms }]
      analyticsSummary,
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

  /**
   * Loads SJ analytics from pre-aggregated summaries stored on attempt rows.
   * Single query, no answer-table joins.
   */
  async loadSJAnalytics() {
    const { data, error } = await supabase
      .from('timed_situational_judgement_exam_attempts')
      .select('id, test_id, submitted_at, time_taken_seconds, correct_count, score_percent, analytics_summary')
      .order('submitted_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Practice analytics (per-section, derived from practice_question_attempts)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Loads everything needed for the Practice analytics tab:
   *   - rawAttempts (all rows, descending by answered_at) — used for trends + streak
   *   - latestAttempts (one per question/statement, with question metadata) —
   *     used for current accuracy, coverage, by-type/difficulty cuts
   *   - cohortByKey: Map<"qid:stmtIdx", { avgTimeMs, correctPct, totalFirstAttempts }>
   *   - totalQuestions in the section
   *
   * @param {'vr'|'dm'|'qr'|'sj'} section
   */
  async loadPracticeAnalytics(section) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { rawAttempts: [], latestAttempts: [], cohortByKey: new Map(), totalQuestions: 0 };
    }

    // 1. All raw attempts (chronological for trend/streak; we'll reverse later).
    const { data: rawAttempts, error: attemptsErr } = await supabase
      .from('practice_question_attempts')
      .select('question_id, statement_index, is_correct, time_spent_ms, answered_at')
      .eq('user_id', user.id)
      .eq('section', section)
      .order('answered_at', { ascending: false });
    if (attemptsErr) throw attemptsErr;

    // 2. Collapse to latest-per-(question, statement_index). rawAttempts is
    //    already DESC, so the first occurrence is the latest.
    const seen = new Set();
    const latest = [];
    for (const a of rawAttempts ?? []) {
      const key = `${a.question_id}:${a.statement_index ?? -1}`;
      if (seen.has(key)) continue;
      seen.add(key);
      latest.push(a);
    }

    // 3. Question metadata (difficulty + DM type) for attempted questions.
    const questionIds = [...new Set(latest.map((a) => a.question_id))];
    const metaByQid = new Map();
    if (questionIds.length > 0) {
      const metaTable = {
        vr: 'verbal_reasoning_questions',
        dm: 'decision_making_questions',
        qr: 'quantitative_reasoning_questions',
        sj: 'situational_judgement_questions',
      }[section];
      const metaCols = section === 'dm' ? 'id, difficulty, type' : 'id, difficulty';
      const { data: meta, error: metaErr } = await supabase
        .from(metaTable)
        .select(metaCols)
        .in('id', questionIds);
      if (metaErr) throw metaErr;
      for (const row of meta ?? []) {
        metaByQid.set(row.id, row);
      }
    }

    const latestAttempts = latest.map((a) => {
      const meta = metaByQid.get(a.question_id) ?? null;
      return {
        ...a,
        difficulty: meta?.difficulty ?? null,
        type: meta?.type ?? null,
      };
    });

    // 4. Cohort stats for the questions the user has attempted.
    const cohortByKey = new Map();
    if (questionIds.length > 0) {
      const { data: stats, error: statsErr } = await supabase
        .from('question_stats')
        .select('question_id, statement_index, total_first_attempts, total_correct_first_attempts, sum_time_ms')
        .eq('section', section)
        .in('question_id', questionIds);
      if (statsErr) throw statsErr;
      for (const row of stats ?? []) {
        const total = row.total_first_attempts ?? 0;
        if (total <= 0) continue;
        const k = `${row.question_id}:${row.statement_index ?? -1}`;
        cohortByKey.set(k, {
          avgTimeMs: Math.round((row.sum_time_ms ?? 0) / total),
          correctPct: (row.total_correct_first_attempts ?? 0) / total, // 0..1
          totalFirstAttempts: total,
        });
      }
    }

    // 5. Total questions available in the section.
    const totalTable = {
      vr: 'verbal_reasoning_questions',
      dm: 'decision_making_questions',
      qr: 'quantitative_reasoning_questions',
      sj: 'situational_judgement_questions',
    }[section];
    const { count, error: countErr } = await supabase
      .from(totalTable)
      .select('id', { count: 'exact', head: true });
    if (countErr) throw countErr;

    return {
      rawAttempts: rawAttempts ?? [],
      latestAttempts,
      cohortByKey,
      totalQuestions: count ?? 0,
    };
  }

  async deleteTimedSJAttempt(testId) {
    const { error } = await supabase
      .from('timed_situational_judgement_exam_attempts')
      .delete()
      .eq('test_id', testId);
    if (error) throw error;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // What's New
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetches the active "What's New" content with the highest version.
   * Returns null if nothing active is configured (modal stays hidden).
   * @returns {Promise<{version:number,title:string,subtitle:string,items:Array<{icon:string,text:string}>}|null>}
   */
  async getWhatsNew() {
    const { data, error } = await supabase
      .from('whats_new')
      .select('version, title, subtitle, items')
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}

export const db = new DatabaseService();
