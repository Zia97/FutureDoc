-- Seed: Timed DM Test 1 (test_id = 1)
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
  VALUES (1, 'DM Practice Test 1', 37)
  ON CONFLICT (id) DO NOTHING;

  -- Q01: Medical Diagnostic Test
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Medical Diagnostic Test', 'probabilistic'::dm_question_type, 'A diagnostic test for a disease has a sensitivity of 90% (it correctly identifies 90% of people who have the disease) and a specificity of 85% (it correctly identifies 85% of people who do not have the disease). In a population where 10% of people have the disease, a person is selected at random and tests positive. What is the probability that this person actually has the disease?', NULL, NULL, 'C', 'Using Bayes'' theorem: P(positive | disease) = 0.90; P(disease) = 0.10; P(positive | no disease) = 1 − 0.85 = 0.15; P(no disease) = 0.90. P(positive) = (0.90 × 0.10) + (0.15 × 0.90) = 0.09 + 0.135 = 0.225. P(disease | positive) = 0.09 / 0.225 = 0.40 = 40%. Option A (10%) is the prior prevalence, ignoring the test result entirely. Option B (25%) does not correctly apply Bayes'' theorem. Option D (90%) is the sensitivity — the probability of a positive test given disease — not the positive predictive value.', 1)
  RETURNING id INTO v_q01;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q01, 'A', '10%', NULL, 1),
    (v_q01, 'B', '25%', NULL, 2),
    (v_q01, 'C', '40%', NULL, 3),
    (v_q01, 'D', '90%', NULL, 4);

  -- Q02: Clinical Drug Trial Results
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Clinical Drug Trial Results', 'interpreting_info'::dm_question_type, 'The table below shows results from a clinical trial comparing four treatments and a placebo group.', '{"headers":["Treatment","Patients (n)","Response Rate (%)","Adverse Events (%)","Dropout Rate (%)"],"rows":[["Drug A","120","68","12","8"],["Drug B","95","74","18","11"],["Placebo","115","23","4","6"],["Drug C","108","81","22","14"],["Combined AB","87","85","28","19"]]}'::jsonb, NULL, NULL, NULL, 2)
  RETURNING id INTO v_q02;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q02, 'Drug C had a higher response rate than Drug B.', 'Yes', 'Drug C response rate = 81%; Drug B = 74%. Drug C is higher.', 1),
    (v_q02, 'The placebo group had the lowest adverse event rate.', 'Yes', 'Placebo adverse events = 4% — the lowest of all five treatment groups.', 2),
    (v_q02, 'More patients were enrolled in the placebo group than in the Drug B group.', 'Yes', 'Placebo n = 115; Drug B n = 95. 115 > 95.', 3),
    (v_q02, 'The treatment with the highest response rate also had the lowest dropout rate.', 'No', 'Combined AB has the highest response rate (85%), but the lowest dropout rate belongs to Placebo (6%) — these are different groups.', 4),
    (v_q02, 'Drug A experienced fewer than 100 adverse events in absolute terms.', 'Yes', 'Drug A: 120 patients × 12% adverse event rate = 14.4 absolute adverse events. This is far fewer than 100.', 5);

  -- Q03: Vitamin C Foods
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Vitamin C Foods', 'syllogism'::dm_question_type, 'All foods containing vitamin C are healthy. Some fruits contain vitamin C. All oranges are fruits.', NULL, NULL, NULL, NULL, 3)
  RETURNING id INTO v_q03;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q03, 'Some fruits are healthy.', 'Yes', 'Some fruits contain vitamin C; all vitamin C foods are healthy — therefore those fruits are healthy.', 1),
    (v_q03, 'All oranges are healthy.', 'No', 'All oranges are fruits, and some fruits contain vitamin C — but the premises don''t confirm oranges specifically contain vitamin C. You cannot conclude all oranges are healthy.', 2),
    (v_q03, 'Some healthy foods are fruits.', 'Yes', 'The fruits that contain vitamin C are both healthy and fruits — so some healthy foods are indeed fruits.', 3),
    (v_q03, 'Some healthy foods contain vitamin C.', 'Yes', 'Some fruits contain vitamin C; those fruits are healthy — therefore some healthy foods contain vitamin C.', 4),
    (v_q03, 'No non-fruit food is healthy.', 'No', 'The premises only state that some fruits containing vitamin C are healthy. They say nothing about other foods — non-fruit foods could also be healthy.', 5);

  -- Q04: Train Departure Times
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Train Departure Times', 'logic_puzzle'::dm_question_type, 'Five trains depart from Millfield Station at the following times: 07:00, 08:30, 10:00, 11:30, and 13:00. Each train serves a different destination: Northport, Southgate, Westham, Eastville, and Midbourne. The following is known:
• The train to Westham departs at 07:00.
• The train to Northport departs at either 08:30 or 10:00.
• The train to Southgate departs exactly one hour and thirty minutes before the train to Eastville.
• The train to Eastville departs after 11:00.
• The train to Midbourne departs before the train to Northport.

