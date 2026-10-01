-- ============================================================
-- Fix DM test quality issues across all 4 tests
-- 1. Fix venn stems (remove shape explanations)
-- 2. Add Yes/No instruction to statement-based questions
-- 3. Fix shape pairings in tests 2 and 3
-- 4. Replace duplicate Chocolate question (test 2)
-- 5. Replace logic puzzles for variety (tests 1, 2, 3)
-- 6. Replace detection-pattern probabilistic (test 3)
-- 7. Vary table shapes in test 3
-- ============================================================

-- ============================================================
-- 1. FIX VENN DIAGRAM STEMS (remove shape-to-category text)
-- ============================================================

-- Test 1: Wine Tasting Notes (INTERPRET)
UPDATE timed_decision_making_questions
SET stem = $s$The diagram shows wines categorised by their tasting notes. Each letter marks a different region.

Which letter represents wines that are Oaky but neither Fruity nor Earthy?$s$
WHERE id = '0632f0fa-e890-49e0-9758-315d29414094';

-- Test 1: Warehouse Stock Categories (INTERPRET)
UPDATE timed_decision_making_questions
SET stem = $s$The diagram shows warehouse stock categorised by storage type. Each letter marks a different region.

Which letter represents items that are Frozen but not Perishable?$s$
WHERE id = '0ff085e6-4840-4f5e-92d9-d445cd277fa6';

-- Test 1: Spice Blends (INTERPRET)
UPDATE timed_decision_making_questions
SET stem = $s$The diagram shows dishes categorised by their spice content. Each letter marks a different region.

Which letter represents dishes that contain both Cumin and Paprika?$s$
WHERE id = 'c400dcab-77db-4344-a337-d66f68746004';

-- Test 1: Aquarium Fish Types (SELECT)
UPDATE timed_decision_making_questions
SET stem = $s$An aquarium surveyed 42 visitors about the fish they keep. 10 keep Tropical only, 7 keep both Tropical and Coldwater, 6 keep Coldwater only, 5 keep both Coldwater and Saltwater, 4 keep Saltwater only, and 10 keep none.

Which of the following diagrams best represents the data?$s$
WHERE id = '8072536d-2a27-44a6-b087-16bdff40d29d';

-- Test 2: Photography Styles (SELECT) — keep relationship descriptions, remove shapes
UPDATE timed_decision_making_questions
SET stem = $s$A photography club surveyed 36 members. 8 shoot Portrait only, 5 shoot both Portrait and Landscape, 7 shoot Landscape only, 9 shoot Macro only, and 7 shoot none. Portrait and Landscape overlap, but Macro is separate from both.

Which of the following diagrams best represents the data?$s$
WHERE id = '41926f4d-cc7d-427b-98f6-1578bd4df20b';

-- Test 3: Art Medium (INTERPRET)
UPDATE timed_decision_making_questions
SET stem = $s$The diagram shows artists categorised by the paint media they use. Each letter marks a different region.

Which letter represents artists who use both Oils and Watercolour but not Acrylic?$s$
WHERE id = '19bb54a8-844d-4d2f-9c7e-b9862221426b';

-- Test 3: Town Planning Zones (INTERPRET)
UPDATE timed_decision_making_questions
SET stem = $s$The diagram shows areas of a town categorised by planning zone. Each letter marks a different region.

Which letter represents an area within both the Heritage zone and the Mixed-Use area?$s$
WHERE id = '364a017f-a6fb-470f-81f4-03029e049299';

-- Test 3: Alloy Composition (SELECT)
UPDATE timed_decision_making_questions
SET stem = $s$A metallurgist categorised 44 alloy samples. 15 contain Iron only, 7 contain Chromium only, 12 contain both Iron and Chromium, and 10 contain neither.

Which of the following diagrams best represents the data?$s$
WHERE id = 'bc7697bb-c1ee-40ab-8256-348aad5849c0';

-- Test 4: Gemstone Cuts (SELECT)
UPDATE timed_decision_making_questions
SET stem = $s$A jewellery workshop categorised 35 gemstones by their cut type. 12 have a Brilliant cut only, 8 have an Emerald cut only, 10 have both Brilliant and Emerald cuts, and 5 have neither cut.

Which of the following diagrams best represents the data?$s$
WHERE id = '3aee779d-0ef4-4240-8371-9b3e2ae50ab2';

