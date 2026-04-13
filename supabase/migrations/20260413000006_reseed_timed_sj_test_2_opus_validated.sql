-- Reseed: Timed SJ Test 2 (test_id = 2)
-- Source: sj-test-002-opus-validated.json (23 scenarios, 69 items)
-- label_set: 1 = importance scale, 2 = appropriateness scale

-- Ensure the test metadata row exists
INSERT INTO timed_situational_judgement_tests (id, title, time_minutes)
VALUES (2, 'SJ Timed Test 2', 26)
ON CONFLICT (id) DO NOTHING;

-- Clear existing Test 2 data (questions first due to FK, then scenarios)
DELETE FROM timed_situational_judgement_questions
WHERE scenario_id IN (
  SELECT id FROM timed_situational_judgement_scenarios WHERE test_id = 2
);
DELETE FROM timed_situational_judgement_scenarios WHERE test_id = 2;

DO $$
DECLARE
  v_s01 UUID; v_s02 UUID; v_s03 UUID; v_s04 UUID; v_s05 UUID;
  v_s06 UUID; v_s07 UUID; v_s08 UUID; v_s09 UUID; v_s10 UUID;
  v_s11 UUID; v_s12 UUID; v_s13 UUID; v_s14 UUID; v_s15 UUID;
  v_s16 UUID; v_s17 UUID; v_s18 UUID; v_s19 UUID; v_s20 UUID;
  v_s21 UUID; v_s22 UUID; v_s23 UUID;
BEGIN

  -- S01: Infection control on ward round
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'During a morning ward round, a third-year medical student, Priya, notices that the registrar does not use hand sanitiser between examining two patients in adjacent beds. Several other team members are present but no one comments on it.

How appropriate is each of the following responses by Priya?')
  RETURNING id INTO v_s01;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s01, 2, 'Priya decides not to say anything because infection control is the responsibility of the nursing staff, not medical students.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because infection control is every healthcare professional''s responsibility. Failing to act when patient safety may be compromised — regardless of role — is a serious breach of professional duty under GMC guidance on safety and quality.', 0),
    (v_s01, 2, 'Priya politely offers the registrar the hand sanitiser dispenser mounted on the wall between the two beds.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the infection control concern directly, respectfully, and in real time. It prioritises patient safety while using a non-confrontational approach, consistent with GMC principles on safety and teamwork.', 1),
    (v_s01, 2, 'Priya mentions the incident to a fellow student after the ward round and they agree it was poor practice.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Priya has correctly identified the issue, discussing it only with a peer achieves nothing to address the problem. It does not cause direct harm, but it fails to fulfil the professional duty to act when patient safety is at risk.', 2);

  -- S02: Group coursework plagiarism
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'While preparing a group coursework submission, Hasan discovers that one group member, Lily, has copied a substantial section of her contribution from an online source without attribution. The deadline is tomorrow and the group has been working well together until now.

How important to take into account are the following considerations for Hasan when deciding how to respond?')
  RETURNING id INTO v_s02;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s02, 1, 'Whether Lily has ever done anything like this before.', 'Of minor importance', 'This is of minor importance because past behaviour does not change the fact that plagiarism has occurred now. While it may provide some context, it should not influence whether the issue is addressed. Academic integrity must be upheld regardless of prior conduct.', 0),
    (v_s02, 1, 'The potential impact on the academic integrity of the entire group''s submission.', 'Very important', 'This is very important because submitting plagiarised work implicates the whole group in academic misconduct. Protecting the integrity of the submission is a core professional and academic responsibility, aligned with GMC principles on honesty and maintaining trust.', 1),
    (v_s02, 1, 'That raising the issue might create tension within the group just before the deadline.', 'Not important at all', 'This is not important at all because personal comfort and group harmony should never override academic integrity. Fear of social awkwardness or conflict is a form of self-interest that must not prevent someone from addressing dishonesty.', 2);

  -- S03: Early discharge concern
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'Dr Okonkwo is an F2 doctor on a medical admissions unit. She has concerns that a patient, Mr Hadley, is being discharged too early by the consultant. Mr Hadley was admitted with chest pain and has had only one set of troponin results, which were borderline. The consultant has decided the patient is fit for discharge.