What time does the train to Northport depart?', NULL, NULL, 'C', 'Westham = 07:00. Northport is either 08:30 or 10:00. If Northport = 08:30, then Midbourne must depart before 08:30 — but the only earlier slot (07:00) is already taken by Westham, leaving no valid slot for Midbourne. Therefore Northport = 10:00 and Midbourne = 08:30. Eastville departs after 11:00, so Eastville is 11:30 or 13:00. Southgate departs 1h30m before Eastville: if Eastville = 11:30, Southgate = 10:00 — but that slot is already assigned to Northport, creating a conflict. Therefore Eastville = 13:00 and Southgate = 11:30. The train to Northport departs at 10:00.', 4)
  RETURNING id INTO v_q04;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q04, 'A', '07:00', NULL, 1),
    (v_q04, 'B', '08:30', NULL, 2),
    (v_q04, 'C', '10:00', NULL, 3),
    (v_q04, 'D', '11:30', NULL, 4);

  -- Q05: Football League Table
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Football League Table', 'interpreting_info'::dm_question_type, 'The table below shows the standings of five teams in a football league after 12 matches each. Teams receive 3 points for a win and 1 point for a draw.', '{"headers":["Team","Played","Won","Drawn","Lost","Points"],"rows":[["United","12","8","2","2","26"],["City","12","7","3","2","24"],["Rovers","12","5","4","3","19"],["Town","12","4","2","6","14"],["Athletic","12","2","1","9","7"]]}'::jsonb, NULL, NULL, NULL, 5)
  RETURNING id INTO v_q05;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q05, 'United have won more games than any other team.', 'Yes', 'United won 8 matches — more than any other team in the table.', 1),
    (v_q05, 'City have drawn more games than any other team.', 'No', 'Rovers recorded 4 draws, which is more than City''s 3 draws. City do not have the most draws.', 2),
    (v_q05, 'Rovers have a better win rate than Town.', 'Yes', 'Rovers won 5 of 12 (41.7%); Town won 4 of 12 (33.3%). Rovers have the higher win rate.', 3),
    (v_q05, 'The combined total of drawn results recorded across all five teams is 12.', 'Yes', 'Sum of draws: 2+3+4+2+1 = 12. The statement is correct.', 4),
    (v_q05, 'The points difference between United and Rovers is greater than the points difference between City and Town.', 'No', 'United minus Rovers = 26−19 = 7 points. City minus Town = 24−14 = 10 points. 7 < 10, so the United/Rovers gap is actually smaller.', 5);

  -- Q06: Conference Room Booking
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Conference Room Booking', 'logic_puzzle'::dm_question_type, 'A company has four meeting rooms: Alpha, Beta, Gamma, and Delta. The finance team needs a room available on both Tuesday and Wednesday for a two-day booking. The following is known:
• Alpha is already booked on Monday and Wednesday.
• Beta is unavailable on Tuesday.
• Gamma is only available on Monday, Wednesday, and Friday.
• Delta is booked on Thursday only.

Which room can the finance team use?', NULL, NULL, 'D', 'The finance team needs a room free on both Tuesday and Wednesday. Alpha is booked on Wednesday — unavailable. Beta is unavailable on Tuesday — cannot be used. Gamma is only available on Monday, Wednesday, and Friday — not available on Tuesday. Delta is booked only on Thursday, meaning it is free on both Tuesday and Wednesday. Delta is the only room that satisfies the two-day requirement.', 6)
  RETURNING id INTO v_q06;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q06, 'A', 'Alpha', NULL, 1),
    (v_q06, 'B', 'Beta', NULL, 2),
    (v_q06, 'C', 'Gamma', NULL, 3),
    (v_q06, 'D', 'Delta', NULL, 4);

  -- Q07: Nature Reserve Animals
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Nature Reserve Animals', 'venn_diagram'::dm_question_type, 'A nature reserve contains 50 animals. 15 are mammals only, 12 are birds only, and 8 are reptiles only. 6 animals are classified as both mammals and birds. 4 animals are classified as both birds and reptiles. 5 animals belong to none of these three categories.

Which of the following diagrams correctly represents this data?', NULL, NULL, 'B', 'The key detail here is that there is no overlap between Mammals and Reptiles — only Mammals and Birds overlap, and Birds and Reptiles overlap. This means the correct diagram must use a linear three-shape layout, not one where all three shapes overlap.

Checking the values: Mammals only = 15, Mammals and Birds = 6, Birds only = 12, Birds and Reptiles = 4, Reptiles only = 8, outside = 5. Total = 15 + 6 + 12 + 4 + 8 + 5 = 50 ✓.

Option B is correct — it uses a linear layout and shows all six values accurately. Option A uses a layout where all three shapes overlap, which introduces a false Mammals and Reptiles region and shows an incorrect Mammals and Birds value of 5. Option C changes Mammals only to 14 and Birds and Reptiles to 5. Option D changes Birds only to 11 and Reptiles only to 9.', 7)
  RETURNING id INTO v_q07;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q07, 'A', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Mammals","shape":"rectangle"},{"id":"set2","label":"Birds","shape":"circle"},{"id":"set3","label":"Reptiles","shape":"triangle"}],"regions":{"set1_only":15,"set2_only":12,"set3_only":8,"set1_set2":5,"set2_set3":4,"set1_set3":1,"outside":5}}'::jsonb, 1),
    (v_q07, 'B', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Mammals","shape":"rectangle"},{"id":"set2","label":"Birds","shape":"circle"},{"id":"set3","label":"Reptiles","shape":"triangle"}],"regions":{"set1_only":15,"set1_set2":6,"set2_only":12,"set2_set3":4,"set3_only":8,"outside":5}}'::jsonb, 2),
    (v_q07, 'C', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Mammals","shape":"rectangle"},{"id":"set2","label":"Birds","shape":"circle"},{"id":"set3","label":"Reptiles","shape":"triangle"}],"regions":{"set1_only":14,"set1_set2":6,"set2_only":12,"set2_set3":5,"set3_only":8,"outside":5}}'::jsonb, 3),
    (v_q07, 'D', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Mammals","shape":"rectangle"},{"id":"set2","label":"Birds","shape":"circle"},{"id":"set3","label":"Reptiles","shape":"triangle"}],"regions":{"set1_only":15,"set1_set2":6,"set2_only":11,"set2_set3":4,"set3_only":9,"outside":5}}'::jsonb, 4);

  -- Q08: Hospital Department Data
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Hospital Department Data', 'interpreting_info'::dm_question_type, 'The table below shows data from five hospital departments for January and February.', '{"headers":["Department","Jan Patients","Feb Patients","Staff","Avg Wait (mins)"],"rows":[["Cardiology","45","52","8","34"],["Neurology","38","41","6","45"],["Orthopaedics","63","59","10","28"],["A&E","210","198","25","18"],["Dermatology","27","31","4","52"]]}'::jsonb, NULL, NULL, NULL, 8)
  RETURNING id INTO v_q08;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q08, 'Cardiology saw an increase in patients from January to February.', 'Yes', 'Cardiology patients rose from 45 in January to 52 in February — that is an increase.', 1),
    (v_q08, 'The department with the longest average wait time also has the fewest staff.', 'Yes', 'Dermatology has the longest average wait (52 mins) and also the fewest staff (4) — both apply to the same department.', 2),
    (v_q08, 'A&E had more than five times the number of January patients compared to Neurology.', 'Yes', 'A&E January = 210; Neurology January = 38. Five times Neurology = 5 × 38 = 190. Since 210 > 190, A&E had more than five times as many.', 3),
    (v_q08, 'The total patient count across all departments was higher in February than in January.', 'No', 'January total = 45+38+63+210+27 = 383. February total = 52+41+59+198+31 = 381. The total actually decreased slightly.', 4),
    (v_q08, 'Orthopaedics had a higher percentage decrease in patients than A&E between January and February.', 'Yes', 'Orthopaedics: 4/63 × 100 ≈ 6.3% decrease. A&E: 12/210 × 100 ≈ 5.7% decrease. Orthopaedics had the larger percentage fall.', 5);

  -- Q09: Language Study Survey
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Language Study Survey', 'venn_diagram'::dm_question_type, 'In a school of 30 students, 18 study French, 14 study Spanish, and 7 study both languages. The remaining students study neither language.

Which of the following diagrams correctly represents this data?', NULL, NULL, 'C', 'Work out each region first. French only = 18 − 7 = 11. Spanish only = 14 − 7 = 7. Both languages = 7. Neither = 30 − (11 + 7 + 7) = 5.

Option C is correct — it shows 11 in French only, 7 in Spanish only, 7 in the overlap, and 5 outside both shapes.

Option A has an incorrect overlap of 6 and an outside value of 6. Option B inflates French only to 12 and reduces Spanish only to 6. Option D reduces French only to 10 and inflates Spanish only to 8.', 9)
  RETURNING id INTO v_q09;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q09, 'A', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"French","shape":"circle"},{"id":"set2","label":"Spanish","shape":"square"}],"regions":{"set1_only":11,"set2_only":7,"set1_set2":6,"outside":6}}'::jsonb, 1),
    (v_q09, 'B', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"French","shape":"circle"},{"id":"set2","label":"Spanish","shape":"square"}],"regions":{"set1_only":12,"set2_only":6,"set1_set2":7,"outside":5}}'::jsonb, 2),
    (v_q09, 'C', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"French","shape":"circle"},{"id":"set2","label":"Spanish","shape":"square"}],"regions":{"set1_only":11,"set2_only":7,"set1_set2":7,"outside":5}}'::jsonb, 3),
    (v_q09, 'D', '', '{"diagramLayout":"two_overlap_staggered","sets":[{"id":"set1","label":"French","shape":"circle"},{"id":"set2","label":"Spanish","shape":"square"}],"regions":{"set1_only":10,"set2_only":8,"set1_set2":7,"outside":5}}'::jsonb, 4);

  -- Q10: Wildlife Population Ranking
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Wildlife Population Ranking', 'logic_puzzle'::dm_question_type, 'Five animals in a wildlife survey are ranked by population size from 1st (largest) to 5th (smallest): red deer, grey squirrel, badger, red fox, and otter. The following is known:
• Red deer has a larger population than grey squirrel.
• Badger is ranked 3rd.
• Red fox is not ranked 1st or 5th.
• Otter has the smallest population.
• Grey squirrel is ranked lower than badger but higher than otter.

