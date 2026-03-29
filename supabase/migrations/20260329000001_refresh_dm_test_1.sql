-- Refresh: Timed DM Test 1 (test_id = 1)
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

  DELETE FROM timed_decision_making_questions WHERE test_id = 1;

  -- Q01: Coloured Ball Draw
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Coloured Ball Draw', 'probabilistic'::dm_question_type, 'A bag contains 6 red, 4 blue, and 5 green balls. Two balls are drawn at random, one at a time, without replacement.', NULL, NULL, 'A', 'P(both red) = 6/15 × 5/14 = 30/210 = 1/7. Option B (2/15) incorrectly uses 15 in the denominator for the second draw. Option C (1/3) and D (3/14) do not correspond to any valid calculation.', 1)
  RETURNING id INTO v_q01;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q01, 'A', 'The probability that both balls are red is 1/7.', NULL, 1),
    (v_q01, 'B', 'The probability that both are red is 2/15.', NULL, 2),
    (v_q01, 'C', 'The probability that both are red is 1/3.', NULL, 3),
    (v_q01, 'D', 'The probability that both are red is 3/14.', NULL, 4);

  -- Q02: Shipping Port Container Volumes
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Shipping Port Container Volumes', 'interpreting_info'::dm_question_type, 'A logistics company recorded the number of containers (in hundreds) handled at four UK ports across four quarters.', '{"headers":["Port","Q1","Q2","Q3","Q4"],"rows":[["Felixstowe","820","850","900","870"],["Southampton","650","680","640","710"],["London Gateway","420","450","480","510"],["Liverpool","380","360","390","400"]]}'::jsonb, NULL, NULL, NULL, 2)
  RETURNING id INTO v_q02;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q02, 'Felixstowe handled the most containers in every quarter.', 'Yes', '820, 850, 900, 870 are all the highest values in their respective quarters.', 1),
    (v_q02, 'London Gateway volumes increased every quarter.', 'Yes', '420 → 450 → 480 → 510. Each quarter is higher.', 2),
    (v_q02, 'Southampton volumes increased consistently across all quarters.', 'No', '650 → 680 → 640 → 710. Volumes dipped from Q2 to Q3.', 3),
    (v_q02, 'Liverpool exceeded 400 containers in Q4.', 'No', 'Liverpool Q4 = 400. This equals 400 but does not exceed it.', 4),
    (v_q02, 'Total containers across all ports exceeded 2400 in Q3.', 'Yes', 'Q3: 900 + 640 + 480 + 390 = 2410, which exceeds 2400.', 5);

  -- Q03: Metals and Conductors
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Metals and Conductors', 'syllogism'::dm_question_type, 'All metals conduct electricity. Some conductors are liquid at room temperature. No insulator conducts electricity.', NULL, NULL, NULL, NULL, 3)
  RETURNING id INTO v_q03;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q03, 'Some metals are liquid at room temperature.', 'No', 'Some conductors are liquid, but those liquid conductors may not be metals. The premises do not establish which conductors are liquid.', 1),
    (v_q03, 'No insulator is a metal.', 'Yes', 'All metals conduct electricity, and no insulator conducts electricity. Therefore no insulator can be a metal.', 2),
    (v_q03, 'All conductors are metals.', 'No', 'All metals conduct — not the reverse. Carbon and saltwater also conduct but are not metals.', 3),
    (v_q03, 'Some liquid conductors are metals.', 'No', 'Same reasoning as statement 1. The liquid conductors may all be non-metals.', 4),
    (v_q03, 'All things that conduct electricity are non-insulators.', 'Yes', 'No insulator conducts electricity, so anything that does conduct must be a non-insulator.', 5);

  -- Q04: Lighthouse Maintenance Schedule
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Lighthouse Maintenance Schedule', 'logic_puzzle'::dm_question_type, 'Five lighthouses — Anvil, Beacon, Crown, Dune, and Eagle — are each visited for maintenance on a different day from Monday to Friday.

• Anvil is visited on Wednesday.
• Crown is visited before Beacon.
• Eagle is not visited on Monday or Friday.
• Dune is visited immediately after Eagle.

Which day is Beacon visited?', NULL, NULL, 'B', 'Anvil = Wednesday. Eagle ≠ Monday or Friday. Dune immediately after Eagle. If Eagle = Tuesday, Dune = Wednesday — but Anvil is already Wednesday. ✗ If Eagle = Thursday, Dune = Friday. Remaining: Monday and Tuesday for Crown and Beacon. Crown before Beacon → Crown = Monday, Beacon = Tuesday. ✓', 4)
  RETURNING id INTO v_q04;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q04, 'A', 'Monday', NULL, 1),
    (v_q04, 'B', 'Tuesday', NULL, 2),
    (v_q04, 'C', 'Thursday', NULL, 3),
    (v_q04, 'D', 'Friday', NULL, 4);

  -- Q05: Compulsory Community Service
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Compulsory Community Service', 'strongest_argument'::dm_question_type, 'All young people aged 18–25 should be required to complete one year of compulsory community service.', NULL, NULL, 'B', 'Option B is the strongest argument because it identifies two specific harms — restriction of personal freedom and delayed education or career progression — during a critical life stage. This directly challenges the feasibility and fairness of the proposal. Option A is reasonable but vague. Option C appeals to other countries without explaining relevance. Option D makes a weak claim that paying taxes is sufficient contribution.', 5)
  RETURNING id INTO v_q05;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q05, 'A', 'Yes; community service builds empathy, civic responsibility, and practical skills that benefit both individuals and the communities they serve.', NULL, 1),
    (v_q05, 'B', 'No; compulsory unpaid service restricts personal freedom and could delay higher education or career development during a critical period of a young person''s life.', NULL, 2),
    (v_q05, 'C', 'Yes; countries such as South Korea and Israel have compulsory national service and their young people appear to benefit.', NULL, 3),
    (v_q05, 'D', 'No; young people already contribute to society through taxes and should not be required to do more.', NULL, 4);

  -- Q06: Spice Blends (venn INTERPRET)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Spice Blends', 'venn_diagram'::dm_question_type, 'The diagram shows dishes categorised by their spice content. The oval represents dishes containing Cumin and the pentagon represents dishes containing Paprika. Each letter marks a different region.

