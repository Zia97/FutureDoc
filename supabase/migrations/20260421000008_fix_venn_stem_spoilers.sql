-- Fix DM venn diagram stems that violate the tightened spoiler rules.
-- SELECT stems: remove structural meta-observations ("the two pairs do not overlap")
-- that collapse adjacent-pair layouts, letting implicit absence of overlap counts do the work.
-- INTERPRET stems: strip all factual premises and category-relationship sentences —
-- the rendered diagram is the student's reading task, narrating the structure spoils it.

-- Test 1 Q24: Warehouse Safety Qualifications (SELECT)
-- Remove "No staff member holds qualifications from both pairs simultaneously."
UPDATE timed_decision_making_questions
SET stem = E'A logistics company employs 80 warehouse staff. 30 hold a forklift licence, 20 have hazardous-goods certification, 15 hold a first-aid certificate, and 25 have a height-safety qualification. 10 staff hold both a forklift licence and hazardous-goods certification. 8 hold both a first-aid certificate and a height-safety qualification. 8 staff hold none of these qualifications.\n\nWhich of the following diagrams best represents the data?'
WHERE test_id = 1 AND order_index = 24;

-- Test 2 Q24: Recruitment Applicant Attributes (SELECT)
-- Remove "No applicant has both prior management experience and industry certifications,
-- or both a relevant degree and strong references."
UPDATE timed_decision_making_questions
SET stem = E'A recruitment firm assessed 80 applicants for a management role. 25 have prior management experience, 30 hold a relevant degree, 20 have industry certifications, and 18 have strong references. 8 applicants have both prior management experience and a relevant degree. 6 have both a relevant degree and industry certifications. 4 have both industry certifications and strong references. 5 have both strong references and prior management experience. 10 applicants have none of these attributes.\n\nWhich of the following diagrams best represents the data?'
WHERE test_id = 2 AND order_index = 24;

-- Test 3 Q27: Employee Training Records (INTERPRET)
-- Strip the two structural sentences that described the nested/disjoint layout.
UPDATE timed_decision_making_questions
SET stem = E'The diagram shows 150 workers at a company categorised by employment type and training records. Each letter marks a different region.\n\nWhich letter represents a full-time staff member who has completed induction, but has not completed safety certification and is not contract staff?'
WHERE test_id = 3 AND order_index = 27;

-- Test 3 Q28: Engineer Certification Hierarchy (INTERPRET)
-- Strip the two "All X are Y" factual premises — the rendered diagram shows the nesting.
UPDATE timed_decision_making_questions
SET stem = E'The diagram shows the engineering staff at a firm categorised by seniority. Each letter marks a different region.\n\nWhich letter represents an engineer who is senior but not principal?'
WHERE test_id = 3 AND order_index = 28;

-- Test 4 Q27: Festival Programming (INTERPRET) — the original Q27 anti-pattern.
-- Strip the two structural sentences that mapped out the entire diagram.
UPDATE timed_decision_making_questions
SET stem = E'The diagram shows 200 festival activities. Each letter marks a different region.\n\nWhich letter represents a main-stage act that is both comedy and family-friendly, but is not a music act?'
WHERE test_id = 4 AND order_index = 27;

-- Bump timed DM content version so clients refetch with the fixed stems.
UPDATE content_versions
SET version = version + 1, updated_at = now()
WHERE section = 'timed_decision_making';
