-- Replace venn diagram questions (Q23–Q28) in timed DM tests 1 and 2
-- with the new batch from preview-dm.json (dm1r-023–dm1r-028, dm2r-023–dm2r-028).
-- Options cascade-delete with the question rows.

DO $$
DECLARE
  v_q23 UUID; v_q24 UUID; v_q25 UUID; v_q26 UUID; v_q27 UUID; v_q28 UUID;
BEGIN

  -- ── TEST 1 ──────────────────────────────────────────────────────────────

  DELETE FROM timed_decision_making_questions
  WHERE test_id = 1 AND order_index BETWEEN 23 AND 28;

  -- Q23: SELECT – Sports Centre Memberships (3-set full overlap, normal)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1, 'Sports Centre Memberships', 'venn_diagram'::dm_question_type,
    E'A sports centre has 80 members. 38 play tennis, 30 play badminton, and 25 play squash. 12 play both tennis and badminton. 10 play both tennis and squash. 8 play both badminton and squash. 5 play all three sports. 12 members play none of these sports.\n\nWhich of the following diagrams best represents the data?',
    NULL, NULL, 'C',
    'The stem gives you two values to read directly: 5 play all three sports, and 12 play none. Scan the options — B shows 8 in the centre, not 5, so eliminate B. D shows 10 outside, not 12, so eliminate D. That leaves A and C. The stem says 12 play both tennis and badminton; 5 of those also play squash, so the tennis-and-badminton-only area = 12 − 5 = 7. A shows 5 there — wrong. C shows 7 — correct.',
    23, 'normal')
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Tennis","shape":"hexagon"},{"id":"set2","label":"Badminton","shape":"pentagon"},{"id":"set3","label":"Squash","shape":"trapezoid"}],"regions":{"set1_only":21,"set2_only":15,"set3_only":12,"set1_set2":5,"set1_set3":7,"set2_set3":3,"set1_set2_set3":5,"outside":12}}'::jsonb, 1),
    (v_q23, 'B', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Tennis","shape":"hexagon"},{"id":"set2","label":"Badminton","shape":"pentagon"},{"id":"set3","label":"Squash","shape":"trapezoid"}],"regions":{"set1_only":21,"set2_only":15,"set3_only":12,"set1_set2":7,"set1_set3":5,"set2_set3":3,"set1_set2_set3":8,"outside":9}}'::jsonb, 2),
    (v_q23, 'C', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Tennis","shape":"hexagon"},{"id":"set2","label":"Badminton","shape":"pentagon"},{"id":"set3","label":"Squash","shape":"trapezoid"}],"regions":{"set1_only":21,"set2_only":15,"set3_only":12,"set1_set2":7,"set1_set3":5,"set2_set3":3,"set1_set2_set3":5,"outside":12}}'::jsonb, 3),
    (v_q23, 'D', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Tennis","shape":"hexagon"},{"id":"set2","label":"Badminton","shape":"pentagon"},{"id":"set3","label":"Squash","shape":"trapezoid"}],"regions":{"set1_only":21,"set2_only":15,"set3_only":12,"set1_set2":7,"set1_set3":5,"set2_set3":5,"set1_set2_set3":5,"outside":10}}'::jsonb, 4);

  -- Q24: SELECT – Warehouse Safety Qualifications (4-set two-pairs, normal)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1, 'Warehouse Safety Qualifications', 'venn_diagram'::dm_question_type,
    E'A logistics company employs 80 warehouse staff. 30 hold a forklift licence, 20 have hazardous-goods certification, 15 hold a first-aid certificate, and 25 have a height-safety qualification. 10 staff hold both a forklift licence and hazardous-goods certification. 8 hold both a first-aid certificate and a height-safety qualification. No staff member holds qualifications from both pairs simultaneously. 8 staff hold none of these qualifications.\n\nWhich of the following diagrams best represents the data?',
    NULL, NULL, 'B',
    'The stem gives you three values to read straight into any diagram: the forklift-and-hazardous overlap = 10, the first-aid-and-height-safety overlap = 8, and none = 8. Scan the options — D shows overlaps of 12 and 6 instead of 10 and 8, so eliminate D. C shows forklift-only = 22, but forklift total is 30 and the overlap is 10, so forklift-only = 30 − 10 = 20, not 22 — eliminate C. That leaves A and B. The difference is in the first-aid-only and height-safety-only areas. First-aid-only = 15 − 8 = 7. A shows 9 there — wrong. B shows 7 — correct.',
    24, 'normal')
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Forklift","shape":"circle"},{"id":"set2","label":"Hazardous","shape":"diamond"},{"id":"set3","label":"First aid","shape":"oval"},{"id":"set4","label":"Height safety","shape":"star"}],"regions":{"set1_only":20,"set2_only":10,"set3_only":9,"set4_only":15,"set1_set2":10,"set3_set4":8,"outside":8}}'::jsonb, 1),
    (v_q24, 'B', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Forklift","shape":"circle"},{"id":"set2","label":"Hazardous","shape":"diamond"},{"id":"set3","label":"First aid","shape":"oval"},{"id":"set4","label":"Height safety","shape":"star"}],"regions":{"set1_only":20,"set2_only":10,"set3_only":7,"set4_only":17,"set1_set2":10,"set3_set4":8,"outside":8}}'::jsonb, 2),
    (v_q24, 'C', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Forklift","shape":"circle"},{"id":"set2","label":"Hazardous","shape":"diamond"},{"id":"set3","label":"First aid","shape":"oval"},{"id":"set4","label":"Height safety","shape":"star"}],"regions":{"set1_only":22,"set2_only":8,"set3_only":7,"set4_only":17,"set1_set2":10,"set3_set4":8,"outside":8}}'::jsonb, 3),
    (v_q24, 'D', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Forklift","shape":"circle"},{"id":"set2","label":"Hazardous","shape":"diamond"},{"id":"set3","label":"First aid","shape":"oval"},{"id":"set4","label":"Height safety","shape":"star"}],"regions":{"set1_only":20,"set2_only":10,"set3_only":7,"set4_only":17,"set1_set2":12,"set3_set4":6,"outside":8}}'::jsonb, 4);

  -- Q25: SELECT – Aviary Bird Traits (3-set hub, normal, hide_labels = true)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty, hide_labels)
  VALUES (1, 'Aviary Bird Traits', 'venn_diagram'::dm_question_type,
    E'An aviary has 40 birds. 18 are colourful, 13 can mimic sounds, and 9 are nocturnal. 5 are both colourful and can mimic sounds. 3 are both colourful and are nocturnal. No bird that can mimic sounds is nocturnal. 8 birds exhibit none of these traits.\n\nWhich diagram is consistent with the data?',
    NULL, NULL, 'A',
    'The stem tells you none of these traits = 8. D shows outside = 10 — eliminate D. The stem also says no bird that can mimic sounds is nocturnal, so those two categories never overlap. The central shape (the one that touches both others) must therefore represent Colourful, the only category that overlaps with both. Now check Mimic: the stem says 13 birds can mimic, so Mimic = its solo area + its overlap with Colourful. In B, that overlap is 3 → Mimic total = 8 + 3 = 11, not 13 — eliminate B. In C, the solo area of the second shape is 6 → Mimic total = 6 + 5 = 11, not 13 — eliminate C. In A, the overlap with Colourful is 5 → Mimic = 8 + 5 = 13 ✓. Option A.',
    25, 'normal', true)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q25, 'A', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Colourful","shape":"rectangle"},{"id":"set2","label":"Mimic","shape":"pentagon"},{"id":"set3","label":"Nocturnal","shape":"vertical_oval"}],"regions":{"set1_only":10,"set2_only":8,"set3_only":6,"set1_set2":5,"set1_set3":3,"outside":8}}'::jsonb, 1),
    (v_q25, 'B', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Colourful","shape":"rectangle"},{"id":"set2","label":"Mimic","shape":"pentagon"},{"id":"set3","label":"Nocturnal","shape":"vertical_oval"}],"regions":{"set1_only":10,"set2_only":8,"set3_only":6,"set1_set2":3,"set1_set3":5,"outside":8}}'::jsonb, 2),
    (v_q25, 'C', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Colourful","shape":"rectangle"},{"id":"set2","label":"Mimic","shape":"pentagon"},{"id":"set3","label":"Nocturnal","shape":"vertical_oval"}],"regions":{"set1_only":10,"set2_only":6,"set3_only":8,"set1_set2":5,"set1_set3":3,"outside":8}}'::jsonb, 3),
    (v_q25, 'D', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Colourful","shape":"rectangle"},{"id":"set2","label":"Mimic","shape":"pentagon"},{"id":"set3","label":"Nocturnal","shape":"vertical_oval"}],"regions":{"set1_only":8,"set2_only":8,"set3_only":6,"set1_set2":5,"set1_set3":3,"outside":10}}'::jsonb, 4);

  -- Q26: INTERPRET – University Course Properties (5-set, normal)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1, 'University Course Properties', 'venn_diagram'::dm_question_type,
    E'The diagram categorises university courses using five properties: has a laboratory component, is mandatory for first-year students, requires an external placement, offers summer school access, and is assessed by portfolio only. Each letter marks a different region.\n\nWhich letter represents a course that has a laboratory component and is mandatory for first-year students, but does not require an external placement, has no summer school access, and is not assessed by portfolio?',
    NULL,
    '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Laboratory","shape":"circle"},{"id":"set2","label":"Mandatory yr 1","shape":"diamond"},{"id":"set3","label":"Ext. placement","shape":"hexagon"},{"id":"set4","label":"Summer school","shape":"oval"},{"id":"set5","label":"Portfolio","shape":"star"}],"regions":{"set1_only":"P","set2_only":"Q","set3_only":"R","set4_only":"S","set5_only":"T","set1_set2":"U","set1_set3":"V","set1_set4":"W","set1_set5":"X","outside":"Y"}}'::jsonb,
    'C',
    'The question needs both Laboratory and Mandatory yr 1, with nothing else. Letter P is Laboratory only — no Mandatory. Letter Q is Mandatory only — no Laboratory. Letter V is Laboratory plus External placement — wrong second property. That leaves Letter U, the region where just Laboratory and Mandatory yr 1 overlap, outside all other categories. Option C.',
    26, 'normal')
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q26, 'A', 'Letter P', NULL, 1),
    (v_q26, 'B', 'Letter Q', NULL, 2),
    (v_q26, 'C', 'Letter U', NULL, 3),
    (v_q26, 'D', 'Letter V', NULL, 4);

  -- Q27: INTERPRET – Research Grant Applications (5-set chain, hard)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1, 'Research Grant Applications', 'venn_diagram'::dm_question_type,
    E'The diagram shows research grant applications to a university categorised by five properties: clinical relevance, industry partnership, patient involvement, multi-site collaboration, and ethical approval. Each letter marks a different region.\n\nWhich letter represents an application that has industry partnership and patient involvement, but lacks clinical relevance?',
    NULL,
    '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Clinical relevance","shape":"hexagon"},{"id":"set2","label":"Industry partnership","shape":"diamond"},{"id":"set3","label":"Patient involvement","shape":"circle"},{"id":"set4","label":"Multi-site collaboration","shape":"octagon"},{"id":"set5","label":"Ethical approval","shape":"star"}],"regions":{"set1_only":"A","set2_only":"B","set3_only":"C","set4_only":"D","set5_only":"E","set1_set2":"F","set2_set3":"G","set3_set4":"H","set4_set5":"J","set1_set5":"K","outside":"L"}}'::jsonb,
    'C',
    'The question needs Industry partnership and Patient involvement, but not Clinical relevance. Letter B is Industry partnership alone — no Patient involvement. Letter F is where Clinical relevance and Industry partnership meet — includes Clinical relevance, which is excluded. Letter H is where Patient involvement and Multi-site collaboration meet — no Industry partnership. That leaves Letter G, the region where Industry partnership and Patient involvement overlap, sitting entirely outside Clinical relevance. Option C.',
    27, 'hard')
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', 'Letter B', NULL, 1),
    (v_q27, 'B', 'Letter F', NULL, 2),
    (v_q27, 'C', 'Letter G', NULL, 3),
    (v_q27, 'D', 'Letter H', NULL, 4);

  -- Q28: INTERPRET – Supermarket Product Properties (6-set chain, hard)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1, 'Supermarket Product Properties', 'venn_diagram'::dm_question_type,
    E'The diagram shows supermarket products categorised by six properties: organic-certified, locally sourced, vegetarian, gluten-free, low-sugar, and fair-trade. Each letter marks a different region.\n\nWhich letter represents a product that is gluten-free and low-sugar, but is not organic-certified, locally sourced, vegetarian, or fair-trade?',
    NULL,
    '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Organic","shape":"circle"},{"id":"set2","label":"Local","shape":"pentagon"},{"id":"set3","label":"Vegetarian","shape":"trapezoid"},{"id":"set4","label":"Gluten-free","shape":"octagon"},{"id":"set5","label":"Low-sugar","shape":"parallelogram"},{"id":"set6","label":"Fair-trade","shape":"vertical_oval"}],"regions":{"set1_only":"A","set2_only":"B","set3_only":"C","set4_only":"D","set5_only":"E","set6_only":"F","set1_set2":"G","set2_set3":"H","set3_set4":"J","set4_set5":"K","set5_set6":"L","outside":"M"}}'::jsonb,
    'D',
    'The question needs Gluten-free and Low-sugar only — none of the other four categories. Letter D is Gluten-free alone — no Low-sugar. Letter J is Vegetarian and Gluten-free — includes Vegetarian, which is excluded. Letter L is Low-sugar and Fair-trade — includes Fair-trade, which is excluded. That leaves Letter K, the region where Gluten-free and Low-sugar overlap, outside all other categories. Option D.',
    28, 'hard')
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', 'Letter D', NULL, 1),
    (v_q28, 'B', 'Letter J', NULL, 2),
    (v_q28, 'C', 'Letter L', NULL, 3),
    (v_q28, 'D', 'Letter K', NULL, 4);


  -- ── TEST 2 ──────────────────────────────────────────────────────────────

  DELETE FROM timed_decision_making_questions
  WHERE test_id = 2 AND order_index BETWEEN 23 AND 28;

  -- Q23: SELECT – Library Membership Tiers (3-set nested, normal)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2, 'Library Membership Tiers', 'venn_diagram'::dm_question_type,
    E'A library has 75 members. 60 are registered members. 40 have an online account. 18 are premium members. All premium members have an online account. All online account holders are registered members.\n\nWhich of the following diagrams best represents the data?',
    NULL, NULL, 'C',
    'Two values are almost immediate: premium = 18 (stated directly, sits in the innermost ring) and none = 75 − 60 = 15 (one subtraction). Scan the options — B shows 22 in the innermost ring, not 18, so eliminate B. D shows 20 outside, not 15, so eliminate D. That leaves A and C. Both have innermost = 18 and outside = 15; they differ in which ring shows 20 and which shows 22. The middle ring = online holders who aren''t premium = 40 − 18 = 22. The outer ring = registered members with no online account = 60 − 40 = 20. A has those two rings showing 20 then 22 — swapped. C shows 22 then 20 — correct.',
    23, 'normal')
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Premium","shape":"diamond"},{"id":"set2","label":"Online account","shape":"pentagon"},{"id":"set3","label":"Registered","shape":"hexagon"}],"regions":{"set3_only":22,"set2_set3":20,"set1_set2_set3":18,"outside":15}}'::jsonb, 1),
    (v_q23, 'B', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Premium","shape":"diamond"},{"id":"set2","label":"Online account","shape":"pentagon"},{"id":"set3","label":"Registered","shape":"hexagon"}],"regions":{"set3_only":20,"set2_set3":18,"set1_set2_set3":22,"outside":15}}'::jsonb, 2),
    (v_q23, 'C', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Premium","shape":"diamond"},{"id":"set2","label":"Online account","shape":"pentagon"},{"id":"set3","label":"Registered","shape":"hexagon"}],"regions":{"set3_only":20,"set2_set3":22,"set1_set2_set3":18,"outside":15}}'::jsonb, 3),
    (v_q23, 'D', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Premium","shape":"diamond"},{"id":"set2","label":"Online account","shape":"pentagon"},{"id":"set3","label":"Registered","shape":"hexagon"}],"regions":{"set3_only":15,"set2_set3":22,"set1_set2_set3":18,"outside":20}}'::jsonb, 4);

  -- Q24: SELECT – Recruitment Applicant Attributes (4-set chain, hard)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2, 'Recruitment Applicant Attributes', 'venn_diagram'::dm_question_type,
    E'A recruitment firm assessed 80 applicants for a management role. 25 have prior management experience, 30 hold a relevant degree, 20 have industry certifications, and 18 have strong references. 8 applicants have both prior management experience and a relevant degree. 6 have both a relevant degree and industry certifications. 4 have both industry certifications and strong references. 5 have both strong references and prior management experience. No applicant has both prior management experience and industry certifications, or both a relevant degree and strong references. 10 applicants have none of these attributes.\n\nWhich of the following diagrams best represents the data?',
    NULL, NULL, 'B',
    'The stem gives you four overlap values and the none count directly: management+degree = 8, degree+certifications = 6, certifications+references = 4, references+management = 5, none = 10. Scan the options — D swaps the degree+certifications and certifications+references overlaps (showing 4 and 6 instead of 6 and 4), so eliminate D. C shows the references+management overlap as 7 instead of 5, so eliminate C. That leaves A and B. Both have all overlaps and the none count correct; they differ only in management-only and degree-only. Management-only = 25 − 8 − 5 = 12. A shows 14 — wrong. B shows 12 — correct. Option B.',
    24, 'hard')
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Mgmt experience","shape":"circle"},{"id":"set2","label":"Relevant degree","shape":"hexagon"},{"id":"set3","label":"Certifications","shape":"octagon"},{"id":"set4","label":"References","shape":"pentagon"}],"regions":{"set1_only":14,"set2_only":14,"set3_only":10,"set4_only":9,"set1_set2":8,"set2_set3":6,"set3_set4":4,"set1_set4":5,"outside":10}}'::jsonb, 1),
    (v_q24, 'B', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Mgmt experience","shape":"circle"},{"id":"set2","label":"Relevant degree","shape":"hexagon"},{"id":"set3","label":"Certifications","shape":"octagon"},{"id":"set4","label":"References","shape":"pentagon"}],"regions":{"set1_only":12,"set2_only":16,"set3_only":10,"set4_only":9,"set1_set2":8,"set2_set3":6,"set3_set4":4,"set1_set4":5,"outside":10}}'::jsonb, 2),
    (v_q24, 'C', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Mgmt experience","shape":"circle"},{"id":"set2","label":"Relevant degree","shape":"hexagon"},{"id":"set3","label":"Certifications","shape":"octagon"},{"id":"set4","label":"References","shape":"pentagon"}],"regions":{"set1_only":12,"set2_only":16,"set3_only":10,"set4_only":7,"set1_set2":8,"set2_set3":6,"set3_set4":4,"set1_set4":7,"outside":10}}'::jsonb, 3),
    (v_q24, 'D', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Mgmt experience","shape":"circle"},{"id":"set2","label":"Relevant degree","shape":"hexagon"},{"id":"set3","label":"Certifications","shape":"octagon"},{"id":"set4","label":"References","shape":"pentagon"}],"regions":{"set1_only":12,"set2_only":16,"set3_only":10,"set4_only":9,"set1_set2":8,"set2_set3":4,"set3_set4":6,"set1_set4":5,"outside":10}}'::jsonb, 4);

  -- Q25: SELECT – Film Festival Screenings (3-set full overlap, normal, hide_labels = true)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty, hide_labels)
  VALUES (2, 'Film Festival Screenings', 'venn_diagram'::dm_question_type,
    E'A film festival has 60 screenings. 28 are documentary films, 22 are international films, and 18 are award-nominated. 8 screenings are both documentary and international. 6 screenings are both documentary and award-nominated. 5 screenings are both international and award-nominated. 3 screenings belong to all three categories. 8 screenings belong to none of these categories.\n\nWhich of the following diagrams is consistent with the data?',
    NULL, NULL, 'C',
    'Two values to check immediately: 3 screenings belong to all three categories (the centre), and 8 belong to none (outside). B shows 5 in the centre — the stem says 3 — eliminate B. A, C, and D all have outside = 8 and centre = 3. D has one of the single-category counts showing 19 — Documentary should be 28 − 5 − 3 − 3 = 17, not 19 — eliminate D. That leaves A and C, which share the same single-category counts (17, 12, 10) but differ in the paired overlaps. Documentary-and-International only = 8 − 3 = 5. A shows that pair as 2 — wrong. C shows 5 — correct. Option C.',
    25, 'normal', true)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q25, 'A', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Documentary","shape":"circle"},{"id":"set2","label":"International","shape":"octagon"},{"id":"set3","label":"Award-nominated","shape":"trapezoid"}],"regions":{"set1_only":17,"set2_only":12,"set3_only":10,"set1_set2":2,"set1_set3":3,"set2_set3":5,"set1_set2_set3":3,"outside":8}}'::jsonb, 1),
    (v_q25, 'B', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Documentary","shape":"circle"},{"id":"set2","label":"International","shape":"octagon"},{"id":"set3","label":"Award-nominated","shape":"trapezoid"}],"regions":{"set1_only":17,"set2_only":12,"set3_only":8,"set1_set2":5,"set1_set3":3,"set2_set3":2,"set1_set2_set3":5,"outside":8}}'::jsonb, 2),
    (v_q25, 'C', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Documentary","shape":"circle"},{"id":"set2","label":"International","shape":"octagon"},{"id":"set3","label":"Award-nominated","shape":"trapezoid"}],"regions":{"set1_only":17,"set2_only":12,"set3_only":10,"set1_set2":5,"set1_set3":3,"set2_set3":2,"set1_set2_set3":3,"outside":8}}'::jsonb, 3),
    (v_q25, 'D', '', '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Documentary","shape":"circle"},{"id":"set2","label":"International","shape":"octagon"},{"id":"set3","label":"Award-nominated","shape":"trapezoid"}],"regions":{"set1_only":19,"set2_only":10,"set3_only":10,"set1_set2":5,"set1_set3":3,"set2_set3":2,"set1_set2_set3":3,"outside":8}}'::jsonb, 4);

  -- Q26: INTERPRET – Online Course Features (5-set, normal)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2, 'Online Course Features', 'venn_diagram'::dm_question_type,
    E'The diagram classifies online courses by five features: certified (can award a certificate), self-paced, live sessions, has assignments, and includes premium content. Each letter marks a different region.\n\nWhich letter represents courses that offer live sessions and are certified, but are not self-paced, do not have assignments, and do not include premium content?',
    NULL,
    '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Certified","shape":"circle"},{"id":"set2","label":"Self-paced","shape":"hexagon"},{"id":"set3","label":"Live sessions","shape":"vertical_oval"},{"id":"set4","label":"Assignments","shape":"oval"},{"id":"set5","label":"Premium content","shape":"pentagon"}],"regions":{"set1_only":"A","set2_only":"B","set3_only":"C","set4_only":"D","set5_only":"E","set1_set2":"F","set1_set3":"G","set1_set4":"H","set1_set5":"J","outside":"K"}}'::jsonb,
    'B',
    'The question needs Certified and Live sessions, with nothing else. The four options each pair Certified with a different feature: F is Certified and Self-paced, G is Certified and Live sessions, H is Certified and Assignments, J is Certified and Premium content. Only Live sessions matches. That''s Letter G, Option B.',
    26, 'normal')
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q26, 'A', 'Letter F', NULL, 1),
    (v_q26, 'B', 'Letter G', NULL, 2),
    (v_q26, 'C', 'Letter H', NULL, 3),
    (v_q26, 'D', 'Letter J', NULL, 4);

  -- Q27: INTERPRET – Academic Programme Levels (5-set chain, hard)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2, 'Academic Programme Levels', 'venn_diagram'::dm_question_type,
    E'The diagram classifies academic programmes at a university by qualification level. Each letter marks a different region.\n\nWhich letter represents programmes that span both Bachelor''s and Master''s levels but do not include Certificate, Foundation, or Doctoral components?',
    NULL,
    '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Certificate","shape":"square"},{"id":"set2","label":"Foundation Degree","shape":"oval"},{"id":"set3","label":"Bachelor''s Degree","shape":"parallelogram"},{"id":"set4","label":"Master''s Degree","shape":"diamond"},{"id":"set5","label":"Doctoral Degree","shape":"hexagon"}],"regions":{"set1_only":"A","set2_only":"B","set3_only":"C","set4_only":"D","set5_only":"E","set1_set2":"F","set2_set3":"G","set3_set4":"H","set4_set5":"J","outside":"K"}}'::jsonb,
    'B',
    'The question needs Bachelor''s and Master''s only — no Certificate, Foundation, or Doctoral. Letter G is Foundation and Bachelor''s — includes Foundation, which is excluded. Letter J is Master''s and Doctoral — includes Doctoral, which is excluded. Letter C is Bachelor''s alone — no Master''s. That leaves Letter H, the overlap between Bachelor''s and Master''s with nothing else. Option B.',
    27, 'hard')
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', 'Letter G', NULL, 1),
    (v_q27, 'B', 'Letter H', NULL, 2),
    (v_q27, 'C', 'Letter J', NULL, 3),
    (v_q27, 'D', 'Letter C', NULL, 4);

  -- Q28: INTERPRET – Community Initiative Focus Areas (6-set chain, hard)
  INSERT INTO timed_decision_making_questions
    (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2, 'Community Initiative Focus Areas', 'venn_diagram'::dm_question_type,
    E'The diagram classifies community initiative projects by focus area: Environment, Healthcare, Education, Housing, Employment, and Transport. Each letter marks a different region.\n\nWhich letter represents projects that focus exclusively on both Transport and Environment, with no other focus area?',
    NULL,
    '{"diagramLayout":"auto","sets":[{"id":"set1","label":"Environment","shape":"hexagon"},{"id":"set2","label":"Healthcare","shape":"circle"},{"id":"set3","label":"Education","shape":"diamond"},{"id":"set4","label":"Housing","shape":"pentagon"},{"id":"set5","label":"Employment","shape":"square"},{"id":"set6","label":"Transport","shape":"octagon"}],"regions":{"set1_only":"A","set2_only":"B","set3_only":"C","set4_only":"D","set5_only":"E","set6_only":"F","set1_set2":"G","set2_set3":"H","set3_set4":"J","set4_set5":"K","set5_set6":"L","set1_set6":"M","outside":"N"}}'::jsonb,
    'A',
    'The question needs Transport and Environment only — no other focus areas. Letter G is Environment and Healthcare — includes Healthcare, which is excluded. Letter F is Transport alone — no Environment. Letter L is Employment and Transport — includes Employment, which is excluded. That leaves Letter M, the overlap between Transport and Environment, outside all four remaining focus areas. Option A.',
    28, 'hard')
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', 'Letter M', NULL, 1),
    (v_q28, 'B', 'Letter G', NULL, 2),
    (v_q28, 'C', 'Letter F', NULL, 3),
    (v_q28, 'D', 'Letter L', NULL, 4);

END $$;