What is the rank of the red fox?', NULL, NULL, 'B', 'Otter is ranked 5th (smallest). Badger is ranked 3rd. Grey squirrel is ranked lower than badger (3rd) but higher than otter (5th), so grey squirrel is ranked 4th. Red deer has a larger population than grey squirrel (4th), so red deer is ranked 1st or 2nd. The only remaining ranks for red deer and red fox are 1st and 2nd. Red fox cannot be 1st, so red fox is 2nd and red deer is 1st. Final order: 1st red deer, 2nd red fox, 3rd badger, 4th grey squirrel, 5th otter.', 10)
  RETURNING id INTO v_q10;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q10, 'A', '1st', NULL, 1),
    (v_q10, 'B', '2nd', NULL, 2),
    (v_q10, 'C', '3rd', NULL, 3),
    (v_q10, 'D', '4th', NULL, 4);

  -- Q11: Viral Replication
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Viral Replication', 'syllogism'::dm_question_type, 'All viruses require a host cell to replicate. Bacteria do not require a host cell to replicate. SARS-CoV-2 is a virus.', NULL, NULL, NULL, NULL, 11)
  RETURNING id INTO v_q11;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q11, 'SARS-CoV-2 requires a host cell to replicate.', 'Yes', 'SARS-CoV-2 is a virus; all viruses require a host cell to replicate — therefore SARS-CoV-2 requires a host cell.', 1),
    (v_q11, 'Bacteria are not viruses.', 'Yes', 'All viruses require a host cell; bacteria do not require one — therefore bacteria cannot be viruses.', 2),
    (v_q11, 'Some viruses can replicate without a host cell.', 'No', 'The premise states all viruses require a host cell — this applies universally. No virus can replicate without one.', 3),
    (v_q11, 'SARS-CoV-2 is not a bacterium.', 'Yes', 'SARS-CoV-2 requires a host cell; bacteria do not — therefore SARS-CoV-2 cannot be a bacterium.', 4),
    (v_q11, 'All organisms that require a host cell to replicate are viruses.', 'No', 'The premises say all viruses require a host cell, but they do not say only viruses do. Other organisms could also require a host cell — the reverse is not proven.', 5);

  -- Q12: Electric Vehicle Emissions
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Electric Vehicle Emissions', 'syllogism'::dm_question_type, 'All electric vehicles produce zero direct emissions. Some cars are electric vehicles. No steam train produces zero direct emissions.', NULL, NULL, NULL, NULL, 12)
  RETURNING id INTO v_q12;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q12, 'Some cars produce zero direct emissions.', 'Yes', 'Some cars are electric vehicles; all EVs produce zero direct emissions — therefore some cars produce zero direct emissions.', 1),
    (v_q12, 'No steam train is an electric vehicle.', 'Yes', 'Steam trains do not produce zero direct emissions; all EVs do — therefore no steam train can be an electric vehicle.', 2),
    (v_q12, 'All zero-emission vehicles are cars.', 'No', 'The premises say some cars are EVs and EVs produce zero emissions, but this doesn''t restrict zero-emission vehicles to cars only — other vehicle types could also be electric.', 3),
    (v_q12, 'Some zero-emission vehicles are cars.', 'Yes', 'Some cars are EVs and EVs produce zero direct emissions — therefore those cars are zero-emission vehicles, meaning some zero-emission vehicles are cars.', 4),
    (v_q12, 'All cars are electric vehicles.', 'No', 'The premises only state that some cars are electric vehicles — not all. You cannot conclude all cars are EVs.', 5);

  -- Q13: Marble Selection
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Marble Selection', 'probabilistic'::dm_question_type, 'A bag contains 5 red marbles, 3 blue marbles, and 2 green marbles. Two marbles are drawn one at a time without replacement. What is the probability that both marbles drawn are red?', NULL, NULL, 'C', 'P(1st red) = 5/10 = 1/2. After removing one red marble, 4 red remain from 9 total. P(2nd red | 1st red) = 4/9. P(both red) = 1/2 × 4/9 = 4/18 = 2/9. Option A (1/5) incorrectly treats the two draws as fully independent. Option B (1/4) corresponds to sampling with replacement (5/10 × 5/10 = 1/4), which does not apply here. Option D (1/2) is only the probability that the first marble is red, ignoring the second draw.', 13)
  RETURNING id INTO v_q13;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q13, 'A', '1/5', NULL, 1),
    (v_q13, 'B', '1/4', NULL, 2),
    (v_q13, 'C', '2/9', NULL, 3),
    (v_q13, 'D', '1/2', NULL, 4);

  -- Q14: Solar System Orbits
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Solar System Orbits', 'syllogism'::dm_question_type, 'All planets orbit the Sun. No moon is a planet. Some moons orbit planets.', NULL, NULL, NULL, NULL, 14)
  RETURNING id INTO v_q14;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q14, 'All planets orbit the Sun.', 'Yes', 'This is directly stated as premise one — it is a given fact in the question.', 1),
    (v_q14, 'Some planets have moons.', 'Yes', 'Some moons orbit planets (premise three); those planets therefore exist and each has at least one moon.', 2),
    (v_q14, 'All objects that orbit the Sun are planets.', 'No', 'The premises only state that planets orbit the Sun. Other objects (like comets or asteroids) may also orbit it — this cannot be excluded from the premises.', 3),
    (v_q14, 'Some objects that orbit planets are not planets themselves.', 'Yes', 'Moons orbit planets (premise three); no moon is a planet (premise two) — therefore objects that orbit planets are not themselves planets.', 4),
    (v_q14, 'All moons orbit the Sun.', 'No', 'Only some moons are stated to orbit planets, and planets orbit the Sun. We cannot conclude all moons orbit the Sun — the premises only give us some moons.', 5);

  -- Q15: Patient Appointment Scheduling
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Patient Appointment Scheduling', 'logic_puzzle'::dm_question_type, 'Five patients — Asif, Beth, Cora, Dan, and Eve — are scheduled in appointment slots 1 to 5 (slot 1 is earliest, slot 5 is latest). The following constraints apply:
• Dan is seen in slot 3.
• Cora is not seen first or last.
• Eve must be seen in the slot immediately before or immediately after Cora.
• Asif is seen before Beth.
• Beth is not seen in slot 4.
• Eve is not seen last.