-- Test 4: Vehicle Classification (SELECT) — keep logical relationships
UPDATE timed_decision_making_questions
SET stem = $s$A transport authority categorised 45 vehicles. All Cars are Motor Vehicles, and all Electric Cars are Cars. 15 are Motor Vehicles that are not Cars, 18 are Cars that are not Electric, 7 are Electric Cars, and 5 are none of these.

Which of the following diagrams best represents the data?$s$
WHERE id = '58741230-f1b3-48f4-ac95-740d601f0fdc';

-- Test 4: Campus Club Membership (INTERPRET)
UPDATE timed_decision_making_questions
SET stem = $s$The diagram shows students categorised by their club membership. Each letter marks a different region.

Which letter represents a student who is in the Debate Club but not the Robotics Club?$s$
WHERE id = '9522e366-8702-4a4d-bfcc-06b99c8af133';

-- Test 4: Transport Modes (INTERPRET) — keep relationship descriptions
UPDATE timed_decision_making_questions
SET stem = $s$The diagram shows commuters categorised by their regular transport modes. Bus and Train users may overlap, but Cycling is separate from both. Each letter marks a different region.

Which letter represents a commuter who uses both Bus and Train?$s$
WHERE id = '9c229408-a7e4-48dd-b96d-4ecf29609809';

-- Test 4: Musical Instrument Skills (SELECT)
UPDATE timed_decision_making_questions
SET stem = $s$A community centre surveyed 50 members about the instruments they can play. 7 play Piano only, 5 play Guitar only, 4 play Drums only, 6 play Piano and Guitar only, 3 play Piano and Drums only, 4 play Guitar and Drums only, 8 play all three instruments, and 13 play none.

Which of the following diagrams best represents the data?$s$
WHERE id = 'a4efee20-c509-4aab-9698-23226bcc7273';

-- Test 4: Paint Types (INTERPRET)
UPDATE timed_decision_making_questions
SET stem = $s$The diagram shows wall paints categorised by their properties. Each letter marks a different region.

Which letter represents a paint that is both Washable and Quick-Dry but not Matt?$s$
WHERE id = 'f9d876ae-0d7f-42a7-b565-5693dfaa7beb';


-- ============================================================
-- 2. ADD YES/NO INSTRUCTION TO ALL STATEMENT-BASED QUESTIONS
-- ============================================================

UPDATE timed_decision_making_questions
SET stem = RTRIM(stem) || chr(10) || chr(10) || $yesno$Select 'Yes' if the conclusion does follow. Select 'No' if the conclusion does not follow.$yesno$
WHERE type IN ('syllogism', 'interpreting_info')
  AND stem NOT LIKE $chk$%Select 'Yes'%$chk$;


-- ============================================================
-- 3. FIX SHAPE PAIRINGS
-- ============================================================

-- Test 2: Textile Properties uses hexagon+star (same as Cheese Ageing)
-- Change to trapezoid+rectangle
UPDATE timed_decision_making_questions
SET stimulus_diagram = '{"sets":[{"id":"set1","label":"Waterproof","shape":"trapezoid"},{"id":"set2","label":"Breathable","shape":"rectangle"}],"regions":{"outside":"Z","set1_only":"W","set1_set2":"X","set2_only":"Y"},"diagramLayout":"two_vertical_overlap"}'::jsonb,
    answer_reason = $s$The trapezoid is Waterproof and the rectangle is Breathable. The overlap region X is inside both shapes — representing fabrics that are both Waterproof and Breathable. W is Waterproof only. Y is Breathable only. Z is neither.$s$
WHERE id = '967054ce-c20c-4092-ba6d-af41d6e50a2d';

-- Test 3: Biological Classification uses rectangle+hexagon+circle (hexagon+circle same as Art Medium)
-- Change to trapezoid+pentagon+oval
-- Option A (correct)
UPDATE timed_decision_making_question_options
SET option_data = '{"sets":[{"id":"set1","label":"Animals","shape":"trapezoid"},{"id":"set2","label":"Vertebrates","shape":"pentagon"},{"id":"set3","label":"Mammals","shape":"oval"}],"regions":{"outside":10,"all_three":15,"set1_only":16,"set1_set2":14},"diagramLayout":"three_nested"}'::jsonb
WHERE id = '9520efd4-a05e-4404-b75f-0d23103f66a1';