Which letter represents dishes that contain both Cumin and Paprika?', NULL, '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Cumin","shape":"oval"},{"id":"set2","label":"Paprika","shape":"pentagon"}],"regions":{"set1_only":"J","set1_set2":"K","set2_only":"L","outside":"M"}}'::jsonb, 'B', 'The oval is Cumin and the pentagon is Paprika. The region where both shapes overlap is marked K. Letter J is Cumin only. Letter L is Paprika only. Letter M is outside both.', 6)
  RETURNING id INTO v_q06;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q06, 'A', 'Letter J', NULL, 1),
    (v_q06, 'B', 'Letter K', NULL, 2),
    (v_q06, 'C', 'Letter L', NULL, 3),
    (v_q06, 'D', 'Letter M', NULL, 4);

  -- Q07: Insects and Arthropods
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Insects and Arthropods', 'syllogism'::dm_question_type, 'All butterflies are insects. All insects are arthropods. Some arthropods live in water.', NULL, NULL, NULL, NULL, 7)
  RETURNING id INTO v_q07;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q07, 'All butterflies are arthropods.', 'Yes', 'Transitive: butterflies → insects → arthropods.', 1),
    (v_q07, 'Some butterflies live in water.', 'No', 'Some arthropods live in water, but those may not include insects or butterflies.', 2),
    (v_q07, 'All arthropods are insects.', 'No', 'Reverse of premise 2. Spiders and crabs are arthropods but not insects.', 3),
    (v_q07, 'Some things that live in water are arthropods.', 'Yes', 'Conversion of ''some arthropods live in water.''', 4),
    (v_q07, 'All insects are butterflies.', 'No', 'Reverse of premise 1. Ants and beetles are insects but not butterflies.', 5);

  -- Q08: Restaurant Hygiene Ratings
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Restaurant Hygiene Ratings', 'interpreting_info'::dm_question_type, 'A food safety authority published hygiene scores (out of 100) for five restaurants across four categories.', '{"headers":["Restaurant","Food (%)","Cleanliness (%)","Management (%)","Overall"],"rows":[["The Oak","92","88","95","92"],["Saffron Leaf","78","82","80","80"],["Marina Grill","85","90","75","83"],["Copper Pan","90","85","88","88"],["Elm Tree","70","72","78","73"]]}'::jsonb, NULL, NULL, NULL, 8)
  RETURNING id INTO v_q08;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q08, 'The Oak scored highest in Management.', 'Yes', 'The Oak Management = 95, highest of all.', 1),
    (v_q08, 'Marina Grill scored higher in Cleanliness than in Food.', 'Yes', 'Cleanliness 90 > Food 85.', 2),
    (v_q08, 'Saffron Leaf scored above 80 in every category.', 'No', 'Saffron Leaf Food = 78, which is below 80.', 3),
    (v_q08, 'Elm Tree scored lowest in every category.', 'Yes', 'Food 70, Cleanliness 72, Management 78, Overall 73 — all the lowest.', 4),
    (v_q08, 'The average Overall rating across all restaurants exceeded 85.', 'No', 'Average: (92 + 80 + 83 + 88 + 73) / 5 = 416 / 5 = 83.2, which is below 85.', 5);

  -- Q09: UK Broadband Infrastructure (passage)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'UK Broadband Infrastructure', 'syllogism'::dm_question_type, 'The UK government set a target of delivering gigabit-capable broadband to 85% of premises by 2025, later revised to 2026. By mid-2024, coverage had reached 79%, up from 72% the previous year. Rural areas lagged behind, with only 58% coverage compared to 93% in urban centres. The government''s Project Gigabit allocated £5 billion to subsidise rollout in hard-to-reach areas. BT''s Openreach division committed to reaching 25 million premises with full fibre by 2026. The National Audit Office warned that achieving universal coverage would cost significantly more than budgeted, particularly in remote Scottish Highlands and Welsh valleys. Industry bodies argued that wayleave agreements with landowners were slowing installation by an average of three months per project.', NULL, NULL, NULL, NULL, 9)
  RETURNING id INTO v_q09;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q09, 'Broadband coverage exceeded 80% of premises by mid-2024.', 'No', 'Coverage reached 79%, which is below 80%.', 1),
    (v_q09, 'Rural coverage was more than 30 percentage points behind urban.', 'Yes', '93% − 58% = 35 percentage points, which exceeds 30.', 2),
    (v_q09, 'The government allocated more than £4 billion to Project Gigabit.', 'Yes', '£5 billion, which exceeds £4 billion.', 3),
    (v_q09, 'Openreach aimed to reach 25 million premises by 2025.', 'No', 'The target was by 2026, not 2025.', 4),
    (v_q09, 'Wayleave agreements were identified as delaying broadband installation.', 'Yes', 'Industry bodies argued wayleave agreements were slowing installation by three months.', 5);

  -- Q10: Factory Quality Control
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Factory Quality Control', 'probabilistic'::dm_question_type, 'A factory produces 1,000 widgets daily. 5% are defective. An inspection catches 90% of defective widgets but wrongly flags 3% of non-defective ones.', NULL, NULL, 'B', 'Defective: 1,000 × 0.05 = 50. Correctly flagged: 50 × 0.90 = 45. Not more than 50, so A is wrong. Non-defective: 950. Wrongly flagged: 950 × 0.03 = 28.5. Total flagged: 45 + 28.5 = 73.5 ≈ 74, so B is correct. P(defective | flagged) = 45/73.5 ≈ 61%, so flagged widgets are more likely defective — C is wrong. Missed defective: 50 − 45 = 5, not fewer than 3, so D is wrong.', 10)
  RETURNING id INTO v_q10;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q10, 'A', 'The inspection correctly flags more than 50 defective widgets per day.', NULL, 1),
    (v_q10, 'B', 'Approximately 74 widgets are flagged in total each day.', NULL, 2),
    (v_q10, 'C', 'A flagged widget is more likely to be non-defective than defective.', NULL, 3),
    (v_q10, 'D', 'The inspection misses fewer than 3 defective widgets per day.', NULL, 4);

  -- Q11: Wildlife Documentary Schedule
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Wildlife Documentary Schedule', 'logic_puzzle'::dm_question_type, 'Five documentary episodes — Arctic, Borneo, Congo, Desert, and Estuary — are scheduled to air on consecutive days from Monday to Friday.