Which slot is Beth seen in?', NULL, NULL, 'D', 'Dan is fixed in slot 3. Cora cannot be in slot 1 or 5, so Cora is in slot 2 or 4. Eve must be adjacent to Cora. If Cora = slot 2, Eve must be in slot 1 or 3; slot 3 is taken by Dan, so Eve = slot 1. Remaining slots 4 and 5 go to Asif and Beth; Asif must be before Beth, so Asif = 4, Beth = 5; Beth ≠ slot 4 is satisfied. If Cora = slot 4, Eve must be in slot 3 or 5; slot 3 is Dan, so Eve = slot 5 — but Eve cannot be last, eliminating this case. The only valid solution is Beth in slot 5.', 15)
  RETURNING id INTO v_q15;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q15, 'A', 'Slot 2', NULL, 1),
    (v_q15, 'B', 'Slot 3', NULL, 2),
    (v_q15, 'C', 'Slot 4', NULL, 3),
    (v_q15, 'D', 'Slot 5', NULL, 4);

  -- Q16: School Vending Machine Policy
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'School Vending Machine Policy', 'strongest_argument'::dm_question_type, 'Sugar-sweetened beverages should be banned from all school vending machines.', NULL, NULL, 'A', 'Option A is the strongest argument: it identifies a specific, evidence-grounded harm (elevated risk of obesity and type 2 diabetes) and directly invokes the school''s duty of care, which is central to the proposition. Option B raises the displacement concern that students can buy drinks outside school, but this does not negate the school''s responsibility to model a healthy environment and does not outweigh A. Option C overstates and distorts evidence by claiming sugary drinks are the primary cause of all childhood obesity, making it factually weak and therefore a poor argument. Option D is irrelevant to student health; economic impact on the vending industry is not a compelling reason to retain access to harmful products in schools.', 16)
  RETURNING id INTO v_q16;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q16, 'A', 'Yes; children who consume high amounts of added sugar face significantly greater risk of obesity and type 2 diabetes, and schools have a duty of care to promote student health.', NULL, 1),
    (v_q16, 'B', 'No; students can purchase sugary drinks outside school, so a ban within school premises would have no meaningful impact.', NULL, 2),
    (v_q16, 'C', 'Yes; sugary drinks are the primary cause of all childhood obesity.', NULL, 3),
    (v_q16, 'D', 'No; banning drinks from vending machines would harm the vending machine industry.', NULL, 4);

  -- Q17: Rainforest Carnivores
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Rainforest Carnivores', 'syllogism'::dm_question_type, 'All carnivores eat meat. No herbivore eats meat. Some animals in the rainforest are carnivores.', NULL, NULL, NULL, NULL, 17)
  RETURNING id INTO v_q17;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q17, 'Some animals in the rainforest eat meat.', 'Yes', 'Some rainforest animals are carnivores; all carnivores eat meat — therefore some rainforest animals eat meat.', 1),
    (v_q17, 'No herbivore is a carnivore.', 'Yes', 'No herbivore eats meat; all carnivores do — therefore no herbivore can be a carnivore.', 2),
    (v_q17, 'All animals that eat meat are carnivores.', 'No', 'The premises establish that carnivores eat meat, but do not state that only carnivores eat meat. Omnivores also eat meat — the reverse is not proven.', 3),
    (v_q17, 'Some rainforest animals are not herbivores.', 'Yes', 'Some rainforest animals are carnivores; no herbivore is a carnivore — therefore those carnivores are not herbivores, meaning some rainforest animals are not herbivores.', 4),
    (v_q17, 'All rainforest animals eat meat.', 'No', 'Only some rainforest animals are stated to be carnivores — the premises do not say all rainforest animals eat meat.', 5);

  -- Q18: Science Subject Students
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Science Subject Students', 'venn_diagram'::dm_question_type, 'The diagram below categorises sixth-form students by the science subjects they study. Physics and Chemistry overlap; Biology is completely separate from both. Each letter marks a different region.

