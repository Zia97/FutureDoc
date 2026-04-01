-- Fix DM Test 2 quality issues identified by validator
-- Fixes: Q07, Q10, Q11, Q19, Q21, Q25, Q28

DO $$
BEGIN

-- ============================================================
-- Q07 (order_index=7): Shift Rota Planning
-- CRITICAL: No option was necessarily true in all valid arrangements.
-- Fix: Add "Fiona cannot work the morning shift" constraint to force C.
-- ============================================================
UPDATE timed_decision_making_questions
SET stem = E'A manager must assign four employees — Fiona, George, Hana, and Ivan — to exactly one of three shifts: morning, afternoon, or night. The following rules apply:\n\n- Each shift must have at least one employee.\n- Fiona and George cannot be on the same shift.\n- Hana must be on the morning shift.\n- Ivan must be on a different shift from Hana.\n- Fiona cannot work the morning shift.\n\nIf George is on the afternoon shift, which of the following must be true?',
    answer_reason = E'Hana is on morning. George is on afternoon. Fiona cannot work morning (rule 5) and cannot be with George on afternoon (rule 2), so Fiona must be on the night shift. Ivan must differ from Hana, so Ivan is on afternoon or night — but Fiona\'s placement on the night shift is forced regardless. Therefore Fiona must be on the night shift.'
WHERE test_id = 2 AND order_index = 7;

-- ============================================================
-- Q10 (order_index=10): Parking Permit Zones
-- CRITICAL: Two correct options (C and D both defensible). Singular
-- "the zone" contradicted 2-2-1-1 distribution.
-- Fix: Redesign puzzle so Green's car count is deterministic (answer=B).
-- ============================================================
UPDATE timed_decision_making_questions
SET stem = E'A car park has four zones — Red, Blue, Green, and Yellow — arranged in a row from left to right in that order. Seven cars must be parked according to these rules:\n\n- Each zone holds at least one car and no more than two cars.\n- Red holds more cars than Yellow.\n- Green holds the same number of cars as Blue.\n\nHow many cars are in the Green zone?',
    correct_answer = 'B',
    answer_reason = E'Each zone holds 1 or 2 cars, and the total is 7. If Green = Blue = 1, then Red + Yellow = 5, but each zone holds at most 2, so maximum Red + Yellow = 4. This is impossible. Therefore Green = Blue = 2, giving Red + Yellow = 3. Since Red > Yellow, Red = 2 and Yellow = 1. The arrangement is Red = 2, Blue = 2, Green = 2, Yellow = 1 (total = 7). Green must hold 2 cars.'
WHERE test_id = 2 AND order_index = 10;

-- Update Q10 options
UPDATE timed_decision_making_question_options
SET option_text = 'It depends on the other zones'
WHERE question_id = (SELECT id FROM timed_decision_making_questions WHERE test_id = 2 AND order_index = 10)
  AND label = 'C';

-- ============================================================
-- Q11 (order_index=11): Charity Raffle Prizes
-- CRITICAL: 3 valid solutions existed; insufficient constraints.
-- Fix: Tighten voucher constraint to "not red, green, or silver" so
-- voucher is forced to blue, yielding a unique solution.
-- ============================================================
UPDATE timed_decision_making_questions
SET stem = E'Five raffle prizes — a hamper, a voucher, a bottle, a teddy bear, and a plant — are each wrapped in a different colour paper: red, blue, green, gold, or silver.\n\n- The hamper is wrapped in gold or silver.\n- The voucher is not wrapped in red, green, or silver.\n- The bottle is wrapped in the colour that comes first alphabetically among the remaining colours after the hamper and voucher are assigned.\n- The teddy bear is not wrapped in silver.\n\nIf the hamper is wrapped in gold, what colour is the plant wrapped in?',
    answer_reason = E'Hamper = gold. The voucher is not red, green, or silver, and gold is taken, so the voucher must be blue. Remaining colours for bottle, teddy, and plant: red, green, silver. The bottle gets the first alphabetically among these three, which is green. Bottle = green. The teddy bear is not silver, so teddy = red and plant = silver.'
WHERE test_id = 2 AND order_index = 11;