• Congo airs on Thursday.
• Arctic airs before Borneo.
• Estuary does not air on a day adjacent to Congo.
• Desert airs on Monday.

Which day does the Estuary episode air?', NULL, NULL, 'B', 'Desert = Monday, Congo = Thursday. Estuary not adjacent to Thursday (not Wednesday or Friday). Estuary ≠ Monday (taken). So Estuary = Tuesday. Remaining: Wednesday and Friday for Arctic and Borneo. Arctic before Borneo → Arctic = Wednesday, Borneo = Friday. ✓', 11)
  RETURNING id INTO v_q11;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q11, 'A', 'Monday', NULL, 1),
    (v_q11, 'B', 'Tuesday', NULL, 2),
    (v_q11, 'C', 'Wednesday', NULL, 3),
    (v_q11, 'D', 'Friday', NULL, 4);

  -- Q12: Mandatory Foreign Language at Primary School
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Mandatory Foreign Language at Primary School', 'strongest_argument'::dm_question_type, 'All primary schools should be required to teach a foreign language from age five.', NULL, NULL, 'A', 'Option A is the strongest argument because it cites specific research linking early language learning (before age 7) to measurable cognitive and academic benefits, directly supporting the age-5 mandate. Option B raises a valid timetable concern but does not engage with the educational benefit. Option C compares to other countries without explaining why age 5 specifically. Option D makes an assumption about retention without evidence.', 12)
  RETURNING id INTO v_q12;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q12, 'A', 'Yes; research shows that children who begin learning a second language before age seven develop stronger cognitive flexibility and perform better across all academic subjects.', NULL, 1),
    (v_q12, 'B', 'No; primary school timetables are already full, and adding a compulsory language would reduce time for core literacy and numeracy.', NULL, 2),
    (v_q12, 'C', 'Yes; the UK lags behind most European countries in language ability, and early exposure would help close this gap.', NULL, 3),
    (v_q12, 'D', 'No; most children will forget what they learn if they do not continue the language into secondary school.', NULL, 4);

  -- Q13: Craft Workshop Materials (venn SELECT)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Craft Workshop Materials', 'venn_diagram'::dm_question_type, 'A craft workshop surveyed 50 members about materials they work with. 8 use Wood only, 6 use Metal only, 4 use Glass only, 5 use Wood and Metal only, 3 use Wood and Glass only, 4 use Metal and Glass only, 6 use all three materials, and 14 use none.

The hexagon represents Wood, the pentagon represents Metal, and the rectangle represents Glass.

Which of the following diagrams best represents the data?', NULL, NULL, 'A', 'From the stem: Wood only = 8, Metal only = 6, Glass only = 4, Wood + Metal = 5, Wood + Glass = 3, Metal + Glass = 4, all three = 6, none = 14. Total = 50. Only option A places every value correctly. B swaps the Wood–Metal and Wood–Glass overlaps. C swaps Wood-only and Metal-only. D swaps the all-three and Metal–Glass values.', 13)
  RETURNING id INTO v_q13;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q13, 'A', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Wood","shape":"hexagon"},{"id":"set2","label":"Metal","shape":"pentagon"},{"id":"set3","label":"Glass","shape":"rectangle"}],"regions":{"set1_only":8,"set2_only":6,"set3_only":4,"set1_set2":5,"set1_set3":3,"set2_set3":4,"all_three":6,"outside":14}}'::jsonb, 1),
    (v_q13, 'B', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Wood","shape":"hexagon"},{"id":"set2","label":"Metal","shape":"pentagon"},{"id":"set3","label":"Glass","shape":"rectangle"}],"regions":{"set1_only":8,"set2_only":6,"set3_only":4,"set1_set2":3,"set1_set3":5,"set2_set3":4,"all_three":6,"outside":14}}'::jsonb, 2),
    (v_q13, 'C', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Wood","shape":"hexagon"},{"id":"set2","label":"Metal","shape":"pentagon"},{"id":"set3","label":"Glass","shape":"rectangle"}],"regions":{"set1_only":6,"set2_only":8,"set3_only":4,"set1_set2":5,"set1_set3":3,"set2_set3":4,"all_three":6,"outside":14}}'::jsonb, 3),
    (v_q13, 'D', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Wood","shape":"hexagon"},{"id":"set2","label":"Metal","shape":"pentagon"},{"id":"set3","label":"Glass","shape":"rectangle"}],"regions":{"set1_only":8,"set2_only":6,"set3_only":4,"set1_set2":5,"set1_set3":3,"set2_set3":6,"all_three":4,"outside":14}}'::jsonb, 4);

  -- Q14: International Freight Costs
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'International Freight Costs', 'interpreting_info'::dm_question_type, 'A comparison site recorded average shipping costs (£) for four freight carriers across three route types.', '{"headers":["Carrier","Domestic (£)","European (£)","Intercontinental (£)"],"rows":[["FastTrack","45","120","380"],["GlobeCargo","55","95","340"],["SwiftPost","40","130","410"],["OceanLine","60","85","290"]]}'::jsonb, NULL, NULL, NULL, 14)
  RETURNING id INTO v_q14;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q14, 'OceanLine had the lowest rate for European shipping.', 'Yes', 'OceanLine European = £85, the lowest of all four carriers.', 1),
    (v_q14, 'FastTrack charged more than GlobeCargo for every route type.', 'No', 'Domestic: FastTrack £45 < GlobeCargo £55.', 2),
    (v_q14, 'SwiftPost had the highest intercontinental rate.', 'Yes', 'SwiftPost = £410, the highest.', 3),
    (v_q14, 'The range of domestic rates was greater than £20.', 'No', 'Range: £60 − £40 = £20. This equals £20 but does not exceed it.', 4),
    (v_q14, 'GlobeCargo offered the lowest intercontinental rate.', 'No', 'OceanLine = £290 is lower than GlobeCargo = £340.', 5);

  -- Q15: Percussion and Strings
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Percussion and Strings', 'syllogism'::dm_question_type, 'No percussion instrument is a string instrument. All violins are string instruments. Some musicians play percussion instruments.', NULL, NULL, NULL, NULL, 15)
  RETURNING id INTO v_q15;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q15, 'No violin is a percussion instrument.', 'Yes', 'Violins are string instruments, and no percussion instrument is a string instrument. By symmetry, no string instrument is a percussion instrument, so no violin is a percussion instrument.', 1),
    (v_q15, 'Some musicians play string instruments.', 'No', 'Some musicians play percussion, but the premises do not establish that any musicians play string instruments.', 2),
    (v_q15, 'All string instruments are violins.', 'No', 'All violins are string instruments — not the reverse. Guitars and cellos are string instruments but not violins.', 3),
    (v_q15, 'Some percussion instruments are violins.', 'No', 'No percussion instrument is a string instrument, and all violins are strings. Therefore no percussion instrument can be a violin.', 4),
    (v_q15, 'All violins are non-percussion instruments.', 'Yes', 'Equivalent to statement 1: no violin is a percussion instrument.', 5);

  -- Q16: Car Park Allocation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Car Park Allocation', 'logic_puzzle'::dm_question_type, 'Four cars — Aston, BMW, Citroën, and Dacia — are parked in spaces numbered 1 to 4 from left to right.