Which letter represents a student who studies Chemistry but not Physics or Biology?', NULL, '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Physics","shape":"circle"},{"id":"set2","label":"Chemistry","shape":"diamond"},{"id":"set3","label":"Biology","shape":"rectangle"}],"regions":{"set1_only":"P","set1_set2":"Q","set2_only":"R","set3_only":"S"}}'::jsonb, 'C', 'Chemistry is represented by the diamond shape. A student who studies Chemistry but not Physics or Biology must be inside the Chemistry diamond only, with no overlap with any other shape. That region is labelled R, so the answer is C.

Region P is Physics only — inside the circle but not overlapping with Chemistry or Biology. Region Q is the overlap between Physics and Chemistry — students studying both. Region S is Biology only, in the separate rectangle which does not overlap with either Physics or Chemistry.', 18)
  RETURNING id INTO v_q18;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q18, 'A', 'Letter P', NULL, 1),
    (v_q18, 'B', 'Letter Q', NULL, 2),
    (v_q18, 'C', 'Letter R', NULL, 3),
    (v_q18, 'D', 'Letter S', NULL, 4);

  -- Q19: Online Retail Sales
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Online Retail Sales', 'interpreting_info'::dm_question_type, 'The table below shows sales data for five products sold by an online retailer in January and February.', '{"headers":["Product","Jan Units Sold","Feb Units Sold","Return Rate (%)","Avg Price (£)"],"rows":[["Headphones","342","298","8.2","45.99"],["Laptop Stand","156","187","2.1","29.99"],["Phone Case","891","924","1.4","8.99"],["USB Hub","234","219","3.8","19.99"],["Webcam","178","203","5.6","67.49"]]}'::jsonb, NULL, NULL, NULL, 19)
  RETURNING id INTO v_q19;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q19, 'Phone cases had more units sold in February than any other product.', 'Yes', 'Phone Case February = 924 units — the highest February figure across all five products.', 1),
    (v_q19, 'The webcam has the highest average price.', 'Yes', 'Webcam average price = £67.49 — the highest of all five products listed.', 2),
    (v_q19, 'Sales of the laptop stand increased by more than 20% from January to February.', 'No', 'Laptop Stand increase = (187−156)/156 × 100 ≈ 19.9%. This is just under 20%, not more than 20%.', 3),
    (v_q19, 'The USB hub had a higher return rate than the laptop stand.', 'Yes', 'USB Hub return rate = 3.8%; Laptop Stand = 2.1%. 3.8 > 2.1.', 4),
    (v_q19, 'Total units sold across all products was higher in February than in January.', 'Yes', 'January total = 342+156+891+234+178 = 1,801. February total = 298+187+924+219+203 = 1,831. February was higher.', 5);

  -- Q20: Engineers and Artists
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Engineers and Artists', 'syllogism'::dm_question_type, 'All engineers study mathematics. Some engineers specialise in structural design. No artist studies mathematics.', NULL, NULL, NULL, NULL, 20)
  RETURNING id INTO v_q20;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q20, 'All structural design specialists study mathematics.', 'Yes', 'Structural design specialists are engineers (stated in the premises), and all engineers study mathematics — so all structural design specialists must study mathematics.', 1),
    (v_q20, 'No artist is an engineer.', 'Yes', 'All engineers study mathematics; no artist studies mathematics; therefore no artist can be an engineer.', 2),
    (v_q20, 'Some people who study mathematics are engineers.', 'Yes', 'All engineers study mathematics, and engineers exist — so at least some mathematics students are engineers.', 3),
    (v_q20, 'All people who study mathematics are engineers.', 'No', 'The premises do not state that only engineers study mathematics — other people could also study it. You can only conclude some maths students are engineers, not all.', 4),
    (v_q20, 'Some engineers do not specialise in structural design.', 'No', 'This does not follow — though it is a very easy trap to fall into. In everyday speech, saying ''some engineers specialise in structural design'' naturally implies that others don''t. But in UCAT syllogisms, ''some'' has a strict logical meaning: at least one. It says nothing about the rest. The premise is entirely consistent with every single engineer specialising in structural design. Because we cannot rule that out, we cannot conclude that some do not.', 5);

  -- Q21: Athletic Activities
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Athletic Activities', 'venn_diagram'::dm_question_type, 'The diagram below categorises athletes by the sports they participate in. Each letter marks a different region of the diagram.

Which letter represents an athlete who swims but does not run?', NULL, '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Swimming","shape":"pentagon"},{"id":"set2","label":"Running","shape":"diamond"}],"regions":{"outside":"P","set1_only":"Q","set1_set2":"R","set2_only":"S"}}'::jsonb, 'A', 'The pentagon represents Swimming and the diamond represents Running.

Region Q is inside the Swimming pentagon but outside the Running diamond — this is where athletes who swim but do not run belong. That matches the question, so the answer is A.

