-- Reseed: Timed SJ Test 1 (test_id = 1)
-- Clears all existing SJ timed content and re-inserts Test 1 from the updated source.
-- label_set: 1 = importance scale, 2 = appropriateness scale

-- Clear existing Test 1 data only (questions first due to FK, then scenarios)
DELETE FROM timed_situational_judgement_questions
WHERE scenario_id IN (
  SELECT id FROM timed_situational_judgement_scenarios WHERE test_id = 1
);
DELETE FROM timed_situational_judgement_scenarios WHERE test_id = 1;

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
  VALUES (1, 1, 'A patient has been diagnosed with a sexually transmitted infection (STI) but is reluctant to tell their sexual partner. The patient is worried about the impact this may have on their relationship.')
  RETURNING id INTO v_s01;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s01, 1, 'How important is it to address the patient''s reluctance to disclose their STI diagnosis to their partner?', 'Very important', 'This is very important because the doctor should explore the patient''s concerns, encourage honest disclosure, and consider the risk of harm to others rather than ignoring the issue.', 0),
    (v_s01, 1, 'How important is it to protect the patient''s privacy and confidentiality while discussing this situation?', 'Very important', 'This is very important because confidentiality remains a core duty, although it should be balanced carefully against any risk of serious harm to others and the need to support safe, honest decision-making.', 1),
    (v_s01, 2, 'The doctor tells the patient that, to avoid stress on the relationship, they can lie to their partner and conceal the STI diagnosis.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it encourages dishonesty, risks the partner''s health, and fails to support responsible and ethical behaviour.', 2);

  -- S02
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'You are discussing a patient''s poor prognosis with two colleagues in a hospital cafe when you notice that a relative of the patient is sitting nearby and may be able to hear the conversation.')
  RETURNING id INTO v_s02;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s02, 1, 'How important is it to address the fact that the patient''s confidential information may be overheard?', 'Very important', 'This is very important because patient information should only be discussed in appropriate settings where confidentiality can be maintained.', 0),
    (v_s02, 2, 'You stop the conversation, suggest moving somewhere private, and later remind your colleagues to be more careful about discussing confidential information in public areas.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it protects confidentiality immediately and addresses the behaviour proportionately without escalating further than necessary.', 1),
    (v_s02, 2, 'You ignore the relative''s presence and continue discussing the patient with your colleagues.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it risks a serious breach of confidentiality and shows poor professional judgement.', 2);

  -- S03
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 1, 'Dr. Katherine Johnson is consulting with Mr. Michael Smith, who has been advised to start a recommended treatment. Mr. Smith is worried about side effects and is unsure whether he wants to go ahead.')
  RETURNING id INTO v_s03;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s03, 1, 'How important is it to discuss Mr. Smith''s worries and concerns about the proposed treatment?', 'Very important', 'This is very important because good decision-making depends on understanding the patient''s concerns and responding to them respectfully.', 0),
    (v_s03, 1, 'How important is it to inform Mr. Smith about the potential benefits, risks, and consequences of refusing the recommended treatment?', 'Very important', 'This is very important because patients need clear and balanced information in order to make an informed decision about their care.', 1),
    (v_s03, 2, 'You tell Mr. Smith that he must take the medication regardless of his concerns.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it is coercive, dismisses the patient''s autonomy, and does not support informed consent.', 2);

  -- S04
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 1, 'Dr. Olivia Davis is part of a team caring for an elderly patient, Mr. Robert Wilson. The team believes that further treatment is unlikely to help and may cause harm, but Mr. Wilson strongly wishes to explore all reasonable options.')
  RETURNING id INTO v_s04;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s04, 1, 'How important is it to have an open and honest discussion with Mr. Wilson about the likely benefits and burdens of further treatment?', 'Very important', 'This is very important because the patient should be given honest information and involved properly in decisions about their care.', 0),
    (v_s04, 1, 'How important is it to consider seeking a second opinion or senior review if uncertainty or disagreement remains after discussion?', 'Important', 'This is important because a second opinion can be helpful when there is uncertainty or disagreement, but it is not automatically the first or only priority in every case.', 1),
    (v_s04, 2, 'Dr. Olivia Davis dismisses Mr. Wilson''s wish for further treatment without discussing his concerns or explaining the reasoning.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it is dismissive, undermines shared decision-making, and fails to respect the patient''s perspective.', 2);

  -- S05
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 1, 'A medical student, Alex Mitchell, is observing Dr. Olivia Turner on a ward round. Alex notices from the notes that the patient, Mr. Smith, has a documented penicillin allergy just as Dr. Turner begins prescribing antibiotics.')
  RETURNING id INTO v_s05;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s05, 1, 'How important is it to make sure Mr. Smith''s penicillin allergy is raised before the prescription is completed?', 'Very important', 'This is very important because preventing avoidable patient harm must be a priority.', 0),
    (v_s05, 1, 'How important is it to tell Dr. Turner promptly and, if possible, do so in a professional way that does not cause unnecessary embarrassment?', 'Very important', 'This is very important because the concern should be raised immediately, while still aiming to communicate respectfully and effectively.', 1),
    (v_s05, 2, 'Alex ignores the allergy information and says nothing because Dr. Turner is the senior doctor.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because hierarchy should not prevent someone from raising a clear patient safety concern.', 2);

  -- S06
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 1, 'Dr. Olivia Williams is at a social gathering with friends, including Dr. Ethan Turner. During the evening, Dr. Turner makes an offensive joke about a colleague from a minority background.')
  RETURNING id INTO v_s06;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s06, 1, 'How important is it to address Dr. Turner''s offensive joke rather than simply letting it pass?', 'Very important', 'This is very important because discriminatory behaviour should be challenged rather than normalised, and addressing it in the moment — even if briefly or imperfectly — sets a clear boundary and signals that such remarks are unacceptable. GMC Good Medical Practice requires doctors to treat colleagues with respect and to challenge behaviour that falls below this standard. Failing to respond at all risks endorsing the behaviour by omission.', 0),
    (v_s06, 1, 'How important is it to speak with Dr. Turner privately afterwards if addressing it in the moment is not the best option?', 'Very important', 'This is very important because a private follow-up is often an effective and proportionate way to challenge unacceptable behaviour.', 1),
    (v_s06, 2, 'You respond to Dr. Turner''s offensive joke with laughter or by making similar remarks.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it endorses the behaviour and contributes to an unprofessional and disrespectful culture.', 2);

  -- S07
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 1, 'Dr. Katherine Davis is a junior doctor in a very busy emergency department. A patient with severe breathing difficulty has just been moved into a resuscitation bay, and the senior doctor asks Dr. Davis to help while the senior leads the immediate treatment.')
  RETURNING id INTO v_s07;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s07, 1, 'How important is it for Dr. Davis to help within her level of competence, for example by gathering notes, equipment, or observations rather than attempting tasks she is not trained to do?', 'Very important', 'This is very important because junior staff should contribute in emergencies, but always within the limits of their competence so that patient safety is protected.', 0),
    (v_s07, 1, 'How important is it to communicate any relevant history, allergies, or recent observations to the senior doctor promptly?', 'Very important', 'This is very important because clear communication of key information can directly affect safe decision-making in an emergency.', 1),
    (v_s07, 1, 'How important is it to take part in a brief debrief afterwards to reflect on what went well and what could be improved?', 'Important', 'This is important because debriefing supports learning and safer teamwork, although it is not as immediately urgent as the patient''s care during the emergency itself.', 2);

  -- S08
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 1, 'A medical student, John Mitchell, is on placement in the internal medicine department when he hears Dr. Turner say that he does not want to treat a particular patient because he finds them difficult and annoying.')
  RETURNING id INTO v_s08;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s08, 1, 'How important is it to address Dr. Turner''s statement and ensure the patient is not denied appropriate care?', 'Very important', 'This is very important because patients must not be disadvantaged because of a clinician''s personal feelings.', 0),
    (v_s08, 1, 'How important is it to report the statement to a supervisor or another appropriate senior if the patient may be put at risk?', 'Very important', 'This is very important because a refusal to provide care for improper reasons is a serious professionalism and patient safety concern.', 1),
    (v_s08, 2, 'John ignores the statement and does not raise it with anyone.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it fails to act on a potentially serious concern about patient care.', 2);

  -- S09
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 1, 'You are working on a busy ward and notice that Dr. Davis has been on shift for a prolonged period, appears exhausted, and is starting to forget details and lose concentration.')
  RETURNING id INTO v_s09;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s09, 1, 'How important is it to address Dr. Davis''s exhaustion and its possible impact on patient safety?', 'Very important', 'This is very important because fatigue can impair judgement and performance and may put patients at risk.', 0),
    (v_s09, 1, 'How important is it to encourage Dr. Davis to take a break or seek support so she can work safely?', 'Very important', 'This is very important because offering practical support is an appropriate first step when a colleague is struggling.', 1),
    (v_s09, 1, 'How important is it to inform a senior if Dr. Davis remains too fatigued to work safely or refuses to take action?', 'Very important', 'This is very important because concerns that may affect patient safety should be escalated when they cannot be resolved directly.', 2);

  -- S10
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 1, 'Dr. Olivia is examining a baby in the paediatrics department when the baby''s mother becomes very distressed and says she does not want anyone else to examine her child.')
  RETURNING id INTO v_s10;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s10, 1, 'How important is it to address the mother''s distress and reluctance to allow the examination?', 'Very important', 'This is very important because the mother''s distress may affect the child''s care and must be handled sensitively.', 0),
    (v_s10, 1, 'How important is it to communicate calmly and empathetically, explaining why the examination is needed and listening to the mother''s concerns?', 'Very important', 'This is very important because clear and compassionate communication is central to building trust and supporting informed decisions.', 1),
    (v_s10, 1, 'How important is it to involve a nurse or another appropriate colleague to help support and reassure the mother if needed?', 'Important', 'This is important because extra support may help de-escalate the situation, although the immediate priority remains calm communication with the mother.', 2);

  -- S11
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'Alex Johnson is a surgical trainee. Over several weeks, a senior doctor has made repeated sexually suggestive comments towards Alex in the workplace, leaving Alex uncomfortable and distracted.')
  RETURNING id INTO v_s11;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s11, 2, 'Alex Johnson documents the incidents and reports them through appropriate hospital channels, seeking support from a supervisor, educational lead, or HR.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because repeated sexual comments are unacceptable, and using proper reporting and support channels is a sensible and professional response.', 0),
    (v_s11, 2, 'Alex Johnson continues to ignore the comments and tries to focus only on work.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the reaction may be understandable in a difficult power imbalance, but it still fails to address repeated unacceptable behaviour.', 1),
    (v_s11, 2, 'Alex Johnson confronts Dr. Davis publicly in the middle of the workplace to make it clear that the comments are unacceptable.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because, while the impulse to challenge the behaviour is understandable, doing so publicly in a workplace setting during a power-imbalance situation is likely to be counterproductive. It risks embarrassing both parties, triggering retaliation, and undermining any formal process that may follow. It is better than doing nothing, which is why it does not reach ''A very inappropriate thing to do'', but it falls short of any threshold of appropriateness when more effective and safer channels are available.', 2);

  -- S12
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 1, 'John, a medical student on ward rounds, overhears two doctors criticising their consultant in front of a patient and making comments that could undermine the patient''s confidence in the team.')
  RETURNING id INTO v_s12;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s12, 1, 'How important is it to approach the doctors privately and address the issue?', 'Very important', 'This is very important because the behaviour is unprofessional and should be challenged in a proportionate way.', 0),
    (v_s12, 2, 'Do nothing and allow the situation to resolve itself.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it allows unprofessional behaviour to continue and may damage the patient''s trust in the team.', 1),
    (v_s12, 1, 'How important is it to inform a supervising consultant or another senior if the behaviour is serious, repeated, or has clearly affected the patient?', 'Important', 'This is important because escalation may be needed when the concern is serious or cannot be resolved directly, but a private challenge is often the proportionate first step.', 2);

  -- S13
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'Dr. Emily Rodriguez, a foundation year doctor, is helping manage a stable but urgent case in the emergency department when a nurse alerts her that another patient nearby has suddenly become acutely short of breath and needs immediate attention.')
  RETURNING id INTO v_s13;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s13, 1, 'How important is it to alert a senior or another available clinician immediately so the deteriorating patient is not left waiting?', 'Very important', 'This is very important because a potentially deteriorating patient requires prompt attention, even if you are already busy.', 0),
    (v_s13, 2, 'Dr. Rodriguez immediately alerts a nearby senior clinician and follows instructions so that the short of breath patient is assessed without delay.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it prioritises the unwell patient quickly while making sensible use of team support.', 1),
    (v_s13, 2, 'Dr. Rodriguez decides to take a short break first and deal with the short of breath patient afterwards.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it delays attention to a potentially urgent patient for no good reason.', 2);

  -- S14
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'Dr. James Patel, a junior trainee in theatre, notices that the swab count may be incorrect during an operation and is not sure whether all items used during the procedure have been accounted for.')
  RETURNING id INTO v_s14;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s14, 1, 'How important is it to inform the senior surgeon immediately and seek guidance?', 'Very important', 'This is very important because a possible error during an operation is a patient safety issue and should be raised without delay.', 0),
    (v_s14, 2, 'Dr. Patel immediately voices the concern and asks the team to confirm the count before the operation proceeds further.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it raises the concern promptly and helps the team address a potential safety problem before harm occurs.', 1),
    (v_s14, 2, 'Dr. Patel says nothing and allows the operation to continue as planned, despite the possible discrepancy.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because ignoring a possible safety issue during surgery could place the patient at significant risk.', 2);

  -- S15
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'Dr. Michael Turner, a foundation year doctor, is called to see a post-operative patient who suddenly develops severe chest pain and appears unwell.')
  RETURNING id INTO v_s15;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s15, 2, 'Administering pain relief medication to the patient without first assessing them or seeking help.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it may mask a serious problem and delays proper assessment of an unwell patient.', 0),
    (v_s15, 1, 'How important is it to notify the patient''s family before the patient has been assessed?', 'Of minor importance', 'This is of minor importance at this stage because the immediate priority is to assess the patient, initiate appropriate management, and seek senior help if needed. Family notification is not the first concern and should not divert attention from the patient''s urgent needs. It is not completely without relevance in every circumstance — for example, if family are already present or there is a welfare arrangement in place — but it remains a very low priority compared to the clinical response required.', 1),
    (v_s15, 2, 'Quickly assessing the patient, checking observations, and calling for senior help if needed.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because a deteriorating patient should be assessed promptly and escalated appropriately.', 2);

  -- S16
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'Dr. Ahmed Rahman, a foundation year doctor on the obstetrics and gynaecology ward, is asked by Mary Johnson to arrange an elective procedure immediately because it would suit her personal plans, even though there is no urgent clinical need.')
  RETURNING id INTO v_s16;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s16, 2, 'Politely declining Mary Johnson''s request without any further discussion.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the request may not be suitable, but simply refusing without explanation does not support good communication or shared decision-making.', 0),
    (v_s16, 2, 'Performing the requested procedure simply to accommodate the patient''s wishes, without proper assessment or senior agreement.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because decisions about procedures should be based on clinical judgement, informed discussion, and appropriate supervision.', 1),
    (v_s16, 2, 'Engaging in a thorough discussion with Mary Johnson about the reasons for her request, explaining the options, and involving a senior clinician if needed.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it respects the patient''s concerns while ensuring decisions are made safely and appropriately.', 2);

  -- S17
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'Dr. Emily Rodriguez, a foundation year doctor, is asked by a registrar to write up a prescription. When checking the chart, she notices that the medication may interact with another treatment the patient is already receiving.')
  RETURNING id INTO v_s17;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s17, 2, 'Proceeding with the prescription exactly as instructed without checking the possible interaction.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it ignores a possible patient safety risk and fails to use professional judgement.', 0),
    (v_s17, 1, 'How important is it to seek guidance from a senior colleague, pharmacist, or another appropriate source before the prescription is completed?', 'Very important', 'This is very important because a possible prescribing problem should be clarified before a patient is exposed to harm.', 1),
    (v_s17, 2, 'Pausing the prescription and asking a senior clinician to review it before it is written up.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it escalates the concern appropriately and helps prevent a possible medication error before the patient is exposed to any risk. Pausing rather than proceeding shows sound professional judgement, and involving a senior clinician ensures the decision is made safely.', 2);

  -- S18
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'Dr. Michael Turner, a foundation year doctor at City General Hospital, notices his colleague Dr. James Patel repeatedly not following basic infection control measures on the ward.')
  RETURNING id INTO v_s18;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s18, 2, 'Having a private conversation with Dr. James Patel about the importance of following infection control guidance.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the concern directly, respectfully, and proportionately.', 0),
    (v_s18, 1, 'How important is it to report the behaviour to a senior member of staff if it continues or poses a risk to patients?', 'Important', 'This is important because repeated or unresolved infection control breaches may need escalation, although a direct conversation is usually the first proportionate step.', 1),
    (v_s18, 2, 'Ignoring the situation because it may not be significant.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because infection control concerns can affect patient safety and should not be dismissed.', 2);

  -- S19
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'Dr. Michael Turner discovers that a colleague, Dr. Patel, posted public messages on social media saying he ''faked a sickie'' to go to a party on the same day he had called in sick, leaving the team short-staffed.')
  RETURNING id INTO v_s19;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s19, 2, 'Confront Dr. Patel directly and ask for an explanation before deciding what further action is needed.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because seeking clarification directly before escalating is a fair and reasonable first step, and may resolve the situation more efficiently. However, it is not the best possible response because direct confrontation about suspected dishonesty carries risks — the colleague may deny it, delete the post, or feel intimidated — and there may be good reason to involve a senior early. It is better than ignoring the situation, but falls short of the fully considered response that a more structured escalation would provide.', 0),
    (v_s19, 2, 'Report the incident to a senior member of staff immediately without first speaking to Dr. Patel.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because the issue may warrant escalation, but where possible it is usually better to clarify the facts directly first unless there is an urgent reason not to.', 1),
    (v_s19, 2, 'Ignore the situation and continue working as usual.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because the behaviour may be dishonest and has already affected colleagues and service provision.', 2);

  -- S20
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'Dr. Emily Parker, an experienced physician, is experiencing burnout and has become increasingly overwhelmed by work demands.')
  RETURNING id INTO v_s20;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s20, 1, 'How important is it for Dr. Parker to speak to a supervisor or trusted colleague about her burnout and explore support options?', 'Very important', 'This is very important because seeking support early can protect both the doctor''s wellbeing and patient safety.', 0),
    (v_s20, 2, 'Taking a leave of absence without informing the hospital or arranging appropriate cover.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because taking time off may be reasonable, but doing so without communicating properly risks disrupting patient care and colleagues.', 1),
    (v_s20, 2, 'Continuing to work excessive hours despite feeling unable to do so safely.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because working when too unwell or exhausted can compromise patient safety and the doctor''s own wellbeing.', 2);

  -- S21
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 1, 'Dr. Sam Johnson, a surgeon, notices that a team member is about to enter a procedure without following hand hygiene requirements.')
  RETURNING id INTO v_s21;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s21, 1, 'How important is it for Dr. Johnson to address the failure to follow hand hygiene requirements before the procedure continues?', 'Very important', 'This is very important because infection prevention is a basic patient safety requirement.', 0),
    (v_s21, 1, 'How important is it to remind the wider team about the importance of hand hygiene and safe practice?', 'Important', 'This is important because broader reminders can reinforce good practice, although the first priority is to address the immediate lapse.', 1),
    (v_s21, 2, 'Dr. Sam does not address the situation and ignores it.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it allows a preventable patient safety risk to continue.', 2);

  -- S22
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'Dr. Smith is reviewing a patient''s records before surgery and notices that the drug chart contains a medication error that could affect the safety of the procedure.')
  RETURNING id INTO v_s22;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s22, 2, 'Ignore the error and proceed with the surgery as planned.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because known safety concerns should not be ignored before an operation proceeds.', 0),
    (v_s22, 2, 'Immediately stop any further progress towards surgery until the medication issue is clarified and corrected.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because patient safety comes first, and the error should be corrected before the procedure continues.', 1),
    (v_s22, 2, 'Ask the patient whether they know about the medication error and proceed depending on what they say.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because asking the patient about a medication error places an inappropriate burden on them and is the wrong process — resolving a prescribing error is the clinician''s responsibility, not the patient''s. It may also cause unnecessary distress. However, it is not as serious as knowingly ignoring the error and proceeding regardless, because there is at least an attempt to acknowledge the problem. That distinguishes it from ''A very inappropriate thing to do'' while still making clear it falls short of acceptable practice.', 2);

  -- S23
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (1, 2, 'Sarah, a patient in her mid-50s, has been advised by her doctor, Dr. Miller, to undergo a complex medical procedure. She is anxious and unsure whether to consent.')
  RETURNING id INTO v_s23;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s23, 2, 'Encourage Sarah to consent immediately so that there are no delays in treatment.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it pressures the patient and does not support informed, voluntary consent.', 0),
    (v_s23, 2, 'Provide only basic information so that Sarah does not feel overwhelmed by too many details.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the intention may be to avoid distress, but the patient still needs sufficient information to make an informed decision.', 1),
    (v_s23, 2, 'Respect Sarah''s autonomy by providing clear information about the procedure, risks, benefits, and alternatives, and giving her time to ask questions.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because informed consent depends on clear information, time for questions, and respect for the patient''s autonomy.', 2);

END $$;

-- Increment content version to push updated content to users
UPDATE content_versions
SET version = version + 1, updated_at = now()
WHERE section = 'timed_situational_judgement';
