-- Seed: Timed SJ Test 4 (test_id = 4)
-- Source: sj-test-004-opus-validated.json (23 scenarios, 69 items)
-- label_set: 1 = importance scale, 2 = appropriateness scale

-- Ensure the test metadata row exists
INSERT INTO timed_situational_judgement_tests (id, title, time_minutes)
VALUES (4, 'SJ Timed Test 4', 26)
ON CONFLICT (id) DO NOTHING;

-- Clear existing Test 4 data (questions first due to FK, then scenarios)
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

  -- S01: Prescribing error at ten times the dose
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'While reviewing a patient''s drug chart, Dr Chandra, an F2 doctor, notices that a colleague, Dr Brook, has prescribed a medication at ten times the correct dose. The patient has not yet received the medication. Dr Brook is currently on a break.

How appropriate is each of the following responses by Dr Chandra?')
  RETURNING id INTO v_s01;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s01, 2, 'Dr Chandra waits for Dr Brook to return from his break so that he can correct his own error, since it is his patient.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because delaying the correction of a potentially dangerous prescribing error puts the patient at direct risk. The medication could be administered before Dr Brook returns. Patient safety must take priority over professional courtesy about who corrects the error.', 0),
    (v_s01, 2, 'Dr Chandra corrects the prescription immediately, then speaks to Dr Brook privately when he returns to explain the error and suggest double-checking doses in future.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the immediate patient safety risk by correcting the dose, and then deals with the colleague constructively through private, non-confrontational communication. This is consistent with GMC guidance on patient safety, teamwork, and raising concerns.', 1),
    (v_s01, 2, 'Dr Chandra corrects the prescription and files a clinical incident report without speaking to Dr Brook first.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because correcting the error and filing an incident report are both responsible actions. However, bypassing direct communication with Dr Brook misses an important learning opportunity and could feel punitive. Speaking to the colleague first, in addition to reporting, is the more collegiate approach.', 2);

  -- S02: Unlocked computer with patient records
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'While walking through the ward, a third-year medical student, Obi, notices that a computer at the nurses'' station has been left logged in and unlocked, displaying a patient''s full medical record. No staff are nearby and visitors are passing through the area.

How important to take into account are the following considerations for Obi when deciding how to respond?')
  RETURNING id INTO v_s02;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s02, 1, 'That Obi is only a medical student and information governance is not his direct responsibility.', 'Not important at all', 'This is not important at all because protecting patient confidentiality is every healthcare team member''s responsibility, including students. Professional duty to maintain confidentiality is not limited to those with specific information governance roles.', 0),
    (v_s02, 1, 'Whether the information on screen could be seen by unauthorised people passing through the area.', 'Very important', 'This is very important because patient confidentiality is a core GMC principle. An unlocked screen displaying patient records in a public area is a clear data protection and confidentiality risk. The longer it remains visible, the greater the chance of a breach.', 1),
    (v_s02, 1, 'Whether Obi should try to identify which staff member left the computer unlocked so they can be informed.', 'Of minor importance', 'This is of minor importance because while informing the staff member could prevent future occurrences, the immediate priority is securing the screen. Identifying the responsible person is a secondary concern that should not delay action to protect the patient''s information.', 2);

  -- S03: Student photographing patient notes on personal phone
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'During a ward placement, a second-year medical student, Kai, sees a fellow student, Rosa, taking photographs of a patient''s paper notes on her personal mobile phone. Rosa says she wants to review the case at home for her portfolio.