How appropriate is each of the following responses by Dr Okonkwo?')
  RETURNING id INTO v_s03;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s03, 2, 'Dr Okonkwo respectfully raises her concerns with the consultant in private, explaining that she thinks a second troponin result would be prudent before discharge.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it directly addresses a patient safety concern through respectful, private communication with the decision-maker. Junior doctors have a professional duty to speak up when they believe a clinical decision may put a patient at risk, consistent with GMC guidance on raising concerns.', 0),
    (v_s03, 2, 'Dr Okonkwo says nothing because the consultant is more experienced and has made the decision.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while deferring to a consultant''s experience is understandable, it should not prevent a doctor from raising a legitimate patient safety concern. The consequence is a missed opportunity to advocate for the patient, though the consultant''s decision may ultimately be correct.', 1),
    (v_s03, 2, 'Dr Okonkwo documents her concerns in the patient''s notes and ensures the discharge summary includes advice to return if symptoms recur.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because documentation is good practice and provides a safety net for the patient. However, it does not directly address the core issue — the premature discharge decision — and misses the opportunity to discuss the concern with the consultant before the patient leaves.', 2);

  -- S04: Child safeguarding
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'During a paediatric outreach clinic, a dental student, Keiran, notices that a seven-year-old patient has multiple bruises on her arms in different stages of healing. The child''s parent explains that she is clumsy and falls often during football practice. The child appears withdrawn and avoids eye contact.

How appropriate is each of the following responses by Keiran?')
  RETURNING id INTO v_s04;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s04, 2, 'Keiran directly asks the parent whether they have been hurting the child.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Keiran''s instinct to address the concern is correct, directly accusing a parent is confrontational, could put the child at further risk, and is beyond a dental student''s role. The correct approach is to report the concern to a senior or safeguarding lead, not to investigate independently.', 0),
    (v_s04, 2, 'Keiran informs the supervising dentist about the observations after the appointment, describing the injuries and the child''s behaviour factually.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it follows proper safeguarding procedure — reporting concerns to a senior who can assess and escalate as needed. Keiran describes observations factually without making accusations, which is the professional standard for raising safeguarding concerns.', 1),
    (v_s04, 2, 'Keiran decides the parent''s explanation is plausible and takes no further action.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because dismissing potential safeguarding concerns without reporting them is a serious failure of professional duty. Multiple bruises in different stages of healing combined with a withdrawn child are recognised indicators that warrant further investigation, regardless of the parent''s explanation.', 2);

  -- S05: Confidential drug information
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'A 22-year-old patient, Marcus, tells Fatima, a second-year medical student on a GP placement, that he regularly uses recreational drugs but has not told his GP. He asks Fatima not to mention it to anyone. Fatima is aware that Marcus is also taking prescription medication.

How important to take into account are the following considerations for Fatima when deciding how to respond?')
  RETURNING id INTO v_s05;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s05, 1, 'That Marcus has specifically asked Fatima to keep this information confidential.', 'Important', 'This is important because respecting patient confidentiality is a core GMC principle and patients must feel they can disclose sensitive information. However, confidentiality is not absolute — it should be weighed against the risk of harm, particularly given the potential drug interaction with prescription medication.', 0),
    (v_s05, 1, 'Whether the recreational drug use could interact with Marcus''s prescription medication and pose a risk to his health.', 'Very important', 'This is very important because the potential for a harmful drug interaction directly concerns patient safety, which is the highest priority under GMC principles. If there is a risk of serious harm, this overrides the request for confidentiality.', 1),
    (v_s05, 1, 'That Fatima personally disapproves of recreational drug use.', 'Not important at all', 'This is not important at all because personal moral views about a patient''s lifestyle should play no role in professional decision-making. GMC guidance requires doctors and students to treat patients without discrimination and to focus on clinical need, not personal judgement.', 2);

  -- S06: Group project non-contribution
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'After several weeks of a group research project, it becomes clear to the other members that one student, Dev, has not completed any of the tasks he volunteered for. The presentation is in five days and the group needs Dev''s section to complete the project.