-- Option B
UPDATE timed_decision_making_question_options
SET option_data = '{"sets":[{"id":"set1","label":"Animals","shape":"trapezoid"},{"id":"set2","label":"Vertebrates","shape":"pentagon"},{"id":"set3","label":"Mammals","shape":"oval"}],"regions":{"outside":10,"all_three":15,"set1_only":14,"set1_set2":16},"diagramLayout":"three_nested"}'::jsonb
WHERE id = '812412b8-7177-4791-bd14-7a6427e644ac';

-- Option C
UPDATE timed_decision_making_question_options
SET option_data = '{"sets":[{"id":"set1","label":"Animals","shape":"trapezoid"},{"id":"set2","label":"Vertebrates","shape":"pentagon"},{"id":"set3","label":"Mammals","shape":"oval"}],"regions":{"outside":15,"all_three":10,"set1_only":16,"set1_set2":14},"diagramLayout":"three_nested"}'::jsonb
WHERE id = '2744e511-ba12-4367-b11e-4a96c20546c3';

-- Option D
UPDATE timed_decision_making_question_options
SET option_data = '{"sets":[{"id":"set1","label":"Animals","shape":"trapezoid"},{"id":"set2","label":"Vertebrates","shape":"pentagon"},{"id":"set3","label":"Mammals","shape":"oval"}],"regions":{"outside":16,"all_three":15,"set1_only":10,"set1_set2":14},"diagramLayout":"three_nested"}'::jsonb
WHERE id = 'e3029ad1-f053-433e-ad36-b8b496b3105a';


-- ============================================================
-- 4. REPLACE DUPLICATE CHOCOLATE QUESTION (test 2)
-- Chocolate Box Probability (caf69cb8) is identical to Chocolate Selection (afabdf48)
-- Replace with Customs Crate Inspection
-- ============================================================

-- CASCADE on questions FK handles options automatically
DELETE FROM timed_decision_making_questions WHERE id = 'caf69cb8-ec03-40e9-a6c2-d89b231b9630';

INSERT INTO timed_decision_making_questions (id, test_id, title, type, stem, correct_answer, answer_reason, order_index)
VALUES (
  'caf69cb8-ec03-40e9-a6c2-d89b231b9630',
  2,
  'Customs Crate Inspection',
  'probabilistic',
  $s$A warehouse has 15 crates: 6 contain electronics, 5 contain clothing, and 4 contain books. Two crates are selected at random for customs inspection without replacement.$s$,
  'A',
  $s$Electronics: 6. Clothing: 5. Books: 4. Total: 15. A: P(both electronics) = 6/15 × 5/14 = 30/210 = 1/7. Correct. B: P(at least one book) = 1 − P(no book) = 1 − (11/15 × 10/14) = 1 − 110/210 = 100/210 ≈ 47.6%. Not greater than 50%. Wrong. C: P(both books) = 4/15 × 3/14 = 12/210 ≈ 5.7%. Not greater than 10%. Wrong. D: P(no books) = 110/210 ≈ 52.4%. Not greater than 55%. Wrong.$s$,
  30
);

INSERT INTO timed_decision_making_question_options (question_id, label, option_text, order_index) VALUES
('caf69cb8-ec03-40e9-a6c2-d89b231b9630', 'A', 'The probability both contain electronics is 1/7.', 1),
('caf69cb8-ec03-40e9-a6c2-d89b231b9630', 'B', 'The probability of selecting at least one book crate exceeds 50%.', 2),
('caf69cb8-ec03-40e9-a6c2-d89b231b9630', 'C', 'The probability both contain books exceeds 10%.', 3),
('caf69cb8-ec03-40e9-a6c2-d89b231b9630', 'D', 'The probability neither contains books is greater than 55%.', 4);


-- ============================================================
-- 5. REPLACE LOGIC PUZZLES FOR VARIETY
-- ============================================================

-- ── Test 1: Replace Car Park Allocation (linear) with Museum Display Selection (selection) ──

DELETE FROM timed_decision_making_questions WHERE id = '926d8bcc-0b1e-4426-a468-9e2b5765337b';