How appropriate is each of the following responses by Kai?')
  RETURNING id INTO v_s03;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s03, 2, 'Kai says nothing because he does not want to create conflict with a fellow student he has to work with every day.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because avoiding conflict is a form of self-interest that must not override patient confidentiality. The breach is ongoing — the photos exist on a personal device — and failing to act means identifiable patient information remains insecure.', 0),
    (v_s03, 2, 'Kai tells Rosa that photographing patient notes on a personal device is a serious breach of confidentiality and asks her to delete the photos immediately.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it directly addresses a clear confidentiality breach through private, firm communication. Patient identifiable information on personal devices violates data protection rules and GMC confidentiality principles. Asking Rosa to delete the photos is the immediate priority.', 1),
    (v_s03, 2, 'Kai suggests to Rosa that she anonymise the information if she wants to use the case for her portfolio, and offers to show her how to do it properly.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while the suggestion to anonymise is constructive, it does not address the immediate breach — the photos with identifiable information are still on Rosa''s phone. The priority is to ensure those photos are deleted first, then discuss proper portfolio methods.', 2);

  -- S04: Student signing attendance register and leaving early
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'Before a mandatory professional development session, a course mate, Ethan, tells his friend Suki that he plans to sign the attendance register and then leave early because he has a job interview. He asks Suki to cover for him if the tutor asks where he went.

How appropriate is each of the following responses by Suki?')
  RETURNING id INTO v_s04;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s04, 2, 'Suki agrees to cover for Ethan because the job interview is a legitimate reason and the session is not that important.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because lying about a colleague''s attendance is academic dishonesty regardless of the reason for absence. Professional development sessions are mandatory for a reason, and Suki would be breaching her own integrity by agreeing to deceive the tutor.', 0),
    (v_s04, 2, 'Suki refuses to cover for Ethan and explains that lying about attendance would be dishonest and could constitute academic misconduct for both of them.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it upholds academic integrity through honest, direct communication. Suki is right to identify that covering for Ethan would make her complicit in misconduct, consistent with GMC principles on honesty and maintaining trust.', 1),
    (v_s04, 2, 'Suki suggests that Ethan speak to the course administrator in advance to request an authorised absence for his interview.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because it offers Ethan a constructive and honest alternative. However, it does not address the fact that Ethan has already indicated he plans to sign in and leave — the more direct response would be to refuse to cover for him AND suggest the legitimate route.', 2);

  -- S05: Student interrupting and dismissing others in tutorials
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'Several students in a tutorial group have noticed that one student, Miles, consistently interrupts others, dismisses their contributions, and makes sarcastic comments. The affected students have become quieter and are contributing less to group discussions. Another student, Rhiannon, is considering whether to address the situation.

How important to take into account are the following considerations for Rhiannon when deciding how to respond?')
  RETURNING id INTO v_s05;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s05, 1, 'That Miles may not realise the effect his behaviour is having on the group.', 'Important', 'This is important because understanding whether Miles is aware of his impact affects how Rhiannon approaches the conversation. If he is unaware, a constructive discussion may be enough to change the behaviour. This consideration helps determine the most effective and fair approach.', 0),
    (v_s05, 1, 'That the other students'' learning is being negatively affected by the hostile group dynamic.', 'Very important', 'This is very important because creating a safe learning environment where everyone can participate is a core professional value. If Miles''s behaviour is suppressing others'' contributions, it is undermining the educational purpose of the group and affecting multiple people''s development.', 1),
    (v_s05, 1, 'That Rhiannon might become a target of Miles''s sarcasm if she speaks up.', 'Not important at all', 'This is not important at all because fear of personal consequences is a form of self-interest that should not prevent someone from addressing unprofessional behaviour. Professional duty to support colleagues and maintain a constructive working environment takes priority over personal comfort.', 2);

  -- S06: Dental nurse placing used instrument on clean tray
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'During a busy clinic session, dental student Niamh notices that a dental nurse has placed a used instrument back on the clean tray instead of into the contaminated instruments container. The instrument has not yet been used on another patient but is now among the sterile set.

How appropriate is each of the following responses by Niamh?')
  RETURNING id INTO v_s06;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s06, 2, 'Niamh assumes the dental nurse knows what she is doing and that the instrument must have already been cleaned.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because assuming the nurse has followed protocol when Niamh directly observed the contrary puts patients at risk. Deferring to someone else''s presumed competence when you have witnessed an error is a failure of professional duty to maintain patient safety.', 0),
    (v_s06, 2, 'Niamh quietly removes the contaminated instrument from the clean tray and alerts the dental nurse to what happened, so the tray can be checked.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it immediately addresses the infection control risk while communicating the issue to the responsible person. The approach is direct, non-confrontational, and prioritises patient safety, consistent with GMC guidance on safety and teamwork.', 1),
    (v_s06, 2, 'Niamh waits until after the clinic session to mention the incident to the dental nurse, not wanting to disrupt the flow of patients.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Niamh intends to raise the issue, delaying until after the session means the contaminated instrument could be used on a patient in the meantime. Infection control concerns must be addressed immediately, not deferred for convenience.', 2);

  -- S07: Nurse telling patient to stop blood pressure medication
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'While helping with discharge paperwork on a medical ward, a third-year medical student, Haruki, overhears a nurse telling a patient to stop taking their blood pressure medication once they get home because they are feeling better. Haruki knows from the patient''s notes that the medication should be continued long-term.