How appropriate is each of the following responses by the other group members?')
  RETURNING id INTO v_s06;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s06, 2, 'The group divides Dev''s section among themselves and completes it without telling him, to avoid conflict.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while it ensures the project is completed, it avoids addressing the real issue — Dev''s failure to contribute. This approach enables the behaviour, undermines accountability, and is unfair to the rest of the group, though it does not cause serious harm.', 0),
    (v_s06, 2, 'A group member speaks to Dev privately to ask whether he is struggling and to agree a realistic plan for completing his section.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it directly addresses the problem through private, non-confrontational communication. It also considers that Dev may have a genuine reason for not contributing, consistent with supporting a colleague while maintaining accountability.', 1),
    (v_s06, 2, 'The group emails the module tutor to complain about Dev''s lack of contribution without speaking to Dev first.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because while escalating to a tutor is a legitimate step, it bypasses direct communication with Dev. The preferred approach is to try resolving the issue within the group first. However, the group is not wrong to seek support from a tutor, and this is not harmful.', 2);

  -- S07: Clinical skill beyond competence
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'Oluwaseun is a fourth-year medical student on a surgical placement. A busy registrar asks him to insert a urinary catheter on a male patient, saying he will be nearby if needed. Oluwaseun has observed the procedure twice but has never performed it himself.

How appropriate is each of the following responses by Oluwaseun?')
  RETURNING id INTO v_s07;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s07, 2, 'Oluwaseun attempts the procedure because the registrar said he would be nearby, and Oluwaseun does not want to appear incompetent.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because performing a procedure beyond one''s competence risks patient harm. Fear of appearing incompetent is a form of self-interest that must never override patient safety. GMC guidance is clear that practitioners must recognise and work within the limits of their competence.', 0),
    (v_s07, 2, 'Oluwaseun explains to the registrar that he has only observed the procedure and asks if the registrar could supervise him directly while he attempts it.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because Oluwaseun is being honest about his level of experience while still showing willingness to learn. Requesting direct supervision ensures patient safety and creates an appropriate learning opportunity, consistent with GMC principles on knowing your limits and seeking help.', 1),
    (v_s07, 2, 'Oluwaseun asks a fellow medical student who has performed the procedure once before to help him do it.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because two inexperienced students do not constitute adequate supervision for a clinical procedure. While the instinct to seek support is reasonable, the appropriate supervisor is a qualified clinician, not another student. The risk to the patient is increased, though the intent is not malicious.', 2);

  -- S08: Colleague impairment
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'After returning from a lunch break, Dr Mensah, an F1 doctor, notices that a fellow F1, Dr Singh, smells strongly of alcohol. Dr Singh is scheduled to see patients on the afternoon clinic list. Dr Singh insists he only had one drink and is fine to work.

How important to take into account are the following considerations for Dr Mensah when deciding how to respond?')
  RETURNING id INTO v_s08;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s08, 1, 'That Dr Mensah and Dr Singh are close friends and have trained together since medical school.', 'Not important at all', 'This is not important at all because personal friendships must never prevent a doctor from acting on a patient safety concern. GMC guidance is clear that professional duty to protect patients overrides personal relationships.', 0),
    (v_s08, 1, 'Whether Dr Singh is about to see patients who could be harmed by impaired clinical judgement.', 'Very important', 'This is very important because patient safety is the highest priority. A doctor who may be impaired by alcohol poses an immediate risk to patients. GMC principles require colleagues to act promptly when they believe a colleague''s fitness to practise may be compromised.', 1),
    (v_s08, 1, 'That Dr Singh may be going through personal difficulties that have led to the drinking.', 'Of minor importance', 'This is of minor importance because while understanding the context may inform how Dr Mensah supports Dr Singh longer-term, it does not change the immediate need to act on the patient safety concern. Compassion for a colleague''s situation is appropriate but must not delay action to protect patients.', 2);

  -- S09: Academic misconduct during exam
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'Nadia is sitting an end-of-year written examination. She notices that the student at the desk beside her appears to have notes written on the inside of their pencil case, which they glance at several times during the exam.