INSERT INTO timed_decision_making_questions (id, test_id, title, type, stem, correct_answer, answer_reason, order_index)
VALUES (
  '926d8bcc-0b1e-4426-a468-9e2b5765337b',
  1,
  'Museum Display Selection',
  'logic_puzzle',
  $s$A museum curator must choose exactly 3 exhibits from 6 options — Armour, Bones, Coins, Daggers, Engravings, and Fossils — for a display case.

• Armour must be included.
• If Bones is included, Coins must also be included.
• Daggers and Engravings cannot both be included.
• If Fossils is not included, Daggers must be included.

Which of the following is a valid selection?$s$,
  'B',
  $s$A: Armour, Bones, Fossils — Bones is selected, so Coins must be included (constraint 2). Coins is not selected. ✗ B: Armour, Coins, Daggers — Armour ✓. Bones not selected, constraint 2 does not apply. Daggers without Engravings ✓. Fossils not selected, so Daggers must be included ✓. All constraints met. ✓ C: Armour, Daggers, Engravings — Both Daggers and Engravings selected. ✗ (constraint 3) D: Armour, Bones, Engravings — Bones selected, so Coins must be included. Coins not selected. ✗$s$,
  16
);

INSERT INTO timed_decision_making_question_options (question_id, label, option_text, order_index) VALUES
('926d8bcc-0b1e-4426-a468-9e2b5765337b', 'A', 'Armour, Bones, Fossils', 1),
('926d8bcc-0b1e-4426-a468-9e2b5765337b', 'B', 'Armour, Coins, Daggers', 2),
('926d8bcc-0b1e-4426-a468-9e2b5765337b', 'C', 'Armour, Daggers, Engravings', 3),
('926d8bcc-0b1e-4426-a468-9e2b5765337b', 'D', 'Armour, Bones, Engravings', 4);

-- ── Test 2: Replace Tournament Bracket (linear) with Tutor Subject Assignment (assignment) ──

DELETE FROM timed_decision_making_questions WHERE id = '61fe1682-a0cb-460b-ac17-bd4162a39636';

INSERT INTO timed_decision_making_questions (id, test_id, title, type, stem, correct_answer, answer_reason, order_index)
VALUES (
  '61fe1682-a0cb-460b-ac17-bd4162a39636',
  2,
  'Tutor Subject Assignment',
  'logic_puzzle',
  $s$Five tutors — Keane, Lloyd, Morris, Nash, and Owen — each teach exactly one of three subjects: History, Geography, and Languages. At least one tutor teaches each subject.

• Keane and Lloyd teach different subjects.
• Morris teaches Geography.
• Nash and Owen teach the same subject.
• Exactly two tutors teach History.
• Lloyd does not teach Languages.

Which subject does Keane teach?$s$,
  'C',
  $s$Morris = Geography. Nash and Owen teach the same subject. Exactly 2 tutors teach History. Lloyd does not teach Languages, so Lloyd = History or Geography. If Nash = Owen = History: 2 at History ✓. Lloyd cannot also be History (would make 3), so Lloyd = Geography. Keane ≠ Lloyd (Geography). History already has 2 (Nash, Owen), so Keane = Languages. If Nash = Owen = Geography or Languages: cannot get exactly 2 at History from the remaining tutors without contradicting constraints. Only valid solution: Keane = Languages.$s$,
  11
);

INSERT INTO timed_decision_making_question_options (question_id, label, option_text, order_index) VALUES
('61fe1682-a0cb-460b-ac17-bd4162a39636', 'A', 'History', 1),
('61fe1682-a0cb-460b-ac17-bd4162a39636', 'B', 'Geography', 2),
('61fe1682-a0cb-460b-ac17-bd4162a39636', 'C', 'Languages', 3),
('61fe1682-a0cb-460b-ac17-bd4162a39636', 'D', 'Cannot be determined', 4);

-- ── Test 3: Replace Greenhouse Planting (linear) with Garden Plot Allocation (selection) ──

DELETE FROM timed_decision_making_questions WHERE id = '9874b146-20f2-466a-a9a1-c31c1683907c';

