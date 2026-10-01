-- Seed: Timed SJ Test 4 (test_id = 4)
-- label_set: 1 = importance scale, 2 = appropriateness scale

-- Clear existing Test 4 data only (questions first due to FK, then scenarios)
DELETE FROM timed_situational_judgement_questions
WHERE scenario_id IN (
  SELECT id FROM timed_situational_judgement_scenarios WHERE test_id = 4
);
DELETE FROM timed_situational_judgement_scenarios WHERE test_id = 4;

DO $$
DECLARE
  v_s01 UUID; v_s02 UUID; v_s03 UUID; v_s04 UUID; v_s05 UUID;
  v_s06 UUID; v_s07 UUID; v_s08 UUID; v_s09 UUID; v_s10 UUID;
  v_s11 UUID; v_s12 UUID; v_s13 UUID; v_s14 UUID; v_s15 UUID;
  v_s16 UUID; v_s17 UUID; v_s18 UUID; v_s19 UUID; v_s20 UUID;
  v_s21 UUID; v_s22 UUID; v_s23 UUID;
BEGIN

  -- S01
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 1, 'You begin discussing a patient''s recent biopsy result with a colleague while walking through a busy corridor. You then notice two visitors are waiting nearby.')
  RETURNING id INTO v_s01;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s01, 1, 'How important is it to stop the discussion and move somewhere private before continuing?', 'Very important', 'This is very important because patient information should only be discussed where privacy can be maintained. It is more than merely important because confidentiality is already at risk in that moment, so immediate action matters.', 0),
    (v_s01, 2, 'You lower your voice and continue because the visitors probably are not listening closely.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because lowering your voice does not remove the risk that confidential information may be overheard. It is worse than ''Inappropriate, but not awful'' because it knowingly continues the unsafe behaviour instead of correcting it.', 1),
    (v_s01, 1, 'How important is it to work out exactly whether the visitors heard every detail before first moving to a private area?', 'Not important at all', 'This is not important at all as an immediate priority because the first step is to stop any further breach by moving somewhere private. It is not even of minor importance at that point, because it does nothing to reduce the current confidentiality risk.', 2);

  -- S02
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'A patient is due to sign consent for a procedure later today but says they feel rushed and still have questions about the risks and alternatives.')
  RETURNING id INTO v_s02;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s02, 1, 'How important is it to explore the patient''s concerns and make sure they have the information and time they need to decide?', 'Very important', 'This is very important because valid consent depends on the patient''s understanding and voluntary decision, not on simply completing a form. It is more than merely important because the quality of the decision-making process is central here.', 0),
    (v_s02, 2, 'You tell the patient they should sign now because the theatre slot may be lost if they delay.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it places pressure on the patient instead of supporting informed and voluntary decision making. It is worse than ''Inappropriate, but not awful'' because it directly undermines the consent process.', 1),
    (v_s02, 2, 'You answer their questions, check what matters most to them, and involve the senior clinician if further discussion is needed before they decide.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it supports informed consent and recognises when more senior input may be needed. It is stronger than ''Appropriate, but not ideal'' because it addresses both the patient''s concerns and the practical next step properly.', 2);

  -- S03
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'At the end of a shift, a colleague leaves quickly without giving a proper handover of two patients who still need blood tests and review overnight. This has happened several times before.')
  RETURNING id INTO v_s03;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s03, 1, 'How important is it that patients receive a clear and safe handover when responsibility is passing to another team?', 'Very important', 'This is very important because safe handover is essential to continuity of care and avoiding missed tasks or deterioration. It is more than merely important because unclear responsibility can create immediate patient-safety risk.', 0),
    (v_s03, 2, 'You make sure the key information is handed over safely for tonight, then later raise the repeated pattern with the colleague or an appropriate senior.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it first protects current patients and then addresses the recurring professionalism issue. It is stronger than ''Appropriate, but not ideal'' because it manages both the immediate and longer-term problem.', 1),
    (v_s03, 2, 'You sort out the handover gaps yourself this time but say nothing about the repeated behaviour because the shift is already over.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because it helps keep patients safe tonight, which is positive. It falls short because repeatedly ignoring the wider problem makes future unsafe handovers more likely, so it is not appropriate overall.', 2);

  -- S04
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'A senior doctor cannot access the electronic prescribing system and asks to use your login details so they can enter a prescription quickly.')
  RETURNING id INTO v_s04;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s04, 2, 'You give them your login because they are senior and the medication needs to be prescribed before the drug round ends.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because sharing login details undermines accountability and creates an unsafe audit trail. It is worse than ''Inappropriate, but not awful'' because it deliberately bypasses a core safeguard rather than making a minor procedural mistake.', 0),
    (v_s04, 1, 'How important is it to keep prescribing access linked to the individual actually making the entry?', 'Important', 'This is important because accurate attribution and accountability matter whenever medicines are prescribed. It is not ''Very important'' in the sense of an immediate patient emergency in the stem, but it is far more than a minor administrative concern.', 1),
    (v_s04, 2, 'You explain that you cannot share your login and suggest contacting the appropriate support route or asking someone with proper access to help immediately.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it refuses an unsafe shortcut while still helping the senior find a legitimate solution. It is stronger than ''Appropriate, but not ideal'' because it protects both patient safety and record integrity.', 2);

  -- S05
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'A patient you recently treated sends you a friend request on your personal social media account with a message thanking you for your help.')
  RETURNING id INTO v_s05;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s05, 2, 'How important is it to maintain professional boundaries with patients online as well as in person?', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because accepting the request blurs professional boundaries and could affect trust, even if the message seems friendly. It is not the very worst response because there may be no immediate harm intended, but it is still not an appropriate professional choice.', 0),
    (v_s05, 2, 'You accept the request because the patient is no longer under your direct care and the message seems harmless.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because the professional boundary does not simply disappear because the contact seems friendly or care has ended. It is worse than ''Inappropriate, but not awful'' because it creates a direct personal-professional overlap you could reasonably avoid.', 1),
    (v_s05, 2, 'You do not accept the request and simply leave it unanswered on your personal account.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because it maintains the boundary by not accepting the request. It falls short of ''A very appropriate thing to do'' because a more clearly professional response or use of an appropriate channel may manage the situation more explicitly.', 2);

  -- S06
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 1, 'You notice that a blood sample tube may have been labelled with the wrong patient''s sticker, but the sample has not yet been sent to the laboratory.')
  RETURNING id INTO v_s06;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s06, 1, 'How important is it to stop the process and make sure the sample is correctly identified before it is sent?', 'Very important', 'This is very important because a mislabelled sample could lead to wrong results being attached to the wrong patient and cause significant harm. It is more than merely important because the risk is immediate and preventable.', 0),
    (v_s06, 2, 'You quietly replace the sticker yourself and send the sample on without telling anyone, since no harm has happened yet.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the intention is to prevent harm and correct the mistake. It is still wrong because you may not be certain what happened and you are hiding a near miss instead of making sure it is dealt with safely and transparently.', 1),
    (v_s06, 1, 'How important is it to work out whose handwriting or sticker placement caused the confusion before first making sure the sample is stopped and checked safely?', 'Not important at all', 'This is not important at all as an immediate priority because the sample first needs to be stopped and checked safely. It is not even of minor importance at that moment, because identifying blame does nothing to reduce the immediate risk to the patient.', 2);

  -- S07
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'After several busy night shifts, you are asked to stay for an extra clinical session. You realise you are struggling to concentrate and have already made minor slips with paperwork today.')
  RETURNING id INTO v_s07;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s07, 1, 'How important is it to consider whether you are fit to continue working safely before agreeing to stay?', 'Very important', 'This is very important because fatigue can impair judgement and increase the risk of errors. It is more than merely important because your ability to practise safely is the key issue in the scenario.', 0),
    (v_s07, 2, 'You agree to stay because the team is short staffed and you do not want to let anyone down.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because good intentions do not make it safe to work when you already recognise reduced concentration. It is worse than ''Inappropriate, but not awful'' because the patient-safety risk is clear to you before you decide.', 1),
    (v_s07, 2, 'You tell the senior doctor you are too fatigued to work safely and help with a safe handover or other lower-risk tasks if appropriate.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it is honest about your limits while still trying to support the team responsibly. It is stronger than ''Appropriate, but not ideal'' because it addresses both safety and professionalism directly.', 2);

  -- S08
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'In a messaging group used by staff, one colleague posts a mocking comment about a patient''s weight after a difficult clinic appointment.')
  RETURNING id INTO v_s08;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s08, 1, 'How important is it to communicate respectfully about patients even in informal or staff-only online spaces?', 'Important', 'This is important because professionalism and respect for patients apply in informal communication too. It is not ''Very important'' in the sense of an immediate emergency, but it is far more than a minor issue of tone.', 0),
    (v_s08, 2, 'You send a laughing emoji so that you do not seem humourless in front of the group.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because you are going along with disrespectful behaviour instead of challenging it. It is not the very worst response because you are not initiating the comment or adding further abuse, but it is still professionally wrong.', 1),
    (v_s08, 2, 'You do not join in and later mention privately to the colleague that the comment was inappropriate.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because it avoids participating and challenges the behaviour to some extent. It falls short of ''A very appropriate thing to do'' because a stronger response may be needed to address the wider team culture or any confidentiality concern more clearly.', 2);

  -- S09
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'You are preparing for an intimate examination in a busy clinic. The patient appears calm, and the team is running late.')
  RETURNING id INTO v_s09;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s09, 1, 'How important is it to offer a chaperone and document the patient''s choice appropriately?', 'Very important', 'This is very important because intimate examinations require attention to dignity, trust, and proper safeguards. It is more than merely important because this is part of safe and respectful practice at the point of care.', 0),
    (v_s09, 2, 'You decide not to mention a chaperone because the patient seems comfortable and offering one will slow the clinic down.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it prioritises convenience over the patient''s dignity and established safeguards. It is worse than ''Inappropriate, but not awful'' because the omission is deliberate rather than an understandable imperfection.', 1),
    (v_s09, 2, 'You explain the examination, offer a chaperone, and document the discussion and the patient''s decision before proceeding.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it supports dignity, transparency, and good documentation. It is stronger than ''Appropriate, but not ideal'' because it follows the expected process fully rather than only partly.', 2);

  -- S10
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'The spouse of an adult patient phones reception and asks whether the patient attended clinic today, saying they are worried because the patient is not answering their phone.')
  RETURNING id INTO v_s10;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s10, 2, 'You confirm that the patient attended and briefly explain what department they were seen in because the spouse sounds genuinely concerned.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because concern from a relative does not by itself justify sharing confidential attendance information. It is worse than ''Inappropriate, but not awful'' because you would be disclosing personal information without checking consent or another proper basis.', 0),
    (v_s10, 1, 'How important is it to check what information can be shared and whether the patient has given consent before disclosing details?', 'Very important', 'This is very important because confidentiality applies to attendance and contact with the service as well as to clinical details. It is more than merely important because the decision to disclose is the central issue in the scenario.', 1),
    (v_s10, 2, 'You explain that you cannot confirm details without the patient''s permission, but you can take a message or suggest the spouse contacts the patient directly.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it protects confidentiality while still being courteous and helpful. It is stronger than ''Appropriate, but not ideal'' because it manages the request appropriately without unnecessary disclosure.', 2);

  -- S11
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'You send a clinic list to a shared printer and then realise several pages containing patient names and hospital numbers are still sitting in the tray in a busy office area.')
  RETURNING id INTO v_s11;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s11, 2, 'You collect the pages immediately and make sure they are stored or disposed of securely.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it directly reduces the confidentiality risk as soon as you notice it. It is stronger than ''Appropriate, but not ideal'' because it deals with the main problem promptly and properly.', 0),
    (v_s11, 1, 'How important is it to review later whether printing processes or printer settings could be improved after the immediate issue has been secured?', 'Important', 'This is important because system improvements can help prevent repeat breaches. It is not ''Very important'' in the immediate sense, because first the documents themselves need to be secured, but it is more than a minor afterthought.', 1),
    (v_s11, 2, 'You leave the pages there until you next pass through the office because the area is mainly used by staff.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because staff areas are not automatically private enough for unattended patient lists. It is worse than ''Inappropriate, but not awful'' because you would be knowingly leaving confidential information exposed.', 2);

  -- S12
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'A newly qualified doctor tells you they are unsure of the dose for a medicine and are about to choose one from memory because the ward is busy.')
  RETURNING id INTO v_s12;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s12, 1, 'How important is it to intervene before the prescription is made if someone is about to prescribe beyond what they know safely?', 'Very important', 'This is very important because an incorrect dose can directly harm a patient. It is more than merely important because there is a clear opportunity to prevent an error before it happens.', 0),
    (v_s12, 2, 'You suggest checking a reliable source or asking a senior before prescribing, and you help them do that if needed.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it promotes safe prescribing and supports the colleague appropriately. It is stronger than ''Appropriate, but not ideal'' because it gives a clear safe alternative rather than only vague reassurance.', 1),
    (v_s12, 2, 'You assume they will check later and leave them to get on with it because they need to learn to cope under pressure.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because patient safety should not be used as a learning experiment when uncertainty has already been admitted. It is worse than ''Inappropriate, but not awful'' because it ignores an obvious preventable risk.', 2);

  -- S13
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'A patient about to be examined says they do not want medical students present because they feel embarrassed.')
  RETURNING id INTO v_s13;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s13, 2, 'You reassure the patient that their decision will be respected and that their care will not be affected if students step out.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because patients should be free to decline student involvement without pressure. It is stronger than ''Appropriate, but not ideal'' because it both respects autonomy and reduces any fear of negative consequences.', 0),
    (v_s13, 1, 'How important is it to respect a patient''s refusal to have students present, even if the teaching opportunity is valuable?', 'Important', 'This is important because patient choice and dignity should not be overridden for educational convenience. It is not ''Very important'' as an urgent safety issue, but it is clearly more than a matter of minor preference.', 1),
    (v_s13, 2, 'You tell the patient students need experience, so it would be better if they agreed just this once.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it puts pressure on the patient after they have clearly expressed a preference. It is worse than ''Inappropriate, but not awful'' because it directly undermines voluntary choice.', 2);

  -- S14
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'The family of a competent adult patient asks the team not to tell the patient about a likely cancer diagnosis because they think it will destroy the patient''s hope.')
  RETURNING id INTO v_s14;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s14, 1, 'How important is it to find out what the patient wants to know and how they want information shared, rather than simply following the family''s request?', 'Very important', 'This is very important because discussions about diagnosis should be guided by the patient''s wishes and right to be involved in decisions about their care. It is more than merely important because the request goes to the heart of truthful communication and autonomy.', 0),
    (v_s14, 2, 'You agree not to tell the patient because the family know them best and are trying to protect them.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it allows the family to control information that should be handled according to the patient''s own wishes. It is worse than ''Inappropriate, but not awful'' because it would seriously undermine the patient''s autonomy.', 1),
    (v_s14, 2, 'You listen to the family''s concerns and seek senior advice about how to handle the conversation sensitively.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because involving senior support can help with a sensitive conversation. It falls short of ''A very appropriate thing to do'' because, on its own, it does not clearly state that the patient''s own wishes and preferences about information still need to guide the discussion.', 2);

  -- S15
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'You see a fellow student open the records of a well-known local celebrity who is in hospital, even though the student is not involved in that patient''s care.')
  RETURNING id INTO v_s15;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s15, 1, 'How important is it that patient records are only accessed for a legitimate care or learning reason, rather than out of curiosity?', 'Very important', 'This is very important because confidentiality includes controlling access to records, not just what is said out loud. It is more than merely important because the access itself is already improper.', 0),
    (v_s15, 2, 'You tell the student to close the record and explain that, if necessary, the issue may need to be raised with an appropriate supervisor.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it challenges the misconduct promptly and leaves room for escalation if needed. It is stronger than ''Appropriate, but not ideal'' because it addresses the behaviour directly rather than just distancing yourself from it.', 1),
    (v_s15, 2, 'You ignore it because no information has been shared outside the hospital and the student was probably just curious.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because improper access itself is a serious breach, even if nothing is later repeated elsewhere. It is worse than ''Inappropriate, but not awful'' because it overlooks a clear confidentiality violation.', 2);

  -- S16
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'A senior asks you to write your patient note as if it were entered before the ward round, even though you are documenting it several hours later, because it will look tidier.')
  RETURNING id INTO v_s16;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s16, 2, 'You make a clear late entry with the actual time of writing and an accurate account of what happened earlier.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because records should be accurate and transparent about when they are created. It is stronger than ''Appropriate, but not ideal'' because it preserves both honesty and usefulness of the notes.', 0),
    (v_s16, 2, 'You backdate the entry so that the notes appear more orderly and the clinical content is still broadly correct.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because making the timing look different from reality is dishonest and can mislead others. It is worse than ''Inappropriate, but not awful'' because the inaccuracy is deliberate rather than accidental.', 1),
    (v_s16, 1, 'How important is it that the timing and authorship of the clinical record are accurate?', 'Very important', 'This is very important because notes are relied on for care, accountability, and later review. It is more than merely important because misleading entries can affect both safety and trust in the record.', 2);

  -- S17
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'At the end of a clinic, a grateful patient offers you expensive concert tickets to thank you for your care.')
  RETURNING id INTO v_s17;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s17, 2, 'You accept the tickets so that the patient is not offended and decide to ask about the rules another day.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the motive is to avoid awkwardness rather than to seek personal gain openly. It is still wrong because expensive gifts can create conflicts of interest or damage trust, so you should not accept first and check later.', 0),
    (v_s17, 1, 'How important is it to avoid making the patient feel mildly awkward when you respond to the gift offer?', 'Of minor importance', 'This is of minor importance because it is good to respond courteously and sensitively to a patient''s gratitude. But it is much less important than maintaining professional boundaries and following policy, so it should not drive the decision.', 1),
    (v_s17, 2, 'You thank the patient and say you need to check local guidance before deciding whether you can accept the tickets.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because it avoids an immediate acceptance and recognises that guidance matters. It falls short of ''A very appropriate thing to do'' because with a clearly significant gift, the safer and clearer response would usually be to decline rather than leave acceptance open.', 2);

  -- S18
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'A patient with limited English is about to leave with several medication changes. No in-person interpreter is available immediately, and the patient is keen to get home.')
  RETURNING id INTO v_s18;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s18, 2, 'You use a phone interpreter or other appropriate support to confirm the key medication instructions, even if this causes some delay.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because safe understanding of medication changes matters more than convenience. It is stronger than ''Appropriate, but not ideal'' because it uses a proper route for an important discharge discussion.', 0),
    (v_s18, 2, 'You rely only on a translation app and the printed discharge summary because the patient seems eager to leave.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because complex medication instructions should not be left to an unreliable substitute when misunderstanding could cause harm. It is worse than ''Inappropriate, but not awful'' because you already know the communication support is inadequate for the risk involved.', 1),
    (v_s18, 1, 'How important is it to make sure the patient truly understands the new medication plan before discharge?', 'Very important', 'This is very important because poor understanding at discharge can directly lead to medication errors and failed follow-up. It is more than merely important because patient safety depends on it in this scenario.', 2);

  -- S19
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'A patient says they do not want to be seen by a doctor of a particular ethnicity and asks for someone else instead.')
  RETURNING id INTO v_s19;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s19, 2, 'You immediately swap doctors to keep the consultation calm and avoid delay.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the motive may be to de-escalate a difficult situation and maintain care. It is still wrong because automatically complying can reinforce discriminatory behaviour rather than addressing it appropriately.', 0),
    (v_s19, 2, 'You support your colleague, explain that discriminatory requests cannot simply be accommodated, and involve a senior if help is needed to manage the situation safely.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it supports the colleague while still focusing on safe patient care and proper escalation if needed. It is stronger than ''Appropriate, but not ideal'' because it deals with both discrimination and the practical management of the encounter.', 1),
    (v_s19, 1, 'How important is it not to reinforce discriminatory behaviour toward colleagues during patient care?', 'Important', 'This is important because fairness, respect, and team culture matter in professional practice. It is not ''Very important'' in the sense of an automatic emergency response, but it is far more than a minor interpersonal issue.', 2);

  -- S20
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'During a ward round, a nurse twice raises concern that a patient seems more breathless than earlier, but the consultant dismisses the concern quickly and moves on.')
  RETURNING id INTO v_s20;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s20, 1, 'How important is it that concerns from team members about a possible change in a patient''s condition are taken seriously?', 'Very important', 'This is very important because nurses and other team members may notice important deterioration, and ignoring concerns can delay recognition of harm. It is more than merely important because the issue may affect immediate patient safety.', 0),
    (v_s20, 2, 'You speak to the nurse promptly, review how the concern can be escalated, and make sure the patient''s condition is reassessed through the appropriate route.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it responds to a potential safety issue and supports proper escalation. It is stronger than ''Appropriate, but not ideal'' because it does more than sympathise; it helps secure appropriate action.', 1),
    (v_s20, 2, 'You say nothing because the consultant is in charge and you do not want to undermine them in front of the team.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because hierarchy should not prevent action when a patient''s safety may be at risk. It is worse than ''Inappropriate, but not awful'' because it ignores a live concern rather than handling it imperfectly.', 2);

  -- S21
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'A teaching session is about to start. Someone wants to show an identifiable patient photograph, but the consent documentation cannot be found.')
  RETURNING id INTO v_s21;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s21, 1, 'How important is it to confirm that valid consent exists before using identifiable patient material for teaching?', 'Very important', 'This is very important because identifiable images should not be used unless there is a proper basis, including consent where required. It is more than merely important because the patient''s privacy and trust are directly involved.', 0),
    (v_s21, 2, 'You go ahead and use the image because it is for education and the person presenting says consent was probably obtained.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the intention is educational and the presenter believes consent may well exist. It is still wrong because identifiable material should not be used when consent cannot be verified, so uncertainty should lead to caution, not assumption.', 1),
    (v_s21, 2, 'You delay using the image until consent is verified, or you use properly anonymised material instead if that is suitable.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it protects the patient''s privacy while still allowing teaching to continue appropriately. It is stronger than ''Appropriate, but not ideal'' because it offers a proper safe alternative rather than a compromise that leaves doubt.', 2);

  -- S22
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'After sending a discharge letter, you realise it wrongly states that the patient has no penicillin allergy, even though the allergy is clearly recorded elsewhere in the notes.')
  RETURNING id INTO v_s22;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s22, 1, 'How important is it to correct the letter promptly and make sure the relevant team members are aware of the error?', 'Very important', 'This is very important because an incorrect allergy record could lead to harmful prescribing decisions. It is more than merely important because the error could affect the patient''s safety if not corrected quickly.', 0),
    (v_s22, 2, 'You contact the appropriate team promptly so the record and discharge communication can be corrected, and you are open about the mistake.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it prioritises patient safety and deals honestly with the error. It is stronger than ''Appropriate, but not ideal'' because it takes direct corrective action rather than relying on someone else to notice.', 1),
    (v_s22, 2, 'You leave it because the allergy is written elsewhere in the record and the GP or pharmacist will probably spot the inconsistency.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it relies on others to catch a known error that you are already able to address. It is worse than ''Inappropriate, but not awful'' because the potential consequence is significant and avoidable.', 2);

  -- S23
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (4, 2, 'A fellow student asks you to sign them in as present for a mandatory professionalism workshop that they missed, saying they attended most of the term and do not want to get into trouble.')
  RETURNING id INTO v_s23;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s23, 2, 'You refuse to sign them in and encourage them to speak honestly to the course team about missing the session.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it supports honesty while still pointing them toward a proper way to deal with the issue. It is stronger than ''Appropriate, but not ideal'' because it does not compromise integrity for convenience.', 0),
    (v_s23, 1, 'How important is honesty in attendance and training records, even when the issue does not involve direct patient care?', 'Important', 'This is important because integrity in training reflects professional trustworthiness more broadly. It is not ''Very important'' as an immediate patient-safety matter, but it is clearly more than a minor administrative detail.', 1),
    (v_s23, 2, 'You sign them in because they are usually reliable and it seems harsh for them to be penalised over one missed workshop.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it creates a false record and supports dishonesty. It is worse than ''Inappropriate, but not awful'' because the deception would be deliberate rather than careless.', 2);

END $$;