How appropriate is each of the following responses by Nadia?')
  RETURNING id INTO v_s09;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s09, 2, 'Nadia alerts an invigilator discreetly during the exam by raising her hand.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because reporting suspected academic misconduct as it happens is a professional duty. Doing so discreetly minimises disruption while ensuring the issue is dealt with by the appropriate authority. Honesty and integrity are core GMC principles.', 0),
    (v_s09, 2, 'Nadia loudly confronts the student during the exam, telling them to put the notes away.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because a public confrontation during an exam would cause significant disruption to all candidates, is disproportionate, and could be seen as intimidating. It also takes on an investigative role that belongs to the invigilators and examination board.', 1),
    (v_s09, 2, 'Nadia speaks to the student after the exam and advises them to self-report to the examination board.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because encouraging the student to self-report demonstrates concern for integrity. However, it delays action and relies on the student actually reporting themselves, which is uncertain. Reporting during the exam would have been more effective and appropriate.', 2);

  -- S10: Patient refusal of anaesthetic
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'In a dental clinic, a patient tells dental student Amara that they do not want local anaesthetic for a filling procedure, despite Amara explaining that the procedure is likely to be painful. The patient is an adult with no known cognitive impairment and says they have a phobia of needles.

How important to take into account are the following considerations for Amara when deciding how to respond?')
  RETURNING id INTO v_s10;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s10, 1, 'Whether the patient fully understands how much pain the procedure is likely to involve without anaesthetic.', 'Very important', 'This is very important because informed consent requires that the patient understands the consequences of their decision. Ensuring the patient has realistic expectations about the pain is essential to respecting their autonomy — they can only make a genuine choice if they are properly informed.', 0),
    (v_s10, 1, 'That the procedure may take longer if the patient is in significant discomfort and needs breaks.', 'Of minor importance', 'This is of minor importance because while practical considerations about time and workflow are worth noting, they should not influence whether to respect a patient''s informed decision. Clinic efficiency is a secondary concern compared to patient autonomy and consent.', 1),
    (v_s10, 1, 'That Amara personally finds it uncomfortable to perform procedures on patients who are in pain.', 'Not important at all', 'This is not important at all because the practitioner''s personal comfort should play no role in the patient''s treatment decisions. The focus must be on the patient''s informed choice and welfare, not on the clinician''s emotional response.', 2);

  -- S11: Medication prescription under fatigue
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'An elderly patient, Mrs Okoro, has been waiting in the emergency department for several hours. Dr Tan, an F1 doctor nearing the end of a long shift, is asked to prescribe her regular medications so she can take her evening doses. Dr Tan is tired and the department is busy.

How appropriate is each of the following responses by Dr Tan?')
  RETURNING id INTO v_s11;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s11, 2, 'Dr Tan prescribes the medications quickly from memory without checking Mrs Okoro''s drug chart or notes, to save time.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because prescribing medication without verifying the patient''s drug chart or notes creates a serious patient safety risk — potential for wrong drug, wrong dose, or dangerous interactions. Tiredness and time pressure do not justify bypassing safety checks.', 0),
    (v_s11, 2, 'Dr Tan hands the prescribing task over to the incoming doctor at handover, ensuring Mrs Okoro''s medication needs are clearly communicated.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because a safe handover ensures the task is completed correctly by a colleague who is less fatigued. Clear communication at handover protects patient safety, which is consistent with GMC guidance on effective teamwork and recognising when you are not in the best position to provide safe care.', 1),
    (v_s11, 2, 'Dr Tan asks a nurse to tell Mrs Okoro that her medications will come soon, but does not arrange for anyone specific to prescribe them.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because acknowledging the patient''s needs and communicating with her shows consideration. However, it does not ensure the task is actually completed — no specific person has been asked to prescribe the medications, creating a risk that Mrs Okoro''s doses are missed.', 2);

  -- S12: Peer wellbeing concern
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'Over the past fortnight, a flatmate and fellow university student, Callum, has stopped attending lectures, barely eats, and stays in his room most of the day. He has mentioned feeling like there is no point in continuing with the course. His close friends in the flat are becoming concerned.