INSERT INTO timed_decision_making_questions (id, test_id, title, type, stem, correct_answer, answer_reason, order_index)
VALUES (
  '9874b146-20f2-466a-a9a1-c31c1683907c',
  3,
  'Garden Plot Allocation',
  'logic_puzzle',
  $s$A community garden allocates 4 plots from 7 available options — Allotment, Border, Courtyard, Dell, Espalier, Fernery, and Greenhouse — for the spring season.

• The Greenhouse must be allocated.
• If the Allotment is allocated, the Border must also be allocated.
• The Courtyard and Dell cannot both be allocated.
• The Espalier and Fernery cannot both be allocated.
• If the Courtyard is not allocated, the Allotment must be allocated.

Which of the following is a valid allocation?$s$,
  'A',
  $s$A: Greenhouse, Allotment, Border, Dell — Greenhouse ✓. Allotment → Border must be included ✓. Courtyard and Dell: only Dell, no Courtyard ✓. Espalier and Fernery: neither selected ✓. Courtyard not allocated → Allotment must be included ✓. All constraints met. ✓ B: Greenhouse, Courtyard, Espalier, Fernery — Espalier AND Fernery both selected ✗ (constraint 4). C: Greenhouse, Allotment, Courtyard, Espalier — Allotment selected → Border must be included (constraint 2). Border not selected ✗. D: Greenhouse, Dell, Espalier, Fernery — Courtyard not allocated → Allotment must be included (constraint 5). Allotment not selected ✗.$s$,
  17
);

INSERT INTO timed_decision_making_question_options (question_id, label, option_text, order_index) VALUES
('9874b146-20f2-466a-a9a1-c31c1683907c', 'A', 'Greenhouse, Allotment, Border, Dell', 1),
('9874b146-20f2-466a-a9a1-c31c1683907c', 'B', 'Greenhouse, Courtyard, Espalier, Fernery', 2),
('9874b146-20f2-466a-a9a1-c31c1683907c', 'C', 'Greenhouse, Allotment, Courtyard, Espalier', 3),
('9874b146-20f2-466a-a9a1-c31c1683907c', 'D', 'Greenhouse, Dell, Espalier, Fernery', 4);


-- ============================================================
-- 6. REPLACE DETECTION-PATTERN PROBABILISTIC (test 3)
-- Fire Alarm Testing → Fruit Selection (combinatorics)
-- ============================================================

DELETE FROM timed_decision_making_questions WHERE id = 'bc80e1d2-9236-474f-ac72-a0d6910415b2';

INSERT INTO timed_decision_making_questions (id, test_id, title, type, stem, correct_answer, answer_reason, order_index)
VALUES (
  'bc80e1d2-9236-474f-ac72-a0d6910415b2',
  3,
  'Fruit Selection',
  'probabilistic',
  $s$A farmer's market stall sells bags containing 10 pieces of fruit: 4 apples, 3 oranges, and 3 pears. A customer selects 3 pieces at random without looking.$s$,
  'A',
  $s$C(10,3) = 120 total ways to choose 3 from 10. A: P(all three apples) = C(4,3)/C(10,3) = 4/120 = 1/30. Correct. B: P(exactly 2 oranges) = C(3,2) × C(7,1) / C(10,3) = 3 × 7 / 120 = 21/120 = 17.5%. Not greater than 20%. Wrong. C: P(at least one pear) = 1 − P(no pear) = 1 − C(7,3)/C(10,3) = 1 − 35/120 = 85/120 ≈ 70.8%. Not greater than 80%. Wrong. D: P(all same type) = (C(4,3) + C(3,3) + C(3,3)) / C(10,3) = (4 + 1 + 1)/120 = 6/120 = 1/20. Not 1/12. Wrong.$s$,
  7
);

INSERT INTO timed_decision_making_question_options (question_id, label, option_text, order_index) VALUES
('bc80e1d2-9236-474f-ac72-a0d6910415b2', 'A', 'The probability all three are apples is 1/30.', 1),
('bc80e1d2-9236-474f-ac72-a0d6910415b2', 'B', 'The probability of selecting exactly 2 oranges exceeds 20%.', 2),
('bc80e1d2-9236-474f-ac72-a0d6910415b2', 'C', 'The probability of selecting at least one pear exceeds 80%.', 3),
('bc80e1d2-9236-474f-ac72-a0d6910415b2', 'D', 'The probability all three are the same type is 1/12.', 4);


-- ============================================================
-- 7. VARY TABLE SHAPES IN TEST 3
-- ============================================================

-- ── Farm Crop Yields: 4×4 → 4×5 (add 2026 column) ──