Region R is the overlap between both shapes — athletes who both swim and run. Region S is inside Running only — runners who do not swim. Region P is outside both shapes entirely — athletes who do neither.', 21)
  RETURNING id INTO v_q21;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q21, 'A', 'Letter Q', NULL, 1),
    (v_q21, 'B', 'Letter R', NULL, 2),
    (v_q21, 'C', 'Letter S', NULL, 3),
    (v_q21, 'D', 'Letter P', NULL, 4);

  -- Q22: Foreign Language Requirements
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Foreign Language Requirements', 'strongest_argument'::dm_question_type, 'All university students should be required to study a foreign language as part of their degree.', NULL, NULL, 'A', 'Option A is the strongest argument: it is specific, directly relevant to the proposition, and cites a concrete practical benefit — improved graduate employability in a global economy. This directly supports the policy''s purpose. Option B is weak — the absence of an immediate subject-specific need is not a compelling reason to exclude all students, especially given broader career benefits. Option C is factually incorrect; compulsory study abroad is not universal across all degree programmes. Option D is paternalistic and vague — asserting that language learning is too difficult for some students is not a strong policy argument.', 22)
  RETURNING id INTO v_q22;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q22, 'A', 'Yes; communicating in a second language directly improves graduate employability in an increasingly global job market.', NULL, 1),
    (v_q22, 'B', 'No; many degree subjects have no direct practical need for foreign language skills.', NULL, 2),
    (v_q22, 'C', 'Yes; studying abroad is already compulsory for all university degree programmes.', NULL, 3),
    (v_q22, 'D', 'No; language learning is too difficult for students who did not study a language at school.', NULL, 4);

  -- Q23: Mammal Classification
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Mammal Classification', 'syllogism'::dm_question_type, 'All mammals are warm-blooded. All dolphins are mammals. No reptile is warm-blooded.', NULL, NULL, NULL, NULL, 23)
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q23, 'All dolphins are warm-blooded.', 'Yes', 'Dolphins are mammals and all mammals are warm-blooded, so all dolphins must be warm-blooded.', 1),
    (v_q23, 'Some reptiles are mammals.', 'No', 'All mammals are warm-blooded; no reptile is warm-blooded; therefore no reptile can be a mammal — the conclusion that some reptiles are mammals is false.', 2),
    (v_q23, 'Dolphins are not reptiles.', 'Yes', 'Dolphins are warm-blooded; no reptile is warm-blooded; therefore dolphins cannot be reptiles.', 3),
    (v_q23, 'All warm-blooded animals are dolphins.', 'No', 'The premises state all mammals are warm-blooded but do not restrict warm-bloodedness to dolphins alone — other mammals also qualify.', 4),
    (v_q23, 'No mammal is a reptile.', 'Yes', 'All mammals are warm-blooded; no reptile is warm-blooded; therefore no mammal can be a reptile.', 5);

  -- Q24: Pet Ownership Survey
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Pet Ownership Survey', 'venn_diagram'::dm_question_type, 'A survey of 40 pet owners found that 18 own dogs only, 15 own cats only, and 7 own neither dogs nor cats. No owner in the survey owns both a dog and a cat.

Which of the following diagrams correctly represents this data?', NULL, NULL, 'C', 'The question states no owner has both a dog and a cat, so the two shapes must be completely separate with no overlap region at all.

Dogs = 18, Cats = 15, neither = 7. Total = 18 + 15 + 7 = 40 ✓.

Option C is correct — both shapes are separate, with 18 in Dogs, 15 in Cats, and 7 outside. Option A has an incorrect Cats count of 14 and an outside value of 8. Option B reduces Dogs to 17 and increases outside to 8. Option D inflates Dogs to 19 and reduces outside to 6.', 24)
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', '', '{"diagramLayout":"two_separate","sets":[{"id":"set1","label":"Dogs","shape":"pentagon"},{"id":"set2","label":"Cats","shape":"circle"}],"regions":{"set1_only":18,"set2_only":14,"outside":8}}'::jsonb, 1),
    (v_q24, 'B', '', '{"diagramLayout":"two_separate_staggered","sets":[{"id":"set1","label":"Dogs","shape":"pentagon"},{"id":"set2","label":"Cats","shape":"circle"}],"regions":{"set1_only":17,"set2_only":15,"outside":8}}'::jsonb, 2),
    (v_q24, 'C', '', '{"diagramLayout":"two_separate","sets":[{"id":"set1","label":"Dogs","shape":"pentagon"},{"id":"set2","label":"Cats","shape":"circle"}],"regions":{"set1_only":18,"set2_only":15,"outside":7}}'::jsonb, 3),
    (v_q24, 'D', '', '{"diagramLayout":"two_separate","sets":[{"id":"set1","label":"Dogs","shape":"pentagon"},{"id":"set2","label":"Cats","shape":"circle"}],"regions":{"set1_only":19,"set2_only":15,"outside":6}}'::jsonb, 4);

  -- Q25: Employee Training Review
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Employee Training Review', 'interpreting_info'::dm_question_type, 'The table below shows training and retention data for five departments at a company.', '{"headers":["Department","Employees","Avg Training Days","Pass Rate (%)","Turnover (%)"],"rows":[["Sales","45","3.2","78","22"],["HR","12","4.1","85","15"],["Finance","28","5.0","92","8"],["IT","34","4.8","88","11"],["Operations","67","2.9","71","28"]]}'::jsonb, NULL, NULL, NULL, 25)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q25, 'Finance has both the highest pass rate and the highest average training days.', 'Yes', 'Finance has the highest pass rate (92%) and the highest average training days (5.0) — both apply to Finance.', 1),
    (v_q25, 'The department with the most employees also has the lowest average training days.', 'Yes', 'Operations has the most employees (67) and also the lowest average training days (2.9) — both apply to the same department.', 2),
    (v_q25, 'HR has a lower employee turnover rate than IT.', 'No', 'HR turnover = 15%; IT turnover = 11%. HR actually has a higher turnover rate than IT, not lower.', 3),
    (v_q25, 'The total number of employees in Sales, HR, and Finance is less than the combined total of IT and Operations.', 'Yes', 'Sales+HR+Finance = 45+12+28 = 85. IT+Operations = 34+67 = 101. 85 < 101, so the statement is correct.', 4),
    (v_q25, 'The pass rate in Sales is more than 10 percentage points below the pass rate in IT.', 'No', 'Sales pass rate = 78%; IT = 88%. The difference is exactly 10 percentage points — not more than 10.', 5);

  -- Q26: Monthly Weather Records
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Monthly Weather Records', 'interpreting_info'::dm_question_type, 'The table below shows weather data recorded at a UK weather station across five months of the year.', '{"headers":["Month","Avg Temp (°C)","Rainfall (mm)","Sunshine Hours","Frost Days"],"rows":[["January","4","68","62","12"],["March","7","52","108","5"],["June","18","45","195","0"],["September","15","58","155","0"],["December","5","72","52","10"]]}'::jsonb, NULL, NULL, NULL, 26)
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q26, 'June had the most sunshine hours of the five months shown.', 'Yes', 'June recorded 195 sunshine hours — the highest of all five months in the table.', 1),
    (v_q26, 'December had a higher average temperature than January.', 'Yes', 'December average = 5°C; January = 4°C. December is warmer by 1°C.', 2),
    (v_q26, 'The month with the highest rainfall also had the fewest sunshine hours.', 'Yes', 'December has the highest rainfall (72mm) and also the fewest sunshine hours (52). Both extremes belong to the same month.', 3),
    (v_q26, 'The total rainfall across the five months shown exceeded 300mm.', 'No', 'Total rainfall = 68+52+45+58+72 = 295mm. This is less than 300mm, not more.', 4),
    (v_q26, 'January had more frost days than all other months combined.', 'No', 'January has 12 frost days. The other four months combined = 5+0+0+10 = 15 frost days. January does not exceed the combined total.', 5);

  -- Q27: Hospital Ward Assignments
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Hospital Ward Assignments', 'logic_puzzle'::dm_question_type, 'Four nurses — Alice, Ben, Carlos, and Diana — are each assigned to one of four wards for a night shift: Cardiac, Geriatric, Paediatric, and Surgical. Each nurse covers exactly one ward. The following is known:
• Alice is not assigned to Paediatric or Surgical.
• Ben is assigned to Cardiac.
• Carlos is not assigned to Geriatric.
• Diana is not assigned to Cardiac.