• BMW is in space 3.
• Citroën is not in a space adjacent to BMW.
• Aston is in a lower-numbered space than Dacia.

Which space is the Citroën in?', NULL, NULL, 'A', 'BMW = space 3. Citroën not adjacent to 3 (not space 2 or 4). Citroën = space 1. Remaining spaces 2 and 4 for Aston and Dacia. Aston < Dacia → Aston = 2, Dacia = 4.', 16)
  RETURNING id INTO v_q16;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q16, 'A', 'Space 1', NULL, 1),
    (v_q16, 'B', 'Space 2', NULL, 2),
    (v_q16, 'C', 'Space 3', NULL, 3),
    (v_q16, 'D', 'Space 4', NULL, 4);

  -- Q17: Warehouse Stock Categories (venn INTERPRET)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Warehouse Stock Categories', 'venn_diagram'::dm_question_type, 'The diagram shows warehouse stock categorised by storage type. The rectangle represents Perishable items, the diamond represents Frozen items (these two overlap), and the circle represents Ambient items (separate from the other two). Each letter marks a different region.

Which letter represents items that are Frozen but not Perishable?', NULL, '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Perishable","shape":"rectangle"},{"id":"set2","label":"Frozen","shape":"diamond"},{"id":"set3","label":"Ambient","shape":"circle"}],"regions":{"set1_only":"A","set1_set2":"B","set2_only":"C","set3_only":"D","outside":"E"}}'::jsonb, 'C', 'The diamond represents Frozen. The region inside the diamond but outside the rectangle (Perishable) is marked C — Frozen but not Perishable. Letter A is Perishable only. Letter B is both Perishable and Frozen. Letter D is Ambient only.', 17)
  RETURNING id INTO v_q17;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q17, 'A', 'Letter A', NULL, 1),
    (v_q17, 'B', 'Letter B', NULL, 2),
    (v_q17, 'C', 'Letter C', NULL, 3),
    (v_q17, 'D', 'Letter D', NULL, 4);

  -- Q18: National Park Visitor Numbers
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'National Park Visitor Numbers', 'interpreting_info'::dm_question_type, 'A tourism board recorded visitor numbers (in thousands) for four national parks across four seasons.', '{"headers":["Park","Spring","Summer","Autumn","Winter"],"rows":[["Lake District","285","520","310","180"],["Snowdonia","190","380","220","140"],["Peak District","240","410","265","195"],["Dartmoor","160","290","175","120"]]}'::jsonb, NULL, NULL, NULL, 18)
  RETURNING id INTO v_q18;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q18, 'The Lake District had the most visitors in every season.', 'No', 'Winter: Lake District = 180, Peak District = 195. Peak District had more in Winter.', 1),
    (v_q18, 'Visitor numbers peaked in Summer for every park.', 'Yes', 'Lake District 520, Snowdonia 380, Peak District 410, Dartmoor 290 — all highest in Summer.', 2),
    (v_q18, 'Dartmoor had fewer visitors than Snowdonia in every season.', 'Yes', '160<190, 290<380, 175<220, 120<140.', 3),
    (v_q18, 'Total visitors across all parks exceeded 1500 in Summer.', 'Yes', '520 + 380 + 410 + 290 = 1600.', 4),
    (v_q18, 'Peak District had the second-highest visitor count in every season.', 'No', 'Winter: Peak District = 195 is the HIGHEST (above Lake District = 180). Peak District was first, not second.', 5);

  -- Q19: UK Apprenticeship System (passage)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'UK Apprenticeship System', 'syllogism'::dm_question_type, 'The UK government introduced the Apprenticeship Levy in 2017, requiring all employers with an annual pay bill exceeding £3 million to contribute 0.5% to fund apprenticeship training. Since its introduction, the total number of apprenticeship starts has declined from 494,000 in 2016–17 to 337,000 in 2022–23. Critics argue the levy has disproportionately funded management-level qualifications rather than entry-level training for young people. The government set a target of 3 million apprenticeship starts by 2020, which was not achieved. Supporters maintain that the levy ensures employers invest in skills development rather than relying solely on public funding. A 2023 review recommended allowing levy funds to be spent on a broader range of training, including shorter modular courses. Small businesses, which are exempt from the levy, can access government-funded apprenticeships but report that the application process is overly bureaucratic.', NULL, NULL, NULL, NULL, 19)
  RETURNING id INTO v_q19;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q19, 'The Apprenticeship Levy applies to all UK employers.', 'No', 'It only applies to employers with a pay bill exceeding £3 million.', 1),
    (v_q19, 'Apprenticeship starts have declined since the levy was introduced.', 'Yes', '494,000 to 337,000.', 2),
    (v_q19, 'The government met its target of 3 million apprenticeship starts by 2020.', 'No', 'The target was not achieved.', 3),
    (v_q19, 'Small businesses pay the Apprenticeship Levy.', 'No', 'Small businesses are exempt.', 4),
    (v_q19, 'A 2023 review recommended expanding how levy funds can be used.', 'Yes', 'Recommended spending on a broader range including shorter modular courses.', 5);

  -- Q20: Abolishing Physical Cash
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Abolishing Physical Cash', 'strongest_argument'::dm_question_type, 'The UK should phase out physical cash and move to a fully digital payment system.', NULL, NULL, 'D', 'Option D is the strongest argument because it identifies a systemic vulnerability — a single point of failure — that could paralyse the entire economy, affecting everyone. This is a fundamental structural risk that the proposal cannot easily mitigate. Option B raises a valid social exclusion concern but affects a specific group rather than the whole system. Option A is a reasonable argument for digital payments but does not address the risks. Option C cites a trivial benefit.', 20)
  RETURNING id INTO v_q20;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q20, 'A', 'Yes; digital payments create a complete audit trail, making it significantly harder for criminal organisations to launder money or evade taxes.', NULL, 1),
    (v_q20, 'B', 'No; approximately 1.2 million UK adults do not have a bank account, and a cashless society would exclude them from basic economic participation.', NULL, 2),
    (v_q20, 'C', 'Yes; cashless systems are faster and more hygienic than handling coins and notes.', NULL, 3),
    (v_q20, 'D', 'No; digital payment systems are vulnerable to power outages and cyber attacks, creating a single point of failure that could paralyse the entire economy.', NULL, 4);

  -- Q21: Academic Qualifications (venn SELECT)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Academic Qualifications', 'venn_diagram'::dm_question_type, 'A university surveyed 45 academic staff about their qualifications. All PhD holders are also graduates. 18 are graduates only (without a PhD), 20 have both a graduate degree and a PhD, and 7 hold neither qualification.

