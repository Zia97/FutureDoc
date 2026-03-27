-- Seed: Timed DM Test 3 (test_id = 3)
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
  VALUES (3, 'DM Practice Test 3', 37)
  ON CONFLICT (id) DO NOTHING;

  -- Q01: Surgeons and Doctors
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Surgeons and Doctors', 'syllogism'::dm_question_type, 'All surgeons are doctors. Some doctors work in hospitals. No surgeons are untrained.', NULL, NULL, NULL, NULL, 1)
  RETURNING id INTO v_q01;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q01, 'Some surgeons work in hospitals.', 'No', 'Some doctors work in hospitals, but those doctors may not include any surgeons. The premises do not establish which doctors work in hospitals.', 1),
    (v_q01, 'No untrained people are surgeons.', 'Yes', 'No surgeons are untrained. By the symmetry of universal negative statements, no untrained people are surgeons.', 2),
    (v_q01, 'All doctors are surgeons.', 'No', 'All surgeons are doctors — not the reverse. Many doctors are not surgeons (e.g. GPs, psychiatrists). This reverses the universal statement.', 3),
    (v_q01, 'All surgeons are trained.', 'Yes', '''No surgeons are untrained'' is equivalent to saying every surgeon is trained. This follows directly.', 4),
    (v_q01, 'Some people who work in hospitals are doctors.', 'Yes', 'Some doctors work in hospitals. Those hospital-working doctors are, by definition, both hospital workers and doctors.', 5);

  -- Q02: Charity Donations by Region
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Charity Donations by Region', 'interpreting_info'::dm_question_type, 'A charity recorded the total donations (in thousands of pounds) received from four UK regions over three months.', '{"headers":["Region","October","November","December"],"rows":[["South East","42","38","65"],["North West","28","31","50"],["Scotland","15","20","35"],["Wales","10","12","22"]]}'::jsonb, NULL, NULL, NULL, 2)
  RETURNING id INTO v_q02;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q02, 'Donations from every region increased from November to December.', 'Yes', 'SE: 38→65 (up). NW: 31→50 (up). Scotland: 20→35 (up). Wales: 12→22 (up). All increased.', 1),
    (v_q02, 'South East donated more than all other regions combined in October.', 'No', 'SE October = 42. Others combined = 28 + 15 + 10 = 53. 42 < 53.', 2),
    (v_q02, 'Scotland''s donations more than doubled from October to December.', 'Yes', 'Scotland October = 15, December = 35. Double of 15 = 30. 35 > 30, so yes it more than doubled.', 3),
    (v_q02, 'South East donations decreased between October and November.', 'Yes', 'SE October = 42, November = 38. The donations fell by £4,000.', 4),
    (v_q02, 'Wales contributed more than 15% of total donations in December.', 'No', 'December total = 65 + 50 + 35 + 22 = 172. Wales = 22. 22/172 ≈ 12.8%. 12.8% is less than 15%, so Wales did not contribute more than 15%.', 5);

  -- Q03: Mandatory Organ Donation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Mandatory Organ Donation', 'strongest_argument'::dm_question_type, 'All citizens should be automatically registered as organ donors unless they choose to opt out.', NULL, NULL, 'A', 'Option A is the strongest argument because it provides concrete, evidence-based reasoning — opt-out systems demonstrably save lives by increasing available organs. Option B raises a valid ethical concern but does not address the life-saving benefit. Option C is speculative about people''s intentions. Option D is irrelevant to the opt-out registration question and makes a weak cost argument.', 3)
  RETURNING id INTO v_q03;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q03, 'A', 'Yes; countries with opt-out systems have significantly higher organ donation rates, which directly reduces the number of patients dying while waiting for transplants.', NULL, 1),
    (v_q03, 'B', 'No; the government should not make decisions about people''s bodies without their explicit written consent.', NULL, 2),
    (v_q03, 'C', 'Yes; most people intend to donate their organs but simply never get around to registering.', NULL, 3),
    (v_q03, 'D', 'No; organ transplants are expensive and place a burden on the NHS budget.', NULL, 4);

  -- Q04: Hotel Room Allocation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Hotel Room Allocation', 'logic_puzzle'::dm_question_type, E'Four guests – Priya, Quinn, Ravi, and Suki – are each assigned a different room on floors 1 to 4 of a hotel.\n\n• Ravi is on a higher floor than Priya.\n• Suki is on floor 3.\n• Quinn is not on a floor adjacent to Suki''s floor.\n\nWhich floor is Ravi on?', NULL, NULL, 'D', 'Suki is on floor 3. Quinn cannot be adjacent to Suki (not floor 2 or 4), so Quinn = floor 1. Remaining floors for Priya and Ravi: 2 and 4. Ravi is higher than Priya, so Priya = 2, Ravi = 4.', 4)
  RETURNING id INTO v_q04;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q04, 'A', 'Floor 1', NULL, 1),
    (v_q04, 'B', 'Floor 2', NULL, 2),
    (v_q04, 'C', 'Floor 3', NULL, 3),
    (v_q04, 'D', 'Floor 4', NULL, 4);

  -- Q05: Gym Membership Types
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Gym Membership Types', 'venn_diagram'::dm_question_type, E'A gym has 30 members. 10 have pool access only, 8 have gym-floor access only, and 12 have both pool and gym-floor access.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'Pool only = 10 (set1_only). Both = 12 (set1_set2). Gym floor only = 8 (set2_only). Total = 10 + 12 + 8 = 30. Only option A has all three values correct. B swaps set1_only and set2_only. C puts the overlap as 10 and pool-only as 12. D puts the overlap as 8.', 5)
  RETURNING id INTO v_q05;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q05, 'A', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Pool","shape":"oval"},{"id":"set2","label":"Gym Floor","shape":"trapezoid"}],"regions":{"set1_only":10,"set1_set2":12,"set2_only":8}}'::jsonb, 1),
    (v_q05, 'B', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Pool","shape":"oval"},{"id":"set2","label":"Gym Floor","shape":"trapezoid"}],"regions":{"set1_only":8,"set1_set2":12,"set2_only":10}}'::jsonb, 2),
    (v_q05, 'C', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Pool","shape":"oval"},{"id":"set2","label":"Gym Floor","shape":"trapezoid"}],"regions":{"set1_only":12,"set1_set2":10,"set2_only":8}}'::jsonb, 3),
    (v_q05, 'D', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Pool","shape":"oval"},{"id":"set2","label":"Gym Floor","shape":"trapezoid"}],"regions":{"set1_only":10,"set1_set2":8,"set2_only":12}}'::jsonb, 4);

  -- Q06: Vaccines and Immunisation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Vaccines and Immunisation', 'syllogism'::dm_question_type, 'All approved vaccines undergo clinical trials. Some clinical trials are funded by the government. No approved vaccines are untested.', NULL, NULL, NULL, NULL, 6)
  RETURNING id INTO v_q06;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q06, 'Some approved vaccines are funded by the government.', 'No', 'Some clinical trials are government-funded, but we cannot determine whether the trials for approved vaccines specifically are among those. The overlap is not established.', 1),
    (v_q06, 'All approved vaccines have been tested.', 'Yes', '''No approved vaccines are untested'' is logically equivalent to ''all approved vaccines have been tested.''', 2),
    (v_q06, 'All things that undergo clinical trials are approved vaccines.', 'No', 'All approved vaccines undergo trials, but many drugs undergo trials and are never approved. This reverses the premise.', 3),
    (v_q06, 'Some government-funded trials involve approved vaccines.', 'No', 'We know some trials are government-funded and all approved vaccines undergo trials, but the government-funded trials could all be for non-vaccine products. The connection is not established.', 4),
    (v_q06, 'No untested products are approved vaccines.', 'Yes', 'No approved vaccines are untested. By symmetry of the universal negative, no untested products are approved vaccines.', 5);

  -- Q07: Train Delays
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Train Delays', 'probabilistic'::dm_question_type, 'A commuter rail service runs 200 trains per week. Records show that 30 trains are delayed each week. Of the delayed trains, 80% arrive within 10 minutes of the scheduled time. Of the trains that are on time, 5% are recorded as delayed due to a logging error.', NULL, NULL, 'A', '30 trains are delayed. 20% of those (6 trains) are delayed by more than 10 min. 6/200 = 3%, so A is correct. On-time = 170. Logging errors: 170 × 0.05 = 8.5. Total logged delayed: 30 + 8.5 = 38.5, not > 40, so B is wrong. P(genuine | logged) = 30/38.5 ≈ 78%, not 50%, so C is wrong. Only 8.5 on-time trains are falsely logged, not >15, so D is wrong.', 7)
  RETURNING id INTO v_q07;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q07, 'A', 'The probability that a randomly selected train is genuinely delayed by more than 10 minutes is 3%.', NULL, 1),
    (v_q07, 'B', 'More than 40 trains per week are logged as delayed.', NULL, 2),
    (v_q07, 'C', 'If a train is logged as delayed, there is approximately a 50% chance it is genuinely delayed.', NULL, 3),
    (v_q07, 'D', 'More than 15 on-time trains per week are incorrectly logged as delayed.', NULL, 4);

  -- Q08: Science Fair Entries
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Science Fair Entries', 'venn_diagram'::dm_question_type, E'The diagram shows students categorised by which science subjects they entered projects in at the school fair. Each letter marks a different region.\n\nWhich letter represents students who entered projects in both Physics and Chemistry but not Biology?', NULL, '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Physics","shape":"parallelogram"},{"id":"set2","label":"Chemistry","shape":"star"},{"id":"set3","label":"Biology","shape":"oval"}],"regions":{"set1_only":"J","set2_only":"K","set3_only":"L","set1_set2":"M","set1_set3":"N","set2_set3":"P","all_three":"Q","outside":"R"}}'::jsonb, 'B', 'Physics = parallelogram (set1), Chemistry = star (set2), Biology = oval (set3). The region inside Physics AND Chemistry but outside Biology is set1_set2 = M. N is Physics ∩ Biology (no Chemistry). P is Chemistry ∩ Biology (no Physics). Q is all three. Answer: B (Letter M).', 8)
  RETURNING id INTO v_q08;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q08, 'A', 'Letter N', NULL, 1),
    (v_q08, 'B', 'Letter M', NULL, 2),
    (v_q08, 'C', 'Letter P', NULL, 3),
    (v_q08, 'D', 'Letter Q', NULL, 4);

  -- Q09: The Rise of Telemedicine
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'The Rise of Telemedicine', 'syllogism'::dm_question_type, E'The adoption of telemedicine accelerated dramatically during the pandemic, with virtual consultations rising by over 300% in the UK. Many patients reported shorter waiting times and greater convenience, particularly those in rural areas who previously faced long journeys to clinics. However, critics noted that physical examinations remained impossible through video calls, and elderly patients often struggled with the required technology. The British Medical Association recommended a hybrid model, where routine follow-ups and minor ailments could be handled remotely, but initial assessments and complex conditions should remain face-to-face.', NULL, NULL, NULL, NULL, 9)
  RETURNING id INTO v_q09;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q09, 'Virtual consultations became more common during the pandemic.', 'Yes', 'The passage states that virtual consultations rose by over 300% during the pandemic, which directly supports this conclusion.', 1),
    (v_q09, 'All elderly patients were unable to access telemedicine.', 'No', 'The passage says elderly patients ''often struggled'' with the technology — ''often'' does not mean ''all''. Some elderly patients may have managed successfully.', 2),
    (v_q09, 'The BMA recommended that all medical consultations should be conducted remotely.', 'No', 'The BMA recommended a hybrid model — remote for routine follow-ups and minor ailments, but face-to-face for initial assessments and complex conditions. Not all consultations remotely.', 3),
    (v_q09, 'Patients in rural areas particularly benefited from telemedicine.', 'Yes', 'The passage states rural patients previously faced long journeys and that they reported shorter waiting times and greater convenience through telemedicine.', 4),
    (v_q09, 'Physical examinations can be conducted effectively through video calls.', 'No', 'The passage explicitly states that physical examinations ''remained impossible through video calls.''', 5);

  -- Q10: Hospital Bed Occupancy
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Hospital Bed Occupancy', 'interpreting_info'::dm_question_type, 'A hospital trust recorded the percentage bed occupancy rate across four wards over three quarters.', '{"headers":["Ward","Q1","Q2","Q3"],"rows":[["A&E","92","88","95"],["Maternity","78","82","80"],["Surgical","85","90","88"],["Paediatric","70","65","72"]]}'::jsonb, NULL, NULL, NULL, 10)
  RETURNING id INTO v_q10;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q10, 'A&E had the highest occupancy rate in every quarter.', 'No', 'In Q2: A&E = 88%, Surgical = 90%. Surgical was higher in Q2.', 1),
    (v_q10, 'Paediatric ward had the lowest occupancy in every quarter.', 'Yes', 'Q1: 70% (lowest). Q2: 65% (lowest). Q3: 72% (lowest). Paediatric is consistently the lowest.', 2),
    (v_q10, 'Maternity occupancy increased from Q1 to Q3.', 'Yes', 'Maternity Q1 = 78%, Q3 = 80%. 80 > 78, so it increased overall (though it dipped in Q3 from Q2''s 82%).', 3),
    (v_q10, 'The range of occupancy across all wards was smallest in Q2.', 'No', 'Q1 range: 92 - 70 = 22. Q2 range: 90 - 65 = 25. Q3 range: 95 - 72 = 23. Q2 has the largest range, not the smallest.', 4),
    (v_q10, 'Surgical ward occupancy peaked in Q2.', 'Yes', 'Surgical: Q1 = 85, Q2 = 90, Q3 = 88. The highest value is 90 in Q2.', 5);

  -- Q11: Swimming Relay Order
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Swimming Relay Order', 'logic_puzzle'::dm_question_type, E'A swimming team of four – Anna, Ben, Clara, and Dev – must swim a relay in a set order (1st to 4th).\n\n• Clara swims immediately before Dev.\n• Anna swims 4th.\n• Ben swims before Clara.\n\nWho swims 1st?', NULL, NULL, 'B', 'Anna = 4th. Clara is immediately before Dev, forming (C, D). Ben swims before Clara. If C=2nd, D=3rd: Ben must be before Clara, so Ben=1st. Order: Ben, Clara, Dev, Anna. If C=1st, D=2nd: Ben must be before Clara(1st) — impossible. If C=3rd, D=4th: but Anna is 4th — conflict. Only valid solution: Ben(1st), Clara(2nd), Dev(3rd), Anna(4th). Ben swims 1st.', 11)
  RETURNING id INTO v_q11;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q11, 'A', 'Anna', NULL, 1),
    (v_q11, 'B', 'Ben', NULL, 2),
    (v_q11, 'C', 'Clara', NULL, 3),
    (v_q11, 'D', 'Dev', NULL, 4);

  -- Q12: Single-Use Plastic Ban
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Single-Use Plastic Ban', 'strongest_argument'::dm_question_type, 'All single-use plastics should be banned immediately.', NULL, NULL, 'B', 'Option B is the strongest argument because it directly addresses the ''immediately'' aspect of the proposal with concrete, serious economic consequences — industry disruption, job losses, and food price increases. Option A provides a compelling environmental reason but does not address the ''immediately'' qualifier. Option C is a weak appeal to other countries'' actions. Option D oversimplifies — recycling rates for plastics remain very low.', 12)
  RETURNING id INTO v_q12;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q12, 'A', 'Yes; plastic pollution in oceans is responsible for the deaths of over one million marine animals each year, and a ban would directly reduce this harm.', NULL, 1),
    (v_q12, 'B', 'No; an immediate ban would cause significant disruption to the food packaging industry, leading to job losses and higher food prices.', NULL, 2),
    (v_q12, 'C', 'Yes; many countries have already banned single-use plastics, so the UK should do the same.', NULL, 3),
    (v_q12, 'D', 'No; people can simply recycle plastics instead of banning them.', NULL, 4);

  -- Q13: Tea and Coffee Drinkers
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Tea and Coffee Drinkers', 'venn_diagram'::dm_question_type, E'The diagram shows beverage preferences among office workers. Each letter marks a different region.\n\nWhich letter represents workers who drink tea but neither coffee nor hot chocolate?', NULL, '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"Tea","shape":"isosceles_triangle"},{"id":"set2","label":"Coffee","shape":"oval"},{"id":"set3","label":"Hot Chocolate","shape":"star"}],"regions":{"set1_only":"A","set1_set2":"B","set2_only":"C","set2_set3":"D","set3_only":"E","outside":"F"}}'::jsonb, 'A', 'Tea = isosceles triangle (set1), Coffee = oval (set2), Hot Chocolate = star (set3). Region A (set1_only) is inside Tea but outside Coffee and Hot Chocolate. B is Tea ∩ Coffee. C is Coffee only. D is Coffee ∩ Hot Chocolate. Answer: A.', 13)
  RETURNING id INTO v_q13;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q13, 'A', 'Letter A', NULL, 1),
    (v_q13, 'B', 'Letter B', NULL, 2),
    (v_q13, 'C', 'Letter C', NULL, 3),
    (v_q13, 'D', 'Letter D', NULL, 4);

  -- Q14: Medical Test Accuracy
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Medical Test Accuracy', 'probabilistic'::dm_question_type, 'A hospital uses a blood test to detect a rare condition. The test has a sensitivity of 98% and a specificity of 92%. In the tested population of 5,000 patients, 50 actually have the condition.', NULL, NULL, 'C', 'True positives: 50 × 0.98 = 49. False positives: 4,950 × 0.08 = 396. Total positives: 49 + 396 = 445, so C is correct. A is wrong — sensitivity is 98%, so 1 patient will be missed. PPV = 49/445 ≈ 11%, far below 50%, so B is wrong. D is wrong — 396 false positives is more than 300.', 14)
  RETURNING id INTO v_q14;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q14, 'A', 'The test will correctly identify all 50 patients with the condition.', NULL, 1),
    (v_q14, 'B', 'A patient who tests positive has a greater than 50% chance of having the condition.', NULL, 2),
    (v_q14, 'C', 'Approximately 445 patients will test positive in total.', NULL, 3),
    (v_q14, 'D', 'The test will produce fewer than 300 false positive results.', NULL, 4);

  -- Q15: Mammals and Whales
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Mammals and Whales', 'syllogism'::dm_question_type, 'All whales are mammals. All mammals breathe air. Some mammals live on land.', NULL, NULL, NULL, NULL, 15)
  RETURNING id INTO v_q15;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q15, 'All whales breathe air.', 'Yes', 'All whales are mammals and all mammals breathe air. By transitive reasoning, all whales breathe air.', 1),
    (v_q15, 'Some whales live on land.', 'No', 'Some mammals live on land, but those land-dwelling mammals could all be non-whale species. The premises do not establish that any whales live on land.', 2),
    (v_q15, 'All things that breathe air are mammals.', 'No', 'The premise states all mammals breathe air — not the reverse. Birds and reptiles also breathe air but are not mammals.', 3),
    (v_q15, 'All mammals are whales.', 'No', 'All whales are mammals — not the reverse. Dogs, cats, and humans are mammals but not whales.', 4),
    (v_q15, 'Some things that breathe air are whales.', 'Yes', 'All whales breathe air (established above). Since whales exist, some air-breathing things are whales.', 5);

  -- Q16: A-Level Results by Subject
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'A-Level Results by Subject', 'interpreting_info'::dm_question_type, 'A sixth form college recorded the percentage of students achieving grades A*–B in four A-Level subjects over three years.', '{"headers":["Subject","2023","2024","2025"],"rows":[["Mathematics","52","58","55"],["Biology","48","50","54"],["English","60","57","62"],["Chemistry","44","49","51"]]}'::jsonb, NULL, NULL, NULL, 16)
  RETURNING id INTO v_q16;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q16, 'Chemistry showed a consistent improvement across all three years.', 'Yes', 'Chemistry: 44 → 49 → 51. Each year is higher than the previous. Consistent improvement.', 1),
    (v_q16, 'English had the highest percentage of A*–B grades in every year.', 'No', 'In 2024: English = 57%, Mathematics = 58%. Mathematics was higher in 2024.', 2),
    (v_q16, 'Mathematics performance improved from 2024 to 2025.', 'No', 'Mathematics 2024 = 58%, 2025 = 55%. It decreased by 3 percentage points.', 3),
    (v_q16, 'Biology improved by more than 10 percentage points from 2023 to 2025.', 'No', 'Biology 2023 = 48%, 2025 = 54%. Improvement = 6 percentage points, which is not more than 10.', 4),
    (v_q16, 'The average percentage across all subjects was higher in 2025 than in 2023.', 'Yes', '2023 average: (52+48+60+44)/4 = 51. 2025 average: (55+54+62+51)/4 = 55.5. 55.5 > 51.', 5);

  -- Q17: Science Lab Schedule
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Science Lab Schedule', 'logic_puzzle'::dm_question_type, E'Four experiments – P, Q, R, and S – must be completed in four consecutive lab slots (9am, 10am, 11am, 12pm).\n\n• Experiment R is completed before experiment Q.\n• Experiment S is at 11am.\n• Experiment P is completed immediately before experiment R.\n\nWhich experiment is at 9am?', NULL, NULL, 'A', 'P is immediately before R, forming the consecutive pair (P, R). S is at 11am. R is before Q. If P=9am, R=10am: S=11am, Q=12pm. R(10am) before Q(12pm) ✓. This works. If P=10am, R=11am: but S is at 11am — conflict. If P=11am: S is at 11am — conflict. So P must be at 9am.', 17)
  RETURNING id INTO v_q17;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q17, 'A', 'Experiment P', NULL, 1),
    (v_q17, 'B', 'Experiment Q', NULL, 2),
    (v_q17, 'C', 'Experiment R', NULL, 3),
    (v_q17, 'D', 'Experiment S', NULL, 4);

  -- Q18: Student Societies
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Student Societies', 'venn_diagram'::dm_question_type, E'In a university of 25 first-year students, 6 joined only the Drama society, 4 joined only the Music society, 3 joined only the Debate society, 5 joined both Drama and Music, 2 joined both Music and Debate, and 5 are not in any society.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'Drama only = 6, Drama ∩ Music = 5, Music only = 4, Music ∩ Debate = 2, Debate only = 3, outside = 5. Total = 6+5+4+2+3+5 = 25. Only option A has all values correct. B swaps Drama-only and the Drama-Music overlap. C swaps the two overlap regions. D swaps Music-only with Debate-only and the two overlaps.', 18)
  RETURNING id INTO v_q18;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q18, 'A', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Drama","shape":"trapezoid"},{"id":"set2","label":"Music","shape":"parallelogram"},{"id":"set3","label":"Debate","shape":"isosceles_triangle"}],"regions":{"set1_only":6,"set1_set2":5,"set2_only":4,"set2_set3":2,"set3_only":3,"outside":5}}'::jsonb, 1),
    (v_q18, 'B', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Drama","shape":"trapezoid"},{"id":"set2","label":"Music","shape":"parallelogram"},{"id":"set3","label":"Debate","shape":"isosceles_triangle"}],"regions":{"set1_only":5,"set1_set2":6,"set2_only":4,"set2_set3":2,"set3_only":3,"outside":5}}'::jsonb, 2),
    (v_q18, 'C', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Drama","shape":"trapezoid"},{"id":"set2","label":"Music","shape":"parallelogram"},{"id":"set3","label":"Debate","shape":"isosceles_triangle"}],"regions":{"set1_only":6,"set1_set2":2,"set2_only":4,"set2_set3":5,"set3_only":3,"outside":5}}'::jsonb, 3),
    (v_q18, 'D', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Drama","shape":"trapezoid"},{"id":"set2","label":"Music","shape":"parallelogram"},{"id":"set3","label":"Debate","shape":"isosceles_triangle"}],"regions":{"set1_only":6,"set1_set2":5,"set2_only":3,"set2_set3":4,"set3_only":2,"outside":5}}'::jsonb, 4);

  -- Q19: Antibiotic Resistance
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Antibiotic Resistance', 'syllogism'::dm_question_type, E'Antibiotic resistance is one of the greatest threats to global health. The overuse of antibiotics in both human medicine and agriculture has accelerated the evolution of resistant bacterial strains. In hospitals, infections caused by methicillin-resistant Staphylococcus aureus (MRSA) have declined in recent years due to improved hygiene protocols, but resistance to last-resort antibiotics such as carbapenems is rising. Pharmaceutical companies have been reluctant to invest in new antibiotic development because antibiotics are used for short courses, making them less profitable than treatments for chronic conditions. Public health experts warn that without new classes of antibiotics, routine surgical procedures could become life-threatening within decades. Several offshore wind projects were completed ahead of schedule, but onshore wind planning applications continue to face significant local opposition in many rural areas.', NULL, NULL, NULL, NULL, 19)
  RETURNING id INTO v_q19;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q19, 'The overuse of antibiotics is limited to human medicine.', 'No', 'The passage states overuse occurs ''in both human medicine and agriculture'' — it is not solely human medicine.', 1),
    (v_q19, 'MRSA infections have declined in recent years.', 'Yes', 'The passage explicitly states MRSA infections ''have declined in recent years due to improved hygiene protocols.''', 2),
    (v_q19, 'Pharmaceutical companies find antibiotics less profitable than chronic condition treatments.', 'Yes', 'The passage states companies are reluctant to invest because antibiotics ''are used for short courses, making them less profitable than treatments for chronic conditions.''', 3),
    (v_q19, 'All forms of antibiotic resistance have declined.', 'No', 'While MRSA declined, resistance to last-resort antibiotics like carbapenems is rising. Not all resistance has declined.', 4),
    (v_q19, 'Without new antibiotics, routine surgery could become dangerous.', 'Yes', 'The passage states that ''without new classes of antibiotics, routine surgical procedures could become life-threatening within decades.''', 5);

  -- Q20: Compulsory Voting
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Compulsory Voting', 'strongest_argument'::dm_question_type, 'Voting in general elections should be made compulsory for all eligible citizens.', NULL, NULL, 'A', 'Option A is the strongest argument because it directly addresses the democratic legitimacy problem — governments would more accurately represent the whole population. Option B raises a philosophical concern about freedom but does not counter the democratic benefit. Option C makes a vague, unsupported claim. Option D is a weak practical objection that doesn''t address the principle.', 20)
  RETURNING id INTO v_q20;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q20, 'A', 'Yes; compulsory voting ensures that elected governments reflect the views of the entire population rather than just those motivated enough to vote.', NULL, 1),
    (v_q20, 'B', 'No; forcing people to vote undermines the principle of freedom, as the right to abstain is itself a form of political expression.', NULL, 2),
    (v_q20, 'C', 'Yes; countries with compulsory voting tend to have more stable governments.', NULL, 3),
    (v_q20, 'D', 'No; enforcing compulsory voting would be costly and difficult to administer.', NULL, 4);

  -- Q21: Genetic Screening
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Genetic Screening', 'probabilistic'::dm_question_type, 'A genetic screening test for a hereditary condition has an accuracy of 97% for carriers and 95% for non-carriers. In a population of 2,000 people screened, 60 are carriers of the gene.', NULL, NULL, 'B', 'True positives: 60 × 0.97 = 58.2. False positives: 1,940 × 0.05 = 97. Total positives: 58.2 + 97 = 155.2. PPV = 58.2/155.2 ≈ 37.5%, so B is correct. A: total positives ≈ 155, not >200, so A is wrong. C: the test misses 3% of carriers (≈ 1.8), so it will not identify all 60, so C is wrong. D: 97 false positives is not fewer than 50, so D is wrong.', 21)
  RETURNING id INTO v_q21;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q21, 'A', 'More than 200 people will test positive in total.', NULL, 1),
    (v_q21, 'B', 'A person who tests positive has approximately a 37% chance of being a carrier.', NULL, 2),
    (v_q21, 'C', 'The test will correctly identify all 60 carriers.', NULL, 3),
    (v_q21, 'D', 'Fewer than 50 non-carriers will receive a false positive result.', NULL, 4);

  -- Q22: Holiday Activities
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Holiday Activities', 'venn_diagram'::dm_question_type, E'The diagram shows guests at a resort categorised by activities they participated in. Each letter marks a different region.\n\nWhich letter represents guests who went swimming and hiking but not cycling?', NULL, '{"diagramLayout":"three_all_overlap_v2","sets":[{"id":"set1","label":"Swimming","shape":"trapezoid"},{"id":"set2","label":"Hiking","shape":"hexagon"},{"id":"set3","label":"Cycling","shape":"parallelogram"}],"regions":{"set1_only":"W","set2_only":"X","set3_only":"Y","set1_set2":"T","set1_set3":"U","set2_set3":"V","all_three":"Z","outside":"S"}}'::jsonb, 'B', 'Swimming = trapezoid (set1), Hiking = hexagon (set2), Cycling = parallelogram (set3). Swimming AND Hiking but NOT Cycling = set1_set2 = T. U is Swimming ∩ Cycling. V is Hiking ∩ Cycling. Z is all three. Answer: B (Letter T).', 22)
  RETURNING id INTO v_q22;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q22, 'A', 'Letter U', NULL, 1),
    (v_q22, 'B', 'Letter T', NULL, 2),
    (v_q22, 'C', 'Letter V', NULL, 3),
    (v_q22, 'D', 'Letter Z', NULL, 4);

  -- Q23: Magazine Shelf Order
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Magazine Shelf Order', 'logic_puzzle'::dm_question_type, E'Five magazines – Art, Business, Cooking, Design, and Engineering – are placed on a shelf from left (position 1) to right (position 5).\n\n• Cooking is immediately to the right of Art.\n• Engineering is in position 5.\n• Business is not next to Cooking.\n• Design is to the left of Business.\n• Art is not in position 1.\n\nWhat is in position 1?', NULL, NULL, 'C', 'Engineering = position 5. (Art, Cooking) is a consecutive pair. Art ≠ position 1. If A=2, C=3: Business not next to C(3) → Business ≠ 2 or 4. Business ≠ 2 (Art). So Business ≠ 4 either. Only remaining spot is 1. Design left of Business(1) — impossible. If A=3, C=4: Business ≠ 3 or 5 (not next to C at 4, and 5 is taken). So Business = 1 or 2. Design left of Business: if B=2, D=1; if B=1, no room for D to the left. So D=1, B=2, A=3, C=4, E=5. Check: Business(2) next to Cooking(4)? No ✓. Position 1 = Design.', 23)
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', 'Art', NULL, 1),
    (v_q23, 'B', 'Business', NULL, 2),
    (v_q23, 'C', 'Design', NULL, 3),
    (v_q23, 'D', 'Cooking', NULL, 4);

  -- Q24: Energy Consumption by Source
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Energy Consumption by Source', 'interpreting_info'::dm_question_type, 'A report tracked the percentage of energy generated from different sources in a country over three years.', '{"headers":["Source","2023","2024","2025"],"rows":[["Wind","22","26","30"],["Solar","8","12","15"],["Gas","45","40","35"],["Nuclear","20","18","17"],["Other","5","4","3"]]}'::jsonb, NULL, NULL, NULL, 24)
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q24, 'Wind and solar combined exceeded 40% of energy generation in 2025.', 'Yes', 'Wind 2025 = 30%, Solar 2025 = 15%. Combined = 45%, which exceeds 40%.', 1),
    (v_q24, 'Gas was the largest single source of energy in every year.', 'Yes', '2023: Gas 45% (highest). 2024: Gas 40% (highest). 2025: Gas 35% — Wind is 30%, so Gas is still highest at 35%.', 2),
    (v_q24, 'Nuclear energy increased over the three-year period.', 'No', 'Nuclear: 20% → 18% → 17%. It decreased each year.', 3),
    (v_q24, 'Solar energy tripled from 2023 to 2025.', 'No', 'Solar 2023 = 8%, 2025 = 15%. Triple of 8% = 24%. 15% is less than 24%, so it did not triple.', 4),
    (v_q24, 'Non-renewable sources (gas, nuclear, other) accounted for less than 60% in 2025.', 'Yes', 'Non-renewable 2025: 35 + 17 + 3 = 55%. 55% < 60%.', 5);

  -- Q25: Social Media and Mental Health
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Social Media and Mental Health', 'syllogism'::dm_question_type, E'A large-scale study published in The Lancet followed 10,000 young people aged 13–18 over five years to examine the relationship between social media use and mental health. The study found a correlation between heavy social media use (more than three hours per day) and higher rates of anxiety and depression. Those spending more than three hours daily were twice as likely to report poor mental health outcomes compared to those spending less than one hour. However, the researchers cautioned that correlation does not imply causation, noting that teenagers already experiencing mental health difficulties may turn to social media for connection. Several schools that implemented phone-free policies reported improved concentration but no measurable change in students'' overall wellbeing scores.', NULL, NULL, NULL, NULL, 25)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q25, 'The study proved that social media causes anxiety and depression.', 'No', 'The passage found a correlation, not causation. The researchers explicitly cautioned that ''correlation does not imply causation.''', 1),
    (v_q25, 'Heavy social media users were twice as likely to report poor mental health.', 'Yes', 'The passage states those spending more than three hours daily were ''twice as likely to report poor mental health outcomes.''', 2),
    (v_q25, 'Phone-free school policies improved student wellbeing.', 'No', 'Schools reported ''improved concentration but no measurable change in students'' overall wellbeing scores.'' Wellbeing did not improve.', 3),
    (v_q25, 'The study examined adults aged over 18.', 'No', 'The study followed participants ''aged 13–18'' — these are teenagers, not adults.', 4),
    (v_q25, 'It is possible that teenagers with mental health issues use social media more as a coping mechanism.', 'Yes', 'The passage states researchers cautioned that ''teenagers already experiencing mental health difficulties may turn to social media for connection,'' which supports this possibility.', 5);

  -- Q26: Instrument Players
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Instrument Players', 'venn_diagram'::dm_question_type, E'In a music school of 18 students, 5 play piano only, 4 play guitar only, 3 play violin only, 2 play both piano and guitar, and 4 play both guitar and violin.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'B', 'Piano only = 5, Piano ∩ Guitar = 2, Guitar only = 4, Guitar ∩ Violin = 4, Violin only = 3. Total = 5+2+4+4+3 = 18. Only option B has all values correct. A swaps the two overlaps. C swaps piano-only and guitar-only. D swaps piano-only and violin-only.', 26)
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q26, 'A', '', '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"Piano","shape":"star"},{"id":"set2","label":"Guitar","shape":"oval"},{"id":"set3","label":"Violin","shape":"trapezoid"}],"regions":{"set1_only":5,"set1_set2":4,"set2_only":4,"set2_set3":2,"set3_only":3}}'::jsonb, 1),
    (v_q26, 'B', '', '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"Piano","shape":"star"},{"id":"set2","label":"Guitar","shape":"oval"},{"id":"set3","label":"Violin","shape":"trapezoid"}],"regions":{"set1_only":5,"set1_set2":2,"set2_only":4,"set2_set3":4,"set3_only":3}}'::jsonb, 2),
    (v_q26, 'C', '', '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"Piano","shape":"star"},{"id":"set2","label":"Guitar","shape":"oval"},{"id":"set3","label":"Violin","shape":"trapezoid"}],"regions":{"set1_only":4,"set1_set2":2,"set2_only":5,"set2_set3":4,"set3_only":3}}'::jsonb, 3),
    (v_q26, 'D', '', '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"Piano","shape":"star"},{"id":"set2","label":"Guitar","shape":"oval"},{"id":"set3","label":"Violin","shape":"trapezoid"}],"regions":{"set1_only":3,"set1_set2":2,"set2_only":4,"set2_set3":4,"set3_only":5}}'::jsonb, 4);

  -- Q27: Abolishing Private Schools
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Abolishing Private Schools', 'strongest_argument'::dm_question_type, 'Private schools should be abolished and all children should attend state schools.', NULL, NULL, 'A', 'Option A is the strongest argument because it identifies a specific, measurable harm — entrenched social inequality from childhood — that directly supports the proposal. Option B raises parental rights but doesn''t address the inequality concern. Option C is speculative about what the government might do. Option D is irrelevant — buildings and traditions do not justify educational inequality.', 27)
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', 'Yes; private schools entrench social inequality by giving wealthier children access to better resources, creating an uneven playing field from childhood.', NULL, 1),
    (v_q27, 'B', 'No; parents have the right to choose how to spend their money, including on their children''s education.', NULL, 2),
    (v_q27, 'C', 'Yes; removing private schools would force the government to invest more in state education.', NULL, 3),
    (v_q27, 'D', 'No; many private schools have historic buildings and traditions that would be lost.', NULL, 4);

  -- Q28: Bus Arrival Order
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Bus Arrival Order', 'logic_puzzle'::dm_question_type, E'Four buses – Route 7, Route 12, Route 15, and Route 22 – arrive at a station one after another.\n\n• Route 15 arrives immediately after Route 7.\n• Route 22 does not arrive 1st or 4th.\n• Route 12 arrives after Route 22.\n\nWhich bus arrives 4th?', NULL, NULL, 'B', 'Route 15 is immediately after Route 7, so (7, 15) is consecutive. Route 22 is not 1st or 4th. Route 12 is after Route 22. If 7=1st, 15=2nd: Route 22 not 1st (taken) or 4th, so 22=3rd. Route 12 after 22(3rd), so 12=4th ✓. If 7=2nd, 15=3rd: 22 not 1st or 4th, so 22 must be a remaining slot. Remaining: 1st and 4th for 22 and 12. But 22 ≠ 1st or 4th — no valid placement. If 7=3rd, 15=4th: 22 ≠ 1st or 4th. Remaining: 1st and 2nd for 22 and 12. 12 after 22 → 22=1st, but 22 ≠ 1st — contradiction. Only valid solution: 7,15,22,12. Route 12 arrives 4th.', 28)
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', 'Route 7', NULL, 1),
    (v_q28, 'B', 'Route 12', NULL, 2),
    (v_q28, 'C', 'Route 15', NULL, 3),
    (v_q28, 'D', 'Route 22', NULL, 4);

  -- Q29: Allergy Types
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Allergy Types', 'venn_diagram'::dm_question_type, E'A survey of 40 patients found: 12 are allergic to peanuts only, 8 are allergic to shellfish only, 6 are allergic to both peanuts and shellfish, and 14 are allergic to neither.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'Peanuts only = 12, both = 6, shellfish only = 8, neither = 14. Total = 12+6+8+14 = 40 ✓. Only option A is correct. B swaps peanuts and shellfish counts. C puts 8 in the overlap. D swaps peanuts-only with neither.', 29)
  RETURNING id INTO v_q29;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q29, 'A', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Peanuts","shape":"isosceles_triangle"},{"id":"set2","label":"Shellfish","shape":"oval"}],"regions":{"set1_only":12,"set1_set2":6,"set2_only":8,"outside":14}}'::jsonb, 1),
    (v_q29, 'B', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Peanuts","shape":"isosceles_triangle"},{"id":"set2","label":"Shellfish","shape":"oval"}],"regions":{"set1_only":8,"set1_set2":6,"set2_only":12,"outside":14}}'::jsonb, 2),
    (v_q29, 'C', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Peanuts","shape":"isosceles_triangle"},{"id":"set2","label":"Shellfish","shape":"oval"}],"regions":{"set1_only":12,"set1_set2":8,"set2_only":6,"outside":14}}'::jsonb, 3),
    (v_q29, 'D', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Peanuts","shape":"isosceles_triangle"},{"id":"set2","label":"Shellfish","shape":"oval"}],"regions":{"set1_only":14,"set1_set2":6,"set2_only":8,"outside":12}}'::jsonb, 4);

  -- Q30: Renewable Energy Subsidies
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Renewable Energy Subsidies', 'syllogism'::dm_question_type, E'Government subsidies for renewable energy have increased steadily over the past decade, with billions of pounds allocated to wind, solar, and tidal power projects. Proponents argue that these subsidies are essential for reaching net-zero carbon emissions by 2050 and that the cost of solar panels has fallen by 70% largely thanks to government support. Critics counter that subsidies discourage private investment by making companies dependent on government support. Despite these debates, several offshore wind projects were completed ahead of schedule, and the UK now generates a record proportion of its electricity from renewables. However, onshore wind planning applications continue to face significant local opposition in many rural areas.', NULL, NULL, NULL, NULL, 30)
  RETURNING id INTO v_q30;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q30, 'Government subsidies for renewable energy have decreased over the past decade.', 'No', 'The passage states subsidies ''have increased steadily over the past decade,'' not decreased.', 1),
    (v_q30, 'The cost of solar panels has fallen significantly.', 'Yes', 'The passage states solar panel costs ''have fallen by 70%,'' which is a significant reduction.', 2),
    (v_q30, 'All wind projects were completed ahead of schedule.', 'No', 'The passage says ''several offshore wind projects'' were completed ahead of schedule — ''several'' does not mean all, and it only refers to offshore projects.', 3),
    (v_q30, 'Critics believe subsidies discourage private investment.', 'Yes', 'The passage states critics argue subsidies ''discourage private investment by making companies dependent on government support.''', 4),
    (v_q30, 'Onshore wind projects face local opposition.', 'Yes', 'The passage explicitly states ''onshore wind planning applications continue to face significant local opposition in many rural areas.''', 5);

  -- Q31: GP Surgery Appointments
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'GP Surgery Appointments', 'interpreting_info'::dm_question_type, 'A GP surgery recorded the number of appointments booked per week across four categories.', '{"headers":["Category","Week 1","Week 2","Week 3","Week 4"],"rows":[["Face-to-face","120","115","130","125"],["Telephone","85","90","88","95"],["Video","15","20","18","25"],["Home visit","10","8","12","9"]]}'::jsonb, NULL, NULL, NULL, 31)
  RETURNING id INTO v_q31;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q31, 'Face-to-face appointments were the most common category every week.', 'Yes', 'Week 1: 120 (highest). Week 2: 115 (highest). Week 3: 130 (highest). Week 4: 125 (highest). Face-to-face leads every week.', 1),
    (v_q31, 'Video appointments increased consistently each week.', 'No', 'Video: 15, 20, 18, 25. It decreased from Week 2 (20) to Week 3 (18).', 2),
    (v_q31, 'The total number of appointments in Week 4 exceeded 250.', 'Yes', 'Week 4 total: 125 + 95 + 25 + 9 = 254. 254 > 250.', 3),
    (v_q31, 'Home visits were always fewer than video appointments.', 'Yes', 'W1: 10 < 15. W2: 8 < 20. W3: 12 < 18. W4: 9 < 25. Home visits are always fewer.', 4),
    (v_q31, 'Telephone appointments decreased from Week 1 to Week 2.', 'No', 'Telephone Week 1 = 85, Week 2 = 90. It increased, not decreased.', 5);

  -- Q32: Campus Facilities
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Campus Facilities', 'venn_diagram'::dm_question_type, E'The diagram shows students categorised by which campus facilities they use. Each letter marks a different region.\n\nWhich letter represents students who use the Library only?', NULL, '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Library","shape":"hexagon"},{"id":"set2","label":"Canteen","shape":"trapezoid"},{"id":"set3","label":"Sports Hall","shape":"isosceles_triangle"}],"regions":{"set1_only":"H","set1_set2":"J","set2_only":"K","set3_only":"L","outside":"M"}}'::jsonb, 'C', 'Library = hexagon (set1), Canteen = trapezoid (set2), Sports Hall = isosceles triangle (set3). Region H (set1_only) is inside the hexagon but outside the trapezoid and triangle — Library only. J is Library ∩ Canteen. K is Canteen only. M is outside all. Answer: C (Letter H).', 32)
  RETURNING id INTO v_q32;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q32, 'A', 'Letter J', NULL, 1),
    (v_q32, 'B', 'Letter K', NULL, 2),
    (v_q32, 'C', 'Letter H', NULL, 3),
    (v_q32, 'D', 'Letter M', NULL, 4);

  -- Q33: Card Drawing Probability
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Card Drawing Probability', 'probabilistic'::dm_question_type, 'A bag contains 8 red cards, 5 blue cards, and 7 green cards. Two cards are drawn at random without replacement.', NULL, NULL, 'A', 'Total cards = 20. P(both red) = (8/20)(7/19) = 56/380 ≈ 14.7% ≈ 15%, so A is correct. P(same colour) = 56/380 + 20/380 + 42/380 = 118/380 ≈ 31%, not >40%, so B is wrong. P(one red, one blue) = 2 × (8/20)(5/19) = 80/380 ≈ 21%, not ≈10%, so C is wrong. P(≥1 green) ≈ 59%, not <50%, so D is wrong.', 33)
  RETURNING id INTO v_q33;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q33, 'A', 'The probability that both cards are red is approximately 15%.', NULL, 1),
    (v_q33, 'B', 'The probability that both cards are the same colour is greater than 40%.', NULL, 2),
    (v_q33, 'C', 'The probability of drawing one red and one blue card (in any order) is approximately 10%.', NULL, 3),
    (v_q33, 'D', 'The probability that at least one card is green is less than 50%.', NULL, 4);

  -- Q34: Nurses and Healthcare Workers
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Nurses and Healthcare Workers', 'syllogism'::dm_question_type, 'All nurses are healthcare workers. All healthcare workers must be registered. Some healthcare workers specialise in mental health.', NULL, NULL, NULL, NULL, 34)
  RETURNING id INTO v_q34;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q34, 'All nurses must be registered.', 'Yes', 'All nurses are healthcare workers, and all healthcare workers must be registered. By transitive reasoning, all nurses must be registered.', 1),
    (v_q34, 'Some nurses specialise in mental health.', 'No', 'Some healthcare workers specialise in mental health, but those may not include any nurses. The premises do not establish which healthcare workers specialise in mental health.', 2),
    (v_q34, 'All healthcare workers are nurses.', 'No', 'All nurses are healthcare workers — not the reverse. Doctors, paramedics, and therapists are healthcare workers but not nurses.', 3),
    (v_q34, 'Some registered people are healthcare workers.', 'Yes', 'All healthcare workers must be registered. Since healthcare workers exist, some registered people must be healthcare workers.', 4),
    (v_q34, 'All registered people are healthcare workers.', 'No', 'All healthcare workers must be registered, but other professionals (e.g. lawyers, accountants) may also need registration. The reverse does not hold.', 5);

  -- Q35: Student Transport Survey
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Student Transport Survey', 'venn_diagram'::dm_question_type, E'The diagram shows how students travel to school. Each letter marks a region.\n\nWhich letter represents students who walk to school but do not cycle?', NULL, '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Walk","shape":"parallelogram"},{"id":"set2","label":"Cycle","shape":"star"}],"regions":{"set1_only":"E","set1_set2":"F","set2_only":"G","outside":"H"}}'::jsonb, 'C', 'Walk = parallelogram (set1), Cycle = star (set2). Region E (set1_only) is inside the parallelogram but outside the star — students who walk but do not cycle. F is Walk ∩ Cycle. G is Cycle only. H is outside both (neither walk nor cycle). Answer: C (Letter E).', 35)
  RETURNING id INTO v_q35;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q35, 'A', 'Letter F', NULL, 1),
    (v_q35, 'B', 'Letter G', NULL, 2),
    (v_q35, 'C', 'Letter E', NULL, 3),
    (v_q35, 'D', 'Letter H', NULL, 4);

END $$;