How appropriate is each of the following responses by Haruki?')
  RETURNING id INTO v_s07;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s07, 2, 'Haruki goes directly to the patient and corrects the nurse''s advice himself.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while the intent to protect the patient is correct, a medical student contradicting a nurse directly to a patient could cause confusion and undermine the nurse''s professional standing. The better approach is to raise the concern with the nurse first, or escalate to a doctor if needed.', 0),
    (v_s07, 2, 'Haruki politely speaks to the nurse after the conversation, mentions what he overheard, and suggests they double-check the discharge plan together.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses a direct patient safety concern through respectful, collaborative communication. Incorrect discharge advice about medication could cause serious harm. Haruki acts within his scope by raising the issue with the nurse rather than overriding them.', 1),
    (v_s07, 2, 'Haruki says nothing because he assumes the nurse must know the patient''s medication plan better than he does.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because Haruki has direct evidence from the patient''s notes that the medication should continue. Deferring to another professional when you have specific knowledge of a potential error is a failure of the duty to act on patient safety concerns. Even as a student, Haruki has a responsibility to speak up.', 2);

  -- S08: F1 prescribing wrong antibiotic
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'Dr Navarro, an F1 doctor, realises she prescribed the wrong antibiotic to a patient earlier in her shift. The patient received one dose before the error was noticed. The patient appears to have suffered no ill effects. Dr Navarro is considering whether and how to report the mistake.

How important to take into account are the following considerations for Dr Navarro when deciding how to respond?')
  RETURNING id INTO v_s08;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s08, 1, 'That the patient does not appear to have been harmed by the error.', 'Of minor importance', 'This is of minor importance because while the absence of harm is reassuring, it does not remove the obligation to report the error. Clinical incident reporting exists to identify system failures and prevent future harm, regardless of the outcome in this specific case. Reporting is about transparency and learning, not just harm.', 0),
    (v_s08, 1, 'That honesty about mistakes is a professional duty, and that reporting errors allows the healthcare system to learn and improve.', 'Very important', 'This is very important because the GMC duty of candour requires doctors to be open and honest when things go wrong. Reporting errors — even when no harm has occurred — contributes to a safety culture that protects future patients. Concealing mistakes is always unacceptable.', 1),
    (v_s08, 1, 'That reporting the error might lead to disciplinary action or damage Dr Navarro''s reputation among colleagues.', 'Not important at all', 'This is not important at all because fear of personal consequences is self-interest that must not prevent honest reporting. A transparent safety culture depends on clinicians feeling able to report errors without prioritising reputation over integrity. GMC principles are clear that honesty must prevail.', 2);

  -- S09: Fellow doctor diverting painkillers
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'While using the electronic prescribing system, Dr Okafor, an F1 doctor, notices that a fellow F1, Dr Grant, has been prescribing strong painkillers under a patient''s name but collecting them herself. Dr Okafor has seen Dr Grant appear drowsy at work on several recent occasions.