The pentagon represents Graduates and the isosceles_triangle (inside the pentagon) represents PhD Holders.

Which of the following diagrams best represents the data?', NULL, NULL, 'A', 'All PhD holders are graduates so the isosceles_triangle sits inside the pentagon. Graduates only = 18, both = 20, neither = 7. Total = 45. Only A is correct. B swaps the graduate-only and both counts. C swaps the both and neither counts. D rotates all values.', 21)
  RETURNING id INTO v_q21;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q21, 'A', '', '{"diagramLayout":"two_nested","sets":[{"id":"set1","label":"Graduates","shape":"pentagon"},{"id":"set2","label":"PhD Holders","shape":"isosceles_triangle"}],"regions":{"set1_only":18,"set1_set2":20,"outside":7}}'::jsonb, 1),
    (v_q21, 'B', '', '{"diagramLayout":"two_nested","sets":[{"id":"set1","label":"Graduates","shape":"pentagon"},{"id":"set2","label":"PhD Holders","shape":"isosceles_triangle"}],"regions":{"set1_only":20,"set1_set2":18,"outside":7}}'::jsonb, 2),
    (v_q21, 'C', '', '{"diagramLayout":"two_nested","sets":[{"id":"set1","label":"Graduates","shape":"pentagon"},{"id":"set2","label":"PhD Holders","shape":"isosceles_triangle"}],"regions":{"set1_only":18,"set1_set2":7,"outside":20}}'::jsonb, 3),
    (v_q21, 'D', '', '{"diagramLayout":"two_nested","sets":[{"id":"set1","label":"Graduates","shape":"pentagon"},{"id":"set2","label":"PhD Holders","shape":"isosceles_triangle"}],"regions":{"set1_only":7,"set1_set2":20,"outside":18}}'::jsonb, 4);

  -- Q22: Gem Auction Results
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Gem Auction Results', 'probabilistic'::dm_question_type, 'At a gem auction, 200 lots are offered. 40% are rubies, 30% are sapphires, and 30% are emeralds. The sell-through rate is 75% for rubies, 50% for sapphires, and 60% for emeralds.', NULL, NULL, 'B', 'Rubies: 80, sold: 60. Sapphires: 60, sold: 30. Emeralds: 60, sold: 36. Total sold: 126, not >130, so A is wrong. Ruby share: 60/126 = 47.6%, less than half, so B is correct. Sapphire rate 50% < emerald rate 60%, so C is wrong. Exactly 30 sapphires sold, not fewer, so D is wrong.', 22)
  RETURNING id INTO v_q22;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q22, 'A', 'More than 130 lots sold in total.', NULL, 1),
    (v_q22, 'B', 'Rubies accounted for less than half of all lots sold.', NULL, 2),
    (v_q22, 'C', 'A higher percentage of sapphires sold than emeralds.', NULL, 3),
    (v_q22, 'D', 'Fewer than 30 sapphires sold.', NULL, 4);

  -- Q23: Bookshelf Organisation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Bookshelf Organisation', 'logic_puzzle'::dm_question_type, 'Five book genres — Art, Biography, Cooking, Drama, and Economics — are placed on shelves 1 to 5, from top to bottom.