Which ward is Alice assigned to?', NULL, NULL, 'B', 'Ben is assigned to Cardiac, so that ward is taken. Alice cannot be assigned to Paediatric or Surgical, and Cardiac is already taken by Ben — therefore Alice must be assigned to Geriatric. Carlos cannot be assigned to Geriatric (now taken by Alice), so Carlos covers Paediatric or Surgical. Diana cannot be assigned to Cardiac (taken by Ben), so Diana takes whichever of Paediatric or Surgical Carlos does not. Alice is assigned to the Geriatric ward.', 27)
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', 'Cardiac', NULL, 1),
    (v_q27, 'B', 'Geriatric', NULL, 2),
    (v_q27, 'C', 'Paediatric', NULL, 3),
    (v_q27, 'D', 'Surgical', NULL, 4);

  -- Q28: Renewable Energy Capacity
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Renewable Energy Capacity', 'interpreting_info'::dm_question_type, 'The table below shows renewable energy capacity (in gigawatts) for five fictional countries.', '{"headers":["Country","Solar (GW)","Wind (GW)","Hydro (GW)","Total Renewable (GW)"],"rows":[["Alvoria","12.4","8.3","3.1","23.8"],["Brendal","5.2","15.6","7.4","28.2"],["Corveth","18.7","4.1","0.8","23.6"],["Drestan","3.6","22.4","9.2","35.2"],["Elwick","9.1","11.8","5.5","26.4"]]}'::jsonb, NULL, NULL, NULL, 28)
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q28, 'Drestan has the highest total renewable energy capacity.', 'Yes', 'Drestan''s total is 35.2 GW — the highest of all five countries in the table.', 1),
    (v_q28, 'Corveth generates more from solar than from wind and hydro combined.', 'Yes', 'Corveth solar = 18.7 GW. Wind + hydro = 4.1+0.8 = 4.9 GW. 18.7 > 4.9, so solar exceeds the combined total.', 2),
    (v_q28, 'Brendal''s wind capacity is more than three times its solar capacity.', 'No', 'Brendal solar = 5.2 GW. Three times that = 3 × 5.2 = 15.6 GW, which exactly equals Brendal''s wind capacity (15.6 GW) — it is not more than three times.', 3),
    (v_q28, 'The country with the highest solar capacity has the second-lowest total renewable capacity.', 'No', 'Corveth has the highest solar (18.7 GW) and the lowest total (23.6 GW), not the second-lowest.', 4),
    (v_q28, 'The combined solar capacity of Alvoria and Elwick exceeds that of Corveth.', 'Yes', 'Alvoria + Elwick solar = 12.4+9.1 = 21.5 GW. Corveth solar = 18.7 GW. 21.5 > 18.7.', 5);

  -- Q29: Medical Placement Requirements
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Medical Placement Requirements', 'strongest_argument'::dm_question_type, 'Medical students should be required to complete six months of clinical work in a rural or deprived area before they can qualify as a doctor.', NULL, NULL, 'A', 'Option A is the strongest argument: it identifies two specific, concrete educational benefits — clinical resilience and a breadth of diagnostic experience — that are directly relevant to the purpose of the requirement and cannot easily be replicated in well-resourced urban hospitals. This directly justifies the proposal. Option B acknowledges a real cost (delayed graduation) but does not engage with the educational value of the training itself, making it a weaker counterargument. Option C is a vague assertion of professional obligation rather than a substantive argument for this specific policy. Option D refers to individual personal circumstances which, while genuine, is a weak policy-level argument that does not address the broader educational rationale.', 29)
  RETURNING id INTO v_q29;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q29, 'A', 'Yes; exposure to under-resourced settings builds clinical resilience and broadens diagnostic experience in ways that well-equipped city hospitals cannot replicate.', NULL, 1),
    (v_q29, 'B', 'No; rural placements would delay graduation for all students regardless of their intended specialty.', NULL, 2),
    (v_q29, 'C', 'Yes; doctors should always be willing to work wherever they are needed.', NULL, 3),
    (v_q29, 'D', 'No; some students have family commitments that make six-month placements away from home impractical.', NULL, 4);

  -- Q30: City Population Statistics
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'City Population Statistics', 'interpreting_info'::dm_question_type, 'The table below shows population and area data for five cities in 2020 and 2023. Density figures are based on 2023 population.', '{"headers":["City","2020 Pop (000s)","2023 Pop (000s)","Area (km²)","Density (per km²)"],"rows":[["Ashford","74","78","22","3545"],["Barton","123","119","35","3400"],["Caldwell","56","61","18","3389"],["Dunmore","210","216","65","3323"],["Elston","88","92","28","3286"]]}'::jsonb, NULL, NULL, NULL, 30)
  RETURNING id INTO v_q30;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q30, 'Barton''s population decreased between 2020 and 2023.', 'Yes', 'Barton''s population fell from 123,000 in 2020 to 119,000 in 2023 — a decrease of 4,000.', 1),
    (v_q30, 'Caldwell has the highest population density in 2023.', 'No', 'Ashford has the highest density at 3,545 per km². Caldwell is 3,389 per km² — not the highest.', 2),
    (v_q30, 'Dunmore had the largest absolute population increase between 2020 and 2023.', 'Yes', 'Dunmore grew by 6,000 (210,000 → 216,000), which is the largest absolute increase among all five cities.', 3),
    (v_q30, 'The combined 2023 population of Ashford and Elston exceeds that of Barton and Caldwell combined.', 'No', 'Ashford + Elston = 78+92 = 170,000. Barton + Caldwell = 119+61 = 180,000. The Ashford/Elston total is lower, not higher.', 4),
    (v_q30, 'Elston has the lowest population density in 2023.', 'Yes', 'Elston''s density is 3,286 per km² — the lowest of all five cities in the table.', 5);

  -- Q31: Volunteer Team Selection
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Volunteer Team Selection', 'logic_puzzle'::dm_question_type, 'A charity is selecting a team of exactly 4 volunteers from seven candidates: A, B, C, D, E, F, and G. The following rules apply:
• A and B cannot both be selected.
• If C is selected, D must also be selected.
• E must be selected.
• At least one of F or G must be selected.
• B must be selected if A is not.