How appropriate is each of the following responses by Dr Okafor?')
  RETURNING id INTO v_s09;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s09, 2, 'Dr Okafor speaks to Dr Grant privately first, expressing concern for her wellbeing and asking whether she needs help.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while concern for a colleague''s wellbeing is admirable, suspected drug diversion and impairment are too serious for a peer-to-peer conversation alone. Speaking to Dr Grant might also prompt her to conceal evidence. However, the intent is compassionate, and Dr Okafor is not acting with malice.', 0),
    (v_s09, 2, 'Dr Okafor decides to monitor the situation for a few more weeks to gather more evidence before reporting.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because delaying a report when there is evidence of potential drug diversion and impaired practice puts patients at immediate risk. Gathering more evidence is not Dr Okafor''s role — that is for the appropriate authority to investigate. The duty to act is now.', 1),
    (v_s09, 2, 'Dr Okafor reports her concerns immediately to the clinical supervisor or responsible consultant, providing the specific evidence she has observed.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because the combination of suspected self-prescribing and appearing impaired at work raises serious concerns about both patient safety and Dr Grant''s fitness to practise. This must be escalated to a senior immediately — it is beyond the scope of a private conversation between peers.', 2);

  -- S10: Students skipping mandatory safeguarding refresher
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'A group of students are considering skipping a mandatory online safeguarding refresher module because they completed it last year and feel it is repetitive. They argue that the time would be better spent revising for upcoming exams. One student, Dara, is unsure whether to join them in skipping it.

How important to take into account are the following considerations for Dara when deciding how to respond?')
  RETURNING id INTO v_s10;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s10, 1, 'That safeguarding training is mandatory for a reason and that skipping it could have implications for Dara''s fitness to practise declaration.', 'Very important', 'This is very important because mandatory training requirements exist to ensure students maintain essential competencies. Safeguarding knowledge protects vulnerable patients, and failing to complete required modules may constitute a fitness to practise issue. Compliance with mandatory training is a professional obligation.', 0),
    (v_s10, 1, 'That the other students are all planning to skip it and Dara does not want to be the only one who completes it.', 'Not important at all', 'This is not important at all because peer pressure to avoid a professional obligation is irrelevant to the ethical decision. What other students choose to do does not change Dara''s own professional duty. Following the group to avoid standing out is a form of social self-interest.', 1),
    (v_s10, 1, 'Whether the safeguarding content has been updated since Dara last completed the module.', 'Of minor importance', 'This is of minor importance because while updated content is a reasonable justification for repeating training, the module is mandatory regardless of whether the content has changed. The obligation to complete it does not depend on whether new material has been added.', 2);

  -- S11: Visitor being aggressive to elderly patient
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'While visiting patients on a care of the elderly ward, a university volunteer, Sam, overhears a visitor speaking aggressively to an elderly patient, saying things like "You''re useless" and "Nobody wants to visit you." The patient looks frightened and does not respond.

How appropriate is each of the following responses by Sam?')
  RETURNING id INTO v_s11;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s11, 2, 'Sam approaches the bedside calmly and asks the patient if they are all right, offering to stay with them for a while.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because checking on the patient''s welfare shows compassion and may provide immediate comfort. However, it does not address the potentially abusive behaviour or ensure it is reported to clinical staff who can assess whether there is a safeguarding concern.', 0),
    (v_s11, 2, 'Sam reports what he witnessed to a member of the nursing staff, describing the visitor''s language and the patient''s reaction factually.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because verbal abuse of a vulnerable patient by a visitor may constitute a safeguarding concern. Reporting factually to nursing staff ensures that trained professionals can assess the situation, check on the patient, and take appropriate action. This is consistent with the duty to protect vulnerable individuals.', 1),
    (v_s11, 2, 'Sam confronts the visitor directly, telling them that speaking to patients that way is unacceptable.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because directly confronting an aggressive visitor could escalate the situation, put Sam or the patient at risk, and is beyond Sam''s role. The appropriate response is to report to staff who are trained and authorised to handle such situations.', 2);

  -- S12: Patient clinic letter left at shared printer
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'While collecting a printed handout from the shared ward printer, a fourth-year medical student, Tanya, finds several pages of a patient''s clinic letter containing sensitive personal and medical information. The letter appears to have been left uncollected for some time.