• Biography is on shelf 1.
• Art is not on shelf 2.
• Drama is immediately below Cooking.
• Economics is on shelf 5.

Which shelf is Art on?', NULL, NULL, 'C', 'Biography = shelf 1, Economics = shelf 5. Drama immediately below Cooking: (Cooking, Drama) = (2, 3) or (3, 4). If Cooking = 2, Drama = 3: Art fills shelf 4. Art ≠ 2 ✓. If Cooking = 3, Drama = 4: Art fills shelf 2. Art ≠ 2 ✗. Only valid: Biography(1), Cooking(2), Drama(3), Art(4), Economics(5).', 23)
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', 'Shelf 2', NULL, 1),
    (v_q23, 'B', 'Shelf 3', NULL, 2),
    (v_q23, 'C', 'Shelf 4', NULL, 3),
    (v_q23, 'D', 'Shelf 5', NULL, 4);

  -- Q24: UK Flood Defence Spending (passage)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'UK Flood Defence Spending', 'syllogism'::dm_question_type, 'The Environment Agency spent £2.6 billion on flood defence projects between 2021 and 2027, protecting an estimated 336,000 homes. Despite this investment, winter storms in 2023–24 caused flooding in over 4,800 properties across England. The National Infrastructure Commission recommended doubling annual flood defence spending to £1 billion per year by 2030. The government''s Flood Re scheme, introduced in 2016, ensures affordable home insurance for properties in flood-risk areas by pooling risk across all insurers. However, the scheme is set to expire in 2039 and does not cover properties built after 2009. Local authorities have criticised the distribution of funding, arguing that northern communities receive proportionally less than the south-east. The Committee on Climate Change warned that 1.8 million properties in England are at significant risk of flooding.', NULL, NULL, NULL, NULL, 24)
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q24, 'The Environment Agency spent more than £3 billion on flood defences.', 'No', '£2.6 billion, which is less than £3 billion.', 1),
    (v_q24, 'Winter storms in 2023–24 flooded more than 5,000 properties.', 'No', 'Over 4,800, which is fewer than 5,000.', 2),
    (v_q24, 'The Flood Re scheme covers properties built after 2009.', 'No', 'It does not cover properties built after 2009.', 3),
    (v_q24, 'The NIC recommended increasing annual flood spending to £1 billion.', 'Yes', 'Recommended doubling to £1 billion per year by 2030.', 4),
    (v_q24, 'More than 1.5 million properties are at significant flood risk.', 'Yes', '1.8 million, which exceeds 1.5 million.', 5);

  -- Q25: Craft Brewery Production
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Craft Brewery Production', 'interpreting_info'::dm_question_type, 'A craft brewery recorded monthly production output (in hectolitres) for four beer types.', '{"headers":["Beer Type","January","February","March","April"],"rows":[["Pale Ale","120","135","150","145"],["Stout","85","80","95","110"],["IPA","200","210","190","225"],["Lager","160","170","180","175"]]}'::jsonb, NULL, NULL, NULL, 25)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q25, 'IPA had the highest output every month.', 'Yes', '200, 210, 190, 225 — all the highest in their months.', 1),
    (v_q25, 'Stout output increased consistently across all months.', 'No', '85 → 80: decreased from January to February.', 2),
    (v_q25, 'Pale Ale output exceeded Stout in every month.', 'Yes', '120>85, 135>80, 150>95, 145>110.', 3),
    (v_q25, 'Total output was highest in April.', 'Yes', 'Jan: 565, Feb: 595, Mar: 615, Apr: 655. April is highest.', 4),
    (v_q25, 'Lager output peaked in April.', 'No', 'Lager: 160, 170, 180, 175. Peak was March (180), not April (175).', 5);

  -- Q26: Aquarium Fish Types (venn SELECT)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Aquarium Fish Types', 'venn_diagram'::dm_question_type, 'An aquarium surveyed 42 visitors about the fish they keep. 10 keep Tropical only, 7 keep both Tropical and Coldwater, 6 keep Coldwater only, 5 keep both Coldwater and Saltwater, 4 keep Saltwater only, and 10 keep none.

The trapezoid represents Tropical, the oval represents Coldwater, and the diamond represents Saltwater.