Which of the following is a valid team?', NULL, NULL, 'B', 'Option A {E, A, C, D}: A is selected and E is present, C→D holds — but neither F nor G is included, violating rule 4. Option B {E, B, F, G}: A is absent so B must be selected (rule 5 satisfied); A and B are not both selected (rule 1 satisfied); C is absent so rule 2 is not triggered; E is present (rule 3); both F and G are present satisfying rule 4. All rules pass — this is the valid team. Option C {E, A, B, D}: A and B are both selected, violating rule 1. Option D {E, C, F, A}: C is selected but D is not, violating rule 2.', 31)
  RETURNING id INTO v_q31;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q31, 'A', 'E, A, C, D', NULL, 1),
    (v_q31, 'B', 'E, B, F, G', NULL, 2),
    (v_q31, 'C', 'E, A, B, D', NULL, 3),
    (v_q31, 'D', 'E, C, F, A', NULL, 4);

  -- Q32: GP Minimum Appointment Time
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'GP Minimum Appointment Time', 'strongest_argument'::dm_question_type, 'GPs should be required by law to spend a minimum of 15 minutes with each patient.', NULL, NULL, 'B', 'Option B is the strongest argument: it directly challenges the proposition by identifying a concrete negative consequence — a mandatory minimum would reduce the total number of appointments available each day, preventing patients from accessing care. This is a measurable policy-relevant trade-off that directly addresses the impact of the proposed law. Option A raises valid concerns about rushed consultations but does not constitute a strong argument for a blanket 15-minute minimum when some consultations genuinely require less time. Option C is a vague aspiration rather than a reasoned argument. Option D notes that waiting times are already long but does not logically connect this to the specific proposal being evaluated.', 32)
  RETURNING id INTO v_q32;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q32, 'A', 'Yes; many patients have complex needs that cannot be addressed in shorter appointments, and rushed consultations increase the risk of diagnostic error.', NULL, 1),
    (v_q32, 'B', 'No; some consultations require only a few minutes, and a mandatory minimum would significantly reduce the number of patients seen each day, denying access to care.', NULL, 2),
    (v_q32, 'C', 'Yes; doctors should always spend as much time as possible with every patient.', NULL, 3),
    (v_q32, 'D', 'No; waiting times in the NHS are already too long.', NULL, 4);

  -- Q33: Olympic Swimmers
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Olympic Swimmers', 'syllogism'::dm_question_type, 'All Olympic athletes train for at least four hours a day. Some swimmers are Olympic athletes. No recreational swimmer trains for four hours a day.', NULL, NULL, NULL, NULL, 33)
  RETURNING id INTO v_q33;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q33, 'Some swimmers train for at least four hours a day.', 'Yes', 'Some swimmers are Olympic athletes, and Olympic athletes must train at least four hours a day — so those swimmers do train that much.', 1),
    (v_q33, 'All recreational swimmers are Olympic athletes.', 'No', 'Recreational swimmers do not train four hours a day; Olympic athletes must — therefore no recreational swimmer can be an Olympic athlete. The statement claims all are, which is false.', 2),
    (v_q33, 'No recreational swimmer is an Olympic athlete.', 'Yes', 'Recreational swimmers do not train four hours a day; Olympic athletes must train at least four hours; therefore no recreational swimmer can be an Olympic athlete.', 3),
    (v_q33, 'Some Olympic athletes are not swimmers.', 'No', 'We only know some swimmers are Olympic athletes. We cannot conclude that some Olympic athletes are not swimmers — it is possible that all Olympic athletes are swimmers.', 4),
    (v_q33, 'Some swimmers are not recreational swimmers.', 'Yes', 'The swimmers who are Olympic athletes train 4+ hours a day; no recreational swimmer does — so those Olympic swimmers are definitively not recreational swimmers, meaning some swimmers are not recreational.', 5);

  -- Q34: Playing Card Probability
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Playing Card Probability', 'probabilistic'::dm_question_type, 'A single card is drawn at random from a standard shuffled deck of 52 cards. What is the probability that the card drawn is either a heart or a king?', NULL, NULL, 'B', 'P(heart) = 13/52. P(king) = 4/52. P(heart AND king) = 1/52 (the king of hearts). By the addition rule: P(heart OR king) = 13/52 + 4/52 − 1/52 = 16/52 = 4/13. Option A (3/13 = 12/52) undercounts by one card. Option C (5/13 = 20/52) overcounts. Option D (1/4 = 13/52) only accounts for the 13 hearts without adding the three remaining kings.', 34)
  RETURNING id INTO v_q34;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q34, 'A', '3/13', NULL, 1),
    (v_q34, 'B', '4/13', NULL, 2),
    (v_q34, 'C', '5/13', NULL, 3),
    (v_q34, 'D', '1/4', NULL, 4);

  -- Q35: Drug Side Effect Probability
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Drug Side Effect Probability', 'probabilistic'::dm_question_type, 'In a clinical study, 60% of patients respond to Drug X. Among patients who respond, there is a 30% chance of experiencing a particular side effect. Among patients who do not respond, there is a 10% chance of the same side effect. What is the probability that a randomly selected patient from the study experiences the side effect?', NULL, NULL, 'C', 'P(side effect) = P(responds) × P(SE | responds) + P(no response) × P(SE | no response) = (0.60 × 0.30) + (0.40 × 0.10) = 0.18 + 0.04 = 0.22 = 22%. Option A (18%) only accounts for the side effect rate among responders, ignoring non-responders entirely. Option B (20%) is an unweighted average of 30% and 10%, failing to account for the different proportions of responders and non-responders. Option D (30%) is solely the side effect rate among responders, not the overall probability.', 35)
  RETURNING id INTO v_q35;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q35, 'A', '18%', NULL, 1),
    (v_q35, 'B', '20%', NULL, 2),
    (v_q35, 'C', '22%', NULL, 3),
    (v_q35, 'D', '30%', NULL, 4);

END $$;