How appropriate is each of the following responses by Tanya?')
  RETURNING id INTO v_s12;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s12, 2, 'Tanya picks up the letter and hands it to the ward clerk or senior nurse, explaining where she found it.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it secures the confidential document and ensures it reaches someone who can handle it appropriately. Tanya is acting to protect patient confidentiality by removing the information from a public area, consistent with GMC guidance on maintaining confidentiality.', 0),
    (v_s12, 2, 'Tanya reads the letter because it might be relevant to a patient she is following for her portfolio.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because reading patient information without a legitimate clinical reason is a breach of confidentiality, even if the document was left in a public area. Finding a document does not grant permission to read its contents.', 1),
    (v_s12, 2, 'Tanya leaves the letter where it is, assuming whoever printed it will come back for it.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Tanya is not actively breaching confidentiality, she is failing to act to protect patient information that is exposed in a shared area. The letter could be read by anyone passing by. Inaction when you can easily secure confidential information is a missed professional duty.', 2);

  -- S13: Patient disclosing domestic violence
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'During a routine dental appointment, a patient becomes tearful and tells dental student Anika that her partner has been hitting her. The patient asks Anika not to tell anyone because she is afraid of what her partner might do. Anika''s supervising dentist is in the next room.

How important to take into account are the following considerations for Anika when deciding how to respond?')
  RETURNING id INTO v_s13;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s13, 1, 'That the patient has asked Anika to keep the information confidential and that breaching this could damage the patient''s trust.', 'Important', 'This is important because maintaining trust is a genuine professional concern, and breaking confidentiality carelessly could deter the patient from seeking help in the future. However, this consideration must be weighed against the duty to protect the patient from serious harm — confidentiality is important but not absolute.', 0),
    (v_s13, 1, 'That the patient may be at risk of serious physical harm and that healthcare professionals have a duty to act on safeguarding concerns.', 'Very important', 'This is very important because patient safety overrides confidentiality when there is a risk of serious harm. Domestic violence is a safeguarding issue, and all healthcare professionals — including dental students — have a duty to escalate concerns to a senior who can assess the situation and ensure the patient receives appropriate support.', 1),
    (v_s13, 1, 'That Anika is only a dental student and dealing with domestic violence is outside her area of expertise.', 'Not important at all', 'This is not important at all because while Anika is not expected to manage the situation alone, she has a professional duty to raise the concern with her supervisor. Safeguarding responsibilities apply to all healthcare team members regardless of seniority or specialty. Being a student does not exempt her from this duty.', 2);

  -- S14: Witnessing consent without being present
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'A registrar asks a third-year medical student, Jin, to sign as a witness on a consent form for a procedure. Jin was not present during the consent discussion and does not know what information the patient was given.

How appropriate is each of the following responses by Jin?')
  RETURNING id INTO v_s14;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s14, 2, 'Jin signs the form because the registrar has asked him to and he does not want to appear difficult.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because witnessing a consent form means confirming that you observed the consent process. Signing without being present is dishonest and could have legal consequences. Fear of appearing difficult is self-interest that must not override honesty and integrity.', 0),
    (v_s14, 2, 'Jin explains to the registrar that he cannot sign as a witness because he was not present for the consent discussion, and offers to witness the next one.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it upholds honesty and the legal meaning of witnessing consent. Jin''s response is respectful, honest, and offers a constructive alternative. This is consistent with GMC principles on integrity and knowing the limits of your role.', 1),
    (v_s14, 2, 'Jin asks the registrar to briefly recap what was discussed with the patient so he can feel comfortable signing.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Jin is trying to verify the consent process, a recap from the registrar is not the same as witnessing the actual discussion with the patient. The witness role confirms the patient''s engagement in the process, not just the doctor''s account of it. However, Jin is at least trying to act responsibly.', 2);

  -- S15: AI-generated content in group coursework
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'While reviewing a group coursework draft, a student, Petra, realises that another group member, Liam, has submitted a section that reads as though it was entirely generated by an AI tool without any editing or attribution. The university''s academic integrity policy requires students to declare AI use.