Which of the following diagrams best represents the data?', NULL, NULL, 'A', 'Tropical only = 10, Tropical + Coldwater = 7, Coldwater only = 6, Coldwater + Saltwater = 5, Saltwater only = 4, none = 10. Total = 42. Only A is correct. B swaps the two overlap counts. C swaps Tropical-only and Coldwater-only. D swaps Saltwater-only and none.', 26)
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q26, 'A', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Tropical","shape":"rectangle"},{"id":"set2","label":"Coldwater","shape":"oval"},{"id":"set3","label":"Saltwater","shape":"diamond"}],"regions":{"set1_only":10,"set1_set2":7,"set2_only":6,"set2_set3":5,"set3_only":4,"outside":10}}'::jsonb, 1),
    (v_q26, 'B', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Tropical","shape":"rectangle"},{"id":"set2","label":"Coldwater","shape":"oval"},{"id":"set3","label":"Saltwater","shape":"diamond"}],"regions":{"set1_only":10,"set1_set2":5,"set2_only":6,"set2_set3":7,"set3_only":4,"outside":10}}'::jsonb, 2),
    (v_q26, 'C', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Tropical","shape":"rectangle"},{"id":"set2","label":"Coldwater","shape":"oval"},{"id":"set3","label":"Saltwater","shape":"diamond"}],"regions":{"set1_only":6,"set1_set2":7,"set2_only":10,"set2_set3":5,"set3_only":4,"outside":10}}'::jsonb, 3),
    (v_q26, 'D', '', '{"diagramLayout":"three_linear","sets":[{"id":"set1","label":"Tropical","shape":"rectangle"},{"id":"set2","label":"Coldwater","shape":"oval"},{"id":"set3","label":"Saltwater","shape":"diamond"}],"regions":{"set1_only":10,"set1_set2":7,"set2_only":6,"set2_set3":5,"set3_only":10,"outside":4}}'::jsonb, 4);

  -- Q27: Coursework-Only Assessment
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Coursework-Only Assessment', 'strongest_argument'::dm_question_type, 'All school exams should be replaced with continuous coursework assessment.', NULL, NULL, 'B', 'Option B is the strongest argument because it identifies a systemic consequence — loss of standardised comparison — that directly undermines the fairness of university admissions. This affects all students, not just a subgroup. Option A cites a reasonable benefit but the 20% figure is not directly linked to the proposal''s overall merit. Option C makes a logical leap from anecdotal success stories. Option D raises a valid concern but is narrower in scope than B''s systemic impact.', 27)
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', 'Yes; coursework allows students to demonstrate sustained understanding, reducing the impact of exam anxiety which affects an estimated 20% of students.', NULL, 1),
    (v_q27, 'B', 'No; without standardised exams, there would be no reliable way to compare student performance between schools, undermining the fairness of university admissions.', NULL, 2),
    (v_q27, 'C', 'Yes; many successful professionals achieved mediocre exam results, proving exams do not measure real-world ability.', NULL, 3),
    (v_q27, 'D', 'No; coursework is more susceptible to plagiarism and parental assistance, making it harder to verify the work is the student''s own.', NULL, 4);

  -- Q28: Airport Gate Assignment
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Airport Gate Assignment', 'logic_puzzle'::dm_question_type, 'Four flights — Amsterdam, Berlin, Copenhagen, and Dublin — depart from gates 1 to 4.

• Berlin departs from gate 2.
• Copenhagen is not at a gate adjacent to Berlin.
• Dublin departs from a higher-numbered gate than Amsterdam.

Which gate does Dublin depart from?', NULL, NULL, 'C', 'Berlin = gate 2. Copenhagen not adjacent to 2 (not gate 1 or 3). Copenhagen = gate 4. Remaining: gates 1 and 3 for Amsterdam and Dublin. Dublin > Amsterdam → Amsterdam = 1, Dublin = 3.', 28)
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', 'Gate 1', NULL, 1),
    (v_q28, 'B', 'Gate 2', NULL, 2),
    (v_q28, 'C', 'Gate 3', NULL, 3),
    (v_q28, 'D', 'Gate 4', NULL, 4);

  -- Q29: Urban Farming in UK Cities (passage)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Urban Farming in UK Cities', 'syllogism'::dm_question_type, 'Urban farming has expanded rapidly in UK cities, with over 1,000 community growing projects registered by 2024. Research from the University of Sheffield found that urban farms can produce yields comparable to conventional agriculture for certain crops, including salad leaves and herbs. The Greater London Authority invested £1.5 million in a programme to convert disused rooftops and car parks into growing spaces. Proponents argue that urban farming reduces food miles and strengthens community bonds. However, the National Farmers'' Union cautioned that urban farming cannot replace large-scale agriculture, noting that all of London''s rooftop space could supply only approximately 1% of the city''s vegetable demand. Soil contamination from historical industrial use has been identified as a barrier, with 15% of tested urban growing sites exceeding safe lead levels.', NULL, NULL, NULL, NULL, 29)
  RETURNING id INTO v_q29;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q29, 'More than 800 community growing projects were registered by 2024.', 'Yes', 'Over 1,000.', 1),
    (v_q29, 'Urban farms match conventional agriculture for all crop types.', 'No', 'Only for certain crops including salad leaves and herbs.', 2),
    (v_q29, 'The GLA invested more than £2 million in urban growing spaces.', 'No', '£1.5 million.', 3),
    (v_q29, 'London''s rooftops could meet more than 5% of the city''s vegetable demand.', 'No', 'Approximately 1%.', 4),
    (v_q29, 'Some urban growing sites had unsafe lead levels.', 'Yes', '15% exceeded safe lead levels.', 5);

  -- Q30: Train Delay Analysis
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Train Delay Analysis', 'probabilistic'::dm_question_type, 'A rail operator runs 500 trains per day. 8% are delayed. Of delayed trains, 60% are delayed by fewer than 10 minutes. Of non-delayed trains, 2% are incorrectly logged as delayed.', NULL, NULL, 'B', 'Delayed: 500 × 0.08 = 40. Delayed ≥10 min: 40 × 0.40 = 16, not >30, so A is wrong. Non-delayed: 460. Incorrectly logged: 460 × 0.02 = 9.2. Total flagged: 40 + 9.2 = 49.2 ≈ 49, so B is correct. P(actually delayed | flagged) = 40/49.2 ≈ 81.3%, not >90%, so C is wrong. 8% are delayed, not <5%, so D is wrong.', 30)
  RETURNING id INTO v_q30;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q30, 'A', 'More than 30 trains are delayed by 10 minutes or more.', NULL, 1),
    (v_q30, 'B', 'Approximately 49 trains are flagged as delayed in total.', NULL, 2),
    (v_q30, 'C', 'A train flagged as delayed has greater than 90% probability of actually being delayed.', NULL, 3),
    (v_q30, 'D', 'Fewer than 5% of all trains experience any delay.', NULL, 4);

  -- Q31: Regional Cinema Attendance
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Regional Cinema Attendance', 'interpreting_info'::dm_question_type, 'A cinema chain recorded monthly attendance figures across five locations for four film genres.', '{"headers":["Cinema","Action","Comedy","Drama","Horror"],"rows":[["Odeon Central","3200","2800","1900","1400"],["Vue Riverside","2600","3100","2200","1100"],["Cineworld Park","2900","2500","2400","1800"],["Picturehouse","1800","2200","2600","2000"],["Reel Indie","800","950","1500","600"]]}'::jsonb, NULL, NULL, NULL, 31)
  RETURNING id INTO v_q31;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q31, 'Odeon Central had the highest Action attendance.', 'Yes', '3200, the highest.', 1),
    (v_q31, 'Vue Riverside had more Comedy attendees than any other cinema.', 'Yes', '3100, the highest.', 2),
    (v_q31, 'Picturehouse was the only cinema where Drama exceeded Action.', 'No', 'Picturehouse: Drama 2600 > Action 1800. But Reel Indie also: Drama 1500 > Action 800. So Picturehouse was not the only one.', 3),
    (v_q31, 'Reel Indie had the lowest attendance in every genre.', 'Yes', 'Action 800, Comedy 950, Drama 1500, Horror 600 — all lowest.', 4),
    (v_q31, 'Total attendance across all cinemas was highest for Action.', 'No', 'Action total: 11,300. Comedy total: 11,550. Comedy was higher.', 5);

  -- Q32: Wine Tasting Notes (venn INTERPRET)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Wine Tasting Notes', 'venn_diagram'::dm_question_type, 'The diagram shows wines categorised by their tasting notes. The star represents Fruity wines, the parallelogram represents Oaky wines, and the hexagon represents Earthy wines. The shapes are arranged vertically. Each letter marks a different region.