How appropriate is each of the following responses by Callum''s flatmates?')
  RETURNING id INTO v_s12;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s12, 2, 'One flatmate speaks to Callum privately, expresses concern for his wellbeing, and encourages him to contact the university counselling service or his GP.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because approaching Callum privately and with genuine concern respects his dignity. Suggesting professional support services is constructive and proportionate. This is consistent with the principle that peers should support each other''s wellbeing and encourage appropriate help-seeking.', 0),
    (v_s12, 2, 'The flatmates discuss Callum''s behaviour with other course mates to see if they have noticed anything similar.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while the intention may be to gather information, discussing Callum''s personal difficulties with others without his knowledge is a breach of his privacy. It will not cause lasting harm, but it is the wrong approach — the priority should be speaking to Callum directly.', 1),
    (v_s12, 2, 'The flatmates decide to leave Callum alone, assuming he will come to them if he needs help.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because the signs described — withdrawal, not eating, expressing hopelessness — suggest Callum may be in significant distress. Doing nothing when a peer is showing these signs is a failure of basic duty of care. People in distress may not seek help themselves, so relying on Callum to reach out is not a safe assumption.', 2);

  -- S13: Professional boundary with patient
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'Zara is a third-year medical student on a community placement. An elderly patient she has been visiting regularly asks Zara for her personal phone number, saying he enjoys their conversations and would like to stay in touch after the placement ends.

How important to take into account are the following considerations for Zara when deciding how to respond?')
  RETURNING id INTO v_s13;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s13, 1, 'That declining might make the patient feel rejected or upset.', 'Of minor importance', 'This is of minor importance because while being sensitive to the patient''s feelings is a reasonable consideration, it should not lead Zara to breach professional boundaries. A compassionate explanation can address the patient''s feelings without compromising professionalism.', 0),
    (v_s13, 1, 'The importance of maintaining clear professional boundaries between healthcare students and patients.', 'Very important', 'This is very important because professional boundaries exist to protect both patients and practitioners. GMC guidance is clear that doctors and medical students must maintain appropriate boundaries in all relationships with patients, and sharing personal contact details blurs the professional relationship.', 1),
    (v_s13, 1, 'Whether the patient has adequate social support and may be experiencing loneliness.', 'Important', 'This is important because recognising a patient''s social isolation may prompt Zara to suggest appropriate support services or raise it with the GP. This shows holistic care for the patient''s wellbeing, even though it does not change the need to maintain professional boundaries.', 2);

  -- S14: Disrespectful consultant behaviour
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'While shadowing a consultant on a ward round, second-year medical student Nia hears the consultant make dismissive remarks about a patient''s weight, saying to the team that the patient''s health problems are entirely self-inflicted. The patient is within earshot and appears upset.

How appropriate is each of the following responses by Nia?')
  RETURNING id INTO v_s14;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s14, 2, 'Nia discusses what happened with her fellow students after the ward round to get their perspective on whether the comments were inappropriate.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while seeking peer perspectives is understandable, it does not address the harm done to the patient or the consultant''s behaviour. The patient''s dignity has been undermined and discussing it informally among students achieves nothing constructive, though it does not worsen the situation.', 0),
    (v_s14, 2, 'Nia laughs along with the team to avoid drawing attention to herself.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because laughing endorses the consultant''s disrespectful comments and compounds the patient''s distress. It also normalises unprofessional behaviour. GMC guidance requires that patients are treated with dignity, and participating in behaviour that undermines this is a serious breach.', 1),
    (v_s14, 2, 'After the ward round, Nia approaches the consultant privately and respectfully says that the patient seemed upset by the comments.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the issue directly, privately, and respectfully. Framing the concern around the patient''s reaction rather than accusing the consultant is tactful and effective. This is consistent with GMC guidance on raising concerns and treating patients with dignity.', 2);

  -- S15: Nurse expertise in prescribing decision
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'Dr Williams is an F1 doctor who has prescribed oral antibiotics for a patient with a urinary tract infection. An experienced ward nurse, Sister Clarke, approaches Dr Williams and says she believes intravenous antibiotics would be more appropriate given the patient''s symptoms.