How appropriate is each of the following responses by Petra?')
  RETURNING id INTO v_s15;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s15, 2, 'Petra raises the issue with Liam privately, explaining that undeclared AI use could constitute academic misconduct for the whole group and asking him to rewrite or properly declare the content.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the integrity concern directly and privately, giving Liam the opportunity to correct the issue. It also protects the group from being implicated in misconduct, consistent with principles of honesty, direct communication, and teamwork.', 0),
    (v_s15, 2, 'Petra says nothing because she is not sure whether the work is AI-generated and does not want to falsely accuse Liam.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Petra''s caution about false accusations is understandable, her suspicion is reasonable and the potential consequences for the group are serious. Raising a concern is not the same as making an accusation — she can ask Liam about it without being confrontational.', 1),
    (v_s15, 2, 'Petra rewrites Liam''s section herself to remove the AI-generated content, without telling him or the group.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because it protects the group from submitting potentially problematic content. However, it avoids addressing the underlying issue — Liam''s breach of academic integrity policy — and means the behaviour may be repeated. Direct communication would be more constructive.', 2);

  -- S16: Patient complaint about rude doctor
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'Dr Eze, an F1 doctor, receives a verbal complaint from a patient who says another doctor, Dr Marsh, was rude and dismissive during a consultation earlier that day. The patient says Dr Marsh did not listen to her concerns and spoke over her repeatedly. Dr Eze was not present during the consultation.

How important to take into account are the following considerations for Dr Eze when deciding how to respond?')
  RETURNING id INTO v_s16;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s16, 1, 'That Dr Marsh may have a different recollection of the consultation and should have the opportunity to respond to the concern.', 'Important', 'This is important because fairness requires that Dr Marsh has the opportunity to give their perspective. However, this does not mean the patient''s complaint should be dismissed or delayed — it means the concern should be handled through proper channels where both sides can be heard.', 0),
    (v_s16, 1, 'That patients have a right to be treated with respect and courtesy, and that poor communication can affect clinical outcomes and trust.', 'Very important', 'This is very important because respectful communication is a core GMC requirement. Poor doctor-patient communication can lead to missed diagnoses, non-compliance with treatment, and erosion of trust in the healthcare system. The patient''s complaint raises a serious professional concern.', 1),
    (v_s16, 1, 'That Dr Eze does not want to get involved in a dispute between a patient and a colleague.', 'Not important at all', 'This is not important at all because personal reluctance to get involved is self-interest. Dr Eze has a professional duty to ensure the patient''s complaint is heard and directed through the appropriate process, regardless of personal discomfort about intervening in a colleague''s conduct.', 2);

  -- S17: Supervisor not wearing protective eye wear
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'In an oral surgery clinic, dental student Ronan notices that the supervising dentist has begun a procedure without putting on protective eye wear, which is required by the clinic''s infection control protocol. The supervising dentist appears to be in a hurry.

How appropriate is each of the following responses by Ronan?')
  RETURNING id INTO v_s17;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s17, 2, 'Ronan hands the supervising dentist the protective eye wear, saying he noticed it was missed.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the safety concern immediately through a practical, non-confrontational action. It gives the supervisor the opportunity to correct the omission without embarrassment, and prioritises compliance with infection control protocols.', 0),
    (v_s17, 2, 'Ronan decides not to say anything because the supervisor is more experienced and must have decided the eye wear is unnecessary for this procedure.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because PPE requirements are protocol-based safety measures, not discretionary decisions. A supervisor''s seniority does not override mandatory infection control standards. Assuming the supervisor deliberately omitted the PPE is rationalising inaction on a safety matter.', 1),
    (v_s17, 2, 'Ronan makes a mental note to mention the PPE issue in the post-clinic debrief session.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Ronan intends to raise the issue, delaying until after the procedure means the safety risk persists for the duration of the current case. The correct time to address PPE compliance is before or during the procedure, not afterwards.', 2);

  -- S18: Homophobic remark by teaching fellow
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'During a ward placement, a fourth-year medical student, Priya, overhears a teaching fellow make a homophobic remark about a patient''s partner in the staff room. Two other staff members laugh. Priya is the only student present.

