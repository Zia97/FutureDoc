-- Seed: Timed DM Test 2 (test_id = 2)
-- 35 questions, 37 minutes

DO $$
DECLARE
  v_q01 UUID;
  v_q02 UUID;
  v_q03 UUID;
  v_q04 UUID;
  v_q05 UUID;
  v_q06 UUID;
  v_q07 UUID;
  v_q08 UUID;
  v_q09 UUID;
  v_q10 UUID;
  v_q11 UUID;
  v_q12 UUID;
  v_q13 UUID;
  v_q14 UUID;
  v_q15 UUID;
  v_q16 UUID;
  v_q17 UUID;
  v_q18 UUID;
  v_q19 UUID;
  v_q20 UUID;
  v_q21 UUID;
  v_q22 UUID;
  v_q23 UUID;
  v_q24 UUID;
  v_q25 UUID;
  v_q26 UUID;
  v_q27 UUID;
  v_q28 UUID;
  v_q29 UUID;
  v_q30 UUID;
  v_q31 UUID;
  v_q32 UUID;
  v_q33 UUID;
  v_q34 UUID;
  v_q35 UUID;
BEGIN

  INSERT INTO timed_decision_making_tests (id, title, time_minutes)
  VALUES (2, 'DM Practice Test 2', 37)
  ON CONFLICT (id) DO NOTHING;

  -- Q01: Athletes and Swimmers
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Athletes and Swimmers', 'syllogism'::dm_question_type, 'Some athletes are swimmers. All swimmers train daily. No swimmers are afraid of water.', NULL, NULL, NULL, NULL, 1)
  RETURNING id INTO v_q01;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q01, 'Some athletes train daily.', 'Yes', 'Some athletes are swimmers, and all swimmers train daily. Therefore those athletes who are swimmers must train daily — so at least some athletes train daily.', 1),
    (v_q01, 'All athletes train daily.', 'No', 'Only some athletes are swimmers. Non-swimmer athletes may or may not train daily — the premises give no information about them.', 2),
    (v_q01, 'No people afraid of water are swimmers.', 'Yes', 'No swimmers are afraid of water. By contraposition, anyone afraid of water is not a swimmer.', 3),
    (v_q01, 'All people who train daily are swimmers.', 'No', 'All swimmers train daily, but other people may also train daily without being swimmers. This reverses the premise.', 4),
    (v_q01, 'Some athletes are not afraid of water.', 'Yes', 'Some athletes are swimmers, and no swimmers are afraid of water. Therefore those athletes who swim are not afraid of water.', 5);

  -- Q02: Student Exam Results
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Student Exam Results', 'interpreting_info'::dm_question_type, 'A school recorded average exam scores by subject and year group.', '{"headers":["Subject","Year 10","Year 11","Year 12"],"rows":[["Maths","62","71","78"],["English","68","72","75"],["Science","58","65","82"],["History","70","68","74"]]}'::jsonb, NULL, NULL, NULL, 2)
  RETURNING id INTO v_q02;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q02, 'Science has the greatest improvement in score from Year 10 to Year 12.', 'Yes', 'Science improved by 82 − 58 = 24 points. Maths improved by 16, English by 7, and History by 4. Science has the greatest improvement.', 1),
    (v_q02, 'History scores decreased between Year 10 and Year 11.', 'Yes', 'History Year 10 = 70, Year 11 = 68. The score fell by 2 points.', 2),
    (v_q02, 'In Year 10, Maths has a higher average score than English.', 'No', 'Year 10 Maths = 62, English = 68. Maths is lower, not higher.', 3),
    (v_q02, 'The range of Year 12 scores across all subjects is greater than 10.', 'No', 'Year 12 scores: 78, 75, 82, 74. Highest = 82, lowest = 74. Range = 82 − 74 = 8, which is not greater than 10.', 4),
    (v_q02, 'Science has the lowest average score in Year 10.', 'Yes', 'Year 10 scores: Maths 62, English 68, Science 58, History 70. Science at 58 is the lowest.', 5);

  -- Q03: Clinic Waiting Times
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Clinic Waiting Times', 'interpreting_info'::dm_question_type, 'A study recorded average waiting times (in minutes) at different clinics by day of the week.', '{"headers":["Day","GP","Dentist","Physio","Eye Clinic"],"rows":[["Monday","18","25","30","12"],["Wednesday","22","20","35","15"],["Friday","15","30","28","18"]]}'::jsonb, NULL, NULL, NULL, 3)
  RETURNING id INTO v_q03;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q03, 'Eye Clinic has the shortest waiting time on every day.', 'No', 'Monday: Eye Clinic = 12 (lowest). Wednesday: Eye Clinic = 15 (lowest). However, on Friday: GP = 15 and Eye Clinic = 18. The GP has a shorter waiting time on Friday, so the statement is false.', 1),
    (v_q03, 'GP waiting time on Wednesday is longer than on Friday.', 'Yes', 'GP Wednesday = 22, GP Friday = 15. 22 > 15.', 2),
    (v_q03, 'Physio has the longest waiting time on every day.', 'No', 'On Friday: Dentist = 30, Physio = 28. Dentist is longer than Physio on Friday.', 3),
    (v_q03, 'The total waiting time across all clinics is lowest on Monday.', 'Yes', 'Monday total: 18 + 25 + 30 + 12 = 85. Wednesday: 22 + 20 + 35 + 15 = 92. Friday: 15 + 30 + 28 + 18 = 91. Monday (85) is lowest.', 4),
    (v_q03, 'Dentist waiting time increases consistently from Monday to Friday.', 'No', 'Dentist: Monday 25, Wednesday 20, Friday 30. It decreases from Monday to Wednesday before increasing. This is not a consistent increase.', 5);

  -- Q04: Speed Cameras on Motorways
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Speed Cameras on Motorways', 'strongest_argument'::dm_question_type, 'All speed cameras on motorways should be removed.', NULL, NULL, 'B', 'Option B is the strongest argument because it directly addresses road safety with evidence-based reasoning — speed cameras are associated with fewer fatal accidents. Option A''s revenue argument does not disprove that cameras also save lives. Option C is irrelevant to whether speed enforcement is needed. Option D is a weak sunk-cost argument.', 4)
  RETURNING id INTO v_q04;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q04, 'A', 'Yes; speed cameras generate large revenues for local authorities, suggesting they are used primarily as a money-making tool rather than a safety measure.', NULL, 1),
    (v_q04, 'B', 'No; areas with speed cameras have consistently shown lower rates of fatal and serious accidents compared to similar roads without cameras.', NULL, 2),
    (v_q04, 'C', 'Yes; modern cars have advanced braking systems that make high-speed collisions less likely.', NULL, 3),
    (v_q04, 'D', 'No; removing speed cameras would cost money, as the infrastructure has already been installed.', NULL, 4);

  -- Q05: Teachers and Musicians
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Teachers and Musicians', 'syllogism'::dm_question_type, 'All music teachers are musicians. Some musicians perform in orchestras. No musicians are tone-deaf.', NULL, NULL, NULL, NULL, 5)
  RETURNING id INTO v_q05;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q05, 'Some music teachers perform in orchestras.', 'No', '''Some musicians perform in orchestras'' does not specify which musicians — those who perform may or may not be music teachers. Since we cannot determine this, the conclusion does not follow.', 1),
    (v_q05, 'No music teachers are tone-deaf.', 'Yes', 'All music teachers are musicians, and no musicians are tone-deaf. By transitive reasoning, no music teacher can be tone-deaf.', 2),
    (v_q05, 'All musicians are music teachers.', 'No', 'The premise states all music teachers are musicians — not the reverse. There may be musicians who are not music teachers. Reversing a universal statement is invalid.', 3),
    (v_q05, 'Some orchestra performers are musicians.', 'Yes', 'The premise states some musicians perform in orchestras. Those orchestra performers are, by definition, musicians.', 4),
    (v_q05, 'It is possible that some tone-deaf people are music teachers.', 'No', 'All music teachers are musicians. No musicians are tone-deaf. Therefore no music teacher can be tone-deaf — it is logically impossible.', 5);

  -- Q06: Dog and Cat Owners
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Dog and Cat Owners', 'venn_diagram'::dm_question_type, E'The diagram shows pet ownership in a neighbourhood. Each letter marks a different region of the diagram.\n\nWhich letter represents someone who owns both a dog and a cat?', NULL, '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Dogs","shape":"square"},{"id":"set2","label":"Cats","shape":"hexagon"}],"regions":{"set1_only":"P","set1_set2":"Q","set2_only":"R","outside":"S"}}'::jsonb, 'B', 'The square is Dogs and the hexagon is Cats. Region Q is the overlap between both shapes — inside the square AND inside the hexagon — representing people who own both a dog and a cat. P is Dogs only, R is Cats only, S is outside both (neither pet).', 6)
  RETURNING id INTO v_q06;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q06, 'A', 'Letter P', NULL, 1),
    (v_q06, 'B', 'Letter Q', NULL, 2),
    (v_q06, 'C', 'Letter R', NULL, 3),
    (v_q06, 'D', 'Letter S', NULL, 4);

  -- Q07: Medical Students and Anatomy
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Medical Students and Anatomy', 'syllogism'::dm_question_type, 'All medical students study anatomy. Some anatomy students fail their exams. No medical students are unqualified.', NULL, NULL, NULL, NULL, 7)
  RETURNING id INTO v_q07;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q07, 'Some medical students fail their exams.', 'No', 'Some anatomy students fail, but medical students are a subset of anatomy students. The failing students could all be non-medical anatomy students.', 1),
    (v_q07, 'All anatomy students are medical students.', 'No', 'All medical students study anatomy, but anatomy is also studied by non-medical students. The reverse does not hold.', 2),
    (v_q07, 'No unqualified people study anatomy.', 'No', 'No medical students are unqualified, but other anatomy students (non-medical) could be unqualified. The premise only restricts medical students.', 3),
    (v_q07, 'All medical students are qualified.', 'Yes', '''No medical students are unqualified'' means every medical student is qualified. This follows directly from the premise.', 4),
    (v_q07, 'Some people who study anatomy are qualified.', 'Yes', 'All medical students study anatomy and all medical students are qualified. Therefore at least some anatomy students (namely the medical students) are qualified.', 5);

  -- Q08: Dentist Appointments
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Dentist Appointments', 'logic_puzzle'::dm_question_type, E'A dentist sees four patients – Fiona, George, Hana, and Ivan – one after another in a single morning.\n\n• Hana is seen before George.\n• Ivan is not seen first or last.\n• Fiona is seen immediately before Ivan.\n\nIn which position is George seen?', NULL, NULL, 'D', 'Fiona is immediately before Ivan, so (F, I) is a consecutive pair. Ivan is not 1st or 4th, so Ivan = 2nd or 3rd. If Ivan = 2nd, Fiona = 1st. Remaining: Hana and George for 3rd and 4th. Hana before George → Hana = 3rd, George = 4th. If Ivan = 3rd, Fiona = 2nd. Remaining: Hana and George for 1st and 4th. Hana before George → Hana = 1st, George = 4th. In both cases George is 4th.', 8)
  RETURNING id INTO v_q08;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q08, 'A', 'First', NULL, 1),
    (v_q08, 'B', 'Second', NULL, 2),
    (v_q08, 'C', 'Third', NULL, 3),
    (v_q08, 'D', 'Fourth', NULL, 4);

  -- Q09: Flowers and Water
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Flowers and Water', 'syllogism'::dm_question_type, 'All roses are flowers. All flowers need water. Some flowers are fragrant.', NULL, NULL, NULL, NULL, 9)
  RETURNING id INTO v_q09;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q09, 'All roses need water.', 'Yes', 'All roses are flowers, and all flowers need water. By transitive reasoning, all roses need water.', 1),
    (v_q09, 'Some roses are fragrant.', 'No', 'Some flowers are fragrant, but this does not mean those fragrant flowers include any roses. Roses are flowers, but the fragrant ones could be entirely non-rose flowers.', 2),
    (v_q09, 'All things that need water are flowers.', 'No', 'The premise says all flowers need water — not that everything needing water is a flower. Many non-flowers also need water. This reverses the universal statement.', 3),
    (v_q09, 'Some fragrant things are flowers.', 'Yes', 'The premise states some flowers are fragrant. Those fragrant flowers are, by definition, both fragrant and flowers.', 4),
    (v_q09, 'All flowers are roses.', 'No', 'The premise states all roses are flowers — not the converse. Many flowers are not roses. This is a reversal error.', 5);

  -- Q10: Medical Conditions
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Medical Conditions', 'venn_diagram'::dm_question_type, E'The diagram shows patients at a clinic grouped by medical condition. Each letter marks a different region.\n\nWhich letter represents patients who have Diabetes and Asthma but not Hypertension?', NULL, '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Diabetes","shape":"square"},{"id":"set2","label":"Hypertension","shape":"circle"},{"id":"set3","label":"Asthma","shape":"octagon"}],"regions":{"set1_only":"W","set2_only":"X","set3_only":"Y","set1_set2":"T","set1_set3":"U","set2_set3":"V","all_three":"Z"}}'::jsonb, 'B', 'Diabetes = square (set1), Asthma = octagon (set3), Hypertension = circle (set2). The region inside Diabetes AND Asthma but outside Hypertension is set1_set3 = U. Region T is Diabetes ∩ Hypertension. Region V is Hypertension ∩ Asthma. Region Z is all three conditions. Answer: B (Letter U).', 10)
  RETURNING id INTO v_q10;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q10, 'A', 'Letter T', NULL, 1),
    (v_q10, 'B', 'Letter U', NULL, 2),
    (v_q10, 'C', 'Letter V', NULL, 3),
    (v_q10, 'D', 'Letter Z', NULL, 4);

  -- Q11: Weather Forecast Accuracy
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Weather Forecast Accuracy', 'probabilistic'::dm_question_type, 'A weather forecasting model correctly predicts rain 80% of the time when it does rain, and correctly predicts dry weather 85% of the time when it does not rain. In a given month of 30 days, it rains on 10 days.', NULL, NULL, 'B', 'Correct rain predictions (true positive): 10 × 0.80 = 8. False rain predictions (false positive): 20 × 0.15 = 3. Total rain predictions: 8 + 3 = 11. So A is wrong (11, not 8). P(rain | predicts rain) = 8/11 ≈ 72.7%, so B is correct. The model is 80% accurate on rainy days vs 85% on dry days, so C is wrong. Total errors = 2 (missed rain) + 3 (false rain) = 5, so D is wrong.', 11)
  RETURNING id INTO v_q11;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q11, 'A', 'The model will predict rain on exactly 8 days.', NULL, 1),
    (v_q11, 'B', 'When the model predicts rain, there is approximately a 73% chance it actually rains.', NULL, 2),
    (v_q11, 'C', 'The model is more accurate on rainy days than on dry days.', NULL, 3),
    (v_q11, 'D', 'The model will make incorrect predictions on fewer than 3 days.', NULL, 4);

  -- Q12: Fruit Preferences
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Fruit Preferences', 'venn_diagram'::dm_question_type, E'A survey of 12 people asked about fruit preferences. Three like only apples, two like only bananas, one likes only cherries, two like apples and bananas, and four like bananas and cherries.\n\nWhich of the following diagrams best represents the above data?', NULL, NULL, 'B', 'Apples only = 3 (set1_only). Apples ∩ Bananas = 2 (set1_set2). Bananas only = 2 (set2_only). Bananas ∩ Cherries = 4 (set2_set3). Cherries only = 1 (set3_only). Total = 3+2+2+4+1 = 12. Only option B has all five values correct. Option A swaps the two overlap regions. Option C swaps set1_only and set2_only. Option D swaps set2_only and set2_set3.', 12)
  RETURNING id INTO v_q12;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q12, 'A', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Apples","shape":"diamond"},{"id":"set2","label":"Bananas","shape":"hexagon"},{"id":"set3","label":"Cherries","shape":"circle"}],"regions":{"set1_only":3,"set1_set2":4,"set2_only":2,"set2_set3":2,"set3_only":1}}'::jsonb, 1),
    (v_q12, 'B', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Apples","shape":"diamond"},{"id":"set2","label":"Bananas","shape":"hexagon"},{"id":"set3","label":"Cherries","shape":"circle"}],"regions":{"set1_only":3,"set1_set2":2,"set2_only":2,"set2_set3":4,"set3_only":1}}'::jsonb, 2),
    (v_q12, 'C', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Apples","shape":"diamond"},{"id":"set2","label":"Bananas","shape":"hexagon"},{"id":"set3","label":"Cherries","shape":"circle"}],"regions":{"set1_only":2,"set1_set2":2,"set2_only":3,"set2_set3":4,"set3_only":1}}'::jsonb, 3),
    (v_q12, 'D', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Apples","shape":"diamond"},{"id":"set2","label":"Bananas","shape":"hexagon"},{"id":"set3","label":"Cherries","shape":"circle"}],"regions":{"set1_only":3,"set1_set2":2,"set2_only":4,"set2_set3":2,"set3_only":1}}'::jsonb, 4);

  -- Q13: Disease Screening Test
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Disease Screening Test', 'probabilistic'::dm_question_type, 'A screening test for a disease has a sensitivity of 95% (correctly identifies 95% of people with the disease) and a specificity of 90% (correctly identifies 90% of people without the disease). In a population of 10,000 people, 200 have the disease.', NULL, NULL, 'A', 'True positives: 200 × 0.95 = 190. False positives: 9,800 × 0.10 = 980. Total positive tests: 190 + 980 = 1,170, so A is correct. The positive predictive value is only 190/1170 ≈ 16%, so B is wrong. C is wrong because 5% (10 people) will be missed. D is wrong because there are 980 false positives, far more than 100.', 13)
  RETURNING id INTO v_q13;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q13, 'A', 'Approximately 1,170 people will test positive in total.', NULL, 1),
    (v_q13, 'B', 'A person who tests positive has a greater than 90% chance of having the disease.', NULL, 2),
    (v_q13, 'C', 'The test will correctly identify all 200 people with the disease.', NULL, 3),
    (v_q13, 'D', 'Fewer than 100 people without the disease will receive a false positive result.', NULL, 4);

  -- Q14: Film Schedule
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Film Schedule', 'logic_puzzle'::dm_question_type, E'A cinema shows four films – W, X, Y, and Z – in four consecutive time slots (1pm, 3pm, 5pm, and 7pm).\n\n• Film W is shown later than Film Z.\n• Film Y is shown at 5pm.\n• Film X is shown immediately after Film Z.\n\nWhich film is shown at 7pm?', NULL, NULL, 'A', 'Y is at 5pm. X is immediately after Z, so (Z, X) are consecutive. Z cannot be at 5pm (taken by Y). If Z = 1pm, X = 3pm. W must be later than Z (1pm), so W = 7pm. This works: Z(1pm), X(3pm), Y(5pm), W(7pm). If Z = 3pm, X = 5pm — but Y is at 5pm. Conflict. If Z = 5pm — taken. If Z = 7pm, X needs a 9pm slot which doesn''t exist. The only solution is W at 7pm.', 14)
  RETURNING id INTO v_q14;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q14, 'A', 'Film W', NULL, 1),
    (v_q14, 'B', 'Film X', NULL, 2),
    (v_q14, 'C', 'Film Y', NULL, 3),
    (v_q14, 'D', 'Film Z', NULL, 4);

  -- Q15: Animal Testing for Medical Research
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Animal Testing for Medical Research', 'strongest_argument'::dm_question_type, 'Animal testing for medical research should be banned.', NULL, NULL, 'B', 'Option B is the strongest argument because it directly addresses patient safety with a concrete, serious consequence — dangerous medicines reaching clinical trials without adequate safety testing. Option A is reasonable but the qualifier ''most'' acknowledges gaps. Option C is an emotional/ethical argument that does not address the practical consequences. Option D is an appeal to tradition, which is logically weak.', 15)
  RETURNING id INTO v_q15;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q15, 'A', 'Yes; advances in computer modelling and cell-based testing now provide reliable alternatives that can replace most animal experiments.', NULL, 1),
    (v_q15, 'B', 'No; without animal testing, it would be impossible to ensure new medicines are safe for humans, potentially leading to dangerous side effects being missed before clinical trials.', NULL, 2),
    (v_q15, 'C', 'Yes; animals suffer during experiments, and causing suffering to any living creature is morally wrong.', NULL, 3),
    (v_q15, 'D', 'No; animal testing has been practised for centuries and is an established part of the scientific process.', NULL, 4);

  -- Q16: Race Finishing Order
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Race Finishing Order', 'logic_puzzle'::dm_question_type, E'Five runners – A, B, C, D, and E – finish a race in different positions (1st to 5th).\n\n• A finishes before B.\n• C finishes immediately after D.\n• E finishes in 3rd place.\n• D finishes before A.\n\nWho finishes in 1st place?', NULL, NULL, 'C', 'E is 3rd. D finishes before A, and A finishes before B, giving the order D → A → B. C is immediately after D. If D = 1st, C = 2nd. E = 3rd. A must come after D, so A = 4th, B = 5th. Final order: D(1st), C(2nd), E(3rd), A(4th), B(5th). Runner D finishes 1st.', 16)
  RETURNING id INTO v_q16;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q16, 'A', 'Runner A', NULL, 1),
    (v_q16, 'B', 'Runner B', NULL, 2),
    (v_q16, 'C', 'Runner D', NULL, 3),
    (v_q16, 'D', 'Runner E', NULL, 4);

  -- Q17: Coin and Die Probability
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Coin and Die Probability', 'probabilistic'::dm_question_type, 'A fair coin is tossed and a fair six-sided die is rolled simultaneously. What is the probability of getting heads on the coin and a number greater than 4 on the die?', NULL, NULL, 'B', 'P(heads) = 1/2. P(greater than 4) = P(5 or 6) = 2/6 = 1/3. Since the events are independent: P(heads AND >4) = 1/2 × 1/3 = 1/6.', 17)
  RETURNING id INTO v_q17;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q17, 'A', '1/12', NULL, 1),
    (v_q17, 'B', '1/6', NULL, 2),
    (v_q17, 'C', '1/3', NULL, 3),
    (v_q17, 'D', '1/4', NULL, 4);

  -- Q18: Language Students
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Language Students', 'venn_diagram'::dm_question_type, E'The diagram shows students categorised by the languages they study. Each letter marks a different region.\n\nWhich letter represents students who study all three languages?', NULL, '{"diagramLayout":"three_all_overlap_v2","sets":[{"id":"set1","label":"French","shape":"circle"},{"id":"set2","label":"Spanish","shape":"hexagon"},{"id":"set3","label":"German","shape":"triangle"}],"regions":{"set1_only":"A","set2_only":"B","set3_only":"C","set1_set2":"D","set1_set3":"E","set2_set3":"F","all_three":"G","outside":"H"}}'::jsonb, 'D', 'Region G is the central overlap where all three shapes intersect — inside the circle (French), inside the hexagon (Spanish), and inside the triangle (German). D is French ∩ Spanish only. E is French ∩ German only. F is Spanish ∩ German only. Students studying all three languages are in region G — Answer D.', 18)
  RETURNING id INTO v_q18;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q18, 'A', 'Letter D', NULL, 1),
    (v_q18, 'B', 'Letter E', NULL, 2),
    (v_q18, 'C', 'Letter F', NULL, 3),
    (v_q18, 'D', 'Letter G', NULL, 4);

  -- Q19: Library Book Loans
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Library Book Loans', 'interpreting_info'::dm_question_type, 'A library recorded the number of books borrowed per month by genre.', '{"headers":["Genre","January","February","March"],"rows":[["Fiction","240","210","280"],["Non-fiction","180","195","170"],["Children''s","320","290","350"],["Reference","45","50","40"]]}'::jsonb, NULL, NULL, NULL, 19)
  RETURNING id INTO v_q19;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q19, 'Children''s books are the most borrowed genre in every month.', 'Yes', 'January: 320 (highest). February: 290 (highest). March: 350 (highest). Children''s leads every month.', 1),
    (v_q19, 'Non-fiction borrowing increased each month.', 'No', 'Non-fiction: January 180, February 195, March 170. It increased from January to February but decreased in March.', 2),
    (v_q19, 'More Fiction books were borrowed in March than in January and February combined.', 'No', 'March Fiction = 280. January + February Fiction = 240 + 210 = 450. 280 < 450.', 3),
    (v_q19, 'Reference books are the least borrowed genre in every month.', 'Yes', 'January: 45 (lowest). February: 50 (lowest). March: 40 (lowest). Reference is consistently the least borrowed.', 4),
    (v_q19, 'Total borrowing across all genres was highest in March.', 'Yes', 'January: 240+180+320+45 = 785. February: 210+195+290+50 = 745. March: 280+170+350+40 = 840. March (840) is the highest.', 5);

  -- Q20: Fitness Class Attendance
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Fitness Class Attendance', 'interpreting_info'::dm_question_type, 'A gym recorded the number of participants in weekly fitness classes at different times of day.', '{"headers":["Class","6am","12pm","6pm"],"rows":[["Yoga","15","22","30"],["Spinning","25","18","35"],["Pilates","12","20","24"],["Boxing","20","14","40"]]}'::jsonb, NULL, NULL, NULL, 20)
  RETURNING id INTO v_q20;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q20, 'The 6pm classes have the highest attendance for every class type.', 'Yes', 'Yoga: 30 > 22 > 15. Spinning: 35 > 25 > 18. Pilates: 24 > 20 > 12. Boxing: 40 > 20 > 14. The 6pm slot is highest in every case.', 1),
    (v_q20, 'Boxing has more participants than Spinning at 6am.', 'No', 'Boxing 6am = 20, Spinning 6am = 25. Boxing has fewer participants.', 2),
    (v_q20, 'Yoga has more 12pm participants than Pilates has 6pm participants.', 'No', 'Yoga 12pm = 22, Pilates 6pm = 24. Yoga has fewer.', 3),
    (v_q20, 'The total number of 6am participants across all classes is less than 80.', 'Yes', '6am total: 15 + 25 + 12 + 20 = 72. 72 < 80.', 4),
    (v_q20, 'Spinning has more participants than Yoga at every time slot.', 'No', 'At 12pm: Spinning = 18, Yoga = 22. Yoga has more participants at 12pm.', 5);

  -- Q21: Qualified and Certified Staff
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Qualified and Certified Staff', 'venn_diagram'::dm_question_type, E'The diagram shows the relationship between qualified and certified employees at a company. Each letter marks a different region.\n\nWhich letter represents employees who are qualified but not certified?', NULL, '{"diagramLayout":"two_nested","sets":[{"id":"set1","label":"Qualified","shape":"pentagon"},{"id":"set2","label":"Certified","shape":"octagon"}],"regions":{"set1_only":"M","set1_set2":"N","outside":"P"}}'::jsonb, 'A', 'The pentagon (Qualified) is the outer shape and the octagon (Certified) is entirely inside it. Region M is inside the pentagon but outside the octagon — qualified but not certified. Region N is inside both shapes — qualified and certified. Region P is outside both — neither. Answer: A (Letter M).', 21)
  RETURNING id INTO v_q21;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q21, 'A', 'Letter M', NULL, 1),
    (v_q21, 'B', 'Letter N', NULL, 2),
    (v_q21, 'C', 'Letter P', NULL, 3),
    (v_q21, 'D', 'Cannot be determined from the diagram', NULL, 4);

  -- Q22: School Uniforms
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'School Uniforms', 'strongest_argument'::dm_question_type, 'All secondary schools should require students to wear a uniform.', NULL, NULL, 'A', 'Option A is the strongest argument because it identifies a specific, measurable social benefit — reducing inequality-driven bullying — that directly supports the proposal. Option B raises a valid but secondary practical concern. Option C makes a speculative causal claim about discipline. Option D appeals to a general principle but does not weigh it against the concrete benefits.', 22)
  RETURNING id INTO v_q22;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q22, 'A', 'Yes; school uniforms reduce visible economic inequality among students, which can decrease bullying related to clothing.', NULL, 1),
    (v_q22, 'B', 'No; uniforms are expensive and add a financial burden on families who are already struggling.', NULL, 2),
    (v_q22, 'C', 'Yes; wearing a uniform teaches children discipline, which will help them in their future careers.', NULL, 3),
    (v_q22, 'D', 'No; students should be free to express their individuality through their clothing choices.', NULL, 4);

  -- Q23: Blood Bank Selection
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Blood Bank Selection', 'probabilistic'::dm_question_type, 'In a hospital blood bank, 45% of donations are type O, 40% are type A, 10% are type B, and 5% are type AB. A doctor selects two units at random from a large supply.', NULL, NULL, 'A', 'P(both O) = 0.45 × 0.45 = 0.2025 ≈ 20%, so A is correct. P(both A) = 0.40 × 0.40 = 0.16 = 16%, not > 20%, so B is wrong. P(one O, one A) = 2 × 0.45 × 0.40 = 0.36 = 36%, not < 30%, so C is wrong. P(same type) = 0.45² + 0.40² + 0.10² + 0.05² = 0.375, so P(different) = 0.625, not < 50%, so D is wrong.', 23)
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', 'The probability that both units are type O is approximately 20%.', NULL, 1),
    (v_q23, 'B', 'The probability that both units are type A is greater than 20%.', NULL, 2),
    (v_q23, 'C', 'The probability of selecting one type O and one type A (in any order) is less than 30%.', NULL, 3),
    (v_q23, 'D', 'The probability that the two units are different blood types is less than 50%.', NULL, 4);

  -- Q24: Rock and Jazz Music
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Rock and Jazz Music', 'venn_diagram'::dm_question_type, E'In a class of 20 students, 8 like rock music only, 5 like jazz music only, and 7 like both rock and jazz.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'C', 'Rock only = 8 (set1_only). Both = 7 (set1_set2). Jazz only = 5 (set2_only). Total = 8+7+5 = 20. Only option C has all three values correct. A swaps set1_only and set2_only. B puts the overlap as 5 instead of 7. D puts 7 in set1_only and 8 in the overlap.', 24)
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Rock","shape":"octagon"},{"id":"set2","label":"Jazz","shape":"triangle"}],"regions":{"set1_only":5,"set1_set2":7,"set2_only":8}}'::jsonb, 1),
    (v_q24, 'B', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Rock","shape":"octagon"},{"id":"set2","label":"Jazz","shape":"triangle"}],"regions":{"set1_only":8,"set1_set2":5,"set2_only":7}}'::jsonb, 2),
    (v_q24, 'C', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Rock","shape":"octagon"},{"id":"set2","label":"Jazz","shape":"triangle"}],"regions":{"set1_only":8,"set1_set2":7,"set2_only":5}}'::jsonb, 3),
    (v_q24, 'D', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Rock","shape":"octagon"},{"id":"set2","label":"Jazz","shape":"triangle"}],"regions":{"set1_only":7,"set1_set2":8,"set2_only":5}}'::jsonb, 4);

  -- Q25: School Activity Groups
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'School Activity Groups', 'venn_diagram'::dm_question_type, E'The diagram shows pupils categorised by school activity. Each letter marks a distinct region. A pupil''s letter indicates which groups they belong to.\n\nWhich letter represents pupils who are in the Year Group and are both Debaters and Musicians but not Athletes?', NULL, '{"diagramLayout":"five_complex","sets":[{"id":"set1","label":"Year Group","shape":"rectangle"},{"id":"set2","label":"Prefects","shape":"square"},{"id":"set3","label":"Athletes","shape":"triangle"},{"id":"set4","label":"Debaters","shape":"circle"},{"id":"set5","label":"Musicians","shape":"diamond"}],"regions":{"set2_only":"A","set1_set2":"B","set1_only":"C","set1_set4":"D","set1_set4_set5":"E","set1_set3_set5":"F","set3_only":"G","outside":"H"}}'::jsonb, 'B', 'Year Group = rectangle (set1), Debaters = circle (set4), Musicians = diamond (set5), Athletes = triangle (set3). Region E (set1_set4_set5) is inside the rectangle, inside the circle, and inside the diamond — but outside the triangle. This is Year Group ∩ Debaters ∩ Musicians without Athletes. Region D is set1 ∩ set4 (no Musicians). Region F is set1 ∩ set3 ∩ set5 (Athletes, not Debaters). Region G is Athletes only. Answer: B (Letter E).', 25)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q25, 'A', 'Letter D', NULL, 1),
    (v_q25, 'B', 'Letter E', NULL, 2),
    (v_q25, 'C', 'Letter F', NULL, 3),
    (v_q25, 'D', 'Letter G', NULL, 4);

  -- Q26: Employee Satisfaction Scores
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Employee Satisfaction Scores', 'interpreting_info'::dm_question_type, 'A company recorded employee satisfaction scores (out of 100) by department over three years.', '{"headers":["Department","2023","2024","2025"],"rows":[["Sales","72","68","75"],["Marketing","80","82","78"],["IT","65","70","76"],["HR","78","79","80"]]}'::jsonb, NULL, NULL, NULL, 26)
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q26, 'HR satisfaction has increased every year.', 'Yes', 'HR: 2023 = 78, 2024 = 79, 2025 = 80. Each year is higher than the last.', 1),
    (v_q26, 'IT had the lowest satisfaction score in 2023.', 'Yes', '2023 scores: Sales 72, Marketing 80, IT 65, HR 78. IT at 65 is the lowest.', 2),
    (v_q26, 'Marketing''s satisfaction score decreased between 2024 and 2025.', 'Yes', 'Marketing 2024 = 82, Marketing 2025 = 78. The score fell by 4 points.', 3),
    (v_q26, 'Sales satisfaction in 2025 is higher than Marketing satisfaction in 2025.', 'No', 'Sales 2025 = 75, Marketing 2025 = 78. Sales is lower, not higher.', 4),
    (v_q26, 'The average satisfaction across all departments was highest in 2025.', 'Yes', '2023 average: (72+80+65+78)/4 = 73.75. 2024: (68+82+70+79)/4 = 74.75. 2025: (75+78+76+80)/4 = 77.25. 2025 is highest.', 5);

  -- Q27: Online vs In-Store Shopping
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Online vs In-Store Shopping', 'venn_diagram'::dm_question_type, E'A survey found that 15 people prefer online shopping only and 10 people prefer in-store shopping only. No one reported preferring both.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'B', 'Online only = 15 (set1_only). In-store only = 10 (set2_only). No overlap, so the shapes must be separate. Only option B correctly shows 15 online and 10 in-store with no overlap. A swaps the counts. C incorrectly shows an overlap of 5. D shows 15 for both groups.', 27)
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', '', '{"diagramLayout":"two_separate_staggered","sets":[{"id":"set1","label":"Online","shape":"octagon"},{"id":"set2","label":"In-Store","shape":"diamond"}],"regions":{"set1_only":10,"set2_only":15}}'::jsonb, 1),
    (v_q27, 'B', '', '{"diagramLayout":"two_separate_staggered","sets":[{"id":"set1","label":"Online","shape":"octagon"},{"id":"set2","label":"In-Store","shape":"diamond"}],"regions":{"set1_only":15,"set2_only":10}}'::jsonb, 2),
    (v_q27, 'C', '', '{"diagramLayout":"two_overlap_staggered","sets":[{"id":"set1","label":"Online","shape":"octagon"},{"id":"set2","label":"In-Store","shape":"diamond"}],"regions":{"set1_only":10,"set1_set2":5,"set2_only":10}}'::jsonb, 3),
    (v_q27, 'D', '', '{"diagramLayout":"two_separate_staggered","sets":[{"id":"set1","label":"Online","shape":"octagon"},{"id":"set2","label":"In-Store","shape":"diamond"}],"regions":{"set1_only":15,"set2_only":15}}'::jsonb, 4);

  -- Q28: Vehicles and Electric Cars
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Vehicles and Electric Cars', 'syllogism'::dm_question_type, 'All cars are vehicles. All electric cars are cars. Some vehicles are imported.', NULL, NULL, NULL, NULL, 28)
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q28, 'All electric cars are vehicles.', 'Yes', 'All electric cars are cars, and all cars are vehicles. By transitive reasoning, all electric cars are vehicles.', 1),
    (v_q28, 'Some cars are imported.', 'No', 'Some vehicles are imported, but cars are a subset of vehicles. The imported vehicles may all be non-car vehicles (e.g. lorries, buses). This does not necessarily follow.', 2),
    (v_q28, 'All vehicles are cars.', 'No', 'The premise states all cars are vehicles — not the reverse. Buses, lorries, and motorcycles are vehicles but not cars.', 3),
    (v_q28, 'Some imported vehicles are electric cars.', 'No', 'We only know some vehicles are imported. Those imported vehicles could be any type of vehicle — there is no basis to conclude any are electric cars.', 4),
    (v_q28, 'All cars are electric cars.', 'No', 'All electric cars are cars, but many cars run on petrol or diesel. The reverse does not follow.', 5);

  -- Q29: Lowering the Voting Age
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Lowering the Voting Age', 'strongest_argument'::dm_question_type, 'The minimum voting age should be lowered to 16.', NULL, NULL, 'A', 'Option A is the strongest argument because it draws a direct, principled parallel — if 16-year-olds already bear civic responsibilities (work, taxes, military service), denying them political representation is inconsistent. Option B makes a broad generalisation about maturity. Option C is speculative about turnout effects. Option D is patronising and unsupported.', 29)
  RETURNING id INTO v_q29;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q29, 'A', 'Yes; 16-year-olds can work, pay taxes, and join the armed forces, so they should have a say in how they are governed.', NULL, 1),
    (v_q29, 'B', 'No; most 16-year-olds lack the life experience needed to make informed decisions about complex political issues.', NULL, 2),
    (v_q29, 'C', 'Yes; lowering the voting age would increase overall voter turnout and strengthen democracy.', NULL, 3),
    (v_q29, 'D', 'No; 16-year-olds might simply vote the same way as their parents, adding no genuine diversity to the electorate.', NULL, 4);

  -- Q30: Youth Club Hobbies
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Youth Club Hobbies', 'venn_diagram'::dm_question_type, E'In a youth club of 15 members, 4 enjoy painting only, 3 enjoy both painting and drawing, 2 enjoy drawing only, and 6 enjoy photography only. No one enjoys both photography and painting, or both photography and drawing.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'D', 'Painting only = 4 (set1_only). Painting ∩ Drawing = 3 (set1_set2). Drawing only = 2 (set2_only). Photography only = 6 (set3_only). Total = 4+3+2+6 = 15. Only option D has all four values correct. A swaps painting-only and photography-only. B swaps the overlap and drawing-only. C swaps painting-only and the overlap.', 30)
  RETURNING id INTO v_q30;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q30, 'A', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Painting","shape":"circle"},{"id":"set2","label":"Drawing","shape":"square"},{"id":"set3","label":"Photography","shape":"hexagon"}],"regions":{"set1_only":6,"set1_set2":3,"set2_only":2,"set3_only":4}}'::jsonb, 1),
    (v_q30, 'B', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Painting","shape":"circle"},{"id":"set2","label":"Drawing","shape":"square"},{"id":"set3","label":"Photography","shape":"hexagon"}],"regions":{"set1_only":4,"set1_set2":2,"set2_only":3,"set3_only":6}}'::jsonb, 2),
    (v_q30, 'C', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Painting","shape":"circle"},{"id":"set2","label":"Drawing","shape":"square"},{"id":"set3","label":"Photography","shape":"hexagon"}],"regions":{"set1_only":3,"set1_set2":4,"set2_only":2,"set3_only":6}}'::jsonb, 3),
    (v_q30, 'D', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Painting","shape":"circle"},{"id":"set2","label":"Drawing","shape":"square"},{"id":"set3","label":"Photography","shape":"hexagon"}],"regions":{"set1_only":4,"set1_set2":3,"set2_only":2,"set3_only":6}}'::jsonb, 4);

  -- Q31: Office Floors
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Office Floors', 'logic_puzzle'::dm_question_type, E'Four employees – James, Kate, Liam, and Maya – each work on a different floor of a four-storey building (floors 1 to 4).\n\n• Kate works on a higher floor than James.\n• Maya works on floor 2.\n• Liam does not work on a floor adjacent to Maya''s.\n\nWhich floor does Kate work on?', NULL, NULL, 'C', 'Maya is on floor 2. Liam cannot be adjacent to Maya, so Liam is not on floor 1 or 3 — Liam must be on floor 4. The remaining floors (1 and 3) go to James and Kate. Since Kate works higher than James: James = floor 1, Kate = floor 3.', 31)
  RETURNING id INTO v_q31;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q31, 'A', 'Floor 1', NULL, 1),
    (v_q31, 'B', 'Floor 2', NULL, 2),
    (v_q31, 'C', 'Floor 3', NULL, 3),
    (v_q31, 'D', 'Floor 4', NULL, 4);

  -- Q32: Parking Spaces
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Parking Spaces', 'logic_puzzle'::dm_question_type, E'Four cars – red, blue, green, and white – park in four numbered spaces (1 to 4) from left to right.\n\n• The red car is in a lower-numbered space than the blue car.\n• The green car is in space 3.\n• The white car is not next to the green car.\n\nWhich space is the blue car in?', NULL, NULL, 'D', 'Green is in space 3. White is not next to green (not space 2 or 4), so white = space 1. Remaining spaces for red and blue: 2 and 4. Red must be in a lower-numbered space than blue, so red = 2 and blue = 4.', 32)
  RETURNING id INTO v_q32;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q32, 'A', 'Space 1', NULL, 1),
    (v_q32, 'B', 'Space 2', NULL, 2),
    (v_q32, 'C', 'Space 3', NULL, 3),
    (v_q32, 'D', 'Space 4', NULL, 4);

  -- Q33: Study Hours and Grades
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Study Hours and Grades', 'probabilistic'::dm_question_type, 'A university surveyed 400 students about their study habits. 240 students reported studying more than 3 hours per day, and of those, 180 achieved a first-class grade. Of the 160 students who studied 3 hours or fewer, 40 achieved a first-class grade.', NULL, NULL, 'A', 'P(first | >3h) = 180/240 = 75%. P(first | ≤3h) = 40/160 = 25%. 75% ÷ 25% = 3, so A is correct. Total first-class = 220, so P = 220/400 = 55%, not 50%, so B is wrong. C is wrong because only 75%, not 100%, achieved first-class. Non-first-class students: 60 studied >3h, 120 studied ≤3h — the majority studied ≤3h, so D is wrong.', 33)
  RETURNING id INTO v_q33;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q33, 'A', 'Students who study more than 3 hours are three times as likely to achieve a first-class grade as those who study 3 hours or fewer.', NULL, 1),
    (v_q33, 'B', 'A student selected at random has a 50% chance of achieving a first-class grade.', NULL, 2),
    (v_q33, 'C', 'Studying more than 3 hours per day guarantees a first-class grade.', NULL, 3),
    (v_q33, 'D', 'The majority of students who did not achieve a first-class grade studied more than 3 hours per day.', NULL, 4);

  -- Q34: Novels and Bestsellers
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Novels and Bestsellers', 'syllogism'::dm_question_type, 'All novels are books. Some books are bestsellers. No textbooks are novels.', NULL, NULL, NULL, NULL, 34)
  RETURNING id INTO v_q34;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q34, 'Some novels are bestsellers.', 'No', 'Some books are bestsellers, but those bestselling books may not include any novels. The overlap between novels and bestsellers is not established by the premises.', 1),
    (v_q34, 'No textbooks are books.', 'No', 'The premise says no textbooks are novels — not that textbooks are not books. Textbooks could still be books; they just cannot be novels.', 2),
    (v_q34, 'All books are novels.', 'No', 'The premise states all novels are books — not that all books are novels. This is a reversal error.', 3),
    (v_q34, 'Some bestsellers are books.', 'Yes', 'Some books are bestsellers. Those bestselling books are, by definition, both bestsellers and books.', 4),
    (v_q34, 'No novels are textbooks.', 'Yes', 'No textbooks are novels. By the symmetry of ''no'' statements, if no textbook is a novel, then no novel is a textbook.', 5);

  -- Q35: University Tuition Fees
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'University Tuition Fees', 'strongest_argument'::dm_question_type, 'University tuition fees should be abolished and replaced with government funding.', NULL, NULL, 'A', 'Option A is the strongest argument because it directly addresses the core issue of access to education with a concrete, evidence-based reason — financial barriers preventing talented students from attending university. Option B raises a practical concern about funding stability but does not address the access problem. Option C relies on a weak ''other countries do it'' comparison. Option D makes a speculative claim about motivation with no supporting evidence.', 35)
  RETURNING id INTO v_q35;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q35, 'A', 'Yes; many talented students from low-income backgrounds are deterred from attending university due to the cost of tuition fees.', NULL, 1),
    (v_q35, 'B', 'No; universities need a reliable income stream, and government budgets are subject to annual political decisions that could destabilise funding.', NULL, 2),
    (v_q35, 'C', 'Yes; other countries have free university education, so the UK should follow their example.', NULL, 3),
    (v_q35, 'D', 'No; students who pay fees are more motivated to study hard and get good grades.', NULL, 4);

END $$;
