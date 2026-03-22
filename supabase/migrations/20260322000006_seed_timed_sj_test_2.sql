-- Seed: Timed SJ Test 2 (test_id = 2)
-- label_set: 1 = importance scale, 2 = appropriateness scale

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
  VALUES (2, 2, 'After a ward round, you and another junior doctor step into a crowded lift and continue discussing a patient''s diagnosis and home circumstances. You realise several members of the public are standing nearby and could overhear.')
  RETURNING id INTO v_s01;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s01, 1, 'How important is it to stop the conversation and move to a more private place before continuing?', 'Very important', 'This is very important because the conversation is already taking place in a public space where confidentiality may be breached. It is more than merely important because the risk is immediate, not a secondary follow-up issue.', 0),
    (v_s01, 2, 'You stop the discussion immediately and later remind your colleague to be more careful about where confidential information is discussed.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it stops the immediate risk and then addresses the colleague''s behaviour in a proportionate, professional way. That makes it stronger than ''Appropriate, but not ideal'', which would usually leave part of the problem unresolved.', 1),
    (v_s01, 2, 'You stay quiet until later because interrupting the conversation in front of others feels awkward.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because the awkwardness is understandable and the intention is not malicious. However, it still allows a possible confidentiality breach to continue, so it is clearly wrong even if less serious than a deliberate disclosure.', 2);

  -- S02
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 1, 'A patient is considering an elective procedure but seems hesitant because of worries about recovery time, work, and family responsibilities. The patient asks whether they really need to hear all the details.')
  RETURNING id INTO v_s02;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s02, 1, 'How important is it to explore the patient''s concerns and find out what matters most to them before they decide?', 'Very important', 'This is very important because good consent depends on understanding the patient''s own concerns and priorities, not just listing facts. It is more than merely important because without this, the decision-making process is fundamentally weakened.', 0),
    (v_s02, 1, 'How important is it to explain the benefits, risks, and reasonable alternatives, including doing nothing, in a clear way the patient can understand?', 'Very important', 'This is very important because patients need balanced information about benefits, risks, alternatives, and the option of doing nothing in order to decide properly. This goes beyond ''Important'' because it is a core part of valid consent rather than a helpful extra.', 1),
    (v_s02, 2, 'You reassure the patient that most people just sign the form and there is no need to go through everything in detail.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it brushes aside the patient''s concerns and undermines informed decision making. There is no meaningful mitigating value here, so it is worse than an answer that is merely imperfect or incomplete.', 2);

  -- S03
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 1, 'Before a morning clinic starts, you notice a colleague seems unusually unsteady, smells strongly of alcohol, and is struggling to concentrate while preparing to see patients.')
  RETURNING id INTO v_s03;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s03, 1, 'How important is it to act on the possible risk to patient safety rather than assuming there is an innocent explanation?', 'Very important', 'This is very important because the signs described could indicate impairment and therefore an immediate risk to patients. That makes it more than simply important: patient safety must take priority over avoiding an uncomfortable conversation.', 0),
    (v_s03, 1, 'How important is it to make an objective record of what you observed after the immediate safety concern has been escalated, if local practice requires it?', 'Important', 'This is important because an objective record may support a proper investigation and protect everyone involved. It is not ''Very important'' here because the first priority is to stop any immediate risk to patients; documentation is secondary to that immediate action.', 1),
    (v_s03, 2, 'You say nothing because it might simply be mouthwash or tiredness, and you do not want to accuse a colleague unfairly.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it ignores clear warning signs that could affect patient safety. Concern about being unfair to a colleague is understandable, but doing nothing in the face of possible impairment makes this more serious than ''Inappropriate, but not awful''.', 2);

  -- S04
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'A medical student on placement is asked by a busy junior doctor to perform a practical procedure on a patient alone, even though the student has only practised it on a model and has never done it on a real patient.')
  RETURNING id INTO v_s04;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s04, 1, 'How important is it for the student to recognise the limits of their competence before agreeing to carry out the procedure?', 'Very important', 'This is very important because students must recognise the limits of their competence before undertaking practical tasks on patients. It is more than merely important because getting this wrong can directly compromise patient safety.', 0),
    (v_s04, 2, 'The student agrees to do the procedure unsupervised because they want to impress the team and do not want to look unhelpful.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it puts the wish to impress others ahead of safe practice and honest recognition of competence. There is no sufficient mitigating benefit, so this is worse than a response that is simply suboptimal.', 1),
    (v_s04, 2, 'The student explains honestly that they are not competent to do it alone and asks for supervision or a more suitable learning opportunity.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it is honest, prioritises patient safety, and still seeks a constructive learning opportunity. It is better than ''Appropriate, but not ideal'' because it fully addresses the key concern rather than leaving any part of it unresolved.', 2);

  -- S05
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 1, 'A patient''s family sends an expensive gift hamper to thank you for your care. The ward team is pleased, but you are unsure whether accepting it would be appropriate.')
  RETURNING id INTO v_s05;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s05, 1, 'How important is it to consider professional boundaries and whether accepting the gift could affect, or appear to affect, your judgement?', 'Important', 'This is important because professional boundaries and the appearance of influence matter when expensive gifts are offered. It is not ''Very important'' in the same way as an immediate safety issue, but it is still a significant professional consideration rather than a minor one.', 0),
    (v_s05, 1, 'How important is it to check local policy or seek senior advice before deciding what to do with the gift?', 'Important', 'This is important because local policy or senior advice helps ensure the gift is handled transparently and fairly. It is not ''Very important'' because it supports the decision rather than being the core ethical issue itself, but it is clearly more than a minor detail.', 1),
    (v_s05, 2, 'You thank the family and place the hamper in the staff room for the moment, saying you will check later whether accepting it is allowed.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because it is more transparent than secretly keeping the gift and it avoids immediate personal gain. However, it still assumes some level of acceptance before the policy has been checked, so it falls short of the best response.', 2);

  -- S06
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 1, 'During a clinic, a patient''s teenage son offers to interpret for his mother because the professional interpreter is running late. The consultation will include discussion of a sensitive diagnosis.')
  RETURNING id INTO v_s06;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s06, 1, 'How important is it to consider the patient''s privacy and whether a family member is an appropriate interpreter in this situation?', 'Very important', 'This is very important because privacy, accurate communication, and the patient''s ability to speak freely are central when discussing a sensitive diagnosis. That makes it more than simply important or convenient.', 0),
    (v_s06, 2, 'You use the teenage son only to explain the delay and confirm basic practical details while arranging the professional interpreter, but you avoid discussing the sensitive diagnosis through him.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because it avoids using the family member for the sensitive part of the consultation and keeps things moving safely in the short term. It is not the best option because even limited reliance on a relative may affect privacy and the patient''s willingness to speak openly.', 1),
    (v_s06, 1, 'How important is it to arrange a suitable professional interpreter or another safe alternative before discussing the sensitive information in detail?', 'Very important', 'This is very important because a suitable professional interpreter or safe alternative is usually needed before discussing sensitive clinical information in detail. It is more than merely important because misunderstanding here could directly affect consent, privacy, and care.', 2);

  -- S07
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'A junior doctor posts a selfie from the ward corridor on social media. In the background, part of a patient whiteboard showing names and bed numbers, and several bed spaces, are visible.')
  RETURNING id INTO v_s07;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s07, 1, 'How important is it to act quickly if there is a risk that patient information or identities could be exposed online?', 'Very important', 'This is very important because once potentially identifiable information is online, the confidentiality risk can spread quickly and become harder to contain. That immediacy makes it more than just an important follow-up issue.', 0),
    (v_s07, 2, 'You ask the doctor to delete the post immediately and seek senior advice if confidential information may already have been shared.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the immediate online risk and recognises that senior advice may be needed if information has already been exposed. It is stronger than ''Appropriate, but not ideal'' because it responds promptly and proportionately.', 1),
    (v_s07, 2, 'You tell the doctor they can leave the post up for now and crop it later when they have time.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it knowingly leaves potentially identifiable patient information online when prompt removal is needed. The delay is not a small imperfection; it leaves an active confidentiality risk in place, so it is worse than ''Inappropriate, but not awful''.', 2);

  -- S08
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'You notice that a colleague has made an important factual error in a patient''s discharge summary. The colleague says the patient has already gone home and asks you not to make a fuss.')
  RETURNING id INTO v_s08;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s08, 1, 'How important is it to make sure the inaccurate record is corrected promptly and appropriately?', 'Very important', 'This is very important because discharge information may affect ongoing care after the patient has left hospital. It is more than merely important because an inaccurate record can cause direct harm if not corrected promptly.', 0),
    (v_s08, 2, 'You agree to leave the summary unchanged because correcting it might draw attention to your colleague''s mistake.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it prioritises protecting a colleague from embarrassment over correcting a potentially unsafe record. There is no adequate mitigating value, so this is more serious than a merely imperfect response.', 1),
    (v_s08, 2, 'You ask the colleague to correct the error straight away and make clear that you will escalate if it is not amended promptly.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it directly challenges the inaccurate record, sets a clear expectation for correction, and backs this up with a commitment to escalate if the colleague does not act. The combination of challenge, accountability, and willingness to escalate addresses the patient safety concern fully rather than leaving any part of it unresolved.', 2);

  -- S09
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'A patient tells the doctor they do not want a medical student present during the consultation because the problem is personal and embarrassing.')
  RETURNING id INTO v_s09;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s09, 1, 'How important is it to respect the patient''s choice about who is present during the consultation?', 'Very important', 'This is very important because patients have a right to decide who is present during intimate or sensitive consultations. It is more than merely important because ignoring this would undermine dignity, trust, and consent.', 0),
    (v_s09, 2, 'The student remains in the room because learning opportunities are limited and the patient might change their mind once the consultation starts.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it ignores the patient''s clearly expressed wishes in order to preserve a learning opportunity. There is no sufficient justification here, so this is worse than a response that is simply awkward or suboptimal.', 1),
    (v_s09, 2, 'The student leaves promptly and politely, without making the patient feel guilty for saying no.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it respects the patient''s choice promptly and without pressure. It is better than ''Appropriate, but not ideal'' because it deals fully and sensitively with the patient''s concern.', 2);

  -- S10
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'During a busy ward round, a senior doctor sharply blames a nurse in front of the patient and the rest of the team for a minor delay, leaving the nurse visibly upset and the patient uncomfortable.')
  RETURNING id INTO v_s10;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s10, 1, 'How important is it to recognise that this behaviour may harm teamworking and the patient''s confidence in the team?', 'Very important', 'This is very important because publicly humiliating a colleague in front of a patient affects colleague dignity, undermines team safety culture, and damages the patient''s confidence in the care they are receiving — all at the same time. GMC Good Medical Practice requires doctors to treat colleagues fairly and with respect, and to challenge behaviour that falls below this standard. That makes recognising this more than merely important: it is central to professional conduct and team wellbeing.', 0),
    (v_s10, 2, 'You check on the nurse afterwards and, if appropriate, raise the concern privately with the senior doctor or another suitable person.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because checking on the nurse and raising the concern privately are sensible and supportive steps. It is not the best possible response because it leaves the impact on the patient and team unaddressed in the moment, so it falls short of a fully rounded response.', 1),
    (v_s10, 2, 'You laugh along with the senior doctor so that you stay on good terms with them.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it reinforces unprofessional behaviour and abandons the upset colleague for personal advantage. There is no meaningful mitigating value, so it is worse than a response that is merely hesitant or incomplete.', 2);

  -- S11
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'A medical student reviewing notes notices a markedly abnormal test result from the previous evening that is flagged for urgent review but appears to have been filed without any documented action. The student can see the patient is still on the ward.')
  RETURNING id INTO v_s11;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s11, 1, 'How important is it to raise the concern promptly with the doctor or team currently responsible for the patient?', 'Very important', 'This is very important because a markedly abnormal result flagged for urgent review may represent an active risk to the patient. That makes prompt escalation more than merely important: it is the central duty in this situation.', 0),
    (v_s11, 2, 'The student waits until a routine teaching session later that day to mention the result because they do not want to interrupt the team.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because once a potentially urgent result has been noticed, delaying until a routine teaching session could expose the patient to avoidable harm. Wanting not to interrupt is understandable, but the delay is too serious for this to count only as ''Inappropriate, but not awful''.', 1),
    (v_s11, 2, 'The student flags the result promptly to a supervising doctor and explains why they are concerned.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it raises the concern promptly with someone able to act and explains why it matters. It is better than ''Appropriate, but not ideal'' because it directly addresses the patient-safety issue without unnecessary delay.', 2);

  -- S12
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 1, 'The ward is short staffed. A colleague suggests skipping the usual patient identity checks before giving medication because everyone already ''knows the patients'' and it would save time.')
  RETURNING id INTO v_s12;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s12, 1, 'How important is it to maintain basic safety checks even when the team is under pressure?', 'Very important', 'This is very important because identity checks are a basic medication safety step and pressure of work does not remove that duty. It is more than simply important because skipping this safeguard can directly harm patients.', 0),
    (v_s12, 2, 'You agree to skip the checks for this round because the ward is unusually busy.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it removes an established safety check for the sake of convenience. There is no adequate mitigating value, so this is more serious than a response that is merely imperfect.', 1),
    (v_s12, 1, 'How important is it to raise the workload problem with a senior if staffing pressures are making safe practice difficult to maintain?', 'Important', 'This is important because staffing pressures that make safe practice difficult should be escalated so the service can respond. It is not ''Very important'' in the immediate sense because the first duty is still to keep doing the identity checks safely on the round itself.', 2);

  -- S13
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'A patient asks you for a medical certificate saying they are unfit for work for the next week. During the conversation, they explain they are actually well enough to work but want the note so they can go on a prepaid holiday.')
  RETURNING id INTO v_s13;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s13, 1, 'How important is it that any certificate or written statement you provide is honest and accurate?', 'Very important', 'This is very important because any certificate or formal statement must be honest and accurate. It is more than merely important because false documentation undermines trust in the profession and can amount to dishonesty.', 0),
    (v_s13, 2, 'You explain that you cannot provide a false certificate and discuss any legitimate concerns the patient does have.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it maintains honesty while still responding professionally to the patient''s situation and concerns. It is better than ''Appropriate, but not ideal'' because it combines integrity with constructive communication.', 1),
    (v_s13, 2, 'You write the certificate anyway because the patient says they will lose a lot of money if they miss the holiday.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it involves knowingly writing a false certificate. Sympathy for the patient''s financial loss does not justify dishonesty, so this is more serious than a merely poor response.', 2);

  -- S14
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'A clinic is running badly behind schedule. A colleague says they will get patients to sign procedure consent forms now and explain the risks properly later so the list can catch up.')
  RETURNING id INTO v_s14;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s14, 1, 'How important is it that consent is based on a proper discussion and not treated as just getting a signature on a form?', 'Very important', 'This is very important because valid consent depends on a real discussion, not just obtaining a signature. It is more than merely important because treating consent as paperwork undermines patient autonomy.', 0),
    (v_s14, 2, 'You encourage your colleague to pause and have the necessary discussions with patients before asking them to sign.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it challenges an unsafe approach and redirects the process back toward proper consent discussions before signing. It is better than ''Appropriate, but not ideal'' because it tackles the key problem directly.', 1),
    (v_s14, 2, 'You say nothing because the clinic is busy and the explanations can always be given afterwards.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it passively accepts a flawed consent process that could mislead patients. The pressure of the clinic being busy is not enough to reduce this to a merely imperfect response.', 2);

  -- S15
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'A well-known local celebrity is admitted to your hospital. A friend messages you asking whether the rumours online are true and says nobody will know if you confirm it privately.')
  RETURNING id INTO v_s15;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s15, 1, 'How important is it to maintain confidentiality even when the patient is famous and other people are already speculating?', 'Very important', 'This is very important because confidentiality applies regardless of a patient''s public profile or outside rumours. It is more than merely important because sharing or confirming the information would be a direct professional breach.', 0),
    (v_s15, 2, 'You reply, ''I cannot say much, but yes, they are definitely here.''', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it confirms confidential information to someone who has no right to know it. The fact that rumours already exist does not meaningfully mitigate the breach, so this is worse than ''Inappropriate, but not awful''.', 1),
    (v_s15, 2, 'You do not discuss the patient and make sure you do not access or share any information unless it is needed for your role.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it maintains confidentiality and recognises that access to information should be based on role, not curiosity. It is stronger than ''Appropriate, but not ideal'' because it fully addresses both disclosure and access issues.', 2);

  -- S16
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'A patient waiting to be seen makes a racist remark and says they do not want to be treated by one of the doctors because of the doctor''s ethnicity. The doctor hears the comment and is visibly affected.')
  RETURNING id INTO v_s16;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s16, 1, 'How important is it to support the colleague and recognise that abusive behaviour should not be treated as acceptable?', 'Important', 'This is important because colleagues should be supported and racist abuse should not be normalised. It is not the single most immediate task in the way a direct patient-safety action might be, but it is clearly more than a minor consideration.', 0),
    (v_s16, 2, 'You immediately swap the patient to a different doctor without challenging the remark or seeking support, because keeping the clinic moving seems easiest.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because silently accommodating a racially discriminatory demand without any challenge effectively endorses that demand and reinforces discriminatory behaviour. Whatever the motive, the outcome is that a racist request is granted without question, which falls seriously short of the professional standard. GMC Good Medical Practice requires doctors to treat colleagues fairly regardless of protected characteristics, and the Equality Act 2010 places clear duties on healthcare professionals in this area. This is more serious than ''Inappropriate, but not awful'' because there is no meaningful mitigating value in an action whose net effect is to endorse discrimination.', 1),
    (v_s16, 2, 'You make clear that abusive language is unacceptable, support the colleague, and seek senior help if needed while ensuring the patient still receives safe care.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it supports the colleague, sets a boundary around abusive behaviour, and still ensures the patient receives safe care with senior input if needed. It is better than ''Appropriate, but not ideal'' because it addresses the whole problem rather than only part of it.', 2);

  -- S17
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'At handover, you realise an important piece of information about a patient has been left out, and the next team is already moving on to other tasks.')
  RETURNING id INTO v_s17;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s17, 1, 'How important is it to make sure relevant information is handed over clearly so the next team can care for the patient safely?', 'Very important', 'This is very important because safe handover depends on the receiving team getting key information at the point they are taking over care. It is more than merely important because missing details can directly affect patient management.', 0),
    (v_s17, 2, 'You decide not to interrupt handover and instead send the next team a message with the missing information shortly afterwards.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because it at least attempts to pass the information on. It is still not good enough because messages may be missed and the delay could matter, so interrupting briefly at handover would be the safer response.', 1),
    (v_s17, 2, 'You interrupt briefly and provide the missing information clearly so the receiving team is aware of it.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it ensures the missing information is handed over clearly at the right time, when the receiving team can act on it. It is stronger than ''Appropriate, but not ideal'' because it addresses the risk directly and without delay.', 2);

  -- S18
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'A medical student sees a close friend on placement open the electronic record of a neighbour out of curiosity, even though the friend is not involved in that patient''s care.')
  RETURNING id INTO v_s18;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s18, 1, 'How important is it to act on the misuse of patient records rather than dismissing it as harmless curiosity?', 'Very important', 'This is very important because accessing records without a care-related reason is a serious misuse of confidential information. It is more than merely important because ignoring it would normalise a clear professional breach.', 0),
    (v_s18, 2, 'You say nothing because the person is your friend and you do not want to damage the friendship.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because friendship is not a justification for ignoring misuse of patient records. There is no adequate mitigating value here, so this is more serious than a response that is simply hesitant or incomplete.', 1),
    (v_s18, 2, 'You tell your friend to stop immediately and seek advice from a supervisor or another appropriate person about the next steps.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it stops the behaviour immediately and brings the concern to an appropriate person for guidance on next steps. It is better than ''Appropriate, but not ideal'' because it deals with both the immediate misuse and the need for proper escalation.', 2);

  -- S19
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'During an observed clinical skills assessment, you notice another student appears to be reading from hidden notes between stations.')
  RETURNING id INTO v_s19;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s19, 1, 'How important is it to act honestly and protect the fairness of the assessment process?', 'Very important', 'This is very important because honesty and integrity in assessments are fundamental professional duties, not secondary concerns. GMC Good Medical Practice makes clear that doctors must be honest and act with integrity at all times, and this standard applies equally during training. Assessment integrity directly predicts professional conduct in clinical practice, which means allowing dishonesty in an assessment carries implications beyond the exam itself. It is more than merely important for the same reason that honesty with patients is: the whole basis of trust in the profession depends on it.', 0),
    (v_s19, 2, 'You speak to the student after the assessment and tell them to stop, but you do not report what you saw to staff.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because it does challenge the behaviour rather than simply ignoring it. However, it still leaves the formal fairness issue unaddressed and relies on the other student alone, so it falls short of what is required.', 1),
    (v_s19, 2, 'You report what you observed to the exam lead or another appropriate member of staff after the station, sticking to the facts.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it reports the concern through the right channel and sticks to the facts without creating unnecessary disruption. It is better than ''Appropriate, but not ideal'' because it protects the assessment process properly.', 2);

  -- S20
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 1, 'A patient is due to be discharged with several new medicines. They have limited English and seem to nod politely, but when asked a simple question they appear not to understand how or when to take the medication.')
  RETURNING id INTO v_s20;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s20, 1, 'How important is it to check the patient''s understanding before discharge rather than assuming they have understood?', 'Very important', 'This is very important because nodding politely does not show real understanding, and misunderstanding discharge medicines can cause direct harm. That makes this more than merely important.', 0),
    (v_s20, 2, 'You discharge the patient with an English-only leaflet because the ward needs the bed and the patient can ask the pharmacy later if they are confused.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it prioritises bed flow over safe communication at discharge. There is no meaningful mitigating value, so it is more serious than a response that is only incomplete or suboptimal.', 1),
    (v_s20, 1, 'How important is it to use an appropriate interpreter or other suitable support and ask the patient to explain the plan back in their own words?', 'Very important', 'This is very important because appropriate language support and checking understanding are key parts of a safe discharge. It is more than merely important because without them the patient may be unable to use the medicines safely.', 2);

  -- S21
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'A trainee is handed a form and asked to sign to confirm they witnessed a consent discussion, but they were not present for it. The consultant says, ''It''s fine, we all know the patient agreed.''')
  RETURNING id INTO v_s21;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s21, 2, 'The trainee signs the form anyway because the consultant is senior and the patient has already agreed to treatment.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it creates a dishonest record by confirming something the trainee did not witness. Senior pressure does not meaningfully reduce the seriousness, so this is worse than ''Inappropriate, but not awful''.', 0),
    (v_s21, 1, 'How important is it to be honest and accurate in records and signatures, even when under pressure from senior colleagues?', 'Very important', 'This is very important because honesty and accuracy in records and signatures are basic professional duties. It is more than merely important because false records can mislead others and undermine trust.', 1),
    (v_s21, 2, 'The trainee declines to sign and explains that they can only confirm what they directly witnessed.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it maintains honesty, protects the record, and communicates the limit of what the trainee can properly confirm. It is better than ''Appropriate, but not ideal'' because it deals directly with the core integrity issue.', 2);

  -- S22
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'A bereaved relative phones the ward asking for full details of an adult patient''s recent results and treatment. You do not know whether the patient would have wanted this information shared, and you have not been able to check with the team yet. The caller is very distressed.')
  RETURNING id INTO v_s22;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s22, 1, 'How important is it to check what information can appropriately be shared before disclosing details to the caller?', 'Very important', 'This is very important because confidentiality does not disappear after death, and decisions about disclosure still require careful checking. That makes it more than merely important or procedural.', 0),
    (v_s22, 2, 'You tell the caller everything because they sound genuinely upset and are probably a close family member.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because distress and apparent closeness do not by themselves justify full disclosure of confidential information. There is little mitigating value, so this is more serious than a merely imperfect response.', 1),
    (v_s22, 2, 'You express sympathy, explain that you need to check what can appropriately be shared, and arrange for the appropriate senior clinician or team to speak with the caller.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it is compassionate, avoids premature disclosure, and routes the issue through the right process. It is stronger than ''Appropriate, but not ideal'' because it addresses both the caller''s distress and the confidentiality issue properly.', 2);

  -- S23
  INSERT INTO timed_situational_judgement_scenarios (test_id, label_set, body)
  VALUES (2, 2, 'Soon after giving a medicine, a junior doctor realises they may have administered the wrong dose. The patient appears well, but the mistake is likely to be recorded if reviewed later.')
  RETURNING id INTO v_s23;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s23, 1, 'How important is it to seek senior help promptly, assess any risk to the patient, and make sure the error is handled honestly?', 'Very important', 'This is very important because a possible medication error requires prompt risk assessment, senior input, and honest handling. It is more than merely important because the patient''s immediate safety and trust may be affected.', 0),
    (v_s23, 2, 'The junior doctor says nothing because the patient seems fine and admitting the mistake could cause trouble.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it hides a potential error instead of addressing the risk and being open about what happened. The patient appearing well does not meaningfully reduce the seriousness, so this is worse than ''Inappropriate, but not awful''.', 1),
    (v_s23, 2, 'The junior doctor informs a senior, documents the issue appropriately, and helps ensure the patient is monitored and told what has happened through the proper process.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it seeks senior help, documents the issue, and supports proper monitoring and disclosure to the patient. It is better than ''Appropriate, but not ideal'' because it responds fully and honestly to the medication error.', 2);

END $$;