How important to take into account are the following considerations for Priya when deciding how to respond?')
  RETURNING id INTO v_s18;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s18, 1, 'That discriminatory attitudes among clinical staff could affect the quality of care provided to patients from marginalised groups.', 'Very important', 'This is very important because discriminatory attitudes in healthcare settings can lead to unequal treatment, poorer outcomes, and patients feeling unsafe or unwelcome. GMC guidance requires that all patients are treated fairly and without discrimination. Addressing discriminatory behaviour protects patients and upholds professional standards.', 0),
    (v_s18, 1, 'That the teaching fellow could give Priya a poor placement assessment if she reports the comment.', 'Not important at all', 'This is not important at all because fear of academic reprisal is self-interest that must not prevent reporting discriminatory behaviour. There are safeguards within reporting processes to protect those who raise concerns in good faith. Professional duty to challenge discrimination outweighs personal risk.', 1),
    (v_s18, 1, 'Whether Priya can identify the appropriate channel through which to report the remark.', 'Important', 'This is important because knowing how and where to report a concern affects whether it is handled effectively. If Priya is unsure of the reporting process, she should seek guidance from a trusted senior or the medical school — but uncertainty about process should not prevent her from acting.', 2);

  -- S19: Patient's daughter complaining about care
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'A patient''s daughter approaches Dr Rahman, an F2 doctor, and says she is unhappy with the overall care her father has received on the ward. She feels the team has been dismissive of her father''s pain and that he has not been reviewed promptly. Dr Rahman was not directly involved in the patient''s care today.

How appropriate is each of the following responses by Dr Rahman?')
  RETURNING id INTO v_s19;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s19, 2, 'Dr Rahman listens to the daughter''s concerns, takes notes, reviews the father''s current condition, and ensures the concerns are communicated to the responsible consultant.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it demonstrates compassion, takes the complaint seriously, and ensures it reaches the person who can act on it. Listening, documenting, and escalating appropriately are all consistent with GMC guidance on communication, patient welfare, and teamwork.', 0),
    (v_s19, 2, 'Dr Rahman tells the daughter that she should use the formal complaints procedure and gives her the relevant contact details, without further engagement.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while directing the daughter to the formal complaints process is technically correct, doing so without listening to her concerns or checking on the patient feels dismissive and fails the communication and compassion standards expected of a doctor. It does not cause harm but misses the opportunity to help.', 1),
    (v_s19, 2, 'Dr Rahman tells the daughter that he was not involved and that she should speak to whichever doctor was responsible for her father''s care today.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Dr Rahman is being honest about his involvement and directing the daughter toward the responsible doctor, he is failing to listen to her concerns, check on the patient, or show any empathy toward a distressed relative. The GMC expects all doctors to respond constructively to concerns about patient care, regardless of whether they were directly involved. Deflecting entirely without engagement falls short of basic communication and compassion standards, though it does not cause direct harm.', 2);

  -- S20: Lab partner impaired before practical session
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'Before a practical laboratory session, a university student, Ife, notices that her lab partner, Callum, smells strongly of cannabis. The session involves handling sharp instruments and chemical reagents. Callum insists he is fine and asks Ife not to make a fuss.

How important to take into account are the following considerations for Ife when deciding how to respond?')
  RETURNING id INTO v_s20;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s20, 1, 'Whether Callum''s impairment could pose a safety risk to himself or others during a practical session involving sharp instruments and chemicals.', 'Very important', 'This is very important because impairment in a practical setting involving sharps and chemicals creates a direct safety risk. Just as with alcohol impairment in a clinical setting, the safety of all participants must be the primary concern.', 0),
    (v_s20, 1, 'That Ife does not want to get Callum into trouble because they are friends.', 'Not important at all', 'This is not important at all because personal friendship must not override safety concerns. Protecting a friend from consequences at the expense of safety is a clear case of personal interest conflicting with professional and personal duty.', 1),
    (v_s20, 1, 'Whether there is a pattern of Callum arriving in this state or whether this is a one-off occurrence.', 'Of minor importance', 'This is of minor importance because while a pattern of behaviour might indicate a larger welfare concern, the immediate safety risk exists regardless of whether this is the first time. A one-off instance of impairment is still dangerous in a practical setting, and the response should be the same.', 2);

  -- S21: Course rep sharing confidential exam information
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'A student, Yuki, discovers that the elected course representative has been sharing specific details about upcoming exam formats and question styles obtained from confidential staff-student committee meetings. Several students have been using this information to focus their revision.

