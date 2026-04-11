-- ============================================================
-- Tag every existing timed QR question with its difficulty.
--
-- 20260411000005_add_difficulty_to_qr_questions.sql added the
-- column with `DEFAULT 'normal'`, so every row is currently
-- 'normal'. This migration UPDATEs only the rows that should be
-- tagged 'hard'. Anything left untouched remains 'normal'.
--
-- Tagging methodology
-- -------------------
-- Each of the 144 questions across QR Tests 1–4 was reviewed
-- against the criteria documented in:
--   .claude/UCAT-QR-QUESTION-GENERATOR.md → "Difficulty Field"
--   .claude/UCAT-QR-VALIDATOR.md          → "STEP 6"
--
-- Tagged 'hard' when the question requires 3+ distinct cognitive
-- steps OR contains a documented trap (progressive tax, sequential
-- discounts, m³→litres→dosage chains, m²/cm² conversions, composite
-- shapes, multi-table cross-reference, weighted average chains,
-- currency+VAT+discount stacks).
--
-- Tagged 'normal' (the default) for everything else: single-step
-- reads, single percentage calcs, two-step calculations with
-- obvious operations, "Can't Tell" questions, simple geometry,
-- and "find max across N similar single-step calcs" patterns.
--
-- Distribution
-- ------------
--   Test 1:  8 hard / 28 normal  (22% hard)
--   Test 2: 12 hard / 24 normal  (33% hard)
--   Test 3: 13 hard / 23 normal  (36% hard)
--   Test 4:  9 hard / 27 normal  (25% hard)
--   Total:  42 hard / 102 normal across 144 questions (29% hard)
--
-- Tests 2 and 3 skew above the 25% target because they contain a
-- lot of progressive-tax, multi-step finance, and composite-geometry
-- problems. The tags reflect the actual content rather than forcing
-- the distribution.
-- ============================================================

UPDATE timed_quantitative_reasoning_questions
   SET difficulty = 'hard'
 WHERE question_ref IN (
   -- ── Test 1 (8 hard) ──────────────────────────────────────
   'qr1-s02-q1',  -- Progressive UK income tax: 3-step band calc
   'qr1-s02-q2',  -- Progressive tax across 2 bands: 4 steps
   'qr1-s02-q3',  -- Tax across 2 bands then weekly division
   'qr1-s06-q3',  -- 3-step percentage decrease formula
   'qr1-s09-q2',  -- Energy: power calc → weekly hours → cost rate
   'qr1-s09-q4',  -- Power diff → weekly → monthly → cost
   'qr1-s11-q3',  -- 2 index lookups → 2 population calcs
   'qr1-s12-q3',  -- 5 items × discount × VAT, sum all

   -- ── Test 2 (12 hard) ─────────────────────────────────────
   'qr2-s01-q2',  -- 4-step row total derivation
   'qr2-s02-q3',  -- 3-step revenue: sum 6 months × 1.5 + add
   'qr2-s03-q1',  -- Inverse percentage chain (520÷0.5÷0.4)
   'qr2-s04-q3',  -- 3-step missing month from line graph
   'qr2-s05-q2',  -- 5 cylinder surface area calcs (formula × 5)
   'qr2-s06-q1',  -- 3-step: subtract walls, height, volume÷conversion
   'qr2-s07-q3',  -- 4-step: 2 tax calcs with discount + diff × years
   'qr2-s10-q3',  -- Pie rebalance: 2 segments × 1.1 + new total
   'qr2-s12-q3',  -- Split nights with different rates + VAT
   'qr2-s12-q4',  -- 2 room types × 3 line items + rates + VAT
   'qr2-s13-q1',  -- L-shape area (composite geometry)
   'qr2-s13-q2',  -- L-shape perimeter with derived sides

   -- ── Test 3 (13 hard) ─────────────────────────────────────
   'qr3-s01-q1',  -- 4-step weighted average with multipliers
   'qr3-s01-q2',  -- 6 weighted averages, find max
   'qr3-s01-q3',  -- Weighted target → reverse calc per weight
   'qr3-s03-q3',  -- Daily dose × days + unit conversion mg→g
   'qr3-s06-q3',  -- Derive missing cell then divide column total
   'qr3-s07-q1',  -- T-shape area (composite geometry)
   'qr3-s07-q2',  -- T-shape perimeter, 4 derived sides
   'qr3-s10-q1',  -- 3-step: miles→km→litres→cost (SDT chain)
   'qr3-s10-q2',  -- 2 routes with distance + fuel + toll
   'qr3-s10-q3',  -- 3-step: distance, time as fraction, speed
   'qr3-s12-q3',  -- Bed addition + per-capita rate change
   'qr3-s13-q2',  -- 4-step progressive tax across 2 bands
   'qr3-s13-q3',  -- Reverse tax calc: tax owed → salary

   -- ── Test 4 (9 hard) ──────────────────────────────────────
   'qr4-s01-q4',  -- 3-step: column proportion → apply to new jobs
   'qr4-s03-q1',  -- 4-step cylinder volume + weight + unit conv
   'qr4-s05-q2',  -- 5 carbon intensity calcs, find min
   'qr4-s05-q4',  -- 5 calcs vs strict threshold
   'qr4-s06-q1',  -- Sequential discounts (multiplicative)
   'qr4-s11-q2',  -- 3-step: mean × count = total → missing
   'qr4-s11-q4',  -- 5 formula calcs, compare results
   'qr4-s12-q2',  -- 3-step: usage over allowance + excess + VAT
   'qr4-s12-q3'   -- 3-step: 12-month excess + monthly + annual
 );

-- Sanity check: bump the QR content version so analytics queries
-- pick up the new difficulty values immediately on the next load.
UPDATE content_versions
   SET version    = version + 1,
       updated_at = now()
 WHERE section = 'timed_quantitative_reasoning';