Which letter represents wines that are Oaky but neither Fruity nor Earthy?', NULL, '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"Fruity","shape":"pentagon"},{"id":"set2","label":"Oaky","shape":"parallelogram"},{"id":"set3","label":"Earthy","shape":"hexagon"}],"regions":{"set1_only":"P","set1_set2":"Q","set2_only":"R","set2_set3":"S","set3_only":"T","outside":"U"}}'::jsonb, 'C', 'The parallelogram represents Oaky wines. The region inside the parallelogram but outside both the star (Fruity) and hexagon (Earthy) is marked R — Oaky only. P is Fruity only. Q is Fruity and Oaky. S is Oaky and Earthy.', 32)
  RETURNING id INTO v_q32;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q32, 'A', 'Letter P', NULL, 1),
    (v_q32, 'B', 'Letter Q', NULL, 2),
    (v_q32, 'C', 'Letter R', NULL, 3),
    (v_q32, 'D', 'Letter S', NULL, 4);

  -- Q33: Fossils and Geological Time
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Fossils and Geological Time', 'syllogism'::dm_question_type, 'All fossils are remnants of ancient organisms. Some ancient organisms were marine. No man-made object is a fossil.', NULL, NULL, NULL, NULL, 33)
  RETURNING id INTO v_q33;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q33, 'Some fossils are remnants of marine organisms.', 'No', 'Some ancient organisms were marine, but those may not have left fossils.', 1),
    (v_q33, 'No fossil is man-made.', 'Yes', 'No man-made object is a fossil. By symmetry, no fossil is man-made.', 2),
    (v_q33, 'All remnants of ancient organisms are fossils.', 'No', 'Reverse of premise 1.', 3),
    (v_q33, 'Some marine things are ancient.', 'Yes', 'Some ancient organisms were marine, so some marine things are ancient.', 4),
    (v_q33, 'All man-made objects are non-fossils.', 'Yes', 'Equivalent to no man-made object is a fossil.', 5);

  -- Q34: Architects and Qualification
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'Architects and Qualification', 'syllogism'::dm_question_type, 'All chartered architects have passed professional examinations. No unqualified person has passed professional examinations. Some people who have passed professional examinations also hold a master''s degree.', NULL, NULL, NULL, NULL, 34)
  RETURNING id INTO v_q34;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q34, 'All chartered architects are qualified.', 'Yes', 'Chartered architects have passed exams. No unqualified person has passed exams. So chartered architects must be qualified.', 1),
    (v_q34, 'Some chartered architects hold a master''s degree.', 'No', 'Some exam-passers hold a master''s, but those may not be chartered architects.', 2),
    (v_q34, 'No chartered architect is unqualified.', 'Yes', 'Same as statement 1 rephrased.', 3),
    (v_q34, 'Some people with a master''s degree have passed professional examinations.', 'Yes', 'Some exam-passers hold master''s → some master''s holders have passed exams.', 4),
    (v_q34, 'All qualified people are chartered architects.', 'No', 'Reverse. Many qualified people may not be chartered architects.', 5);

  -- Q35: UK Cycling Infrastructure (passage)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (1, 'UK Cycling Infrastructure', 'syllogism'::dm_question_type, 'Cycling accounted for only 2% of all journeys in England in 2023, compared to 27% in the Netherlands. The government committed £2 billion over five years to build protected cycle lanes in 40 towns and cities under the Gear Change strategy. Transport for London reported a 20% increase in cycling trips after installing segregated lanes on major routes. The Parliamentary Advisory Council for Transport Safety found that 100 cyclists were killed on UK roads in 2023, with lorries involved in 25% of fatalities. Cycling UK argued that the lack of protected infrastructure, not cyclist behaviour, was the primary cause of road deaths. The Active Travel Commissioner recommended reallocating 10% of the roads budget to walking and cycling infrastructure. Motoring groups opposed the reallocation, arguing it would worsen congestion by reducing road capacity.', NULL, NULL, NULL, NULL, 35)
  RETURNING id INTO v_q35;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q35, 'Cycling accounts for more than 5% of journeys in England.', 'No', 'Only 2%.', 1),
    (v_q35, 'The government pledged more than £1 billion for cycling infrastructure.', 'Yes', '£2 billion.', 2),
    (v_q35, 'Segregated cycle lanes in London led to increased cycling.', 'Yes', '20% increase reported.', 3),
    (v_q35, 'Fewer than 80 cyclists were killed on UK roads in 2023.', 'No', '100 cyclists were killed.', 4),
    (v_q35, 'Motoring groups supported reallocating roads budget to cycling.', 'No', 'They opposed it.', 5);

END $$;