How appropriate is each of the following responses by Dr Williams?')
  RETURNING id INTO v_s15;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s15, 2, 'Dr Williams listens to Sister Clarke''s reasoning, reviews the patient together, and reconsiders the prescription based on the clinical picture.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because effective teamwork means listening to all members of the healthcare team, regardless of professional role. Nurses have valuable clinical experience and observations. Reviewing the decision collaboratively ensures the best outcome for the patient, consistent with GMC guidance on teamwork and patient safety.', 0),
    (v_s15, 2, 'Dr Williams tells Sister Clarke that prescribing is a doctor''s responsibility and that she should not question his clinical decisions.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because dismissing a colleague''s concerns based on professional hierarchy undermines teamwork, disrespects the nurse''s expertise, and could compromise patient care. GMC guidance emphasises that all members of the healthcare team should feel able to raise concerns.', 1),
    (v_s15, 2, 'Dr Williams thanks Sister Clarke for raising the concern and says he will ask his registrar for a second opinion.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because seeking a senior opinion is a reasonable step, particularly for a junior doctor uncertain about the best antibiotic route. However, it delays the decision and could have been resolved by reviewing the patient with Sister Clarke first. It is a safe but not the most efficient or collaborative approach.', 2);

  -- S16: Committee minutes alteration
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'Kwame is a student representative on a university committee. After a meeting, the committee chair — a senior lecturer — asks Kwame to alter the minutes to remove a decision that was made about changing assessment deadlines, saying it will cause unnecessary complaints from students.

How important to take into account are the following considerations for Kwame when deciding how to respond?')
  RETURNING id INTO v_s16;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s16, 1, 'That keeping an accurate record of committee decisions is a core responsibility of the minutes-taker.', 'Very important', 'This is very important because the integrity of official records is a matter of professional duty and honesty. Altering minutes to conceal a decision is a form of dishonesty that undermines transparency and institutional governance. GMC principles on maintaining trust apply directly.', 0),
    (v_s16, 1, 'That the chair is a senior lecturer who could influence Kwame''s academic progression.', 'Not important at all', 'This is not important at all because fear of repercussions from a senior figure is a form of self-interest. The seniority of the person making the request does not make the request appropriate. Professional integrity requires that Kwame acts honestly regardless of the potential personal consequences.', 1),
    (v_s16, 1, 'Whether removing the decision from the minutes would actually change any outcome, since the decision has already been communicated verbally.', 'Of minor importance', 'This is of minor importance because while the practical impact might be limited if the decision was already communicated, the principle of maintaining accurate records is not contingent on whether it changes an outcome. Falsifying records is wrong regardless of practical consequences.', 2);

  -- S17: Infection control in clinical practice
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'Elise is a third-year dental student. During a busy clinic session, her supervising dentist asks Elise to begin preparing a patient''s tooth for a crown without changing gloves between patients. The supervising dentist says it will save time and the gloves are still clean.

How appropriate is each of the following responses by Elise?')
  RETURNING id INTO v_s17;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s17, 2, 'Elise completes the clinic session as instructed and then raises the infection control concern with the dental school''s clinical governance team the following day.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because while reporting the concern to clinical governance is a responsible step, delaying the response means the infection control breach occurs. The patient''s safety should be protected in the moment, not only addressed retrospectively.', 0),
    (v_s17, 2, 'Elise politely explains to the supervising dentist that she would prefer to change gloves between patients, as this is the standard infection control protocol.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because Elise is directly and respectfully addressing a patient safety concern in the moment. Infection control protocols exist to protect patients, and following them is non-negotiable regardless of time pressure. This response is consistent with GMC principles on safety and raising concerns.', 1),
    (v_s17, 2, 'Elise follows the supervising dentist''s instruction without comment, reasoning that the supervisor is more experienced and must know best.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because blindly following an instruction that breaches infection control protocols puts patients at risk. A supervisor''s seniority does not override established safety procedures. Students have a professional duty to challenge unsafe practices, even when directed by a senior.', 2);

  -- S18: GP test result misinterpretation
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'While observing a consultation, first-year medical student Reuben hears the GP tell a patient that a particular blood test result is normal. Reuben is fairly confident, from a recent lecture, that the result shown on the screen is actually outside the normal range. The patient leaves appearing reassured.

