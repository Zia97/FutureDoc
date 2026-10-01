-- Replace venn diagram questions (Q23–Q28) in timed DM tests 3 and 4
-- with the batch from preview-dm.json (dm3r-023–dm3r-028, dm4r-023–dm4r-028).
-- Options cascade-delete with the question rows.

DO $$
DECLARE
  v_q23 UUID; v_q24 UUID; v_q25 UUID; v_q26 UUID; v_q27 UUID; v_q28 UUID;
BEGIN

  -- ── TEST 3 ──────────────────────────────────────────────────────────────

  DELETE FROM timed_decision_making_questions
  WHERE test_id = 3 AND order_index BETWEEN 23 AND 28;

  -- Q23: SELECT – Library Catalogue
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3, E'Library Catalogue', 'venn_diagram'::dm_question_type,
    E'A library holds 80 books. 30 are hardbacks, 38 are fiction, and 22 are children''s books. 12 are both hardback and fiction. 8 are both hardback and children''s. 10 are both fiction and children''s. 4 books fall into all three categories. 16 books fit none of these categories.\n\nWhich of the following diagrams best represents the data?',
    NULL, NULL,
    'A',
    E'Two freebies: 4 books are in all three categories (the centre) and 16 fit none (outside). Scan — B shows 6 in the centre, stem says 4 — eliminate B. C shows 10 outside, stem says 16 — eliminate C. That leaves A and D. The stem says 12 are both hardback and fiction; 4 of those are also children''s, so hardback-and-fiction only = 12 − 4 = 8. A shows 8 ✓. D shows 12 — eliminate D. Answer: A.',
    23, 'normal')
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Hardback","shape":"hexagon"},{"id":"set2","label":"Fiction","shape":"trapezoid"},{"id":"set3","label":"Children''s","shape":"oval"}],"regions":{"set1_only":14,"set2_only":20,"set3_only":8,"set1_set2":8,"set1_set3":4,"set2_set3":6,"set1_set2_set3":4,"outside":16}}'::jsonb, 1),
    (v_q23, 'B', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Hardback","shape":"hexagon"},{"id":"set2","label":"Fiction","shape":"trapezoid"},{"id":"set3","label":"Children''s","shape":"oval"}],"regions":{"set1_only":14,"set2_only":20,"set3_only":8,"set1_set2":8,"set1_set3":4,"set2_set3":6,"set1_set2_set3":6,"outside":14}}'::jsonb, 2),
    (v_q23, 'C', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Hardback","shape":"hexagon"},{"id":"set2","label":"Fiction","shape":"trapezoid"},{"id":"set3","label":"Children''s","shape":"oval"}],"regions":{"set1_only":20,"set2_only":20,"set3_only":8,"set1_set2":8,"set1_set3":4,"set2_set3":6,"set1_set2_set3":4,"outside":10}}'::jsonb, 3),
    (v_q23, 'D', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Hardback","shape":"hexagon"},{"id":"set2","label":"Fiction","shape":"trapezoid"},{"id":"set3","label":"Children''s","shape":"oval"}],"regions":{"set1_only":14,"set2_only":20,"set3_only":8,"set1_set2":12,"set1_set3":8,"set2_set3":10,"set1_set2_set3":4,"outside":4}}'::jsonb, 4);

  -- Q24: SELECT – Bootcamp Student Skills
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3, E'Bootcamp Student Skills', 'venn_diagram'::dm_question_type,
    E'A coding bootcamp tracks 50 students by their skill areas. 15 are strong in Frontend, 14 in Backend, 13 in Database, and 14 in DevOps. 4 students are strong in both Frontend and Backend. 3 are strong in both Backend and Database. 4 are strong in both Database and DevOps. 5 students are not strong in any of these areas.\n\nWhich of the following diagrams best represents the data?',
    NULL, NULL,
    'A',
    E'Four values are freebies — the overlap counts 4, 3, 4 and the 5 students outside. Scan — C shows 1 outside (stem says 5) — eliminate C. B shows 3 in the Frontend-and-Backend overlap (stem says 4) — eliminate B. That leaves A and D, which differ in the Frontend-only and DevOps-only values. Frontend total = 15, minus the 4 also strong in Backend, leaves 11 Frontend-only. D shows 10 there — eliminate D. A shows 11 — correct. Answer: A.',
    24, 'normal')
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Frontend","shape":"diamond"},{"id":"set2","label":"Backend","shape":"circle"},{"id":"set3","label":"Database","shape":"square"},{"id":"set4","label":"DevOps","shape":"triangle"}],"regions":{"set1_only":11,"set2_only":7,"set3_only":6,"set4_only":10,"set1_set2":4,"set2_set3":3,"set3_set4":4,"outside":5}}'::jsonb, 1),
    (v_q24, 'B', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Frontend","shape":"diamond"},{"id":"set2","label":"Backend","shape":"circle"},{"id":"set3","label":"Database","shape":"square"},{"id":"set4","label":"DevOps","shape":"triangle"}],"regions":{"set1_only":11,"set2_only":7,"set3_only":6,"set4_only":10,"set1_set2":3,"set2_set3":4,"set3_set4":4,"outside":5}}'::jsonb, 2),
    (v_q24, 'C', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Frontend","shape":"diamond"},{"id":"set2","label":"Backend","shape":"circle"},{"id":"set3","label":"Database","shape":"square"},{"id":"set4","label":"DevOps","shape":"triangle"}],"regions":{"set1_only":15,"set2_only":7,"set3_only":6,"set4_only":10,"set1_set2":4,"set2_set3":3,"set3_set4":4,"outside":1}}'::jsonb, 3),
    (v_q24, 'D', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Frontend","shape":"diamond"},{"id":"set2","label":"Backend","shape":"circle"},{"id":"set3","label":"Database","shape":"square"},{"id":"set4","label":"DevOps","shape":"triangle"}],"regions":{"set1_only":10,"set2_only":7,"set3_only":6,"set4_only":11,"set1_set2":4,"set2_set3":3,"set3_set4":4,"outside":5}}'::jsonb, 4);

  -- Q25: SELECT – Greenhouse Plants
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty, hide_labels)
  VALUES (3, E'Greenhouse Plants', 'venn_diagram'::dm_question_type,
    E'A school greenhouse has 40 plants, each classified as succulent, flowering, or trailing. 12 plants are succulent, 18 are flowering, and 14 are trailing. 5 plants are both succulent and flowering. 6 plants are both flowering and trailing. 7 plants are none of these types.\n\nWhich of the following diagrams is consistent with the data?',
    NULL, NULL,
    'A',
    E'The category totals are Succulent 12, Flowering 18, Trailing 14, and only flowering overlaps with the other two — so one shape must total 18 and overlap with both sides. Work out each shape''s total in every option. Option C has the middle shape totalling 10 + 5 + 6 = 21 — no category has that total — eliminate C. Option D has side shapes totalling 7 + 6 = 13 and 8 + 5 = 13 — neither matches Succulent 12 or Trailing 14 — eliminate D. Option B has sides totalling 8 + 5 = 13 and 7 + 6 = 13 — same problem — eliminate B. Only Option A has sides totalling 7 + 5 = 12 (Succulent) and 8 + 6 = 14 (Trailing), with the middle shape at 7 + 5 + 6 = 18 (Flowering). Answer: A.',
    25, 'normal', true)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q25, 'A', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Succulent","shape":"star"},{"id":"set2","label":"Flowering","shape":"trapezoid"},{"id":"set3","label":"Trailing","shape":"octagon"}],"regions":{"set1_only":7,"set2_only":7,"set3_only":8,"set1_set2":5,"set2_set3":6,"outside":7}}'::jsonb, 1),
    (v_q25, 'B', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Succulent","shape":"star"},{"id":"set2","label":"Flowering","shape":"trapezoid"},{"id":"set3","label":"Trailing","shape":"octagon"}],"regions":{"set1_only":8,"set2_only":7,"set3_only":7,"set1_set2":5,"set2_set3":6,"outside":7}}'::jsonb, 2),
    (v_q25, 'C', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Succulent","shape":"star"},{"id":"set2","label":"Flowering","shape":"trapezoid"},{"id":"set3","label":"Trailing","shape":"octagon"}],"regions":{"set1_only":7,"set2_only":10,"set3_only":8,"set1_set2":5,"set2_set3":6,"outside":4}}'::jsonb, 3),
    (v_q25, 'D', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Succulent","shape":"star"},{"id":"set2","label":"Flowering","shape":"trapezoid"},{"id":"set3","label":"Trailing","shape":"octagon"}],"regions":{"set1_only":7,"set2_only":7,"set3_only":8,"set1_set2":6,"set2_set3":5,"outside":7}}'::jsonb, 4);

  -- Q26: INTERPRET – Office Task Classification
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3, E'Office Task Classification', 'venn_diagram'::dm_question_type,
    E'The diagram shows office tasks categorised by five attributes. Each letter marks a different region.\n\nWhich letter represents a task that is urgent and requires approval, but is not recurring, does not need a manager, and is not automated?',
    NULL, '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Urgent","shape":"rectangle"},{"id":"set2","label":"Approval","shape":"pentagon"},{"id":"set3","label":"Recurring","shape":"diamond"},{"id":"set4","label":"Manager","shape":"hexagon"},{"id":"set5","label":"Automated","shape":"star"}],"regions":{"set1_only":"V","set1_set2":"P","set1_set3":"Q","set1_set4":"R","set1_set5":"S","set2_only":"T","set3_only":"U","set4_only":"W","set5_only":"X","outside":"Y"}}'::jsonb,
    'A',
    E'The question needs a task that is urgent (inside the rectangle) and requires approval (inside the pentagon), but outside the diamond (recurring), hexagon (manager), and star (automated). Letter T sits in the pentagon only — missing urgent. Letter V sits in the rectangle only — missing approval. Letter R sits where the rectangle and hexagon overlap — that includes the manager, which is excluded. Letter P sits where the rectangle and pentagon overlap, outside every other shape — matching every condition. Option A.',
    26, 'normal')
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q26, 'A', E'Letter P', NULL, 1),
    (v_q26, 'B', E'Letter T', NULL, 2),
    (v_q26, 'C', E'Letter V', NULL, 3),
    (v_q26, 'D', E'Letter R', NULL, 4);

  -- Q27: INTERPRET – Employee Training Records
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3, E'Employee Training Records', 'venn_diagram'::dm_question_type,
    E'The diagram shows 150 workers at a company, categorised by employment type and training records. Every completed induction and every safety certification belongs to a full-time staff member. Contract staff are not full-time and hold neither induction nor safety certification. Each letter marks a different region.\n\nWhich letter represents a full-time staff member who has completed induction, but has not completed safety certification and is not contract staff?',
    NULL, '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Full-time staff","shape":"rectangle"},{"id":"set2","label":"Induction done","shape":"circle"},{"id":"set3","label":"Safety certified","shape":"pentagon"},{"id":"set4","label":"Contract staff","shape":"diamond"}],"regions":{"set1_only":"P","set1_set2":"Q","set1_set2_set3":"R","set1_set3":"S","set4_only":"T","outside":"U"}}'::jsonb,
    'A',
    E'The question needs a full-time staff member (inside the rectangle) who has completed induction (inside the circle), but has not completed safety certification (outside the pentagon) and is not contract staff (outside the diamond). Letter R sits where the rectangle, circle, and pentagon all overlap — that includes safety certified, which is excluded. Letter P is inside the rectangle only — missing induction. Letter T is inside the diamond, outside the rectangle — not full-time staff at all. Letter Q sits inside the rectangle and circle but outside the pentagon and diamond — matching every condition. Option A.',
    27, 'hard')
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', E'Letter Q', NULL, 1),
    (v_q27, 'B', E'Letter R', NULL, 2),
    (v_q27, 'C', E'Letter P', NULL, 3),
    (v_q27, 'D', E'Letter T', NULL, 4);

  -- Q28: INTERPRET – Engineer Certification Hierarchy
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3, E'Engineer Certification Hierarchy', 'venn_diagram'::dm_question_type,
    E'The diagram shows the engineering staff at a firm. All senior engineers are engineers. All principal engineers are senior engineers. Each letter marks a different region.\n\nWhich letter represents an engineer who is senior but not principal?',
    NULL, '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Engineer","shape":"octagon"},{"id":"set2","label":"Senior engineer","shape":"square"},{"id":"set3","label":"Principal engineer","shape":"circle"}],"regions":{"set1_only":"P","set1_set2":"Q","set1_set2_set3":"R","outside":"S"}}'::jsonb,
    'B',
    E'The diagram shows three nested shapes: the octagon (engineers) contains the square (senior engineers), which contains the circle (principal engineers). A senior engineer who is not principal sits in the ring between the square and the circle. Letter P is inside the octagon but outside the square — an engineer who is not senior. Letter R is inside all three — a principal engineer, which the question excludes. Letter S is outside all three — not an engineer at all. Letter Q is inside the octagon and square but outside the circle — matching the description. Option B.',
    28, 'normal')
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', E'Letter P', NULL, 1),
    (v_q28, 'B', E'Letter Q', NULL, 2),
    (v_q28, 'C', E'Letter R', NULL, 3),
    (v_q28, 'D', E'Letter S', NULL, 4);

  -- ── TEST 4 ──────────────────────────────────────────────────────────────

  DELETE FROM timed_decision_making_questions
  WHERE test_id = 4 AND order_index BETWEEN 23 AND 28;

  -- Q23: SELECT – Magazine Subscriptions
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4, E'Magazine Subscriptions', 'venn_diagram'::dm_question_type,
    E'A newsagent stocks 90 magazine titles. 42 are weekly editions, 36 have a digital format, and 30 cover environmental topics. 15 are both weekly and digital. 12 are both weekly and environmental. 10 are both digital and environmental. 6 magazines are all three. 13 magazines fit none of these categories.\n\nWhich of the following diagrams best represents the data?',
    NULL, NULL,
    'A',
    E'Two values are freebies: 6 magazines are all three (the centre) and 13 fit none (outside). Scan — B shows 8 in the centre (stem says 6) — eliminate B. C shows 10 outside (stem says 13) — eliminate C. That leaves A and D. The stem says 15 are both weekly and digital; 6 of those are also environmental, so the weekly-and-digital-only area = 15 − 6 = 9. D shows 4 there — eliminate D. A shows 9 — correct. Answer: A.',
    23, 'normal')
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Weekly","shape":"vertical_oval"},{"id":"set2","label":"Digital","shape":"hexagon"},{"id":"set3","label":"Environmental","shape":"pentagon"}],"regions":{"set1_only":21,"set2_only":17,"set3_only":14,"set1_set2":9,"set1_set3":6,"set2_set3":4,"set1_set2_set3":6,"outside":13}}'::jsonb, 1),
    (v_q23, 'B', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Weekly","shape":"vertical_oval"},{"id":"set2","label":"Digital","shape":"hexagon"},{"id":"set3","label":"Environmental","shape":"pentagon"}],"regions":{"set1_only":21,"set2_only":17,"set3_only":14,"set1_set2":9,"set1_set3":6,"set2_set3":4,"set1_set2_set3":8,"outside":11}}'::jsonb, 2),
    (v_q23, 'C', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Weekly","shape":"vertical_oval"},{"id":"set2","label":"Digital","shape":"hexagon"},{"id":"set3","label":"Environmental","shape":"pentagon"}],"regions":{"set1_only":24,"set2_only":17,"set3_only":14,"set1_set2":9,"set1_set3":6,"set2_set3":4,"set1_set2_set3":6,"outside":10}}'::jsonb, 3),
    (v_q23, 'D', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Weekly","shape":"vertical_oval"},{"id":"set2","label":"Digital","shape":"hexagon"},{"id":"set3","label":"Environmental","shape":"pentagon"}],"regions":{"set1_only":21,"set2_only":17,"set3_only":14,"set1_set2":4,"set1_set3":6,"set2_set3":9,"set1_set2_set3":6,"outside":13}}'::jsonb, 4);

  -- Q24: SELECT – Restaurant Dishes
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4, E'Restaurant Dishes', 'venn_diagram'::dm_question_type,
    E'A restaurant lists 70 dishes. 20 are spicy, 14 are vegetarian, 18 contain nuts, and 20 are gluten-free. 8 dishes are both spicy and vegetarian. 6 dishes both contain nuts and are gluten-free. 12 dishes fit none of these descriptions.\n\nWhich of the following diagrams best represents the data?',
    NULL, NULL,
    'A',
    E'Three values are freebies: 8 spicy-and-vegetarian, 6 nuts-and-gluten-free, and 12 outside. Scan — B shows 6 in the spicy-and-vegetarian overlap and 8 in the nuts-and-gluten-free overlap (swapped) — eliminate B. C shows 10 outside (stem says 12) — eliminate C. That leaves A and D. Vegetarian total = 14, with 8 also spicy, so vegetarian-only = 14 − 8 = 6. D shows 12 there — eliminate D. A shows 6 — correct. Answer: A.',
    24, 'normal')
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Spicy","shape":"hexagon"},{"id":"set2","label":"Vegetarian","shape":"star"},{"id":"set3","label":"Contains nuts","shape":"square"},{"id":"set4","label":"Gluten-free","shape":"oval"}],"regions":{"set1_only":12,"set2_only":6,"set1_set2":8,"set3_only":12,"set4_only":14,"set3_set4":6,"outside":12}}'::jsonb, 1),
    (v_q24, 'B', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Spicy","shape":"hexagon"},{"id":"set2","label":"Vegetarian","shape":"star"},{"id":"set3","label":"Contains nuts","shape":"square"},{"id":"set4","label":"Gluten-free","shape":"oval"}],"regions":{"set1_only":12,"set2_only":6,"set1_set2":6,"set3_only":12,"set4_only":14,"set3_set4":8,"outside":12}}'::jsonb, 2),
    (v_q24, 'C', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Spicy","shape":"hexagon"},{"id":"set2","label":"Vegetarian","shape":"star"},{"id":"set3","label":"Contains nuts","shape":"square"},{"id":"set4","label":"Gluten-free","shape":"oval"}],"regions":{"set1_only":14,"set2_only":6,"set1_set2":8,"set3_only":12,"set4_only":14,"set3_set4":6,"outside":10}}'::jsonb, 3),
    (v_q24, 'D', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Spicy","shape":"hexagon"},{"id":"set2","label":"Vegetarian","shape":"star"},{"id":"set3","label":"Contains nuts","shape":"square"},{"id":"set4","label":"Gluten-free","shape":"oval"}],"regions":{"set1_only":12,"set2_only":12,"set1_set2":8,"set3_only":6,"set4_only":14,"set3_set4":6,"outside":12}}'::jsonb, 4);

  -- Q25: SELECT – Classroom Clubs
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty, hide_labels)
  VALUES (4, E'Classroom Clubs', 'venn_diagram'::dm_question_type,
    E'A school records which clubs 80 students belong to. 30 are in music, 24 are in drama, and 18 are in art. 10 students are in both music and drama. 7 are in both music and art. 6 are in both drama and art. 3 students are in all three clubs. 28 students are in none of these clubs.\n\nWhich of the following diagrams is consistent with the data?',
    NULL, NULL,
    'A',
    E'One shape must total 30 (music), another 24 (drama), the third 18 (art). The centre should be 3, and the pair overlaps 10, 7, and 6. Check each option''s shape totals. Option B has a centre of 5 and shape totals 32, 26, 20 — none match — eliminate B. Option C has centre 3 but one shape totals 16+10+7+3 = 36 (forgot to subtract the triple from the pair overlaps) — eliminate C. Option D has one shape totalling 8+7+4+3 = 22 — no match — eliminate D. Only Option A works: shape totals are 16+7+4+3 = 30 (music), 11+7+3+3 = 24 (drama), and 8+4+3+3 = 18 (art), with centre 3. Answer: A.',
    25, 'normal', true)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q25, 'A', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Music","shape":"circle"},{"id":"set2","label":"Drama","shape":"diamond"},{"id":"set3","label":"Art","shape":"triangle"}],"regions":{"set1_only":16,"set2_only":11,"set3_only":8,"set1_set2":7,"set1_set3":4,"set2_set3":3,"set1_set2_set3":3,"outside":28}}'::jsonb, 1),
    (v_q25, 'B', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Music","shape":"circle"},{"id":"set2","label":"Drama","shape":"diamond"},{"id":"set3","label":"Art","shape":"triangle"}],"regions":{"set1_only":16,"set2_only":11,"set3_only":8,"set1_set2":7,"set1_set3":4,"set2_set3":3,"set1_set2_set3":5,"outside":26}}'::jsonb, 2),
    (v_q25, 'C', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Music","shape":"circle"},{"id":"set2","label":"Drama","shape":"diamond"},{"id":"set3","label":"Art","shape":"triangle"}],"regions":{"set1_only":16,"set2_only":11,"set3_only":8,"set1_set2":10,"set1_set3":7,"set2_set3":6,"set1_set2_set3":3,"outside":19}}'::jsonb, 3),
    (v_q25, 'D', E'', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Music","shape":"circle"},{"id":"set2","label":"Drama","shape":"diamond"},{"id":"set3","label":"Art","shape":"triangle"}],"regions":{"set1_only":8,"set2_only":11,"set3_only":16,"set1_set2":7,"set1_set3":4,"set2_set3":3,"set1_set2_set3":3,"outside":28}}'::jsonb, 4);

  -- Q26: INTERPRET – Library Book Handling Stages
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4, E'Library Book Handling Stages', 'venn_diagram'::dm_question_type,
    E'The diagram shows 120 library books categorised by five handling stages. Each letter marks a different region.\n\nWhich letter represents a book that has been shelved and wrapped, but has not been catalogued, stamped, or tagged?',
    NULL, '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Catalogued","shape":"trapezoid"},{"id":"set2","label":"Stamped","shape":"pentagon"},{"id":"set3","label":"Shelved","shape":"oval"},{"id":"set4","label":"Wrapped","shape":"hexagon"},{"id":"set5","label":"Tagged","shape":"square"}],"regions":{"set1_only":"P","set1_set2":"Q","set2_only":"R","set2_set3":"S","set3_only":"T","set3_set4":"U","set4_only":"V","set4_set5":"W","set5_only":"X","outside":"Y"}}'::jsonb,
    'B',
    E'The question needs a book that is shelved (inside the oval) and wrapped (inside the hexagon), but outside the trapezoid (catalogued), pentagon (stamped), and square (tagged). Letter S sits where the pentagon and oval overlap — that includes stamped, which is excluded. Letter T sits in the oval only — missing wrapped. Letter W sits where the hexagon and square overlap — that includes tagged, which is excluded. Letter U sits where the oval and hexagon overlap, outside every other shape — matching every condition. Option B.',
    26, 'hard')
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q26, 'A', E'Letter S', NULL, 1),
    (v_q26, 'B', E'Letter U', NULL, 2),
    (v_q26, 'C', E'Letter T', NULL, 3),
    (v_q26, 'D', E'Letter W', NULL, 4);

  -- Q27: INTERPRET – Festival Programming
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4, E'Festival Programming', 'venn_diagram'::dm_question_type,
    E'The diagram shows 200 festival activities. All music acts, comedy acts, and family-friendly acts take place on the main stage. Food stalls and free-entry activities do not take place on the main stage and do not overlap with the staged acts. Each letter marks a different region.\n\nWhich letter represents a main-stage act that is both comedy and family-friendly, but is not a music act?',
    NULL, '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Main stage","shape":"rectangle"},{"id":"set2","label":"Music","shape":"circle"},{"id":"set3","label":"Comedy","shape":"pentagon"},{"id":"set4","label":"Family-friendly","shape":"star"},{"id":"set5","label":"Food stall","shape":"hexagon"},{"id":"set6","label":"Free entry","shape":"diamond"}],"regions":{"set1_only":"V","set1_set2":"P","set1_set2_set3":"Q","set1_set3":"R","set1_set3_set4":"S","set1_set4":"T","set5_only":"U","set6_only":"W","outside":"Y"}}'::jsonb,
    'B',
    E'The question needs an act on the main stage (inside the rectangle), that is comedy (inside the pentagon) and family-friendly (inside the star), but not music (outside the circle). Letter Q sits where the rectangle, circle, and pentagon overlap — that includes music, which is excluded. Letter R is where the rectangle and pentagon overlap only — missing family-friendly. Letter T is where the rectangle and star overlap only — missing comedy. Letter S sits where the rectangle, pentagon, and star overlap, outside every other shape — matching every condition. Option B.',
    27, 'hard')
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', E'Letter Q', NULL, 1),
    (v_q27, 'B', E'Letter S', NULL, 2),
    (v_q27, 'C', E'Letter R', NULL, 3),
    (v_q27, 'D', E'Letter T', NULL, 4);

  -- Q28: INTERPRET – Employee Competency Network
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4, E'Employee Competency Network', 'venn_diagram'::dm_question_type,
    E'The diagram shows 80 employees categorised by job role competencies. Each letter marks a different region.\n\nWhich letter represents an employee who has both manager and analyst competencies but is neither a designer nor a developer?',
    NULL, '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Manager","shape":"pentagon"},{"id":"set2","label":"Designer","shape":"oval"},{"id":"set3","label":"Developer","shape":"trapezoid"},{"id":"set4","label":"Analyst","shape":"diamond"}],"regions":{"set1_only":"P","set1_set2":"Q","set2_only":"R","set2_set3":"S","set3_only":"T","set3_set4":"U","set4_only":"V","set1_set4":"W","outside":"X"}}'::jsonb,
    'A',
    E'The question needs an employee with manager (inside the pentagon) and analyst (inside the diamond) competencies, but outside the oval (designer) and trapezoid (developer). Letter P is inside the pentagon only — missing analyst. Letter V is inside the diamond only — missing manager. Letter Q is where the pentagon and oval overlap — that includes designer, which is excluded. Letter W sits where the pentagon and diamond overlap, outside both the oval and trapezoid — matching every condition. Option A.',
    28, 'normal')
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', E'Letter W', NULL, 1),
    (v_q28, 'B', E'Letter P', NULL, 2),
    (v_q28, 'C', E'Letter V', NULL, 3),
    (v_q28, 'D', E'Letter Q', NULL, 4);

END $$;
