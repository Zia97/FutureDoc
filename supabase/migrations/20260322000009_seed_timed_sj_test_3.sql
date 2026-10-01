-- Seed: Timed SJ Test 3 (test_id = 3)
-- label_set: 1 = importance scale, 2 = appropriateness scale

-- Clear existing Test 3 data only (questions first due to FK, then scenarios)
DELETE FROM timed_situational_judgement_questions
WHERE scenario_id IN (
  SELECT id FROM timed_situational_judgement_scenarios WHERE test_id = 3
);
DELETE FROM timed_situational_judgement_scenarios WHERE test_id = 3;

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
  VALUES (3, 1, 'You realise you have accidentally emailed a patient''s blood results to the wrong internal email address because the address auto-completed incorrectly.')
  RETURNING id INTO v_s01;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s01, 1, 'How important is it to act promptly to contain the confidentiality breach and inform the appropriate senior or information governance process?', 'Very important', 'This is very important because there has already been a potential breach of confidential information and the priority is to limit any further disclosure and follow the proper reporting route. It is more than merely important because this is an immediate professional duty, not a useful follow-up step.', 0),
    (v_s01, 2, 'You contact the unintended recipient straight away, ask them to delete the email without forwarding it, and report the incident through the appropriate channel.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the immediate risk and follows an appropriate reporting process. That makes it stronger than ''Appropriate, but not ideal'', which would usually deal with only part of the problem or do so less reliably.', 1),
    (v_s01, 1, 'How important is it to work out exactly why auto-complete chose the wrong address before taking any steps to contain the breach?', 'Not important at all', 'This is not important at all at this stage because understanding the technical cause can wait until after the breach has been contained. It is not even of minor importance in the immediate moment, because it does nothing to protect the patient''s information right now.', 2);

  -- S02
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A patient with limited English is discussing a new diagnosis. Their adult daughter offers to interpret so that the appointment can move more quickly.')
  RETURNING id INTO v_s02;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s02, 1, 'How important is it to offer a professional interpreter for important clinical discussions, even if the daughter is willing to help?', 'Very important', 'This is very important because accurate communication, confidentiality, and the patient''s own understanding are central to safe care and valid decision making. It is more than simply important because using an appropriate interpreter may materially affect the quality and independence of the discussion.', 0),
    (v_s02, 2, 'You continue the full discussion using only the daughter as interpreter because she knows the family well and it will save time.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it risks misunderstanding, reduces privacy, and may make it harder for the patient to speak freely. It is worse than ''Inappropriate, but not awful'' because time pressure is being allowed to override a core safeguard in an important clinical conversation.', 1),
    (v_s02, 2, 'You thank the daughter for helping the patient feel comfortable, but arrange a professional interpreter for the key discussion and any consent decisions.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it correctly balances acknowledging the daughter''s supportive role with ensuring that the key clinical discussion and any consent decisions are handled through a professional interpreter. GMC Consent guidance makes clear that professional interpreters should be used for important clinical discussions where accuracy, privacy, and the patient''s ability to speak freely all matter. This response fully addresses that requirement rather than leaving any part of it unresolved.', 2);

  -- S03
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A senior doctor asks you to write in the notes that you performed an examination yourself, even though you were not present and did not examine the patient.')
  RETURNING id INTO v_s03;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s03, 2, 'You explain that you cannot document something you did not personally do, and ask that the record is completed accurately.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it protects the accuracy of the record while remaining professional and direct. It is stronger than ''Appropriate, but not ideal'' because it addresses the issue clearly rather than leaving misleading documentation in place.', 0),
    (v_s03, 2, 'You add the note anyway because the senior doctor is likely to have done the examination and questioning them could damage the relationship.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it creates a false record and places loyalty to hierarchy above honesty. It is worse than ''Inappropriate, but not awful'' because it involves knowingly documenting something untrue rather than making a less serious lapse in judgment.', 1),
    (v_s03, 1, 'How important is it that the notes clearly show who actually examined the patient and when?', 'Very important', 'This is very important because medical records must be accurate, attributable, and trustworthy for ongoing patient care. It is more than merely important because inaccurate attribution can directly undermine clinical decision making and accountability.', 2);

  -- S04
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A fellow student uploads a photo from theatre to social media. A whiteboard can be seen in the background and may contain patient details.')
  RETURNING id INTO v_s04;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s04, 2, 'You tell the student to take the post down immediately, explain the confidentiality concern, and escalate if they refuse.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it aims to stop any ongoing breach quickly and addresses the behaviour in a proportionate way. It is stronger than ''Appropriate, but not ideal'' because it does not leave the risky post visible while you decide what to do.', 0),
    (v_s04, 2, 'You ignore it because the patient details are only partly visible and most people probably will not notice them.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because the post is live and accessible, and partial visibility of patient details does not reduce the duty to act – possible identification is enough to require immediate action. Choosing to ignore it is not a passive oversight; it is a decision to leave an active confidentiality risk in place. The motive may be to avoid confrontation rather than to expose information deliberately, but that does not meaningfully reduce the seriousness of an ongoing breach. This is worse than ''Inappropriate, but not awful'' because there is a clear duty to act and a conscious choice not to.', 1),
    (v_s04, 1, 'How important is it to consider whether the image or its background could identify a patient before deciding whether further action is needed?', 'Important', 'This is important because the degree of identifiability affects the seriousness of the incident and the next steps. It is not ''Very important'' because the immediate priority is to remove the post and stop further sharing; assessing the exact level of risk comes just after that.', 2);

  -- S05
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 1, 'On a very busy ward round, a tired junior doctor says there is no time to do another identity and allergy check before giving a regular medication.')
  RETURNING id INTO v_s05;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s05, 1, 'How important is it to complete the identity and allergy check before the medication is given?', 'Very important', 'This is very important because checking the right patient, medicine, and allergies is a basic patient-safety step. It is more than merely important because skipping it could cause immediate avoidable harm.', 0),
    (v_s05, 2, 'You give the medication without the check because the patient has been on it for days and the ward is extremely busy.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because workload pressure does not justify bypassing a core safety check. It is worse than ''Inappropriate, but not awful'' because it knowingly exposes the patient to preventable risk for the sake of convenience or speed.', 1),
    (v_s05, 1, 'How important is it to raise the workload and staffing pressure afterwards so that repeated unsafe shortcuts are less likely?', 'Important', 'This is important because systems pressures should be addressed and not ignored. It is not ''Very important'' in the moment because the immediate priority is still to carry out the safety check before the drug is given.', 2);

  -- S06
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A patient says they do not want to hear the full details of a likely cancer diagnosis and would prefer their spouse to be told first and help decide what is discussed.')
  RETURNING id INTO v_s06;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s06, 1, 'How important is it to explore exactly what the patient does and does not want to know, and what they consent to be shared with their spouse?', 'Very important', 'This is very important because patient preferences about information and confidentiality must be clarified rather than assumed. It is more than simply important because the whole conversation depends on understanding the patient''s wishes accurately.', 0),
    (v_s06, 2, 'You insist on telling the patient every detail immediately because patients must always hear the full diagnosis directly from the doctor.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it ignores the patient''s expressed preferences and treats a complex communication issue as rigidly one-size-fits-all. It is worse than ''Inappropriate, but not awful'' because it overrides patient autonomy rather than handling it imperfectly.', 1),
    (v_s06, 2, 'You document the patient''s wishes, make sure they understand the broad situation, and involve a senior colleague if you are unsure how best to proceed.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it respects the patient''s wishes while ensuring the situation is handled safely and transparently. It is stronger than ''Appropriate, but not ideal'' because it combines clarification, documentation, and appropriate support rather than relying on guesswork.', 2);

  -- S07
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'During teaching on the ward, a doctor makes belittling comments about a nurse in front of students and then laughs it off.')
  RETURNING id INTO v_s07;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s07, 2, 'You speak to the doctor privately afterwards and explain that the comments were disrespectful and undermining.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because addressing the doctor privately is a reasonable and professional first response. It falls short of ''A very appropriate thing to do'' because if the behaviour is serious or repeated, a more formal step may still be needed rather than relying only on a quiet word.', 0),
    (v_s07, 1, 'How important is it to ask other students whether they also thought the comments were inappropriate before deciding what to do?', 'Of minor importance', 'This is of minor importance because another perspective may help you judge the situation more confidently, but it is not central to acting professionally yourself. It is not ''Important'' because you do not need group agreement before addressing obviously disrespectful behaviour.', 1),
    (v_s07, 2, 'You laugh along so that the session does not become awkward.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the motivation may be to avoid conflict rather than to endorse the behaviour fully. However, it is still wrong because it helps normalise disrespectful conduct toward a colleague.', 2);

  -- S08
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A patient says they do not want to be treated by the registrar assigned to them because of the registrar''s ethnicity.')
  RETURNING id INTO v_s08;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s08, 1, 'How important is it to support the registrar and address the discriminatory request rather than simply treating it as a routine preference?', 'Very important', 'This is very important because discriminatory behaviour affects staff wellbeing, fairness, and the professional environment as well as patient care. It is more than merely important because the issue is not just one of convenience or scheduling.', 0),
    (v_s08, 2, 'You move the patient to another doctor immediately because it is the fastest way to keep clinic running on time.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because silently accommodating a racially discriminatory demand – without any challenge or explanation – effectively endorses it, regardless of the motive. Whatever the intention, the outcome is that a discriminatory request is granted without question, the registrar is left unsupported, and the behaviour is reinforced. GMC Good Medical Practice requires doctors to treat colleagues fairly regardless of protected characteristics, and the Equality Act 2010 places clear duties on healthcare professionals in this area. There is no meaningful mitigating value in an action whose net effect is to endorse discrimination, which makes this more serious than ''Inappropriate, but not awful''.', 1),
    (v_s08, 2, 'You explain that discriminatory requests are not routinely accommodated, support the registrar, and seek senior help if the situation becomes difficult.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it supports a colleague while managing the situation through an appropriate authority if needed. It is stronger than ''Appropriate, but not ideal'' because it does not simply avoid the problem or leave the registrar unsupported.', 2);

  -- S09
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'While reviewing blood results with a senior, you notice one result is clearly flagged as critical. The senior moves on quickly and seems not to have noticed it.')
  RETURNING id INTO v_s09;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s09, 1, 'How important is it to raise the concern promptly rather than assume someone else will notice later?', 'Very important', 'This is very important because a critical result may require urgent action and should not be ignored. It is more than merely important because delay could directly affect patient safety.', 0),
    (v_s09, 2, 'You check the result and patient details, then draw the senior''s attention to it promptly, or seek another clinician if necessary.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it combines a quick factual check with prompt escalation to protect the patient. It is stronger than ''Appropriate, but not ideal'' because it does not leave the result unaddressed or rely on hope that someone else will spot it.', 1),
    (v_s09, 2, 'You decide to mention it at the next teaching session because interrupting now may make the senior doctor look careless.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it places the senior''s image above a potentially urgent patient-safety issue. It is worse than ''Inappropriate, but not awful'' because the delay is deliberate despite a clear reason to act promptly.', 2);

  -- S10
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A close friend messages you a photograph of a rash and asks you to confirm that it is nothing serious so they do not need to book an appointment.')
  RETURNING id INTO v_s10;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s10, 2, 'You explain that you cannot safely diagnose it through an informal message and suggest booking a proper appointment if they remain worried.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because it refuses unsafe informal diagnosis and points the friend toward proper care. It falls short of ''A very appropriate thing to do'' because it is fairly general and may not sufficiently signpost urgency, red flags, or appropriate routes if the problem is more serious.', 0),
    (v_s10, 2, 'You tell them the likely diagnosis and suggest treatment because you have recently revised dermatology and do not want them to worry.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it goes beyond your competence and treats an informal image as if it were a proper consultation. It is worse than ''Inappropriate, but not awful'' because you are giving specific clinical advice on an unsafe basis.', 1),
    (v_s10, 1, 'How important is it to maintain professional boundaries even when someone asking for advice is a friend?', 'Important', 'This is important because boundaries matter and help prevent informal, unsafe practice. It is not ''Very important'' here because the most immediate issue is the unsafe attempt to diagnose without an adequate assessment; the boundary point supports that judgment rather than replacing it.', 2);

  -- S11
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'At the end of a drug round, a discrepancy is found in the controlled drug count and one dose cannot be accounted for.')
  RETURNING id INTO v_s11;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s11, 1, 'How important is it to report the discrepancy through the correct local process rather than trying to fix the count quietly?', 'Very important', 'This is very important because controlled drug discrepancies can have serious safety, legal, and governance implications. It is more than merely important because proper reporting is a core requirement, not an optional extra.', 0),
    (v_s11, 2, 'You ask a colleague to cover your patients briefly while you check the records carefully and inform the appropriate senior or pharmacist.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it balances patient care with prompt, responsible investigation and escalation. It is stronger than ''Appropriate, but not ideal'' because it does not leave the discrepancy unexplored or try to manage it informally.', 1),
    (v_s11, 2, 'You ignore the missing dose because counting mistakes happen and you do not want to create trouble if it turns up later.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it dismisses a potentially serious issue without any attempt to investigate or report it. It is worse than ''Inappropriate, but not awful'' because the choice is to do nothing despite a clear duty to act.', 2);

  -- S12
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'During a rushed handover, you realise after leaving that you forgot to mention the patient''s severe antibiotic allergy to the evening team.')
  RETURNING id INTO v_s12;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s12, 2, 'You contact the evening team immediately to correct the handover and make sure the allergy information is clear.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it directly corrects an omission that could affect patient safety. It is stronger than ''Appropriate, but not ideal'' because it acts promptly rather than assuming the information will be noticed elsewhere.', 0),
    (v_s12, 1, 'How important is it to reflect on how your handover was structured so that you are less likely to omit critical details in future?', 'Important', 'This is important because improving handover practice matters and can prevent repeated mistakes. It is not ''Very important'' in the immediate situation because the first priority is to correct the omitted information for this patient.', 1),
    (v_s12, 2, 'You decide the team will probably check the electronic record themselves, so there is no need to interrupt them now.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it relies on assumption rather than ensuring a key safety detail is handed over. It is worse than ''Inappropriate, but not awful'' because the omission relates to a known severe allergy with obvious potential consequences.', 2);

  -- S13
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A worried relative telephones the ward asking for an update. They know the patient''s full name and date of birth but you do not recognise the caller.')
  RETURNING id INTO v_s13;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s13, 1, 'How important is it to check the patient''s wishes and the caller''s identity before sharing confidential information?', 'Very important', 'This is very important because knowing patient identifiers does not automatically entitle someone to clinical information. It is more than merely important because confidentiality depends on verifying both identity and the patient''s consent or best interests.', 0),
    (v_s13, 2, 'You give a brief update because the caller sounds genuine and already knows the patient''s details.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the caller may indeed be genuine and the intention is to reassure them, not to disclose recklessly. However, it is still wrong because sounding convincing is not enough to justify sharing confidential information.', 1),
    (v_s13, 2, 'You explain that you need to check what can be shared and, if appropriate, arrange to call back using verified contact details.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it protects confidentiality while still trying to help through a safe process. It is stronger than ''Appropriate, but not ideal'' because it does not rely on guesswork or partial reassurance alone.', 2);

  -- S14
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A patient eligible for a research study seems unsure. The clinician recruiting them says participation would be the sensible thing to do and keeps pressing the benefits.')
  RETURNING id INTO v_s14;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s14, 2, 'You make clear that participation is voluntary and that their usual care will not be affected if they decline.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it protects voluntary decision making and separates research from routine care. It is stronger than ''Appropriate, but not ideal'' because it directly counters the pressure being applied.', 0),
    (v_s14, 2, 'You tell the patient that most sensible people would take part because the study may help them and future patients.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it uses pressure and judgmental language rather than supporting a free decision. It is worse than ''Inappropriate, but not awful'' because it actively pushes the patient rather than merely explaining the study imperfectly.', 1),
    (v_s14, 1, 'How important is it that the patient does not feel pressured to join a study by someone involved in their care?', 'Very important', 'This is very important because consent to research must be voluntary and free from undue influence. It is more than merely important because pressure can undermine the legitimacy of the patient''s decision.', 2);

  -- S15
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A patient needs an intimate examination and says they would strongly prefer a female chaperone. None is immediately available.')
  RETURNING id INTO v_s15;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s15, 1, 'How important is it to take the patient''s preference about a chaperone seriously and discuss the available options?', 'Very important', 'This is very important because dignity, comfort, and trust are central in intimate examinations. It is more than merely important because ignoring the preference could undermine consent and the therapeutic relationship.', 0),
    (v_s15, 2, 'You proceed immediately without discussing a chaperone because the examination is brief and the clinic is running late.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it ignores a clearly stated preference in a sensitive situation. It is worse than ''Inappropriate, but not awful'' because the patient''s dignity and comfort are being brushed aside for convenience.', 1),
    (v_s15, 2, 'You acknowledge the preference, explain the options such as waiting, rearranging, or seeing whether a suitable chaperone can be found, and let the patient decide.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it respects the patient''s preference and supports a genuine choice about how to proceed. It is stronger than ''Appropriate, but not ideal'' because it is patient-centred and transparent rather than dismissive or rushed.', 2);

  -- S16
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A colleague missed mandatory safeguarding training because of service pressures and asks you to sign them in as if they had attended.')
  RETURNING id INTO v_s16;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s16, 2, 'You sign them in because they intended to come and the ward was genuinely too busy.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the motivation may be sympathy for a colleague in a difficult service situation rather than deliberate gain. However, it is still dishonest and undermines the purpose of mandatory training.', 0),
    (v_s16, 1, 'How important is honesty in training records and declarations of attendance?', 'Very important', 'This is very important because honesty in records and formal declarations is a fundamental professional duty under GMC Good Medical Practice, not a secondary consideration. Falsifying attendance at mandatory safeguarding training is particularly serious because the training exists specifically to protect vulnerable patients, and a false declaration means the colleague is treated as compliant when they are not. It is more than merely important because the dishonesty is not a minor administrative matter – it undermines the integrity of a safeguard that exists for a clear patient-protection purpose.', 1),
    (v_s16, 2, 'You advise the colleague to explain the genuine reason for missing the session and arrange to complete the training properly.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it is honest, supportive, and helps the colleague resolve the issue properly. It is stronger than ''Appropriate, but not ideal'' because it addresses both the missed training and the temptation to falsify attendance.', 2);

  -- S17
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 1, 'A prescribing system glitches and almost generates the wrong dose. You catch it before it reaches the patient.')
  RETURNING id INTO v_s17;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s17, 1, 'How important is it to report the near miss through the incident system even though no patient was harmed?', 'Very important', 'This is very important because near misses can reveal safety problems that need to be fixed before harm occurs. It is more than merely important because formal reporting is how the risk is made visible to the wider system.', 0),
    (v_s17, 2, 'You mention the glitch informally to a few colleagues but do not make a formal report because the error was caught in time.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because informal word-of-mouth is not a reliable substitute for proper reporting of a systems problem. It is worse than ''Inappropriate, but not awful'' because you are consciously choosing not to use the correct safety process.', 1),
    (v_s17, 1, 'How important is it to ask whether others have seen the same glitch before you submit the report?', 'Of minor importance', 'This is of minor importance because extra context may strengthen the report, but it is not central to the duty to report the near miss. It is not ''Important'' because the report should still be made even if no one else has yet noticed the problem.', 2);

  -- S18
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A recent patient sends you a friend request on a personal social media account.')
  RETURNING id INTO v_s18;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s18, 2, 'You do not accept the request and keep professional boundaries in place.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it protects professional boundaries and reduces the risk of inappropriate contact. It is stronger than ''Appropriate, but not ideal'' because it is the clearest and safest response.', 0),
    (v_s18, 2, 'You accept the request but decide you will not discuss health matters online.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the boundary problem remains even if you intend not to talk about clinical issues. It is still wrong because accepting the request can blur the professional relationship, even if the motive is politeness.', 1),
    (v_s18, 1, 'How important is it to review your privacy settings after an event like this?', 'Important', 'This is important because good privacy settings reduce future boundary problems and unintended disclosures. It is not ''Very important'' because it is a sensible preventive step rather than the core response to the current request.', 2);

  -- S19
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A colleague becomes tearful and visibly shaken after a patient dies unexpectedly, but says they are fine to continue with a practical procedure straight away.')
  RETURNING id INTO v_s19;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s19, 1, 'How important is it to consider whether your colleague is fit to continue if their distress could affect patient safety?', 'Very important', 'This is very important because distress can affect concentration, decision making, and safe performance of procedures. It is more than merely important because there may be an immediate risk to the next patient.', 0),
    (v_s19, 2, 'You quietly ask whether they need a pause and alert a senior if you think their ability to work safely may be affected.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it is supportive while still putting safety first. It is stronger than ''Appropriate, but not ideal'' because it does not simply express sympathy and walk away.', 1),
    (v_s19, 2, 'You leave them alone because bringing it up might embarrass them and make the situation worse.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the instinct to avoid adding to someone''s distress is understandable. However, it is still wrong because it fails to address a possible immediate safety issue.', 2);

  -- S20
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A nurse asks you to prescribe a medication urgently, saying it is routinely used on the ward, but you are unfamiliar with the drug and cannot access the usual senior doctor immediately.')
  RETURNING id INTO v_s20;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s20, 2, 'You explain that you need to check the indication, dose, allergies, and local guidance or get advice before prescribing.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it recognises the limits of your competence and protects the patient from unsafe prescribing. It is stronger than ''Appropriate, but not ideal'' because it makes safety, not speed, the deciding factor.', 0),
    (v_s20, 2, 'You prescribe it now because the nurse seems confident and delaying may annoy the team.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because you would be prescribing without adequate knowledge or verification. It is worse than ''Inappropriate, but not awful'' because it knowingly steps outside safe professional limits.', 1),
    (v_s20, 1, 'How important is it to recognise and work within the limits of your competence when prescribing?', 'Very important', 'This is very important because prescribing errors can cause direct patient harm and competence limits must be respected. It is more than merely important because this principle is central to safe clinical practice.', 2);

  -- S21
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'You discover that a fellow student has copied large parts of a reflective assignment from material found online and plans to submit it unchanged.')
  RETURNING id INTO v_s21;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s21, 2, 'You tell the student they need to correct it and seek support if they are struggling, and you make clear that you cannot ignore it if they submit it unchanged.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because speaking to the student first can be a reasonable initial step and gives them a chance to act honestly. It falls short of ''A very appropriate thing to do'' because the seriousness of the misconduct means you may still need to escalate promptly rather than rely on the student''s word.', 0),
    (v_s21, 2, 'You ignore it because reflective assignments do not affect patient care directly.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the lack of immediate patient harm may make the issue feel less urgent. However, it is still wrong because honesty and integrity in training are important professional matters.', 1),
    (v_s21, 1, 'How important is academic honesty to professional trustworthiness, even in non-clinical assessed work?', 'Very important', 'This is very important because academic honesty is not a lower-stakes version of professional integrity – it is the same duty applied in a training context. GMC Good Medical Practice makes clear that doctors must be honest and act with integrity at all times, and this applies equally during education and assessment. Dishonesty in assessed work, even work that is not directly clinical, can reflect directly on a future professional''s trustworthiness and is treated seriously by medical schools and regulators for exactly that reason. It is more than merely important for the same reason that honesty with patients is: the whole basis of professional trust depends on it.', 2);

  -- S22
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'The clinic is running very late. A patient is about to leave with new medication, but it is clear they do not understand the dosing instructions or follow-up plan.')
  RETURNING id INTO v_s22;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s22, 2, 'You pause the discharge briefly, check the patient''s understanding, and make sure the medication and follow-up instructions are clear before they go.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it puts safe discharge and patient understanding ahead of clinic pressure. It is stronger than ''Appropriate, but not ideal'' because it deals with the immediate safety issue directly and completely.', 0),
    (v_s22, 2, 'You hand over the written leaflet only because the clinic is delayed and the patient can read it later at home.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because you already know the patient does not understand the instructions and are choosing speed over safe communication. It is worse than ''Inappropriate, but not awful'' because the risk is obvious at the point of discharge.', 1),
    (v_s22, 1, 'How important is it to raise recurring delay or workflow problems with the team after the patient has been made safe?', 'Important', 'This is important because repeated system pressures should be addressed rather than accepted as normal. It is not ''Very important'' in the immediate moment because first you must ensure this patient''s discharge is safe.', 2);

  -- S23
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (3, 2, 'A patient who lacks capacity arrives with a long-time carer. The carer is upset and insists on making the decision alone without hearing from the rest of the team.')
  RETURNING id INTO v_s23;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s23, 1, 'How important is it to involve the relevant team and follow the proper best-interests process rather than relying on one person''s view alone?', 'Very important', 'This is very important because decisions for a patient who lacks capacity should be made through a proper best-interests process, not by defaulting to a single voice. It is more than merely important because the decision-making framework itself matters here.', 0),
    (v_s23, 2, 'You thank the carer for their insight, gather relevant information from them and the team, and seek senior support to ensure the decision is made properly.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it values the carer''s knowledge without giving them sole unchecked authority. It is stronger than ''Appropriate, but not ideal'' because it combines compassion with the correct decision-making process.', 1),
    (v_s23, 2, 'You let the carer decide on their own because they know the patient best and are clearly very invested.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it hands over a formal best-interests decision to one person without the proper process. It is worse than ''Inappropriate, but not awful'' because the error is fundamental rather than a minor imperfection in communication.', 2);

END $$;