How important to take into account are the following considerations for Reuben when deciding how to respond?')
  RETURNING id INTO v_s18;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s18, 1, 'That correcting the GP might embarrass them in front of a medical student.', 'Not important at all', 'This is not important at all because a doctor''s potential embarrassment is irrelevant when patient safety may be at stake. GMC guidance is clear that concerns about how a colleague might react should never prevent someone from raising a potential patient safety issue.', 0),
    (v_s18, 1, 'Whether the incorrect information could affect the patient''s understanding of their health and any treatment decisions.', 'Very important', 'This is very important because if the patient has been given incorrect information about a test result, they may make decisions about their health based on a false understanding. Patient safety and the duty to ensure patients receive accurate information are paramount under GMC principles.', 1),
    (v_s18, 1, 'That Reuben is only a first-year medical student and may have misunderstood the lecture content.', 'Important', 'This is important because Reuben should acknowledge that he may not have the full picture. However, this should not prevent him from raising the concern — the appropriate response is to mention it politely to the GP after the consultation, framing it as a question rather than a correction. The possibility of being wrong reduces the certainty but not the duty to speak up.', 2);

  -- S19: Peer course engagement concern
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'Aisha notices that her course mate, Tom, has missed several consecutive submission deadlines for their programme. Tom has been increasingly withdrawn in recent weeks and has stopped responding to messages from friends. Aisha is not close to Tom but sees him regularly in tutorials.

How appropriate is each of the following responses by Aisha?')
  RETURNING id INTO v_s19;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s19, 2, 'Aisha informs their personal tutor that she is concerned about Tom''s welfare, without going into unnecessary detail.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because alerting a tutor is a constructive step, particularly if Aisha does not feel close enough to approach Tom directly. However, it would be better to also try speaking to Tom first, as a personal approach may be more supportive and less formal.', 0),
    (v_s19, 2, 'Aisha approaches Tom after a tutorial and gently asks if he is okay, offering to help if he is struggling.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because a private, compassionate approach directly to Tom shows genuine concern for his wellbeing. Even though they are not close friends, reaching out to a peer who is visibly struggling is consistent with the professional value of supporting colleagues and the duty of care to fellow students.', 1),
    (v_s19, 2, 'Aisha assumes Tom is just lazy or disorganised and does not do anything.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because making negative assumptions about a peer without evidence, and doing nothing when there are clear signs of difficulty, is a failure of basic collegiality. The combination of missed deadlines, withdrawal, and unresponsiveness may indicate significant personal or mental health difficulties that warrant concern, not dismissal.', 2);

  -- S20: Derogatory comment from tutor
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'During a clinical skills teaching session, a fourth-year medical student, James, overhears a tutor making a derogatory comment about a patient''s ethnicity to another member of staff. The comment is made in a corridor where other students and patients might also overhear.

How appropriate is each of the following responses by James?')
  RETURNING id INTO v_s20;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s20, 2, 'James challenges the comment in the moment, saying calmly that he found the remark inappropriate.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because speaking up in the moment demonstrates professional courage and signals that discriminatory language is unacceptable. However, doing so in a semi-public corridor may embarrass the tutor and could escalate the situation. A private conversation or formal report may be more effective and less confrontational.', 0),
    (v_s20, 2, 'James reports the comment to the medical school through the appropriate complaints or concerns procedure.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because discriminatory remarks from a tutor are a serious professional conduct issue that should be formally reported. Using the proper channels ensures the concern is investigated appropriately and sends a clear message that such behaviour is unacceptable. This is consistent with GMC guidance on raising concerns and treating people fairly.', 1),
    (v_s20, 2, 'James decides the comment was probably a one-off and not worth making a fuss about.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because dismissing a discriminatory comment — regardless of whether it was a ''one-off'' — normalises the behaviour and fails to protect patients and colleagues from a prejudiced attitude. Professional duty requires that discriminatory behaviour is challenged and reported.', 2);

  -- S21: Handover safety concern
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'Dr Kapoor is an F2 doctor finishing a night shift. The incoming F1, Dr Novak, arrives late and appears flustered. During the verbal handover, Dr Kapoor realises that Dr Novak is not writing anything down and has not asked any questions about the sickest patients on the list.

