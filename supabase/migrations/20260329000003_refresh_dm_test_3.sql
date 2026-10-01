-- Refresh: Timed DM Test 3 (test_id = 3)
-- Replaces all 35 questions

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

  DELETE FROM timed_decision_making_questions WHERE test_id = 3;

  -- Q01: Comets and Celestial Bodies
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Comets and Celestial Bodies', 'syllogism'::dm_question_type, 'All comets have visible tails. Some celestial bodies that orbit the Sun are comets. No asteroid has a visible tail.', NULL, NULL, NULL, NULL, 1)
  RETURNING id INTO v_q01;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q01, 'Some celestial bodies orbiting the Sun have visible tails.', 'Yes', 'Some celestial bodies that orbit the Sun are comets, and all comets have visible tails. Therefore some Sun-orbiting celestial bodies have visible tails.', 1),
    (v_q01, 'No asteroid is a comet.', 'Yes', 'All comets have visible tails, and no asteroid has a visible tail. If an asteroid were a comet it would need a visible tail, which contradicts the premise. So no asteroid can be a comet.', 2),
    (v_q01, 'All things with visible tails are comets.', 'No', 'All comets have visible tails, but the reverse is not established. Other objects (e.g. meteors) could also have visible tails.', 3),
    (v_q01, 'Some asteroids orbit the Sun.', 'No', 'The premises say nothing about whether asteroids orbit the Sun. This cannot be concluded.', 4),
    (v_q01, 'All comets are non-asteroids.', 'Yes', 'Since no asteroid is a comet (established above), it follows that every comet is a non-asteroid. This is simply the contrapositive.', 5);

  -- Q02: Farm Crop Yields
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Farm Crop Yields', 'interpreting_info'::dm_question_type, 'A farm recorded the yield (in tonnes per hectare) of four crops over four years.', '{"headers":["Crop","2022 (t/ha)","2023 (t/ha)","2024 (t/ha)","2025 (t/ha)"],"rows":[["Wheat","8.2","7.8","8.5","8.0"],["Barley","6.5","6.8","7.0","6.6"],["Oilseed Rape","3.4","3.2","3.6","3.8"],["Oats","5.8","6.0","5.5","6.2"]]}'::jsonb, NULL, NULL, NULL, 2)
  RETURNING id INTO v_q02;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q02, 'Wheat had the highest yield every year.', 'Yes', 'Wheat: 8.2, 7.8, 8.5, 8.0. In every year these are the highest values compared to Barley, Oilseed Rape and Oats.', 1),
    (v_q02, 'Oilseed Rape yield increased every year.', 'No', 'Oilseed Rape: 3.4 → 3.2 → 3.6 → 3.8. It decreased from 2022 to 2023 (3.4 to 3.2), so it did not increase every year.', 2),
    (v_q02, 'Barley yield peaked in 2024.', 'Yes', 'Barley: 6.5, 6.8, 7.0, 6.6. The highest value is 7.0 in 2024.', 3),
    (v_q02, 'Oats yield exceeded 6.0 in every year.', 'No', 'Oats in 2024 was 5.5, which is below 6.0.', 4),
    (v_q02, 'Total yield across all crops was lowest in 2023.', 'Yes', '2022: 8.2+6.5+3.4+5.8 = 23.9. 2023: 7.8+6.8+3.2+6.0 = 23.8. 2024: 8.5+7.0+3.6+5.5 = 24.6. 2025: 8.0+6.6+3.8+6.2 = 24.6. 2023 total (23.8) is the lowest.', 5);

  -- Q03: Banning Single-Use Vapes
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Banning Single-Use Vapes', 'strongest_argument'::dm_question_type, 'Single-use disposable vapes should be banned.', NULL, NULL, 'A', 'Option A is the strongest argument because it provides specific environmental evidence — lithium batteries, non-recyclable plastic, and a quantified figure of 5 tonnes of lithium waste — directly supporting the case for a ban. Option B raises a valid health trade-off but does not address the environmental harm. Option C makes a reasonable point about youth addiction but lacks the concrete evidence of A. Option D is a weak economic argument that does not address the core issue.', 3)
  RETURNING id INTO v_q03;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q03, 'A', 'Yes; disposable vapes contain lithium batteries and plastic that cannot be recycled, contributing an estimated 5 tonnes of lithium waste to UK landfill each year.', NULL, 1),
    (v_q03, 'B', 'No; banning vapes would push users back to conventional cigarettes, which cause significantly more harm to health.', NULL, 2),
    (v_q03, 'C', 'Yes; vapes are popular among teenagers and banning disposable ones would reduce youth nicotine addiction.', NULL, 3),
    (v_q03, 'D', 'No; the vaping industry provides significant tax revenue and employment that would be lost.', NULL, 4);

  -- Q04: Railway Platform Assignment
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Railway Platform Assignment', 'logic_puzzle'::dm_question_type, E'Five trains – Aberdeen, Bristol, Cardiff, Dover, and Edinburgh – depart from platforms 1 to 5.\n\n• Bristol is on platform 3.\n• Edinburgh is not on platform 1 or 5.\n• Dover departs from the platform immediately after Edinburgh.\n• Aberdeen is on a lower-numbered platform than Cardiff.', NULL, NULL, 'B', 'Bristol = platform 3. Edinburgh is not on 1 or 5. Dover is immediately after Edinburgh. If Edinburgh = 2, Dover = 3 — but Bristol is on 3, conflict. If Edinburgh = 4, Dover = 5. Remaining platforms 1 and 2 for Aberdeen and Cardiff. Aberdeen < Cardiff, so Aberdeen = 1, Cardiff = 2. Cardiff is on platform 2.', 4)
  RETURNING id INTO v_q04;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q04, 'A', 'Platform 1', NULL, 1),
    (v_q04, 'B', 'Platform 2', NULL, 2),
    (v_q04, 'C', 'Platform 4', NULL, 3),
    (v_q04, 'D', 'Platform 5', NULL, 4);

  -- Q05: UK Teacher Recruitment Crisis
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'UK Teacher Recruitment Crisis', 'syllogism'::dm_question_type, E'The Department for Education reported that secondary schools in England recruited only 83% of the teachers they needed in 2023–24, the fourth consecutive year of missing targets. The shortage was most acute in physics, where only 17% of the target number of trainees was recruited, and in mathematics at 69%. Starting salaries for teachers were £30,000, rising to £36,745 in London. The government introduced bursaries of up to £27,000 for trainee teachers in shortage subjects. A survey by the NASUWT teaching union found that 47% of teachers had considered leaving the profession in the past year, citing workload as the primary concern. The average teacher worked 54 hours per week, compared to the national average of 37 hours. Teach First, the graduate training programme, reported a 25% decline in applications since 2019.', NULL, NULL, NULL, NULL, 5)
  RETURNING id INTO v_q05;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q05, 'Secondary schools recruited more than 90% of the teachers they needed.', 'No', 'The passage states schools recruited only 83% of the teachers needed, which is below 90%.', 1),
    (v_q05, 'Physics teacher recruitment met less than a quarter of its target.', 'Yes', 'Only 17% of the target was recruited for physics. 17% is less than 25% (a quarter).', 2),
    (v_q05, 'Starting salary for London teachers was more than £35,000.', 'Yes', 'Starting salaries rose to £36,745 in London, which exceeds £35,000.', 3),
    (v_q05, 'More than half of teachers had considered leaving the profession.', 'No', 'The survey found 47% had considered leaving. 47% is less than 50% (half).', 4),
    (v_q05, 'Average teacher working hours exceeded the national average.', 'Yes', 'Teachers worked an average of 54 hours per week compared to the national average of 37 hours.', 5);

  -- Q06: Accounting Certification (Venn INTERPRET, two_nested)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Accounting Certification', 'venn_diagram'::dm_question_type, E'The diagram shows accountants categorised by qualification level. The trapezoid represents all Qualified Accountants and the diamond (inside the trapezoid) represents Chartered Accountants. Every Chartered Accountant is also a Qualified Accountant. Each letter marks a different region.\n\nWhich letter represents a Qualified Accountant who is not Chartered?', NULL, '{"diagramLayout":"two_nested","sets":[{"id":"set1","label":"Qualified Accountants","shape":"trapezoid"},{"id":"set2","label":"Chartered Accountants","shape":"diamond"}],"regions":{"set1_only":"W","set1_set2":"X","outside":"Y"}}'::jsonb, 'A', 'The trapezoid is Qualified Accountants (set1) and the diamond inside is Chartered Accountants (set2). Inside the trapezoid but outside the diamond is set1_only = W — Qualified but not Chartered. X (set1_set2) is both Qualified and Chartered. Y (outside) is neither.', 6)
  RETURNING id INTO v_q06;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q06, 'A', 'Letter W', NULL, 1),
    (v_q06, 'B', 'Letter X', NULL, 2),
    (v_q06, 'C', 'Letter Y', NULL, 3),
    (v_q06, 'D', 'Letters W and X', NULL, 4);

  -- Q07: Fire Alarm Testing
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Fire Alarm Testing', 'probabilistic'::dm_question_type, 'A building has 800 rooms. 3% of rooms have a fire hazard. The alarm system detects 95% of actual hazards. The false alarm rate on safe rooms is 6%.', NULL, NULL, 'C', 'Hazard rooms: 800 × 0.03 = 24. Detected hazards: 24 × 0.95 = 22.8. Safe rooms: 776. False alarms: 776 × 0.06 = 46.56. Total triggers: 22.8 + 46.56 = 69.36. A: fewer than 60 triggers — 69.36 > 60, so A is wrong. B: triggered alarm > 50% chance of real hazard — 22.8/69.36 ≈ 32.9%, so B is wrong. C: fewer than 3 hazards go undetected — 24 − 22.8 = 1.2, which is fewer than 3, so C is correct. D: more than 50 false alarms — 46.56 < 50, so D is wrong.', 7)
  RETURNING id INTO v_q07;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q07, 'A', 'The alarm triggers in fewer than 60 rooms in total.', NULL, 1),
    (v_q07, 'B', 'A triggered alarm has a greater than 50% chance of indicating a real hazard.', NULL, 2),
    (v_q07, 'C', 'Fewer than 3 actual hazards go undetected by the alarm.', NULL, 3),
    (v_q07, 'D', 'More than 50 safe rooms experience a false alarm.', NULL, 4);

  -- Q08: Bridges and Engineering
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Bridges and Engineering', 'syllogism'::dm_question_type, 'All suspension bridges use cables. No rigid bridge uses cables. Some bridges are pedestrian-only.', NULL, NULL, NULL, NULL, 8)
  RETURNING id INTO v_q08;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q08, 'No suspension bridge is a rigid bridge.', 'Yes', 'Suspension bridges use cables, and no rigid bridge uses cables. A bridge cannot both use and not use cables, so no suspension bridge is rigid.', 1),
    (v_q08, 'Some pedestrian bridges use cables.', 'No', 'Some bridges are pedestrian-only, but the premises do not establish whether any of those pedestrian bridges are suspension bridges (which use cables). The connection is not made.', 2),
    (v_q08, 'All bridges that use cables are suspension bridges.', 'No', 'All suspension bridges use cables, but the reverse is not stated. Cable-stayed bridges also use cables but are not suspension bridges.', 3),
    (v_q08, 'No rigid bridge is a suspension bridge.', 'Yes', 'This is the same as statement 1 rephrased. Rigid bridges do not use cables; suspension bridges do. They are mutually exclusive.', 4),
    (v_q08, 'Some pedestrian bridges are rigid.', 'No', 'The premises only state that some bridges are pedestrian-only. Whether any of these are rigid is not established.', 5);

  -- Q09: Hotel Occupancy by Season
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Hotel Occupancy by Season', 'interpreting_info'::dm_question_type, 'A tourism board recorded the percentage occupancy rate of four hotels across four seasons.', '{"headers":["Hotel","Spring (%)","Summer (%)","Autumn (%)","Winter (%)"],"rows":[["Grand Palace","72","95","68","55"],["Seaside Inn","60","98","45","30"],["Mountain Lodge","45","70","80","85"],["City Central","88","82","90","78"]]}'::jsonb, NULL, NULL, NULL, 9)
  RETURNING id INTO v_q09;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q09, 'Seaside Inn had the highest occupancy in Summer.', 'Yes', 'Summer occupancies: Grand Palace 95%, Seaside Inn 98%, Mountain Lodge 70%, City Central 82%. Seaside Inn at 98% is the highest.', 1),
    (v_q09, 'Mountain Lodge occupancy was highest in Winter.', 'Yes', 'Mountain Lodge: Spring 45%, Summer 70%, Autumn 80%, Winter 85%. The highest is 85% in Winter.', 2),
    (v_q09, 'City Central had above 80% occupancy in every season.', 'No', 'City Central Winter = 78%, which is below 80%.', 3),
    (v_q09, 'Grand Palace had higher occupancy than Mountain Lodge in every season.', 'No', 'In Autumn: Grand Palace 68%, Mountain Lodge 80%. Mountain Lodge was higher.', 4),
    (v_q09, 'Seaside Inn had the lowest occupancy in Winter.', 'Yes', 'Winter occupancies: Grand Palace 55%, Seaside Inn 30%, Mountain Lodge 85%, City Central 78%. Seaside Inn at 30% is the lowest.', 5);

  -- Q10: UK Childhood Vaccination Programme
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'UK Childhood Vaccination Programme', 'syllogism'::dm_question_type, E'Childhood vaccination uptake in England fell to 92.6% for the first dose of the MMR vaccine in 2023–24, the fifth consecutive annual decline and below the 95% threshold recommended by the World Health Organization for herd immunity. London had the lowest uptake at 87.3%. The UK Health Security Agency declared measles outbreaks in Birmingham and London in 2024, with over 200 confirmed cases. Public health officials attributed declining uptake partly to misinformation on social media and partly to difficulties accessing GP appointments. The government launched a catch-up campaign offering MMR vaccinations at pharmacies and drop-in clinics. Research from the University of Oxford estimated that a 1 percentage point drop in MMR uptake results in approximately 30,000 additional susceptible children. The Joint Committee on Vaccination and Immunisation recommended adding chickenpox vaccination to the routine childhood schedule.', NULL, NULL, NULL, NULL, 10)
  RETURNING id INTO v_q10;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q10, 'MMR first-dose uptake exceeded 95% in 2023–24.', 'No', 'The passage states uptake fell to 92.6%, which is below 95%.', 1),
    (v_q10, 'London had the highest vaccination uptake.', 'No', 'London had the lowest uptake at 87.3%, not the highest.', 2),
    (v_q10, 'Measles outbreaks were declared in 2024.', 'Yes', 'The passage states the UKHSA declared measles outbreaks in Birmingham and London in 2024.', 3),
    (v_q10, 'The catch-up campaign offered vaccines only at GP surgeries.', 'No', 'The campaign offered vaccinations at pharmacies and drop-in clinics, not only at GP surgeries.', 4),
    (v_q10, 'The JCVI recommended adding chickenpox to the routine schedule.', 'Yes', 'The passage explicitly states the JCVI recommended adding chickenpox vaccination to the routine childhood schedule.', 5);

  -- Q11: Art Gallery Display
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Art Gallery Display', 'logic_puzzle'::dm_question_type, E'Five paintings – Abstract, Baroque, Cubist, Dutch, and Expressionist – are displayed in rooms 1 to 5.\n\n• Dutch is in room 1.\n• Expressionist is in room 5.\n• Cubist is not in a room adjacent to Dutch.\n• Abstract is in the room immediately before Baroque.', NULL, NULL, 'A', 'Dutch = room 1, Expressionist = room 5. Abstract is immediately before Baroque (consecutive pair). Cubist is not adjacent to Dutch (room 1), so Cubist is not in room 2. Remaining rooms 2, 3, 4 for Abstract, Baroque, Cubist. If Abstract = 2, Baroque = 3: Cubist = 4. Cubist(4) adjacent to Dutch(1)? No. Valid. If Abstract = 3, Baroque = 4: Cubist = 2. Cubist(2) adjacent to Dutch(1)? Yes — invalid. Only solution: Abstract = 2, Baroque = 3, Cubist = 4. Abstract is in room 2.', 11)
  RETURNING id INTO v_q11;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q11, 'A', 'Room 2', NULL, 1),
    (v_q11, 'B', 'Room 3', NULL, 2),
    (v_q11, 'C', 'Room 4', NULL, 3),
    (v_q11, 'D', 'Room 5', NULL, 4);

  -- Q12: Compulsory Voting
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Compulsory Voting', 'strongest_argument'::dm_question_type, 'Voting in general elections should be made compulsory for all eligible citizens.', NULL, NULL, 'A', 'Option A is the strongest argument because it identifies the core democratic principle — that election results should genuinely reflect the will of the entire population — and the specific problem that voluntary voting creates self-selection bias. Option B raises a philosophical concern about individual freedom but does not counter the democratic benefit. Option C states a fact about Australia but does not explain why high turnout is desirable. Option D is speculative and lacks evidence.', 12)
  RETURNING id INTO v_q12;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q12, 'A', 'Yes; compulsory voting ensures that election results genuinely reflect the will of the entire population, not just those motivated enough to vote, strengthening democratic legitimacy.', NULL, 1),
    (v_q12, 'B', 'No; forcing citizens to vote infringes on individual freedom, which includes the right not to participate in the political process.', NULL, 2),
    (v_q12, 'C', 'Yes; countries with compulsory voting, such as Australia, consistently achieve turnout above 90%.', NULL, 3),
    (v_q12, 'D', 'No; compulsory voting would increase the number of uninformed votes, potentially distorting election outcomes.', NULL, 4);

  -- Q13: Alloy Composition (Venn SELECT, two_vertical_overlap)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Alloy Composition', 'venn_diagram'::dm_question_type, E'A metallurgist categorised 44 alloy samples. 15 contain Iron only, 7 contain Chromium only, 12 contain both Iron and Chromium, and 10 contain neither.\n\nThe hexagon represents alloys containing Iron and the star represents alloys containing Chromium.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'Iron only = 15 (set1_only), both = 12 (set1_set2), Chromium only = 7 (set2_only), neither = 10 (outside). Total = 15 + 12 + 7 + 10 = 44. Only option A has all values correct. B swaps Iron-only and Chromium-only. C swaps the overlap and outside. D puts 12 in Iron-only and 15 in the overlap.', 13)
  RETURNING id INTO v_q13;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q13, 'A', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Iron","shape":"hexagon"},{"id":"set2","label":"Chromium","shape":"star"}],"regions":{"set1_only":15,"set1_set2":12,"set2_only":7,"outside":10}}'::jsonb, 1),
    (v_q13, 'B', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Iron","shape":"hexagon"},{"id":"set2","label":"Chromium","shape":"star"}],"regions":{"set1_only":7,"set1_set2":12,"set2_only":15,"outside":10}}'::jsonb, 2),
    (v_q13, 'C', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Iron","shape":"hexagon"},{"id":"set2","label":"Chromium","shape":"star"}],"regions":{"set1_only":15,"set1_set2":10,"set2_only":7,"outside":12}}'::jsonb, 3),
    (v_q13, 'D', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Iron","shape":"hexagon"},{"id":"set2","label":"Chromium","shape":"star"}],"regions":{"set1_only":12,"set1_set2":15,"set2_only":7,"outside":10}}'::jsonb, 4);

  -- Q14: Parcel Delivery Accuracy
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Parcel Delivery Accuracy', 'probabilistic'::dm_question_type, 'A delivery service delivers 2,000 parcels per day. 4% go to the wrong address. Of the wrong-address parcels, 70% are returned within 24 hours. Of correctly delivered parcels, 1% are reported as missing despite being delivered.', NULL, NULL, 'D', 'Wrong-address parcels: 2000 × 0.04 = 80. Returned within 24h: 80 × 0.70 = 56. Not returned: 80 − 56 = 24. Correct parcels: 1920. Reported missing: 1920 × 0.01 = 19.2. A: fewer than 50 returned — 56 > 50, so A is wrong. B: more than 20 reported missing — 19.2 < 20, so B is wrong. C: total with issues exceeds 100 — 80 + 19.2 = 99.2 < 100, so C is wrong. D: more than 20 misdelivered not returned — 24 > 20, so D is correct.', 14)
  RETURNING id INTO v_q14;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q14, 'A', 'Fewer than 50 wrong-address parcels are returned within 24 hours.', NULL, 1),
    (v_q14, 'B', 'More than 20 correctly delivered parcels are reported as missing.', NULL, 2),
    (v_q14, 'C', 'The total number of parcels either misdelivered or reported missing exceeds 100.', NULL, 3),
    (v_q14, 'D', 'More than 20 misdelivered parcels are NOT returned within 24 hours.', NULL, 4);

  -- Q15: Glaciers and Ice
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Glaciers and Ice', 'syllogism'::dm_question_type, 'All glaciers are made of compacted ice. All compacted ice melts above 0°C. Some glaciers are found in tropical regions.', NULL, NULL, NULL, NULL, 15)
  RETURNING id INTO v_q15;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q15, 'All glaciers melt above 0°C.', 'Yes', 'All glaciers are made of compacted ice, and all compacted ice melts above 0°C. By transitive reasoning, all glaciers melt above 0°C.', 1),
    (v_q15, 'Some things found in tropical regions are made of compacted ice.', 'Yes', 'Some glaciers are found in tropical regions, and all glaciers are made of compacted ice. Therefore some tropical things are made of compacted ice.', 2),
    (v_q15, 'All compacted ice is found in glaciers.', 'No', 'All glaciers are made of compacted ice, but the reverse is not stated. Ice caps and icebergs also contain compacted ice.', 3),
    (v_q15, 'Some tropical things melt above 0°C.', 'Yes', 'Some glaciers are tropical, all glaciers are compacted ice, and all compacted ice melts above 0°C. So some tropical things melt above 0°C.', 4),
    (v_q15, 'All things that melt above 0°C are glaciers.', 'No', 'All glaciers melt above 0°C, but many other things (e.g. ice cream, butter) also melt above 0°C. The reverse does not hold.', 5);

  -- Q16: Airline Punctuality
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Airline Punctuality', 'interpreting_info'::dm_question_type, 'The Civil Aviation Authority recorded the percentage of flights arriving on time for four airlines over three months.', '{"headers":["Airline","January (%)","February (%)","March (%)"],"rows":[["British Airways","78","82","80"],["EasyJet","72","70","75"],["Ryanair","68","74","71"],["Jet2","85","83","88"]]}'::jsonb, NULL, NULL, NULL, 16)
  RETURNING id INTO v_q16;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q16, 'Jet2 had the highest punctuality every month.', 'Yes', 'January: Jet2 85% (highest). February: Jet2 83% (highest, BA was 82%). March: Jet2 88% (highest).', 1),
    (v_q16, 'Ryanair punctuality improved every month.', 'No', 'Ryanair: 68% → 74% → 71%. It dropped from February (74%) to March (71%).', 2),
    (v_q16, 'British Airways punctuality exceeded 80% in February.', 'Yes', 'British Airways February = 82%, which exceeds 80%.', 3),
    (v_q16, 'EasyJet had the lowest punctuality in January.', 'No', 'January: EasyJet 72%, Ryanair 68%. Ryanair had the lowest punctuality in January.', 4),
    (v_q16, 'Average punctuality across all airlines exceeded 80% in March.', 'No', 'March average: (80 + 75 + 71 + 88) / 4 = 314 / 4 = 78.5%. This is below 80%.', 5);

  -- Q17: Greenhouse Planting
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Greenhouse Planting', 'logic_puzzle'::dm_question_type, E'Four plants – Aloe, Basil, Cactus, and Daisy – are placed in greenhouse zones 1 to 4 (zone 1 is sunniest, zone 4 is shadiest).\n\n• Basil is in zone 1.\n• Daisy is not adjacent to Basil.\n• Cactus is in zone 2.\n• Aloe is not in zone 3.', NULL, NULL, 'B', 'Basil = zone 1, Cactus = zone 2. Remaining zones 3 and 4 for Aloe and Daisy. Aloe is not in zone 3, so Aloe = zone 4. Therefore Daisy = zone 3. Check: Daisy(3) adjacent to Basil(1)? Zones 1 and 3 are not adjacent. Valid. Daisy is in zone 3.', 17)
  RETURNING id INTO v_q17;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q17, 'A', 'Zone 2', NULL, 1),
    (v_q17, 'B', 'Zone 3', NULL, 2),
    (v_q17, 'C', 'Zone 4', NULL, 3),
    (v_q17, 'D', 'Zone 1', NULL, 4);

  -- Q18: Bookshop Sections (Venn SELECT, three_linear)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Bookshop Sections', 'venn_diagram'::dm_question_type, E'A bookshop surveyed 46 customers. 12 browse Fiction only, 6 browse both Fiction and Non-fiction, 9 browse Non-fiction only, 4 browse both Non-fiction and Children''s, 5 browse Children''s only, and 10 browse none.\n\nThe pentagon represents Fiction, the rectangle represents Non-fiction, and the oval represents Children''s.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'Fiction only = 12, Fiction ∩ Non-fiction = 6, Non-fiction only = 9, Non-fiction ∩ Children''s = 4, Children''s only = 5, outside = 10. Total = 12 + 6 + 9 + 4 + 5 + 10 = 46. Only option A has all values correct. B swaps the two overlaps. C swaps Fiction-only and Non-fiction-only. D swaps Children''s-only and outside.', 18)
  RETURNING id INTO v_q18;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q18, 'A', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Fiction","shape":"pentagon"},{"id":"set2","label":"Non-fiction","shape":"rectangle"},{"id":"set3","label":"Children''s","shape":"oval"}],"regions":{"set1_only":12,"set1_set2":6,"set2_only":9,"set2_set3":4,"set3_only":5,"outside":10}}'::jsonb, 1),
    (v_q18, 'B', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Fiction","shape":"pentagon"},{"id":"set2","label":"Non-fiction","shape":"rectangle"},{"id":"set3","label":"Children''s","shape":"oval"}],"regions":{"set1_only":12,"set1_set2":4,"set2_only":9,"set2_set3":6,"set3_only":5,"outside":10}}'::jsonb, 2),
    (v_q18, 'C', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Fiction","shape":"pentagon"},{"id":"set2","label":"Non-fiction","shape":"rectangle"},{"id":"set3","label":"Children''s","shape":"oval"}],"regions":{"set1_only":9,"set1_set2":6,"set2_only":12,"set2_set3":4,"set3_only":5,"outside":10}}'::jsonb, 3),
    (v_q18, 'D', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Fiction","shape":"pentagon"},{"id":"set2","label":"Non-fiction","shape":"rectangle"},{"id":"set3","label":"Children''s","shape":"oval"}],"regions":{"set1_only":12,"set1_set2":6,"set2_only":9,"set2_set3":4,"set3_only":10,"outside":5}}'::jsonb, 4);

  -- Q19: UK Mental Health Services
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'UK Mental Health Services', 'syllogism'::dm_question_type, E'The number of people in contact with NHS mental health services in England reached 4.5 million in 2023–24, an increase of 22% over five years. Average waiting times for talking therapies through the Improving Access to Psychological Therapies (IAPT) programme were 16 days for initial assessment but rose to an average of 54 days for treatment to begin. The NHS Long Term Plan committed to ensuring 380,000 additional people access IAPT services annually by 2024. The Royal College of Psychiatrists estimated a national shortfall of 2,000 consultant psychiatrists. In a 2024 survey, 23% of adults reported symptoms of anxiety or depression, up from 19% before the pandemic. Crisis services, including the 24-hour mental health helpline, received 4.2 million calls during 2023. Young people aged 17–19 had the highest rate of probable mental health disorders at 25.7%.', NULL, NULL, NULL, NULL, 19)
  RETURNING id INTO v_q19;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q19, 'Fewer than 4 million people accessed NHS mental health services.', 'No', 'The passage states 4.5 million people were in contact with NHS mental health services, which exceeds 4 million.', 1),
    (v_q19, 'Treatment waiting times averaged more than 50 days.', 'Yes', 'Average waiting time for treatment to begin was 54 days, which exceeds 50 days.', 2),
    (v_q19, 'The NHS plan aimed to give 380,000 additional people access to IAPT annually.', 'Yes', 'The passage states the NHS Long Term Plan committed to ensuring 380,000 additional people access IAPT services annually.', 3),
    (v_q19, 'Anxiety and depression rates declined compared to pre-pandemic levels.', 'No', 'Rates increased from 19% before the pandemic to 23% in 2024. They rose, not declined.', 4),
    (v_q19, 'Young people aged 17–19 had the highest rate of mental health disorders.', 'Yes', 'The passage states this age group had the highest rate of probable mental health disorders at 25.7%.', 5);

  -- Q20: Banning Disposable Barbecues in Public Parks
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Banning Disposable Barbecues in Public Parks', 'strongest_argument'::dm_question_type, 'Disposable barbecues should be banned from all public parks.', NULL, NULL, 'A', 'Option A is the strongest argument because it provides specific UK evidence — 118 wildfires, a named location (Hampstead Heath), and quantified damage (15 hectares) — directly supporting the safety case for a ban. Option B raises an equity concern but does not address the fire risk. Option C is vague and lacks specific evidence. Option D suggests an alternative but does not refute the fire danger evidence.', 20)
  RETURNING id INTO v_q20;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q20, 'A', 'Yes; disposable barbecues caused 118 wildfires on public land in the UK in 2022, including a major blaze on Hampstead Heath that destroyed 15 hectares of grassland.', NULL, 1),
    (v_q20, 'B', 'No; banning barbecues in parks would unfairly restrict families who cannot afford gardens or patios, limiting outdoor cooking to those with private land.', NULL, 2),
    (v_q20, 'C', 'Yes; parks should be kept clean and barbecues leave scorch marks on the grass.', NULL, 3),
    (v_q20, 'D', 'No; educating the public about safe barbecue use would be more effective than an outright ban.', NULL, 4);

  -- Q21: Dice Probability
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Dice Probability', 'probabilistic'::dm_question_type, 'Two fair six-sided dice are rolled simultaneously.', NULL, NULL, 'A', 'Total outcomes = 36. A: P(sum = 7) — ways: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. 6/36 = 1/6. Yes, correct. B: P(sum > 10) — sum 11: (5,6),(6,5) = 2; sum 12: (6,6) = 1; total = 3/36 = 8.3%. 8.3% < 10%, so B is wrong. C: P(both same) = 6/36 = 1/6, not 1/3, so C is wrong. D: P(sum even) = 18/36 = 50%, which equals but does not exceed 50%, so D is wrong.', 21)
  RETURNING id INTO v_q21;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q21, 'A', 'The probability that the sum equals 7 is 1/6.', NULL, 1),
    (v_q21, 'B', 'The probability that the sum exceeds 10 is greater than 10%.', NULL, 2),
    (v_q21, 'C', 'The probability that both dice show the same number is 1/3.', NULL, 3),
    (v_q21, 'D', 'The probability that the sum is even exceeds 50%.', NULL, 4);

  -- Q22: Libraries and Archives
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Libraries and Archives', 'syllogism'::dm_question_type, 'No archive is open to the public without an appointment. All reference libraries are open to the public without an appointment. Some archives contain rare manuscripts.', NULL, NULL, NULL, NULL, 22)
  RETURNING id INTO v_q22;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q22, 'No reference library is an archive.', 'Yes', 'Archives require appointments; reference libraries are open without appointments. A place cannot both require and not require an appointment, so no reference library is an archive.', 1),
    (v_q22, 'Some places containing rare manuscripts need an appointment.', 'Yes', 'Some archives contain rare manuscripts, and all archives need appointments. Therefore some places with rare manuscripts need appointments.', 2),
    (v_q22, 'All places open without an appointment are reference libraries.', 'No', 'All reference libraries are open without appointments, but the reverse is not stated. Museums and shops may also be open without appointments.', 3),
    (v_q22, 'No archive is a reference library.', 'Yes', 'This is the same as statement 1 rephrased. Archives and reference libraries are mutually exclusive based on appointment requirements.', 4),
    (v_q22, 'Some reference libraries contain rare manuscripts.', 'No', 'Some archives contain rare manuscripts, but archives and reference libraries are disjoint sets. There is no basis to conclude reference libraries have rare manuscripts.', 5);

  -- Q23: Market Stall Placement
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Market Stall Placement', 'logic_puzzle'::dm_question_type, E'Five stalls – Artisan, Baker, Cheesemonger, Deli, and Florist – are arranged in positions 1 to 5 at a market.\n\n• Florist is in position 5.\n• Baker is not adjacent to Florist.\n• Deli is in position 1.\n• Baker is immediately before Artisan.\n• Artisan is before Cheesemonger.', NULL, NULL, 'B', 'Deli = 1, Florist = 5. Baker is not adjacent to Florist, so Baker is not in position 4. Baker is immediately before Artisan. If Baker = 2, Artisan = 3: Cheesemonger fills 4. Artisan(3) < Cheesemonger(4) — valid. If Baker = 3, Artisan = 4: Cheesemonger fills 2. Artisan(4) < Cheesemonger(2)? No — invalid. Only valid: Deli(1), Baker(2), Artisan(3), Cheesemonger(4), Florist(5). Artisan is in position 3.', 23)
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', 'Position 2', NULL, 1),
    (v_q23, 'B', 'Position 3', NULL, 2),
    (v_q23, 'C', 'Position 4', NULL, 3),
    (v_q23, 'D', 'Position 5', NULL, 4);

  -- Q24: Art Medium (Venn INTERPRET, three_all_overlap)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Art Medium', 'venn_diagram'::dm_question_type, E'The diagram shows artists categorised by the paint media they use. The hexagon represents Oils, the circle represents Watercolour, and the square represents Acrylic. Each letter marks a different region.\n\nWhich letter represents artists who use both Oils and Watercolour but not Acrylic?', NULL, '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Oils","shape":"hexagon"},{"id":"set2","label":"Watercolour","shape":"circle"},{"id":"set3","label":"Acrylic","shape":"square"}],"regions":{"set1_only":"A","set2_only":"B","set3_only":"C","set1_set2":"D","set1_set3":"E","set2_set3":"F","all_three":"G","outside":"H"}}'::jsonb, 'A', 'Oils = hexagon (set1), Watercolour = circle (set2). Their overlap excluding Acrylic (square, set3) is set1_set2 = D. E is Oils + Acrylic. F is Watercolour + Acrylic. G is all three. Answer: A (Letter D).', 24)
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', 'Letter D', NULL, 1),
    (v_q24, 'B', 'Letter E', NULL, 2),
    (v_q24, 'C', 'Letter F', NULL, 3),
    (v_q24, 'D', 'Letter G', NULL, 4);

  -- Q25: River Water Quality
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'River Water Quality', 'interpreting_info'::dm_question_type, 'An environmental agency measured water quality indicators across four river stretches.', '{"headers":["River Stretch","Dissolved O₂ (mg/L)","Nitrate (mg/L)","pH","Phosphate (mg/L)"],"rows":[["Upper Tees","11.2","1.8","7.4","0.02"],["Lower Tees","7.8","6.5","7.1","0.15"],["Upper Wear","10.5","2.2","7.3","0.04"],["Lower Wear","6.4","8.1","6.9","0.22"]]}'::jsonb, NULL, NULL, NULL, 25)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q25, 'Upper stretches had higher dissolved oxygen than their corresponding lower stretches.', 'Yes', 'Upper Tees 11.2 > Lower Tees 7.8. Upper Wear 10.5 > Lower Wear 6.4. Both upper stretches have higher dissolved oxygen.', 1),
    (v_q25, 'Lower Wear had the highest nitrate concentration.', 'Yes', 'Nitrate levels: Upper Tees 1.8, Lower Tees 6.5, Upper Wear 2.2, Lower Wear 8.1. Lower Wear at 8.1 is the highest.', 2),
    (v_q25, 'All stretches had a pH above 7.0.', 'No', 'Lower Wear has a pH of 6.9, which is below 7.0.', 3),
    (v_q25, 'Phosphate levels were higher in lower stretches than upper stretches.', 'Yes', 'Lower Tees 0.15 > Upper Tees 0.02. Lower Wear 0.22 > Upper Wear 0.04. Both lower stretches have higher phosphate.', 4),
    (v_q25, 'Upper Tees had both the highest dissolved oxygen and lowest nitrate.', 'Yes', 'Dissolved oxygen: Upper Tees 11.2 is the highest. Nitrate: Upper Tees 1.8 is the lowest. Both are true.', 5);

  -- Q26: UK Pothole Crisis
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'UK Pothole Crisis', 'syllogism'::dm_question_type, E'Local authorities in England filled 1.7 million potholes in 2023–24, but the Annual Local Authority Road Maintenance survey estimated a backlog of repairs that would cost £16.3 billion to clear. The average time to repair a reported pothole was 12 days. The RAC reported that pothole-related breakdowns increased by 30% compared to 2019. The Department for Transport allocated £500 million annually for local road maintenance, though the Local Government Association argued this covered only a third of what was needed. The Asphalt Industry Alliance estimated that roads were being resurfaced on a cycle of once every 73 years on average, compared to the recommended cycle of 10–20 years. Council spending on road maintenance had fallen by 17% in real terms since 2010. Insurance claims for vehicle damage caused by potholes totalled £80 million in 2023.', NULL, NULL, NULL, NULL, 26)
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q26, 'More than 2 million potholes were filled in 2023–24.', 'No', 'The passage states 1.7 million potholes were filled, which is fewer than 2 million.', 1),
    (v_q26, 'The repair backlog would cost more than £15 billion to clear.', 'Yes', 'The backlog was estimated at £16.3 billion, which exceeds £15 billion.', 2),
    (v_q26, 'Pothole-related breakdowns decreased compared to 2019.', 'No', 'The RAC reported breakdowns increased by 30% compared to 2019, not decreased.', 3),
    (v_q26, 'Roads are resurfaced more frequently than the recommended cycle.', 'No', 'Roads are resurfaced once every 73 years on average, far less frequently than the recommended 10–20 year cycle.', 4),
    (v_q26, 'Vehicle damage claims from potholes totalled £80 million.', 'Yes', 'The passage states insurance claims for vehicle damage caused by potholes totalled £80 million in 2023.', 5);

  -- Q27: Universal Basic Income
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Universal Basic Income', 'strongest_argument'::dm_question_type, 'The government should introduce a Universal Basic Income for all adults.', NULL, NULL, 'B', 'Option B is the strongest argument because it identifies the specific cost — approximately £300 billion per year — and the concrete trade-offs required (massive tax increases or cuts to existing services), directly challenging the feasibility of the proposal. Option A makes a valid point about simplification but does not address cost. Option C cites a single trial without UK-specific evidence. Option D makes a general claim about work incentives without evidence.', 27)
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', 'Yes; a UBI would eliminate the administrative complexity and stigma of means-tested benefits, ensuring no citizen falls below the poverty line regardless of employment status.', NULL, 1),
    (v_q27, 'B', 'No; the estimated cost of a meaningful UBI — approximately £300 billion per year — would require either massive tax increases or cuts to existing services.', NULL, 2),
    (v_q27, 'C', 'Yes; UBI has been trialled in Finland with positive effects on recipients'' mental health and wellbeing.', NULL, 3),
    (v_q27, 'D', 'No; paying everyone a basic income regardless of need would disincentivise work and reduce overall economic productivity.', NULL, 4);

  -- Q28: Biological Classification (Venn SELECT, three_nested)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Biological Classification', 'venn_diagram'::dm_question_type, E'A biology class categorised 55 organisms. All Mammals are Vertebrates, and all Vertebrates are Animals. 16 are Animals only (not Vertebrates), 14 are Vertebrates only (not Mammals), 15 are Mammals (which are also Vertebrates and Animals), and 10 are not Animals.\n\nThe rectangle represents Animals, the hexagon (inside the rectangle) represents Vertebrates, and the circle (inside the hexagon) represents Mammals.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'Animals only = 16 (set1_only), Vertebrates not Mammals = 14 (set1_set2), Mammals = 15 (all_three), not Animals = 10 (outside). Total = 16 + 14 + 15 + 10 = 55. Only option A has all values correct. B swaps set1_only and set1_set2. C swaps all_three and outside. D puts outside as set1_only and set1_only as outside.', 28)
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', '', '{"diagramLayout":"three_nested","sets":[{"id":"set1","label":"Animals","shape":"rectangle"},{"id":"set2","label":"Vertebrates","shape":"hexagon"},{"id":"set3","label":"Mammals","shape":"circle"}],"regions":{"set1_only":16,"set1_set2":14,"all_three":15,"outside":10}}'::jsonb, 1),
    (v_q28, 'B', '', '{"diagramLayout":"three_nested","sets":[{"id":"set1","label":"Animals","shape":"rectangle"},{"id":"set2","label":"Vertebrates","shape":"hexagon"},{"id":"set3","label":"Mammals","shape":"circle"}],"regions":{"set1_only":14,"set1_set2":16,"all_three":15,"outside":10}}'::jsonb, 2),
    (v_q28, 'C', '', '{"diagramLayout":"three_nested","sets":[{"id":"set1","label":"Animals","shape":"rectangle"},{"id":"set2","label":"Vertebrates","shape":"hexagon"},{"id":"set3","label":"Mammals","shape":"circle"}],"regions":{"set1_only":16,"set1_set2":14,"all_three":10,"outside":15}}'::jsonb, 3),
    (v_q28, 'D', '', '{"diagramLayout":"three_nested","sets":[{"id":"set1","label":"Animals","shape":"rectangle"},{"id":"set2","label":"Vertebrates","shape":"hexagon"},{"id":"set3","label":"Mammals","shape":"circle"}],"regions":{"set1_only":10,"set1_set2":14,"all_three":15,"outside":16}}'::jsonb, 4);

  -- Q29: Musical Performance Order
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Musical Performance Order', 'logic_puzzle'::dm_question_type, E'Five acts – Alto, Bass, Choir, Drums, and Ensemble – perform in slots 1 to 5.\n\n• Choir is in slot 3.\n• Alto performs before Bass.\n• Drums is not in slot 1 or 5.\n• Ensemble performs immediately after Drums.', NULL, NULL, 'B', 'Choir = slot 3. Drums is not in slot 1 or 5, and Ensemble is immediately after Drums. If Drums = 2, Ensemble = 3 — but Choir is in slot 3, conflict. If Drums = 4, Ensemble = 5. Remaining slots 1 and 2 for Alto and Bass. Alto < Bass, so Alto = 1, Bass = 2. Bass is in slot 2.', 29)
  RETURNING id INTO v_q29;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q29, 'A', 'Slot 1', NULL, 1),
    (v_q29, 'B', 'Slot 2', NULL, 2),
    (v_q29, 'C', 'Slot 4', NULL, 3),
    (v_q29, 'D', 'Slot 5', NULL, 4);

  -- Q30: Wind Farm Output
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Wind Farm Output', 'interpreting_info'::dm_question_type, 'An energy report recorded the monthly electricity output (in GWh) of four offshore wind farms.', '{"headers":["Farm","January (GWh)","February (GWh)","March (GWh)","April (GWh)"],"rows":[["North Sea Alpha","420","380","350","310"],["Irish Sea Beta","280","300","260","240"],["Dogger Bank","520","480","510","450"],["Hornsea","460","440","470","420"]]}'::jsonb, NULL, NULL, NULL, 30)
  RETURNING id INTO v_q30;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q30, 'Dogger Bank had the highest output every month.', 'Yes', 'Jan: 520 (highest). Feb: 480 (highest). Mar: 510 (highest). Apr: 450 (highest). Dogger Bank leads every month.', 1),
    (v_q30, 'Output decreased from January to April for every farm.', 'No', 'Irish Sea Beta: Jan 280, Feb 300. Output increased from January to February, so it did not decrease every month.', 2),
    (v_q30, 'Hornsea output exceeded 400 GWh every month.', 'Yes', 'Hornsea: 460, 440, 470, 420. All values exceed 400 GWh.', 3),
    (v_q30, 'Irish Sea Beta had the lowest output every month.', 'Yes', 'Jan: 280 (lowest). Feb: 300 (lowest). Mar: 260 (lowest). Apr: 240 (lowest). Irish Sea Beta is consistently lowest.', 4),
    (v_q30, 'Total output across all farms in January exceeded 1,600 GWh.', 'Yes', 'January total: 420 + 280 + 520 + 460 = 1,680 GWh, which exceeds 1,600.', 5);

  -- Q31: Batch Quality Testing
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Batch Quality Testing', 'probabilistic'::dm_question_type, 'A factory produces 500 items per batch. Two batches are tested. Batch A has a 6% defect rate. Batch B has a 4% defect rate.', NULL, NULL, 'A', 'Batch A defective: 500 × 0.06 = 30. Batch B defective: 500 × 0.04 = 20. Total items: 1000. Total defective: 50. A: combined defect rate is 5% — 50/1000 = 5%. Correct. B: Batch A has more than twice as many defective items as Batch B — 30/20 = 1.5, not more than 2. Wrong. C: fewer than 45 defective items total — 50 > 45. Wrong. D: P(defective) from all 1000 exceeds 6% — 5% < 6%. Wrong.', 31)
  RETURNING id INTO v_q31;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q31, 'A', 'The combined defect rate across both batches is 5%.', NULL, 1),
    (v_q31, 'B', 'Batch A has more than twice as many defective items as Batch B.', NULL, 2),
    (v_q31, 'C', 'There are fewer than 45 defective items in total.', NULL, 3),
    (v_q31, 'D', 'If one item is selected at random from all 1,000 items, the probability it is defective exceeds 6%.', NULL, 4);

  -- Q32: Deserts and Climate
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Deserts and Climate', 'syllogism'::dm_question_type, 'Some deserts are cold. All cold deserts receive snowfall. No hot desert receives snowfall.', NULL, NULL, NULL, NULL, 32)
  RETURNING id INTO v_q32;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q32, 'Some deserts receive snowfall.', 'Yes', 'Some deserts are cold, and all cold deserts receive snowfall. Therefore some deserts receive snowfall.', 1),
    (v_q32, 'All deserts are cold.', 'No', 'The premise states only that some deserts are cold, not all. Hot deserts also exist.', 2),
    (v_q32, 'No hot desert is a cold desert.', 'Yes', 'All cold deserts receive snowfall and no hot desert receives snowfall. If a desert were both hot and cold it would both receive and not receive snowfall — a contradiction. So no hot desert is a cold desert.', 3),
    (v_q32, 'Some things that receive snowfall are deserts.', 'Yes', 'Some deserts receive snowfall (established above). Therefore some things that receive snowfall are deserts.', 4),
    (v_q32, 'All things that receive snowfall are cold deserts.', 'No', 'All cold deserts receive snowfall, but mountains and tundra also receive snowfall. The reverse does not hold.', 5);

  -- Q33: Town Planning Zones (Venn INTERPRET, five_complex)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Town Planning Zones', 'venn_diagram'::dm_question_type, E'The diagram shows areas of a town categorised by planning zone. The rectangle represents the Town Centre, the square represents Residential areas, the triangle represents Commercial areas, the circle represents the Heritage zone, and the diamond represents Mixed-Use areas. Each letter marks a different region.\n\nWhich letter represents an area within both the Heritage zone and the Mixed-Use area?', NULL, '{"diagramLayout":"five_complex","sets":[{"id":"set1","label":"Town Centre","shape":"rectangle"},{"id":"set2","label":"Residential","shape":"square"},{"id":"set3","label":"Commercial","shape":"triangle"},{"id":"set4","label":"Heritage","shape":"circle"},{"id":"set5","label":"Mixed-Use","shape":"diamond"}],"regions":{"set2_only":"P","set1_set2":"Q","set1_only":"R","set1_set4":"S","set1_set4_set5":"T","set1_set3_set5":"U","set3_only":"V","outside":"W"}}'::jsonb, 'B', 'Heritage = circle (set4), Mixed-Use = diamond (set5). The region inside both Heritage and Mixed-Use is set1_set4_set5 = T. S is set1_set4 (Town Centre + Heritage, no Mixed-Use). U is set1_set3_set5 (Town Centre + Commercial + Mixed-Use). R is Town Centre only.', 33)
  RETURNING id INTO v_q33;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q33, 'A', 'Letter S', NULL, 1),
    (v_q33, 'B', 'Letter T', NULL, 2),
    (v_q33, 'C', 'Letter U', NULL, 3),
    (v_q33, 'D', 'Letter R', NULL, 4);

  -- Q34: UK Electric Vehicle Charging
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'UK Electric Vehicle Charging', 'syllogism'::dm_question_type, E'The UK had 53,677 public electric vehicle charge points as of October 2024, an increase of 45% over two years. However, the distribution was highly uneven, with London accounting for 29% of all charge points while Scotland had only 8%. The government target of 300,000 public charge points by 2030 would require installation rates to triple. Rapid chargers capable of adding 100 miles of range in 20 minutes made up only 18% of the network. Range anxiety — the fear of running out of charge before reaching a charger — was cited by 52% of non-EV owners as their primary barrier to switching. The Competition and Markets Authority found that charging on motorways cost an average of 77p per kWh, compared to 30p per kWh at home, a disparity it described as ''excessive.'' The government mandated that all new homes built after 2022 include an EV charge point.', NULL, NULL, NULL, NULL, 34)
  RETURNING id INTO v_q34;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q34, 'The UK had more than 60,000 public charge points in October 2024.', 'No', 'The passage states 53,677 charge points, which is fewer than 60,000.', 1),
    (v_q34, 'London had nearly a third of all charge points.', 'Yes', 'London accounted for 29% of all charge points, which is nearly a third (33%).', 2),
    (v_q34, 'Rapid chargers made up more than a quarter of the network.', 'No', 'Rapid chargers made up 18% of the network, which is less than 25% (a quarter).', 3),
    (v_q34, 'Range anxiety was cited by more than half of non-EV owners.', 'Yes', '52% of non-EV owners cited range anxiety as their primary barrier, and 52% exceeds 50% (half).', 4),
    (v_q34, 'Motorway charging costs were more than double home charging costs.', 'Yes', 'Motorway charging: 77p/kWh. Home charging: 30p/kWh. 77/30 ≈ 2.57, which is more than double.', 5);

  -- Q35: Algorithms and Computation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (3, 'Algorithms and Computation', 'syllogism'::dm_question_type, 'All algorithms follow a defined sequence of steps. Some processes that follow defined steps are automated. No random process follows a defined sequence of steps.', NULL, NULL, NULL, NULL, 35)
  RETURNING id INTO v_q35;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q35, 'Some algorithms are automated.', 'No', 'Some processes that follow defined steps are automated, but those automated processes may not include any algorithms. The premises do not establish which step-following processes are automated.', 1),
    (v_q35, 'No random process is an algorithm.', 'Yes', 'All algorithms follow defined steps, and no random process follows defined steps. Therefore no random process can be an algorithm.', 2),
    (v_q35, 'All processes that follow defined steps are algorithms.', 'No', 'All algorithms follow defined steps, but the reverse is not stated. Recipes and assembly instructions also follow defined steps but are not algorithms.', 3),
    (v_q35, 'Some automated processes follow defined steps.', 'Yes', 'The premise directly states that some processes following defined steps are automated. By conversion, some automated processes follow defined steps.', 4),
    (v_q35, 'All algorithms are non-random.', 'Yes', 'Since no random process is an algorithm (established above), every algorithm must be non-random. This is the contrapositive.', 5);

END $$;