How appropriate is each of the following responses by Yuki?')
  RETURNING id INTO v_s21;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s21, 2, 'Yuki reports the situation to the course director, explaining that confidential exam information is being shared and that it gives some students an unfair advantage.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because sharing confidential exam information undermines academic integrity and creates an unfair assessment process. Reporting through proper channels protects the fairness of the examination for all students, consistent with principles of honesty and justice.', 0),
    (v_s21, 2, 'Yuki tells the course rep that she thinks sharing the information is unfair and asks him to stop, but does not report it further.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because raising the concern directly with the course rep is a constructive first step. However, if confidential information has already been widely shared, speaking to the individual alone may not be sufficient — the course director needs to know so the integrity of the assessment can be reviewed.', 1),
    (v_s21, 2, 'Yuki uses the information herself since it is already circulating and she does not want to be at a disadvantage compared to other students who have seen it.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because using unfairly obtained exam information is a form of academic dishonesty, regardless of how widely it has been shared. The fact that others are doing it does not make it acceptable. This rationalisation — ''everyone else is doing it'' — is a common trap.', 2);

  -- S22: Adult patient's mother demanding diagnosis information
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'An adult patient''s mother arrives at the ward and demands that Dr Yates, an F1 doctor, tell her the diagnosis and test results for her son. The patient, who is 25 and has capacity, has not given consent for information to be shared with his family. The mother is becoming increasingly agitated.

How important to take into account are the following considerations for Dr Yates when deciding how to respond?')
  RETURNING id INTO v_s22;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s22, 1, 'That the mother is distressed and might escalate her behaviour if she does not receive the information.', 'Of minor importance', 'This is of minor importance because while managing the mother''s distress is a reasonable communication concern, it must not pressure Dr Yates into breaching confidentiality. The mother''s emotional state does not override the patient''s legal right to control who receives his medical information.', 0),
    (v_s22, 1, 'Whether the patient has explicitly stated that he does not want his mother to be informed, or whether the issue simply has not been discussed.', 'Very important', 'This is very important because there is a significant difference between a patient actively refusing to share information and the matter not having been discussed. If it has not been discussed, Dr Yates should speak to the patient before responding to the mother. If the patient has explicitly refused, that decision must be respected absolutely.', 1),
    (v_s22, 1, 'Whether sharing some general information without clinical details could help manage the mother''s distress without breaching full confidentiality.', 'Important', 'This is important because considering whether partial, non-clinical reassurance can be offered is a practical communication consideration. It may help de-escalate the situation while preserving the patient''s confidentiality. However, it must not lead to disclosure of the diagnosis or clinical details without consent.', 2);

  -- S23: Intoxicated patient becoming violent in ED
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (4, 'In the emergency department on a Friday night, an intoxicated patient begins shouting at staff and throwing objects. Dr Hassan, an F2 doctor, is the most senior doctor currently in the department. Other patients and staff appear frightened.

How appropriate is each of the following responses by Dr Hassan?')
  RETURNING id INTO v_s23;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s23, 2, 'Dr Hassan attempts to physically restrain the patient alone to prevent further disruption.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because attempting to physically restrain a violent, intoxicated patient alone is dangerous and contrary to safe restraint guidelines, which require trained team involvement. Solo restraint risks serious injury to both the doctor and the patient and could significantly escalate the situation. Despite the protective intent, the action could make things substantially worse and falls well outside safe professional practice.', 0),
    (v_s23, 2, 'Dr Hassan ensures other patients and staff are moved to a safe area, calls for security support, and attempts to de-escalate the situation verbally from a safe distance.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it prioritises the safety of all individuals — other patients, staff, and the aggressive patient — while following established protocols for managing violent incidents. De-escalation from a safe distance and calling for trained support is the professional standard.', 1),
    (v_s23, 2, 'Dr Hassan moves other patients to safety and waits for the patient to exhaust himself, without calling for security or attempting any intervention.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because protecting other patients is the right instinct. However, failing to call for security or attempt de-escalation means the situation remains unmanaged and the patient could harm himself or damage equipment. A passive approach when active management is needed falls short of the ideal response.', 2);

END $$;
