-- Seed: Timed DM Test 4 (test_id = 4)
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
  VALUES (4, 'DM Practice Test 4', 37)
  ON CONFLICT (id) DO NOTHING;

  -- Q01: syllogism - Maritime Signal Flags
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Maritime Signal Flags', 'syllogism'::dm_question_type, 'All maritime signal flags are colour-coded. Some colour-coded items are waterproof. No maritime signal flags are disposable.', NULL, NULL, NULL, NULL, 1)
  RETURNING id INTO v_q01;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q01, 'Some maritime signal flags are waterproof.', 'No', 'All maritime signal flags are colour-coded, and some colour-coded items are waterproof. However, the waterproof colour-coded items may not include any maritime signal flags. We cannot conclude this.', 1),
    (v_q01, 'No disposable items are maritime signal flags.', 'Yes', '''No maritime signal flags are disposable'' is a universal negative, which converts symmetrically: no disposable items are maritime signal flags.', 2),
    (v_q01, 'All colour-coded items are maritime signal flags.', 'No', 'All maritime signal flags are colour-coded — not the reverse. Many colour-coded items (traffic cones, wiring) are not maritime signal flags.', 3),
    (v_q01, 'All maritime signal flags are colour-coded and not disposable.', 'Yes', 'Premise 1 states all maritime signal flags are colour-coded. Premise 3 states no maritime signal flags are disposable. Both properties hold for all maritime signal flags.', 4),
    (v_q01, 'Some waterproof items are colour-coded.', 'Yes', '''Some colour-coded items are waterproof'' converts to ''some waterproof items are colour-coded.'' This follows directly by conversion of a particular affirmative.', 5);

  -- Q02: interpreting_info - Volcanic Ash Monitoring
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Volcanic Ash Monitoring', 'interpreting_info'::dm_question_type, 'A volcanological observatory recorded the concentration of airborne ash (μg/m³) at four monitoring stations over three days following an eruption.', '{"headers":["Station","Day 1","Day 2","Day 3"],"rows":[["Summit","480","350","210"],["Valley","120","180","260"],["Coastal","90","75","60"],["Upwind","30","25","20"]]}'::jsonb, NULL, NULL, NULL, 2)
  RETURNING id INTO v_q02;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q02, 'The Summit station had the highest concentration on every day.', 'No', 'Day 3: Summit = 210, Valley = 260. The Valley station had the highest concentration on Day 3, not the Summit.', 1),
    (v_q02, 'Ash concentration at the Coastal station decreased each day.', 'Yes', 'Coastal: 90 → 75 → 60. Each day is lower than the previous.', 2),
    (v_q02, 'The Valley station''s concentration increased each day.', 'Yes', 'Valley: 120 → 180 → 260. Each day is higher than the previous.', 3),
    (v_q02, 'The total concentration across all stations was highest on Day 1.', 'Yes', 'Day 1: 480 + 120 + 90 + 30 = 720. Day 2: 350 + 180 + 75 + 25 = 630. Day 3: 210 + 260 + 60 + 20 = 550. Day 1 (720) is the highest.', 4),
    (v_q02, 'The Upwind station''s Day 1 concentration was more than double its Day 3 concentration.', 'No', 'Double of Day 3 (20) is 40. Day 1 is 30, which is less than 40. So Day 1 was not more than double Day 3.', 5);

  -- Q03: venn_diagram SELECT - Musical Instrument Skills
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Musical Instrument Skills', 'venn_diagram'::dm_question_type, E'A community centre surveyed 50 members about the instruments they can play. 7 play Piano only, 5 play Guitar only, 4 play Drums only, 6 play Piano and Guitar only, 3 play Piano and Drums only, 4 play Guitar and Drums only, 8 play all three instruments, and 13 play none.\n\nThe circle represents Piano, the pentagon represents Guitar, and the star represents Drums.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'From the stem: Piano only = 7, Guitar only = 5, Drums only = 4, Piano + Guitar = 6, Piano + Drums = 3, Guitar + Drums = 4, all three = 8, none = 13. Total = 50. Only option A places every value correctly. Option B swaps the Piano–Guitar and Piano–Drums overlaps. Option C swaps the Piano-only and Guitar-only counts. Option D swaps the Guitar–Drums overlap with the all-three centre.', 3)
  RETURNING id INTO v_q03;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q03, 'A', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Piano","shape":"circle"},{"id":"set2","label":"Guitar","shape":"pentagon"},{"id":"set3","label":"Drums","shape":"star"}],"regions":{"set1_only":7,"set2_only":5,"set3_only":4,"set1_set2":6,"set1_set3":3,"set2_set3":4,"all_three":8,"outside":13}}'::jsonb, 1),
    (v_q03, 'B', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Piano","shape":"circle"},{"id":"set2","label":"Guitar","shape":"pentagon"},{"id":"set3","label":"Drums","shape":"star"}],"regions":{"set1_only":7,"set2_only":5,"set3_only":4,"set1_set2":3,"set1_set3":6,"set2_set3":4,"all_three":8,"outside":13}}'::jsonb, 2),
    (v_q03, 'C', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Piano","shape":"circle"},{"id":"set2","label":"Guitar","shape":"pentagon"},{"id":"set3","label":"Drums","shape":"star"}],"regions":{"set1_only":5,"set2_only":7,"set3_only":4,"set1_set2":6,"set1_set3":3,"set2_set3":4,"all_three":8,"outside":13}}'::jsonb, 3),
    (v_q03, 'D', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Piano","shape":"circle"},{"id":"set2","label":"Guitar","shape":"pentagon"},{"id":"set3","label":"Drums","shape":"star"}],"regions":{"set1_only":7,"set2_only":5,"set3_only":4,"set1_set2":6,"set1_set3":3,"set2_set3":8,"all_three":4,"outside":13}}'::jsonb, 4);

  -- Q04: logic_puzzle - Telescope Observation Schedule
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Telescope Observation Schedule', 'logic_puzzle'::dm_question_type, E'Five astronomers — Clarke, Diaz, Frost, Gupta, and Holt — each have one observation slot on a telescope across five consecutive nights (Monday to Friday).\n\n• Clarke observes on Monday.\n• Gupta observes the night immediately before Holt.\n• Frost does not observe on a night adjacent to Clarke''s.\n• Diaz observes later in the week than Frost.\n\nOn which night does Frost observe?', NULL, NULL, 'C', E'Clarke = Monday. Frost ≠ Tuesday (adjacent to Monday). Gupta–Holt consecutive (Gupta then Holt). Diaz > Frost. Remaining: Diaz, Frost, Gupta, Holt in {Tue, Wed, Thu, Fri}. Frost ∈ {Wed, Thu, Fri}. If Frost = Wed: Diaz ∈ {Thu, Fri}. Gupta–Holt pair from remaining must be consecutive. Only pair is (Thu, Fri), so Gupta = Thu, Holt = Fri, Diaz = Tue. But Diaz > Frost requires Diaz > Wed; Tue < Wed. ✗ If Frost = Thu: Diaz = Fri. Gupta, Holt ∈ {Tue, Wed}. Gupta = Tue, Holt = Wed. Consecutive ✓. All constraints satisfied. ✓ If Frost = Fri: Diaz > Fri is impossible. ✗ Only valid: Clarke(Mon), Gupta(Tue), Holt(Wed), Frost(Thu), Diaz(Fri).', 4)
  RETURNING id INTO v_q04;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q04, 'A', 'Tuesday', NULL, 1),
    (v_q04, 'B', 'Wednesday', NULL, 2),
    (v_q04, 'C', 'Thursday', NULL, 3),
    (v_q04, 'D', 'Friday', NULL, 4);

  -- Q05: strongest_argument - Congestion Pricing in UK Cities
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Congestion Pricing in UK Cities', 'strongest_argument'::dm_question_type, 'All UK cities with populations exceeding 100,000 should introduce congestion charging zones.', NULL, NULL, 'A', 'Option A is the strongest argument because it cites a specific, real-world example — Transport for London — with quantified outcomes: a 30% traffic reduction and £230 million in revenue reinvested in public transport. This directly and specifically supports the proposal. Option B raises a narrow concern about elderly drivers navigating payment systems, which could be addressed through design improvements rather than abandoning the policy. Option C makes a vague appeal without evidence or specifics. Option D raises a plausible but unquantified concern about retail impact that does not address the core transport and environmental benefits.', 5)
  RETURNING id INTO v_q05;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q05, 'A', 'Yes; Transport for London''s congestion charge reduced traffic volumes by 30% in the central zone within its first year and generated over £230 million annually that was reinvested in public transport improvements.', NULL, 1),
    (v_q05, 'B', 'No; some elderly drivers may find it confusing to navigate the payment systems required for congestion zones.', NULL, 2),
    (v_q05, 'C', 'Yes; reducing traffic would mean fewer cars on the road, which most people would agree is a positive change.', NULL, 3),
    (v_q05, 'D', 'No; congestion charges might discourage people from visiting city centre shops, harming local businesses.', NULL, 4);

  -- Q06: probabilistic - Warehouse Inventory Sampling
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Warehouse Inventory Sampling', 'probabilistic'::dm_question_type, 'A warehouse stores 500 electronic components. 60% are Type A and the rest are Type B. Quality testing found that 10% of Type A components are defective and 25% of Type B components are defective.', NULL, NULL, 'C', 'Type A: 500 × 0.60 = 300. Defective A: 300 × 0.10 = 30. Type B: 500 × 0.40 = 200. Defective B: 200 × 0.25 = 50. Total defective: 30 + 50 = 80. A is wrong: 80/500 = 16%, not more than 20%. B is wrong: 30 < 50, so more defective Type B. C is correct: P(B | defective) = 50/80 = 62.5%, which exceeds 50%. D is wrong: 80 > 70.', 6)
  RETURNING id INTO v_q06;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q06, 'A', 'More than 20% of all components are defective.', NULL, 1),
    (v_q06, 'B', 'There are more defective Type A components than defective Type B components.', NULL, 2),
    (v_q06, 'C', 'If a component is defective, it is more likely to be Type B than Type A.', NULL, 3),
    (v_q06, 'D', 'Fewer than 70 components are defective in total.', NULL, 4);

  -- Q07: syllogism (passage) - UK Coastal Erosion
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'UK Coastal Erosion', 'syllogism'::dm_question_type, E'The Environment Agency estimates that approximately 28% of England''s coastline is affected by erosion, with over 700 properties at risk of loss to the sea within the next 20 years. In Norfolk, the Happisburgh cliff face has retreated by more than 250 metres since 1600, with an average loss of 2 metres per year in recent decades. The government allocated £5.2 billion in flood and coastal erosion risk management funding for the period 2021 to 2027, the largest investment in England''s history. However, local councils reported that only 12% of coastline identified as needing protection has received funded intervention. The Pathfinder programme, launched in 2012, offered support to 15 coastal communities exploring adaptive strategies such as managed retreat. Environmental groups argued that climate change is accelerating erosion rates beyond historical projections, while the National Trust warned that 500 miles of its coastal land is vulnerable.', NULL, NULL, NULL, NULL, 7)
  RETURNING id INTO v_q07;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q07, 'More than a quarter of England''s coastline is affected by erosion.', 'Yes', 'The passage states ''approximately 28%'' is affected. 28% exceeds 25% (a quarter).', 1),
    (v_q07, 'The Happisburgh cliff face has retreated by more than 300 metres since 1600.', 'No', 'The passage states ''more than 250 metres,'' not 300. 250 is less than 300.', 2),
    (v_q07, 'The government invested more than £5 billion in flood and coastal erosion management.', 'Yes', 'The passage states ''£5.2 billion,'' which exceeds £5 billion.', 3),
    (v_q07, 'More than half of the coastline needing protection has received funded intervention.', 'No', 'The passage states ''only 12% of coastline identified as needing protection has received funded intervention.'' 12% is far less than half.', 4),
    (v_q07, 'The Pathfinder programme supported 20 coastal communities.', 'No', 'The passage states the programme ''offered support to 15 coastal communities,'' not 20.', 5);

  -- Q08: interpreting_info - Solar Panel Installation Rates
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Solar Panel Installation Rates', 'interpreting_info'::dm_question_type, 'A renewable energy agency recorded the number of solar panel installations (in thousands) across four UK regions over four quarters.', '{"headers":["Region","Q1","Q2","Q3","Q4"],"rows":[["South East","12.4","15.8","18.2","14.6"],["Midlands","8.6","10.2","11.5","9.8"],["North West","6.3","7.8","9.1","7.4"],["Scotland","4.2","5.6","7.3","5.1"]]}'::jsonb, NULL, NULL, NULL, 8)
  RETURNING id INTO v_q08;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q08, 'The South East had the most installations in every quarter.', 'Yes', 'South East: Q1 = 12.4, Q2 = 15.8, Q3 = 18.2, Q4 = 14.6. All are the highest in their respective quarters.', 1),
    (v_q08, 'Installations in Scotland more than doubled from Q1 to Q3.', 'No', 'Scotland Q1 = 4.2. Double of 4.2 = 8.4. Scotland Q3 = 7.3, which is less than 8.4. Installations did not more than double.', 2),
    (v_q08, 'The total installations across all regions were highest in Q3.', 'Yes', 'Q1: 12.4 + 8.6 + 6.3 + 4.2 = 31.5. Q2: 15.8 + 10.2 + 7.8 + 5.6 = 39.4. Q3: 18.2 + 11.5 + 9.1 + 7.3 = 46.1. Q4: 14.6 + 9.8 + 7.4 + 5.1 = 36.9. Q3 (46.1) is the highest.', 3),
    (v_q08, 'North West installations exceeded Scotland''s in every quarter.', 'Yes', 'Q1: 6.3 > 4.2. Q2: 7.8 > 5.6. Q3: 9.1 > 7.3. Q4: 7.4 > 5.1. North West exceeds Scotland every quarter.', 4),
    (v_q08, 'The Midlands had consistently increasing installations throughout the year.', 'No', 'Midlands: Q1 = 8.6, Q2 = 10.2, Q3 = 11.5, Q4 = 9.8. Installations dropped from Q3 to Q4 (11.5 → 9.8), so the increase was not consistent.', 5);

  -- Q09: venn_diagram INTERPRET - Campus Club Membership
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Campus Club Membership', 'venn_diagram'::dm_question_type, E'The diagram shows students categorised by their club membership. The trapezoid represents Debate Club members and the hexagon represents Robotics Club members. Each letter marks a different region.\n\nWhich letter represents a student who is in the Debate Club but not the Robotics Club?', NULL, '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Debate Club","shape":"trapezoid"},{"id":"set2","label":"Robotics Club","shape":"hexagon"}],"regions":{"set1_only":"P","set2_only":"Q","set1_set2":"R","outside":"S"}}'::jsonb, 'A', 'The trapezoid represents Debate Club (set1) and the hexagon represents Robotics Club (set2). Region P is inside the trapezoid only — Debate Club but not Robotics Club. Letter Q is Robotics only. Letter R is both clubs. Letter S is outside both. The correct answer is A (Letter P).', 9)
  RETURNING id INTO v_q09;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q09, 'A', 'Letter P', NULL, 1),
    (v_q09, 'B', 'Letter Q', NULL, 2),
    (v_q09, 'C', 'Letter R', NULL, 3),
    (v_q09, 'D', 'Letter S', NULL, 4);

  -- Q10: logic_puzzle - Mountain Expedition Team Selection
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Mountain Expedition Team Selection', 'logic_puzzle'::dm_question_type, E'A climbing team must select exactly 3 members from 6 candidates — Anders, Blake, Chen, Drake, Ellis, and Fry — for a mountain expedition.\n\n• If Anders is selected, Chen must also be selected.\n• Blake and Drake cannot both be selected.\n• Ellis must be selected.\n• If Chen is not selected, Fry must be selected.\n\nWhich of the following is a valid team?', NULL, NULL, 'B', 'A: Anders is selected, so Chen must be selected (constraint 1). Chen is not included. ✗ B: Ellis ✓. Anders not selected, so constraint 1 does not apply. Blake included without Drake, so constraint 2 satisfied. Chen is selected, so constraint 4 does not apply. All constraints met. ✓ C: Blake and Drake are both selected. ✗ (constraint 2) D: Anders is selected, so Chen must be selected (constraint 1). Chen is not included. ✗', 10)
  RETURNING id INTO v_q10;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q10, 'A', 'Ellis, Anders, Drake', NULL, 1),
    (v_q10, 'B', 'Ellis, Chen, Blake', NULL, 2),
    (v_q10, 'C', 'Ellis, Blake, Drake', NULL, 3),
    (v_q10, 'D', 'Ellis, Anders, Fry', NULL, 4);

  -- Q11: syllogism - Textile Dye Processes
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Textile Dye Processes', 'syllogism'::dm_question_type, 'All indigo dyes are plant-based. All plant-based dyes are water-soluble. Some water-soluble substances are biodegradable.', NULL, NULL, NULL, NULL, 11)
  RETURNING id INTO v_q11;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q11, 'All indigo dyes are water-soluble.', 'Yes', 'All indigo dyes are plant-based, and all plant-based dyes are water-soluble. By transitive reasoning, all indigo dyes are water-soluble.', 1),
    (v_q11, 'Some biodegradable substances are water-soluble.', 'Yes', '''Some water-soluble substances are biodegradable'' can be converted: some biodegradable substances are water-soluble.', 2),
    (v_q11, 'All water-soluble substances are indigo dyes.', 'No', 'All indigo dyes are water-soluble — not the reverse. Honey and table salt are water-soluble but are not indigo dyes.', 3),
    (v_q11, 'Some indigo dyes are biodegradable.', 'No', 'Some water-soluble substances are biodegradable, but those biodegradable water-soluble substances may not include any indigo dyes. The premises do not establish which water-soluble substances are biodegradable.', 4),
    (v_q11, 'All plant-based dyes are indigo dyes.', 'No', 'All indigo dyes are plant-based — not the reverse. Turmeric and beetroot are plant-based dyes but are not indigo.', 5);

  -- Q12: interpreting_info - Tidal Energy Output
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Tidal Energy Output', 'interpreting_info'::dm_question_type, 'A marine energy agency recorded the electricity output (GWh) from five tidal power stations over four months.', '{"headers":["Station","March","April","May","June"],"rows":[["Swansea","4.2","5.1","5.8","6.3"],["Pentland","7.8","8.2","7.5","8.0"],["Severn","3.6","4.0","4.4","4.8"],["Mersey","2.1","2.5","2.8","3.0"],["Solent","1.5","1.8","2.2","2.4"]]}'::jsonb, NULL, NULL, NULL, 12)
  RETURNING id INTO v_q12;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q12, 'Pentland produced the most electricity every month.', 'Yes', 'Pentland: March = 7.8, April = 8.2, May = 7.5, June = 8.0. All are the highest in their respective months.', 1),
    (v_q12, 'Swansea''s output increased every month.', 'Yes', 'Swansea: 4.2 → 5.1 → 5.8 → 6.3. Each month is higher than the previous.', 2),
    (v_q12, 'Pentland''s output increased every month.', 'No', 'Pentland: April = 8.2, May = 7.5. Output decreased from April to May.', 3),
    (v_q12, 'The combined output of Mersey and Solent exceeded Severn''s output in June.', 'Yes', 'June: Mersey (3.0) + Solent (2.4) = 5.4. Severn = 4.8. 5.4 > 4.8.', 4),
    (v_q12, 'The total output across all stations was highest in April.', 'No', 'March: 19.2. April: 21.6. May: 22.7. June: 24.5. The highest total was in June (24.5), not April.', 5);

  -- Q13: strongest_argument - Mandatory Salary Transparency
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Mandatory Salary Transparency', 'strongest_argument'::dm_question_type, 'All employers with more than 50 staff should be legally required to publish the salary ranges for every job role.', NULL, NULL, 'A', 'Option A is the strongest argument because it cites specific data — a 14.3% gender pay gap from the ONS — and provides international evidence from Denmark and Norway showing a measurable 7% reduction following transparency legislation. This directly and specifically supports the proposal. Option B raises a plausible workplace dynamics concern but does not counter the systemic benefits of transparency. Option C makes a vague appeal to transparency as a principle without providing evidence. Option D asserts a preference for confidentiality without engaging with the documented harms of pay secrecy.', 13)
  RETURNING id INTO v_q13;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q13, 'A', 'Yes; the UK''s Office for National Statistics found that the gender pay gap in 2024 was 14.3% for all employees, and research from countries with transparency laws — including Denmark and Norway — showed the gap narrowed by 7% within five years of implementation.', NULL, 1),
    (v_q13, 'B', 'No; publishing salaries could cause resentment among existing staff who discover colleagues in similar roles earn more.', NULL, 2),
    (v_q13, 'C', 'Yes; everyone deserves to know what others earn because transparency is always a good thing.', NULL, 3),
    (v_q13, 'D', 'No; salary negotiations are a private matter between employer and employee and should remain confidential.', NULL, 4);

  -- Q14: probabilistic - Auction Bidding Outcomes
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Auction Bidding Outcomes', 'probabilistic'::dm_question_type, 'At a vintage car auction, 200 lots were offered. 40% were sold to telephone bidders and the rest to room bidders. Of the telephone bidder purchases, 25% exceeded the pre-auction estimate. Of the room bidder purchases, 50% exceeded the pre-auction estimate.', NULL, NULL, 'B', 'Telephone: 200 × 0.40 = 80. Exceeded: 80 × 0.25 = 20. Room: 200 × 0.60 = 120. Exceeded: 120 × 0.50 = 60. Total exceeded: 20 + 60 = 80. A is wrong: 80/200 = 40%, not more than half. B is correct: room bidders had 60 exceeding lots vs 20 for telephone. C is wrong: total exceeded is 80, not 90. D is wrong: P(telephone | exceeded) = 20/80 = 25%, so it was more likely purchased by a room bidder.', 14)
  RETURNING id INTO v_q14;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q14, 'A', 'More than half of all lots exceeded the pre-auction estimate.', NULL, 1),
    (v_q14, 'B', 'Room bidders purchased more lots that exceeded the estimate than telephone bidders did.', NULL, 2),
    (v_q14, 'C', 'The total number of lots exceeding the estimate was 90.', NULL, 3),
    (v_q14, 'D', 'If a lot exceeded the estimate, it was more likely purchased by a telephone bidder.', NULL, 4);

  -- Q15: venn_diagram SELECT - Vehicle Classification
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Vehicle Classification', 'venn_diagram'::dm_question_type, E'A transport authority categorised 45 vehicles. All Motor Vehicles include Cars as a subset, and all Cars include Electric Cars as a subset. 15 are Motor Vehicles that are not Cars, 18 are Cars that are not Electric, 7 are Electric Cars, and 5 are none of these.\n\nThe rectangle represents Motor Vehicles, the oval represents Cars, and the diamond represents Electric Cars.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'From the stem: Motor Vehicles only (not Cars) = 15, Cars only (not Electric) = 18, Electric Cars = 7, none = 5. Total = 45. Only option A places every value correctly. Option B swaps the Motor-Vehicles-only and Cars-only counts. Option C swaps the Electric Cars and none counts. Option D swaps the Cars-only and Electric Cars counts.', 15)
  RETURNING id INTO v_q15;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q15, 'A', '', '{"diagramLayout":"three_nested","sets":[{"id":"set1","label":"Motor Vehicles","shape":"rectangle"},{"id":"set2","label":"Cars","shape":"oval"},{"id":"set3","label":"Electric Cars","shape":"diamond"}],"regions":{"set1_only":15,"set1_set2":18,"all_three":7,"outside":5}}'::jsonb, 1),
    (v_q15, 'B', '', '{"diagramLayout":"three_nested","sets":[{"id":"set1","label":"Motor Vehicles","shape":"rectangle"},{"id":"set2","label":"Cars","shape":"oval"},{"id":"set3","label":"Electric Cars","shape":"diamond"}],"regions":{"set1_only":18,"set1_set2":15,"all_three":7,"outside":5}}'::jsonb, 2),
    (v_q15, 'C', '', '{"diagramLayout":"three_nested","sets":[{"id":"set1","label":"Motor Vehicles","shape":"rectangle"},{"id":"set2","label":"Cars","shape":"oval"},{"id":"set3","label":"Electric Cars","shape":"diamond"}],"regions":{"set1_only":15,"set1_set2":18,"all_three":5,"outside":7}}'::jsonb, 3),
    (v_q15, 'D', '', '{"diagramLayout":"three_nested","sets":[{"id":"set1","label":"Motor Vehicles","shape":"rectangle"},{"id":"set2","label":"Cars","shape":"oval"},{"id":"set3","label":"Electric Cars","shape":"diamond"}],"regions":{"set1_only":15,"set1_set2":7,"all_three":18,"outside":5}}'::jsonb, 4);

  -- Q16: logic_puzzle - Antique Clock Restoration
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Antique Clock Restoration', 'logic_puzzle'::dm_question_type, E'A clockmaker must restore five antique clocks — a Grandfather, a Mantel, a Carriage, a Cuckoo, and a Bracket clock — one at a time in sequence from first (1st) to last (5th).\n\n• The Mantel clock is restored immediately before the Carriage clock.\n• The Grandfather clock is restored first.\n• The Cuckoo clock is not restored in a position adjacent to the Bracket clock.\n• The Bracket clock is restored before the Cuckoo clock.\n\nIn which position is the Bracket clock restored?', NULL, NULL, 'A', E'Grandfather = 1st. Mantel–Carriage consecutive (Mantel then Carriage). Remaining: Mantel, Carriage, Bracket, Cuckoo in {2, 3, 4, 5}. Bracket < Cuckoo and not adjacent. If Mantel = 2, Carriage = 3: Bracket, Cuckoo ∈ {4, 5}. Bracket = 4, Cuckoo = 5. Adjacent (differ by 1). ✗ If Mantel = 3, Carriage = 4: Bracket, Cuckoo ∈ {2, 5}. Bracket = 2, Cuckoo = 5. Not adjacent (differ by 3). ✓ If Mantel = 4, Carriage = 5: Bracket, Cuckoo ∈ {2, 3}. Bracket = 2, Cuckoo = 3. Adjacent. ✗ Only valid: Grandfather(1), Bracket(2), Mantel(3), Carriage(4), Cuckoo(5).', 16)
  RETURNING id INTO v_q16;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q16, 'A', '2nd', NULL, 1),
    (v_q16, 'B', '3rd', NULL, 2),
    (v_q16, 'C', '4th', NULL, 3),
    (v_q16, 'D', '5th', NULL, 4);

  -- Q17: syllogism (passage) - UK AI Regulation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'UK AI Regulation', 'syllogism'::dm_question_type, E'The UK government published its AI Safety Institute framework in 2024, establishing voluntary codes of practice for companies developing frontier AI models. The Institute, based at Bletchley Park, employs over 100 researchers conducting safety evaluations of advanced AI systems. In contrast to the European Union''s AI Act, which imposes mandatory compliance requirements, the UK''s approach relies on existing regulators — such as the FCA, Ofcom, and the CMA — to apply AI-specific guidance within their sectors. A cross-party parliamentary report recommended that the government legislate to create a statutory duty for developers of the most powerful AI systems to conduct pre-deployment safety testing. The Alan Turing Institute estimated that the UK AI sector contributes £3.7 billion annually to the economy and employs approximately 50,000 people. Critics warned that a purely voluntary framework risks falling behind international standards, while industry groups argued that heavy regulation would drive AI investment to less regulated jurisdictions.', NULL, NULL, NULL, NULL, 17)
  RETURNING id INTO v_q17;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q17, 'The AI Safety Institute is based at Bletchley Park.', 'Yes', 'The passage directly states ''The Institute, based at Bletchley Park.''', 1),
    (v_q17, 'The EU''s approach to AI regulation is voluntary, like the UK''s.', 'No', 'The passage states the EU''s AI Act ''imposes mandatory compliance requirements,'' in contrast to the UK''s voluntary approach.', 2),
    (v_q17, 'The UK AI sector employs more than 40,000 people.', 'Yes', 'The passage states the sector ''employs approximately 50,000 people,'' which exceeds 40,000.', 3),
    (v_q17, 'The parliamentary report recommended voluntary guidelines for AI developers.', 'No', 'The report recommended the government ''legislate to create a statutory duty'' — a legal requirement, not voluntary guidelines.', 4),
    (v_q17, 'The AI Safety Institute employs fewer than 50 researchers.', 'No', 'The passage states the Institute ''employs over 100 researchers,'' which exceeds 50.', 5);

  -- Q18: interpreting_info - Concert Ticket Sales
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Concert Ticket Sales', 'interpreting_info'::dm_question_type, 'A concert promoter recorded ticket sales (in hundreds) for four venues across five months.', '{"headers":["Venue","January","February","March","April","May"],"rows":[["Arena North","32","28","35","40","45"],["City Hall","18","22","20","25","28"],["Pavilion","15","12","18","14","20"],["Riverside","8","10","12","15","18"]]}'::jsonb, NULL, NULL, NULL, 18)
  RETURNING id INTO v_q18;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q18, 'Arena North sold the most tickets every month.', 'Yes', 'Arena North: 32, 28, 35, 40, 45. In every month these are the highest values across all venues.', 1),
    (v_q18, 'Riverside ticket sales increased every month.', 'Yes', 'Riverside: 8 → 10 → 12 → 15 → 18. Each month is higher than the previous.', 2),
    (v_q18, 'Pavilion ticket sales increased every month.', 'No', 'Pavilion: January = 15, February = 12 (decreased). Also March = 18, April = 14 (decreased). Sales did not consistently increase.', 3),
    (v_q18, 'The combined sales of Pavilion and Riverside exceeded City Hall in May.', 'Yes', 'May: Pavilion (20) + Riverside (18) = 38. City Hall = 28. 38 > 28.', 4),
    (v_q18, 'Total sales across all venues were lowest in January.', 'No', 'January: 32 + 18 + 15 + 8 = 73. February: 28 + 22 + 12 + 10 = 72. February (72) is the lowest, not January (73).', 5);

  -- Q19: venn_diagram INTERPRET - Paint Types
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Paint Types', 'venn_diagram'::dm_question_type, E'The diagram shows wall paints categorised by their properties. The square represents Matt paints, the triangle represents Washable paints, and the parallelogram represents Quick-Dry paints. The shapes are arranged vertically with Matt at the top and Quick-Dry at the bottom. Each letter marks a different region.\n\nWhich letter represents a paint that is both Washable and Quick-Dry but not Matt?', NULL, '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"Matt","shape":"square"},{"id":"set2","label":"Washable","shape":"triangle"},{"id":"set3","label":"Quick-Dry","shape":"parallelogram"}],"regions":{"set1_only":"A","set1_set2":"B","set2_only":"C","set2_set3":"D","set3_only":"E","outside":"F"}}'::jsonb, 'C', 'The triangle is Washable (set2) and the parallelogram is Quick-Dry (set3). The region where these two shapes overlap — but outside the square (Matt) — is marked D. This is where paints that are both Washable and Quick-Dry but not Matt belong. Letter B is the Matt–Washable overlap. Letter C is Washable only. Letter E is Quick-Dry only. The correct answer is C (Letter D).', 19)
  RETURNING id INTO v_q19;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q19, 'A', 'Letter B', NULL, 1),
    (v_q19, 'B', 'Letter C', NULL, 2),
    (v_q19, 'C', 'Letter D', NULL, 3),
    (v_q19, 'D', 'Letter E', NULL, 4);

  -- Q20: strongest_argument - Banning Private Jets for Domestic Flights
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Banning Private Jets for Domestic Flights', 'strongest_argument'::dm_question_type, 'Private jets should be banned from operating domestic flights within the UK.', NULL, NULL, 'A', 'Option A is the strongest argument because it cites a specific study with quantified environmental impact — 4.3 tonnes of CO₂ per flight equalling one person''s annual footprint — and identifies a practical alternative (train in under five hours). This directly and specifically supports the ban. Option B makes a vague economic claim without quantifying the contribution or addressing the environmental cost. Option C is a symbolic argument that does not address practical consequences. Option D invokes a broad principle of personal freedom without engaging with the environmental evidence.', 20)
  RETURNING id INTO v_q20;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q20, 'A', 'Yes; a study by the Institute for Policy Research found that a single private jet flight from London to Edinburgh emits 4.3 tonnes of CO₂, roughly equivalent to the average UK resident''s carbon footprint for an entire year, while train alternatives cover the same route in under five hours.', NULL, 1),
    (v_q20, 'B', 'No; wealthy individuals contribute significantly to the economy through spending and should be free to travel as they choose.', NULL, 2),
    (v_q20, 'C', 'Yes; private jets are a symbol of inequality and banning them would send a positive message about fairness.', NULL, 3),
    (v_q20, 'D', 'No; banning private jets would be an infringement on personal freedom and set a worrying precedent for government overreach.', NULL, 4);

  -- Q21: probabilistic - Textile Dye Batch Consistency
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Textile Dye Batch Consistency', 'probabilistic'::dm_question_type, 'A textile factory produces 1,000 metres of fabric per day. 60% is dyed blue and the rest is dyed red. Quality inspectors reject 15% of blue fabric and 30% of red fabric for colour inconsistency.', NULL, NULL, 'B', 'Blue: 1,000 × 0.60 = 600m. Rejected blue: 600 × 0.15 = 90m. Red: 1,000 × 0.40 = 400m. Rejected red: 400 × 0.30 = 120m. Total rejected: 90 + 120 = 210m. A is wrong: 90 < 120, so more red is rejected. B is correct: total is exactly 210. C is wrong: P(blue | rejected) = 90/210 ≈ 42.9%, so rejected fabric is more likely red. D is wrong: 210/1,000 = 21%, not more than 25%.', 21)
  RETURNING id INTO v_q21;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q21, 'A', 'More blue fabric is rejected than red fabric.', NULL, 1),
    (v_q21, 'B', 'The total rejected fabric is exactly 210 metres.', NULL, 2),
    (v_q21, 'C', 'If fabric is rejected, it is more likely to be blue than red.', NULL, 3),
    (v_q21, 'D', 'More than 25% of all fabric is rejected.', NULL, 4);

  -- Q22: logic_puzzle - Research Laboratory Assignment
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Research Laboratory Assignment', 'logic_puzzle'::dm_question_type, E'Five researchers — Palmer, Quinn, Russo, Shaw, and Tan — each work in a different laboratory numbered 1 to 5.\n\n• Palmer works in Lab 1.\n• Quinn works in a higher-numbered lab than Russo.\n• Shaw works in Lab 4.\n• Tan does not work in Lab 2.\n• Quinn does not work in Lab 3.\n\nWhat lab does Quinn work in?', NULL, NULL, 'D', 'Palmer = Lab 1, Shaw = Lab 4. Remaining: Quinn, Russo, Tan in {2, 3, 5}. Quinn ≠ Lab 3, so Quinn ∈ {2, 5}. Tan ≠ Lab 2, so Tan ∈ {3, 5}. If Quinn = 2: Quinn > Russo requires Russo < 2. No remaining lab below 2 exists. ✗ If Quinn = 5: Remaining for Russo and Tan: {2, 3}. Tan ≠ 2 → Tan = 3, Russo = 2. Quinn (5) > Russo (2). ✓ Only valid: Palmer(1), Russo(2), Tan(3), Shaw(4), Quinn(5).', 22)
  RETURNING id INTO v_q22;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q22, 'A', 'Lab 2', NULL, 1),
    (v_q22, 'B', 'Lab 3', NULL, 2),
    (v_q22, 'C', 'Lab 4', NULL, 3),
    (v_q22, 'D', 'Lab 5', NULL, 4);

  -- Q23: syllogism - Handmade Clocks
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Handmade Clocks', 'syllogism'::dm_question_type, 'No handmade clocks use quartz movements. All tower clocks are handmade clocks. Some items using quartz movements are battery-powered.', NULL, NULL, NULL, NULL, 23)
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q23, 'No tower clocks use quartz movements.', 'Yes', 'All tower clocks are handmade, and no handmade clocks use quartz. By transitive reasoning, no tower clocks use quartz movements.', 1),
    (v_q23, 'Some battery-powered items use quartz movements.', 'Yes', '''Some items using quartz movements are battery-powered'' can be converted: some battery-powered items use quartz movements.', 2),
    (v_q23, 'All handmade clocks are tower clocks.', 'No', 'All tower clocks are handmade — not the reverse. A handmade pocket watch is handmade but is not a tower clock.', 3),
    (v_q23, 'Some tower clocks are battery-powered.', 'No', 'The premises link battery-powered items to quartz movements, and tower clocks do not use quartz. There is no connection established between tower clocks and being battery-powered.', 4),
    (v_q23, 'All items that use quartz movements are handmade clocks.', 'No', 'No handmade clocks use quartz movements, so quartz-using items cannot be handmade clocks. This directly contradicts the premise.', 5);

  -- Q24: interpreting_info - Harbour Freight Tonnage
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Harbour Freight Tonnage', 'interpreting_info'::dm_question_type, 'A port authority recorded the monthly freight tonnage (thousands of tonnes) handled at five docks across five months.', '{"headers":["Dock","January","February","March","April","May"],"rows":[["Alpha","48","52","55","60","58"],["Bravo","35","38","42","45","50"],["Charlie","22","25","20","28","30"],["Delta","15","18","22","20","25"],["Echo","10","12","15","18","22"]]}'::jsonb, NULL, NULL, NULL, 24)
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q24, 'Alpha handled the most freight every month.', 'Yes', 'Alpha: 48, 52, 55, 60, 58. All are the highest values in their respective months.', 1),
    (v_q24, 'Bravo''s freight tonnage increased every month.', 'Yes', 'Bravo: 35 → 38 → 42 → 45 → 50. Each month is higher than the previous.', 2),
    (v_q24, 'Charlie''s freight tonnage increased every month.', 'No', 'Charlie: February = 25, March = 20. Tonnage decreased from February to March.', 3),
    (v_q24, 'The total freight across all docks exceeded 150 in every month.', 'No', 'January: 48 + 35 + 22 + 15 + 10 = 130. This is below 150.', 4),
    (v_q24, 'Echo''s May tonnage was more than double its January tonnage.', 'Yes', 'Echo: January = 10, May = 22. Double of 10 = 20. 22 > 20, so May tonnage was more than double January.', 5);

  -- Q25: venn_diagram SELECT - Gemstone Cuts
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Gemstone Cuts', 'venn_diagram'::dm_question_type, E'A jewellery workshop categorised 35 gemstones by their cut type. 12 have a Brilliant cut only, 8 have an Emerald cut only, 10 have both Brilliant and Emerald cuts, and 5 have neither cut.\n\nThe isosceles_triangle represents Brilliant cut and the octagon represents Emerald cut.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'From the stem: Brilliant only = 12, Emerald only = 8, both = 10, neither = 5. Total = 35. Only option A places every value correctly. Option B swaps the Brilliant-only and Emerald-only counts. Option C swaps the overlap count with the neither count. Option D swaps the Brilliant-only and overlap counts.', 25)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q25, 'A', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Brilliant","shape":"isosceles_triangle"},{"id":"set2","label":"Emerald","shape":"octagon"}],"regions":{"set1_only":12,"set2_only":8,"set1_set2":10,"outside":5}}'::jsonb, 1),
    (v_q25, 'B', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Brilliant","shape":"isosceles_triangle"},{"id":"set2","label":"Emerald","shape":"octagon"}],"regions":{"set1_only":8,"set2_only":12,"set1_set2":10,"outside":5}}'::jsonb, 2),
    (v_q25, 'C', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Brilliant","shape":"isosceles_triangle"},{"id":"set2","label":"Emerald","shape":"octagon"}],"regions":{"set1_only":12,"set2_only":8,"set1_set2":5,"outside":10}}'::jsonb, 3),
    (v_q25, 'D', '', '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Brilliant","shape":"isosceles_triangle"},{"id":"set2","label":"Emerald","shape":"octagon"}],"regions":{"set1_only":10,"set2_only":8,"set1_set2":12,"outside":5}}'::jsonb, 4);

  -- Q26: syllogism (passage) - UK Rail Nationalisation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'UK Rail Nationalisation', 'syllogism'::dm_question_type, E'Great British Railways (GBR) was formally established in 2024 as a new public sector body to oversee England''s rail network, fulfilling a manifesto commitment to bring train operations under public ownership. The first operator to transition was LNER, which had already been government-run since 2018 after the failure of the Virgin Trains East Coast franchise. The Department for Transport estimated that full nationalisation would save approximately £1.5 billion per year in fees previously paid to private operators. However, the Rail Delivery Group argued that private operators had invested £1.1 billion in new rolling stock since 2015 and that service quality had improved by 12% on customer satisfaction metrics. Under the new model, GBR will control timetabling, ticketing, and revenue, while Network Rail continues to manage tracks and infrastructure. Trade unions representing 60,000 rail workers supported nationalisation but demanded binding commitments on staffing levels and pay.', NULL, NULL, NULL, NULL, 26)
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q26, 'LNER was the first operator to transition to public ownership under GBR.', 'Yes', 'The passage directly states ''The first operator to transition was LNER.''', 1),
    (v_q26, 'Full nationalisation is estimated to cost the government £1.5 billion per year.', 'No', 'The passage states nationalisation would ''save approximately £1.5 billion per year,'' not cost. This is a precision trap testing save versus cost.', 2),
    (v_q26, 'Private operators invested more than £1 billion in rolling stock since 2015.', 'Yes', 'The passage states ''£1.1 billion in new rolling stock since 2015,'' which exceeds £1 billion.', 3),
    (v_q26, 'GBR will manage both train operations and track infrastructure.', 'No', 'GBR will control timetabling, ticketing, and revenue (operations), but Network Rail continues to manage tracks and infrastructure.', 4),
    (v_q26, 'Trade unions representing rail workers opposed nationalisation.', 'No', 'The passage states unions ''supported nationalisation'' — they supported it, not opposed it.', 5);

  -- Q27: logic_puzzle - Ferry Loading Sequence
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Ferry Loading Sequence', 'logic_puzzle'::dm_question_type, E'Six vehicles — a Bus, a Caravan, a Delivery van, an Estate car, a Fire engine, and a Go-kart trailer — board a ferry in a single file queue from position 1 (first to board) to position 6 (last).\n\n• The Fire engine boards first.\n• The Bus boards immediately after the Estate car.\n• The Delivery van boards in position 5.\n• The Caravan does not board in a position adjacent to the Delivery van.\n• The Go-kart trailer boards after the Caravan.\n\nIn which position does the Caravan board?', NULL, NULL, 'A', E'Fire engine = 1st, Delivery = 5th. Estate–Bus consecutive (Estate then Bus). Caravan not adjacent to Delivery(5), so Caravan ≠ 4 and ≠ 6. Remaining: Bus, Caravan, Estate, Go-kart in {2, 3, 4, 6}. Caravan ∈ {2, 3}. If Caravan = 2: remaining {3, 4, 6} for Estate, Bus, Go-kart. Estate–Bus pair: (3, 4). Go-kart = 6. Caravan(2) < Go-kart(6). ✓ If Caravan = 3: remaining {2, 4, 6}. Estate–Bus pair: (2, 3) — 3 is taken. (4, 5) — 5 is Delivery. (4, 6) — not consecutive. No valid pair. ✗ Only valid: Fire(1), Caravan(2), Estate(3), Bus(4), Delivery(5), Go-kart(6).', 27)
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', '2nd', NULL, 1),
    (v_q27, 'B', '3rd', NULL, 2),
    (v_q27, 'C', '4th', NULL, 3),
    (v_q27, 'D', '5th', NULL, 4);

  -- Q28: interpreting_info - Timber Mill Output
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Timber Mill Output', 'interpreting_info'::dm_question_type, 'A timber mill recorded the volume of processed timber (cubic metres) by wood type across four quarters.', '{"headers":["Wood Type","Q1","Q2","Q3","Q4"],"rows":[["Oak","420","380","450","510"],["Pine","680","720","650","700"],["Beech","250","280","310","290"],["Ash","150","140","160","170"]]}'::jsonb, NULL, NULL, NULL, 28)
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q28, 'Pine had the highest output every quarter.', 'Yes', 'Pine: Q1 = 680, Q2 = 720, Q3 = 650, Q4 = 700. All are the highest in their respective quarters.', 1),
    (v_q28, 'Oak''s output increased every quarter.', 'No', 'Oak: Q1 = 420, Q2 = 380. Output decreased from Q1 to Q2.', 2),
    (v_q28, 'Ash had the lowest output every quarter.', 'Yes', 'Ash: Q1 = 150, Q2 = 140, Q3 = 160, Q4 = 170. All are the lowest in their respective quarters.', 3),
    (v_q28, 'The total output of Oak and Ash exceeded Beech in every quarter.', 'Yes', 'Q1: 420 + 150 = 570 > 250. Q2: 380 + 140 = 520 > 280. Q3: 450 + 160 = 610 > 310. Q4: 510 + 170 = 680 > 290. Oak + Ash exceeds Beech every quarter.', 4),
    (v_q28, 'The range of Pine''s quarterly output (highest minus lowest) exceeded 100 cubic metres.', 'No', 'Pine''s highest is 720 (Q2) and lowest is 650 (Q3). Range = 720 − 650 = 70, which is less than 100.', 5);

  -- Q29: venn_diagram INTERPRET - Transport Modes
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Transport Modes', 'venn_diagram'::dm_question_type, E'The diagram shows commuters categorised by their regular transport modes. The oval represents Bus users, the square represents Train users, and the hexagon represents Cyclists. The Bus and Train shapes overlap, but the Cycling shape is separate from both. Each letter marks a different region.\n\nWhich letter represents a commuter who uses both Bus and Train?', NULL, '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Bus","shape":"oval"},{"id":"set2","label":"Train","shape":"square"},{"id":"set3","label":"Cycling","shape":"hexagon"}],"regions":{"set1_only":"J","set1_set2":"K","set2_only":"L","set3_only":"M","outside":"N"}}'::jsonb, 'B', 'The oval represents Bus (set1) and the square represents Train (set2). Their overlap region is marked K. This is where commuters who use both Bus and Train belong. Letter J is Bus only. Letter L is Train only. Letter M is Cycling only (separate shape). The correct answer is B (Letter K).', 29)
  RETURNING id INTO v_q29;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q29, 'A', 'Letter J', NULL, 1),
    (v_q29, 'B', 'Letter K', NULL, 2),
    (v_q29, 'C', 'Letter L', NULL, 3),
    (v_q29, 'D', 'Letter M', NULL, 4);

  -- Q30: syllogism - Cartographic Standards
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Cartographic Standards', 'syllogism'::dm_question_type, 'Some nautical charts are hand-drawn. All hand-drawn documents require archival storage. No digital file is hand-drawn.', NULL, NULL, NULL, NULL, 30)
  RETURNING id INTO v_q30;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q30, 'Some nautical charts require archival storage.', 'Yes', 'Some nautical charts are hand-drawn, and all hand-drawn documents require archival storage. Therefore those hand-drawn nautical charts require archival storage.', 1),
    (v_q30, 'All hand-drawn documents are nautical charts.', 'No', 'Only ''some'' nautical charts are hand-drawn — not the reverse. Sketches and manuscripts are hand-drawn but are not nautical charts.', 2),
    (v_q30, 'No digital file requires archival storage.', 'No', 'Digital files are not hand-drawn, but the premises only state that hand-drawn documents require archival storage — not that only hand-drawn documents do. Digital files may require archival storage for other reasons.', 3),
    (v_q30, 'Some documents requiring archival storage are hand-drawn.', 'Yes', 'All hand-drawn documents require archival storage, and hand-drawn documents exist (some nautical charts are hand-drawn). Therefore some archival documents are hand-drawn.', 4),
    (v_q30, 'No digital file is a nautical chart.', 'No', 'Digital files are not hand-drawn, but only some nautical charts are hand-drawn. Other nautical charts may be digital. The premises do not exclude digital nautical charts.', 5);

  -- Q31: strongest_argument - Mandatory Four-Day School Week
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Mandatory Four-Day School Week', 'strongest_argument'::dm_question_type, 'All UK primary schools should move to a four-day school week.', NULL, NULL, 'B', 'Option B is the strongest argument because it quantifies the loss — a 20% reduction in teaching hours — and cites specific research from the Education Policy Institute showing a 0.4 standard deviation decline in academic performance. This directly challenges the core purpose of schooling. Option A makes a vague parental belief claim without evidence. Option C focuses on teacher wellbeing rather than educational outcomes. Option D raises a practical concern but does not address the educational impact of reduced hours.', 31)
  RETURNING id INTO v_q31;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q31, 'A', 'Yes; children would have more time for play and relaxation, which many parents believe is important.', NULL, 1),
    (v_q31, 'B', 'No; a four-day week would reduce teaching hours by 20%, and the Education Policy Institute estimated that students in schools with shortened weeks scored 0.4 standard deviations lower in reading and maths assessments compared to five-day peers.', NULL, 2),
    (v_q31, 'C', 'Yes; teachers deserve a better work-life balance and would be happier working four days.', NULL, 3),
    (v_q31, 'D', 'No; it would cause childcare difficulties for working parents.', NULL, 4);

  -- Q32: probabilistic - Traffic Light Signal Patterns
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Traffic Light Signal Patterns', 'probabilistic'::dm_question_type, 'A traffic monitoring system recorded data over 500 junctions. 70% of junctions use adaptive signal timing and the rest use fixed timing. Of the junctions with adaptive timing, 8% experienced congestion during peak hours. Of the junctions with fixed timing, 28% experienced congestion during peak hours.', NULL, NULL, 'B', 'Adaptive: 500 × 0.70 = 350. Congested adaptive: 350 × 0.08 = 28. Fixed: 500 × 0.30 = 150. Congested fixed: 150 × 0.28 = 42. Total congested: 28 + 42 = 70. A is wrong: 28 > 20. B is correct: P(fixed | congested) = 42/70 = 60%, which exceeds 50%. C is wrong: 70/500 = 14%, not more than 20%. D is wrong: 42/28 = 1.5, not exactly twice.', 32)
  RETURNING id INTO v_q32;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q32, 'A', 'Fewer than 20 junctions with adaptive timing experienced congestion.', NULL, 1),
    (v_q32, 'B', 'If a junction experienced congestion, it was more likely to use fixed timing.', NULL, 2),
    (v_q32, 'C', 'More than 20% of all junctions experienced congestion.', NULL, 3),
    (v_q32, 'D', 'The number of congested fixed-timing junctions was exactly twice the number of congested adaptive junctions.', NULL, 4);

  -- Q33: syllogism (passage) - UK Organ Transplant Waiting Lists
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'UK Organ Transplant Waiting Lists', 'syllogism'::dm_question_type, E'NHS Blood and Transplant reported that 7,000 patients were on the organ transplant waiting list in England at the start of 2025, a decrease from 7,600 in 2023. Despite improvements, approximately 400 patients die each year while waiting for a suitable organ. The Organ Donation (Deemed Consent) Act 2020 introduced an opt-out system in England, meaning all adults are presumed to consent to donation unless they specifically opt out. Since the law''s introduction, the opt-out register has recorded 2.8 million entries. Living donor transplants accounted for approximately 30% of all kidney transplants performed in 2024. The Human Tissue Authority reported that 4,600 transplant operations were carried out in 2024, the highest annual figure on record. Wales, which implemented its own opt-out system in 2015, reported a 36% increase in deceased donor consent rates in the first five years.', NULL, NULL, NULL, NULL, 33)
  RETURNING id INTO v_q33;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q33, 'The transplant waiting list grew between 2023 and 2025.', 'No', 'The passage states the list was 7,600 in 2023 and 7,000 in 2025 — a decrease, not growth.', 1),
    (v_q33, 'More than 300 patients die annually while waiting for a transplant.', 'Yes', 'The passage states ''approximately 400 patients die each year,'' which exceeds 300.', 2),
    (v_q33, 'The opt-out system means all adults must donate their organs.', 'No', 'Adults are ''presumed to consent unless they specifically opt out.'' They can refuse — it is not mandatory donation.', 3),
    (v_q33, 'More than 4,000 transplant operations were carried out in 2024.', 'Yes', 'The passage states ''4,600 transplant operations,'' which exceeds 4,000.', 4),
    (v_q33, 'Wales''s opt-out system led to a 36% increase in donor consent rates.', 'Yes', 'The passage states Wales ''reported a 36% increase in deceased donor consent rates in the first five years.''', 5);

  -- Q34: syllogism - Trade Tariffs
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'Trade Tariffs', 'syllogism'::dm_question_type, 'All imported goods are subject to customs checks. No domestic products are subject to customs checks. Some luxury items are imported goods.', NULL, NULL, NULL, NULL, 34)
  RETURNING id INTO v_q34;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q34, 'Some luxury items are subject to customs checks.', 'Yes', 'Some luxury items are imported, and all imported goods are subject to customs checks. Therefore those imported luxury items are subject to customs checks.', 1),
    (v_q34, 'No domestic products are imported goods.', 'Yes', 'If a product were both domestic and imported, it would both be subject to customs checks (premise 1) and not subject to customs checks (premise 2) — a contradiction. Therefore no product can be both.', 2),
    (v_q34, 'All goods subject to customs checks are luxury items.', 'No', 'All imported goods have customs checks, but only some luxury items are imported. Many non-luxury imported goods also face customs checks.', 3),
    (v_q34, 'All luxury items are imported goods.', 'No', 'The premise states only ''some'' luxury items are imported. Others may be domestically produced.', 4),
    (v_q34, 'Some goods subject to customs checks are luxury items.', 'Yes', 'Some luxury items are imported (premise 3), and all imports face customs checks (premise 1). Therefore some customs-checked goods are luxury items.', 5);

  -- Q35: syllogism (passage) - UK Childcare Costs
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (4, 'UK Childcare Costs', 'syllogism'::dm_question_type, E'The average cost of a full-time nursery place for a child under two in England reached £14,800 per year in 2024, according to the Coram Family and Childcare Survey. This represents more than a third of the median full-time salary after tax. The government expanded its free childcare offer to include 30 hours per week for all children from nine months old, with full rollout beginning in September 2025. Early years providers warned that the government funding rate of £11.22 per hour does not cover their operating costs, which average £13.40 per hour. Ofsted reported that 5,000 childcare providers closed in the year to March 2024. Research from the Institute for Fiscal Studies found that mothers who accessed free childcare hours were 8 percentage points more likely to return to work than those who did not. The Children''s Commissioner recommended that the government extend funded hours to cover year-round care, noting that the current term-time model creates gaps that force parents to fund additional provision privately.', NULL, NULL, NULL, NULL, 35)
  RETURNING id INTO v_q35;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q35, 'Average nursery costs for under-twos exceeded £15,000 per year.', 'No', 'The passage states the average cost ''reached £14,800 per year,'' which is below £15,000.', 1),
    (v_q35, 'The government funding rate covers providers'' average operating costs.', 'No', 'The funding rate is £11.22 per hour, but operating costs average £13.40 per hour. The rate does not cover costs.', 2),
    (v_q35, 'More than 4,000 childcare providers closed in the year to March 2024.', 'Yes', 'The passage states ''5,000 childcare providers closed,'' which exceeds 4,000.', 3),
    (v_q35, 'Mothers with access to free childcare were more likely to return to work.', 'Yes', 'The passage states they were ''8 percentage points more likely to return to work.''', 4),
    (v_q35, 'The Children''s Commissioner recommended extending funded hours to year-round care.', 'Yes', 'The passage directly states the Commissioner ''recommended that the government extend funded hours to cover year-round care.''', 5);

END $$;