-- ============================================================
-- Q19 (order_index=19): Introducing Four-Day Work Weeks
-- CRITICAL: Option A was self-contradictory — labelled "No" but content
-- argued in favour of the proposition.
-- Fix: Replace with a genuine "No" argument.
-- ============================================================
UPDATE timed_decision_making_question_options
SET option_text = 'No; some employees prefer working five days with shorter hours and value the routine, and a mandatory four-day week removes the flexibility for individual companies to accommodate diverse employee preferences.'
WHERE question_id = (SELECT id FROM timed_decision_making_questions WHERE test_id = 2 AND order_index = 19)
  AND label = 'A';

UPDATE timed_decision_making_questions
SET answer_reason = 'Option B is the strongest argument because it directly addresses the proposed action (four-day week requirement) and provides specific evidence from real-world trials showing maintained productivity and measurable wellbeing gains. Option C is a reasonable counter with evidence but focuses on sector-specific challenges rather than the broad workforce. Option A raises a preference concern but addresses only a subgroup of employees without evidence of impact on productivity or wellbeing. Option D is an opinion without evidence.'
WHERE test_id = 2 AND order_index = 19;

-- ============================================================
-- Q21 (order_index=21): Restricting Social Media for Under-16s
-- MAJOR: Options B and C both failed for the same reason (vague,
-- emotional, no evidence). Also should be rated "hard" due to
-- strong A vs D competition.
-- Fix: Replace B with a substantively different weak argument and
-- upgrade difficulty.
-- ============================================================
UPDATE timed_decision_making_question_options
SET option_text = E'Yes; parents frequently report feeling unable to control their children''s screen time, and a legal requirement would relieve them of this burden.'
WHERE question_id = (SELECT id FROM timed_decision_making_questions WHERE test_id = 2 AND order_index = 21)
  AND label = 'B';

UPDATE timed_decision_making_questions
SET answer_reason = E'Option D is the strongest argument because it directly links the proposed action (preventing under-16 accounts) to specific, evidence-based health outcomes (twofold increase in anxiety and depression from longitudinal studies by a named institution). Option A is a strong counter with enforceability data, but it addresses whether the policy is practical rather than whether it is desirable. Option B relies on the unstated assumption that parents cannot manage screen time and addresses parental convenience rather than child health outcomes. Option C appeals to children''s emotional response without any evidence.',
    difficulty = 'hard'
WHERE test_id = 2 AND order_index = 21;

-- ============================================================
-- Q25 (order_index=25): Household Recycling Habits
-- MAJOR: hideLabels key was duplicated inside each option_data
-- JSON blob. It must only exist at the question level (hide_labels
-- column), not inside option_data.
-- Fix: Remove hideLabels from all 4 option_data JSON objects.
-- ============================================================
UPDATE timed_decision_making_question_options
SET option_data = option_data - 'hideLabels'
WHERE question_id = (SELECT id FROM timed_decision_making_questions WHERE test_id = 2 AND order_index = 25);

-- ============================================================
-- Q28 (order_index=28): Delivery Driver Qualifications
-- MAJOR: Diagram region letters (A-F) collided with option labels
-- (A-D), making the explanation confusing for students.
-- Fix: Change diagram letters to P/Q/R/S/T/U and update options
-- and explanation accordingly.
-- ============================================================
UPDATE timed_decision_making_questions
SET stimulus_diagram = '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"HGV licence","shape":"octagon"},{"id":"set2","label":"Hazardous goods","shape":"rectangle"},{"id":"set3","label":"Refrigeration","shape":"oval"}],"regions":{"set1_only":"P","set1_set2":"Q","set2_only":"R","set2_set3":"S","set3_only":"T","outside":"U"}}'::jsonb,
    answer_reason = 'The question asks for drivers who hold a hazardous goods certification only — meaning they do not also have an HGV licence or a refrigeration endorsement. The region inside the hazardous goods shape but outside both the HGV and refrigeration shapes is marked with letter R. Letter Q is in the overlap between HGV and hazardous goods, so it includes HGV licence holders. Letter S is in the overlap between hazardous goods and refrigeration, so it includes refrigeration endorsement holders. Letter T is inside the refrigeration shape only and does not include hazardous goods at all.'
WHERE test_id = 2 AND order_index = 28;

-- Update Q28 options to use new letters
UPDATE timed_decision_making_question_options
SET option_text = CASE label
    WHEN 'A' THEN 'Letter Q'
    WHEN 'B' THEN 'Letter R'
    WHEN 'C' THEN 'Letter S'
    WHEN 'D' THEN 'Letter T'
  END
WHERE question_id = (SELECT id FROM timed_decision_making_questions WHERE test_id = 2 AND order_index = 28);

END $$;