UPDATE timed_decision_making_questions
SET stem = $s$A farm recorded the yield (in tonnes per hectare) of four crops over five years.$s$,
    table_data = '{"rows":[["Wheat","8.2","7.8","8.5","8.0","8.3"],["Barley","6.5","6.8","7.0","6.6","6.9"],["Oilseed Rape","3.4","3.2","3.6","3.8","3.5"],["Oats","5.8","6.0","5.5","6.2","6.0"]],"headers":["Crop","2022 (t/ha)","2023 (t/ha)","2024 (t/ha)","2025 (t/ha)","2026 (t/ha)"]}'::jsonb
WHERE id = '43bcbd6a-979f-4296-bd84-86794fe61b4d';

-- Update affected statement answer_reasons
UPDATE timed_decision_making_question_statements
SET answer_reason = $s$Wheat: 8.2, 7.8, 8.5, 8.0, 8.3. In every year these are the highest values compared to Barley, Oilseed Rape and Oats.$s$
WHERE id = '79e4ae57-32ac-4a2d-b274-6a20eb1091ea';

UPDATE timed_decision_making_question_statements
SET answer_reason = $s$Oilseed Rape: 3.4 → 3.2 → 3.6 → 3.8 → 3.5. It decreased from 2022 to 2023 (3.4 to 3.2), so it did not increase every year.$s$
WHERE id = '89cc7b7d-aadd-4d03-884c-b99735123a3b';

UPDATE timed_decision_making_question_statements
SET answer_reason = $s$Barley: 6.5, 6.8, 7.0, 6.6, 6.9. The highest value is 7.0 in 2024.$s$
WHERE id = 'db13e5b9-68f4-4362-b9b8-4b40985f6ec7';

UPDATE timed_decision_making_question_statements
SET answer_reason = $s$2022: 8.2+6.5+3.4+5.8 = 23.9. 2023: 7.8+6.8+3.2+6.0 = 23.8. 2024: 8.5+7.0+3.6+5.5 = 24.6. 2025: 8.0+6.6+3.8+6.2 = 24.6. 2026: 8.3+6.9+3.5+6.0 = 24.7. 2023 total (23.8) is the lowest.$s$
WHERE id = '257cd56d-a1e1-44a3-8c8a-0f01181c8924';

-- ── Wind Farm Output: 4×4 → 5×4 (add Walney Extension row) ──

UPDATE timed_decision_making_questions
SET stem = $s$An energy report recorded the monthly electricity output (in GWh) of five offshore wind farms.$s$,
    table_data = '{"rows":[["North Sea Alpha","420","380","350","310"],["Irish Sea Beta","280","300","260","240"],["Dogger Bank","520","480","510","450"],["Hornsea","460","440","470","420"],["Walney Extension","380","360","400","350"]],"headers":["Farm","January (GWh)","February (GWh)","March (GWh)","April (GWh)"]}'::jsonb
WHERE id = 'db7a815e-ebde-4d6c-aae3-8888da7f2025';

-- Update affected statement answer_reasons
UPDATE timed_decision_making_question_statements
SET answer_reason = $s$Jan: 520 (highest). Feb: 480 (highest). Mar: 510 (highest). Apr: 450 (highest). Walney Extension values (380, 360, 400, 350) are all below Dogger Bank. Dogger Bank leads every month.$s$
WHERE id = 'b56b3625-eb6e-4332-9e3b-d851219ec2bd';

UPDATE timed_decision_making_question_statements
SET answer_reason = $s$Jan: Irish Sea Beta 280 (lowest vs Walney 380). Feb: Irish Sea Beta 300 (lowest vs Walney 360). Mar: Irish Sea Beta 260 (lowest vs Walney 400). Apr: Irish Sea Beta 240 (lowest vs Walney 350). Irish Sea Beta is consistently lowest.$s$
WHERE id = '2a35ee5e-1a84-4cee-b7ad-649ecbda6a38';

UPDATE timed_decision_making_question_statements
SET answer_reason = $s$January total: 420 + 280 + 520 + 460 + 380 = 2,060 GWh, which exceeds 1,600.$s$
WHERE id = '1126756d-d0a8-4b45-b20a-4f6fd57212de';

-- ── Bump content version ──
UPDATE content_versions SET version = version + 1 WHERE section = 'timed_decision_making';