How important to take into account are the following considerations for Dr Kapoor when deciding how to respond?')
  RETURNING id INTO v_s21;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s21, 1, 'That an effective handover is essential for the continuity and safety of patient care.', 'Very important', 'This is very important because handover is a critical patient safety process. Information lost during handover can lead to missed diagnoses, delayed treatment, or adverse events. GMC guidance emphasises that effective communication during transitions of care is a core professional responsibility.', 0),
    (v_s21, 1, 'That Dr Kapoor''s shift has ended and she is tired after a night shift.', 'Not important at all', 'This is not important at all because personal fatigue and the end of a shift do not remove the professional responsibility to ensure a safe handover. Patient safety must take priority over personal convenience or tiredness. Leaving before the handover is complete could put patients at risk.', 1),
    (v_s21, 1, 'How many patients on the list have active or complex clinical issues that require clear communication.', 'Important', 'This is important because the number and complexity of patients affects how thorough the handover needs to be. If several patients have active issues, Dr Kapoor should ensure Dr Novak has understood the key information for each. However, even with fewer complex patients, the handover process itself must still be properly completed.', 2);

  -- S22: Confidentiality breach in public space
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'Ines is a second-year medical student walking through a hospital corridor. She overhears two junior doctors discussing a recognisable patient case in detail, including the patient''s name, diagnosis, and personal circumstances. Other staff and visitors are passing by.

How appropriate is each of the following responses by Ines?')
  RETURNING id INTO v_s22;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s22, 2, 'Ines walks past without saying anything, assuming it is not her place to intervene as a student.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Ines''s reluctance to intervene as a student is understandable, a confidentiality breach is occurring in a public area. Failing to act means the breach continues, potentially reaching other patients or visitors. However, the harm from Ines''s inaction alone is limited and transient.', 0),
    (v_s22, 2, 'Ines politely approaches the junior doctors and suggests they might want to continue their discussion somewhere more private.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the confidentiality breach directly, politely, and in the moment. Patient confidentiality is a core GMC principle, and all members of the healthcare team — including students — have a responsibility to protect it. The suggestion is constructive rather than accusatory.', 1),
    (v_s22, 2, 'Ines joins the conversation to learn more about the case, as she recognises the patient from her placement.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because joining the conversation compounds the confidentiality breach by adding another person to an inappropriate discussion in a public area. Ines would also be participating in the breach rather than addressing it, violating GMC principles on confidentiality and professional conduct.', 2);

  -- S23: Health disclosure and fitness to practise
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (2, 'At a social gathering, a university friend privately tells Gemma that he has recently been diagnosed with a chronic health condition. He says he has not told the medical school and asks Gemma to keep it between them. Gemma knows that the condition could, if unmanaged, affect his ability to practise safely on clinical placements.

How important to take into account are the following considerations for Gemma when deciding how to respond?')
  RETURNING id INTO v_s23;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s23, 1, 'That her friend confided in her in a social setting and trusts her.', 'Important', 'This is important because trust is a valuable element of personal relationships, and Gemma should be thoughtful about how she responds. However, trust does not override patient safety — if the condition poses a risk on clinical placements, the medical school needs to be aware so that appropriate support and safeguards can be arranged.', 0),
    (v_s23, 1, 'Whether the health condition could affect her friend''s fitness to practise safely during clinical placements.', 'Very important', 'This is very important because if the condition could impair his ability to practise safely, patient safety is at stake. GMC guidance requires that health conditions which may affect fitness to practise are disclosed to the relevant authority. This consideration should be central to Gemma''s response.', 1),
    (v_s23, 1, 'That Gemma does not want to damage their friendship by getting involved.', 'Not important at all', 'This is not important at all because preserving a personal friendship is a form of self-interest that must not prevent Gemma from acting on a potential patient safety concern. GMC principles make clear that professional duty overrides personal convenience and social comfort.', 2);

END $$;
