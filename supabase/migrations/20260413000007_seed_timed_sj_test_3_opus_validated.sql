-- Seed: Timed SJ Test 3 (test_id = 3)
-- Source: sj-test-003-opus-validated.json (23 scenarios, 69 items)
-- label_set: 1 = importance scale, 2 = appropriateness scale

-- Ensure the test metadata row exists
INSERT INTO timed_situational_judgement_tests (id, title, time_minutes)
VALUES (3, 'SJ Timed Test 3', 26)
ON CONFLICT (id) DO NOTHING;

-- Clear existing Test 3 data (questions first due to FK, then scenarios)
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

  -- S01: Rude healthcare assistant
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'A patient on the medical ward approaches Dr Reeves, an F1 doctor, and says she is upset because a healthcare assistant spoke to her rudely during the night shift. The patient is visibly distressed and says she wants to make a formal complaint.

How appropriate is each of the following responses by Dr Reeves?')
  RETURNING id INTO v_s01;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s01, 2, 'Dr Reeves tells the patient that the healthcare assistant was probably just tired and that she should not take it personally.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while it attempts to reassure the patient, it dismisses her experience and minimises a legitimate concern. It does not cause lasting harm but fails to take the complaint seriously, which undermines trust.', 0),
    (v_s01, 2, 'Dr Reeves listens to the patient''s account, acknowledges her distress, and explains how she can make a formal complaint through the hospital''s patient advice and liaison service.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it validates the patient''s experience, treats her with respect, and directs her to the proper complaints process. This is consistent with GMC guidance on communication, partnership, and maintaining trust.', 1),
    (v_s01, 2, 'Dr Reeves promises to speak to the healthcare assistant''s manager immediately and assures the patient the staff member will be disciplined.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because while Dr Reeves is taking the concern seriously, promising disciplinary action is beyond his authority and creates expectations he cannot guarantee. The better approach is to signpost the proper complaints process rather than making promises about outcomes.', 2);

  -- S02: Patient requesting female doctor
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'Dr Osei, an F1 doctor, is about to examine a patient in a gynaecology clinic. The patient requests that only a female doctor examine her, citing cultural and personal reasons. Dr Osei is the only doctor currently available.

How important to take into account are the following considerations for Dr Osei when deciding how to respond?')
  RETURNING id INTO v_s02;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s02, 1, 'Whether a short delay to find a female colleague would pose any clinical risk to the patient.', 'Of minor importance', 'This is of minor importance because while clinical urgency matters, the scenario describes a routine clinic appointment where a brief wait is unlikely to cause harm. It is worth checking but should not override the patient''s reasonable request.', 0),
    (v_s02, 1, 'The patient''s right to dignity and to have her preferences respected during intimate examinations.', 'Very important', 'This is very important because patient autonomy and dignity are core GMC principles. Respecting reasonable preferences about intimate examinations is a fundamental aspect of consent and trust, particularly where cultural or personal sensitivities are involved.', 1),
    (v_s02, 1, 'That Dr Osei might feel personally rejected or offended by the request.', 'Not important at all', 'This is not important at all because the doctor''s personal feelings about the request are irrelevant to the clinical and ethical decision. Patient dignity and autonomy take priority over any personal reaction from the clinician.', 2);

  -- S03: Registrar belittling F1
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'During a surgical placement, a fourth-year medical student, Adaeze, witnesses a registrar repeatedly belittling an F1 doctor in front of the nursing team. The F1 appears upset but does not respond. This is the third time Adaeze has seen the registrar behave this way.

How appropriate is each of the following responses by Adaeze?')
  RETURNING id INTO v_s03;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s03, 2, 'Adaeze confronts the registrar publicly during the next ward round, telling them their behaviour is unacceptable.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because a public confrontation with a senior clinician is unprofessional, could escalate the situation, and may create further problems for the F1 and the team. It also models the same aggressive communication style being objected to.', 0),
    (v_s03, 2, 'Adaeze speaks to the F1 privately afterwards to check on their wellbeing and encourages them to report the behaviour.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it supports a colleague who may be struggling to act alone, and it encourages use of proper reporting channels. Supporting colleagues'' wellbeing and addressing unprofessional behaviour are core professional duties.', 1),
    (v_s03, 2, 'Adaeze decides it is not her place to get involved since she is only a medical student.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Adaeze''s hesitation as a student is understandable, all healthcare team members have a duty to raise concerns about unprofessional behaviour. Inaction allows the bullying to continue, though Adaeze''s silence alone does not cause the harm.', 2);

  -- S04: Falsified logbook entries
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'While comparing placement logbooks, Rhys notices that his course mate, Seren, has recorded clinical skills she has not actually performed. Seren says everyone exaggerates their logbooks and that it does not matter as long as they eventually learn the skills.

How appropriate is each of the following responses by Rhys?')
  RETURNING id INTO v_s04;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s04, 2, 'Rhys starts exaggerating his own logbook as well, since Seren says it is common practice.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it compounds the dishonesty rather than addressing it. The fact that others may do it does not make it acceptable. Falsifying records is academic misconduct and undermines patient safety, regardless of how common the practice may be.', 0),
    (v_s04, 2, 'Rhys explains to Seren that falsifying logbook entries is dishonest and could have consequences for patient safety if she is assessed as competent in skills she has not practised.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it directly addresses the issue through honest, private communication. It highlights both the integrity concern and the patient safety implication, consistent with GMC principles on honesty and maintaining trust.', 1),
    (v_s04, 2, 'Rhys tells the clinical skills coordinator about Seren''s logbook without speaking to Seren first.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because while reporting dishonesty to the appropriate authority is a legitimate step, it bypasses direct communication with Seren. For a non-urgent issue involving a peer, speaking to the person first is preferred before escalating.', 2);

  -- S05: On-call F1 asleep on duty
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'During a night placement on a medical ward, second-year medical student Jaya discovers that the on-call F1 doctor has fallen asleep in the doctors'' mess. There are currently no urgent patient issues, but Jaya knows the F1 is the only doctor covering the ward overnight.

How important to take into account are the following considerations for Jaya when deciding how to respond?')
  RETURNING id INTO v_s05;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s05, 1, 'Whether the F1 has been working excessive hours and may have fallen asleep due to exhaustion.', 'Of minor importance', 'This is of minor importance because while understanding the context is compassionate, it does not change the immediate need to ensure medical cover is available for patients. The reason for falling asleep may inform longer-term welfare support but should not delay acting on the safety concern.', 0),
    (v_s05, 1, 'Whether patients on the ward could deteriorate and need urgent medical attention while the doctor is asleep.', 'Very important', 'This is very important because patient safety is the highest priority. Even though there are no current urgent issues, patients can deteriorate rapidly and the covering doctor must be available to respond. This directly concerns the safety and quality domain of GMC guidance.', 1),
    (v_s05, 1, 'That waking the F1 or reporting the situation might make things awkward between Jaya and the doctor for the rest of the placement.', 'Not important at all', 'This is not important at all because social comfort and avoiding awkwardness are forms of self-interest that must never override patient safety concerns. Professional duty requires action regardless of personal discomfort.', 2);

  -- S06: Social media breach of confidentiality
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'After an interesting day on her emergency department placement, third-year medical student Leah posts on social media describing a particularly unusual case she observed. She does not name the patient but includes the patient''s approximate age, the presenting complaint, and the name of the hospital.

How appropriate is each of the following responses by Leah?')
  RETURNING id INTO v_s06;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s06, 2, 'Leah leaves the post up because she has not used the patient''s name and believes it is therefore not a confidentiality breach.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because confidentiality can be breached even without naming a patient. The combination of age, presenting complaint, hospital, and date could allow the patient to be identified — especially for unusual cases. GMC and medical school social media policies are clear that this constitutes a breach.', 0),
    (v_s06, 2, 'Leah deletes the post immediately upon reflection and informs her clinical supervisor about what she posted.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the breach promptly and demonstrates honesty by self-reporting. Deleting the post limits further exposure, and informing the supervisor allows the situation to be managed appropriately. This is consistent with GMC principles on honesty and maintaining confidentiality.', 1),
    (v_s06, 2, 'Leah edits the post to remove the hospital name and the patient''s age, keeping only a general description of the case.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Leah is attempting to reduce the identifiability of the patient, even a general description of an unusual case could be enough for identification. The post should be removed entirely, not edited. However, Leah has at least recognised the need to act.', 2);

  -- S07: Inadequate consent explanation
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'While observing in a pre-operative clinic, a third-year medical student, Olumide, notices that a surgeon is explaining a procedure to a patient very quickly and in complex medical terminology. The patient nods along but appears confused and does not ask any questions. The consent form is signed.

How appropriate is each of the following responses by Olumide?')
  RETURNING id INTO v_s07;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s07, 2, 'Olumide approaches the patient after the surgeon leaves and asks whether they understood everything about the procedure.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it directly addresses the concern about informed consent by checking the patient''s understanding. Even as a student, Olumide can act as an advocate for the patient. If the patient is confused, Olumide can then escalate to ensure proper consent is obtained.', 0),
    (v_s07, 2, 'Olumide says nothing because the surgeon is experienced and must know whether the patient has understood.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because deferring to seniority when a patient''s informed consent may be compromised is a failure of professional duty. Consent is a fundamental ethical and legal requirement, and assuming the surgeon has fulfilled it when there are visible signs the patient may not have understood is negligent.', 1),
    (v_s07, 2, 'Olumide mentions his concern to the surgical registrar later that day, suggesting that the patient may not have fully understood the procedure.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because raising the concern with another clinician is a constructive step. However, it delays action — the patient may undergo the procedure before the registrar acts. Checking directly with the patient first would have been more timely and effective.', 2);

  -- S08: Treating a family member
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'While working a weekend shift in the emergency department, Dr Afolabi, an F1 doctor, is assigned to assess a patient and discovers it is his aunt. She has presented with abdominal pain and asks him to treat her because she trusts him.

How important to take into account are the following considerations for Dr Afolabi when deciding how to respond?')
  RETURNING id INTO v_s08;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s08, 1, 'That refusing to treat his aunt might offend her or damage their family relationship.', 'Not important at all', 'This is not important at all because personal family dynamics should not influence professional clinical decisions. The primary concern is whether treating a close relative could compromise clinical objectivity, not whether declining would cause personal offence.', 0),
    (v_s08, 1, 'The risk that a personal relationship with the patient could compromise Dr Afolabi''s clinical objectivity and judgement.', 'Very important', 'This is very important because GMC guidance recognises that treating people close to you can impair objectivity and lead to suboptimal care — either through over-investigation, under-investigation, or emotional bias. Conflicts of interest in clinical care must be managed to protect the patient.', 1),
    (v_s08, 1, 'Whether another doctor is available to take over the assessment.', 'Important', 'This is important because the availability of an alternative clinician affects the practical options. If another doctor can take over, Dr Afolabi should arrange a handover. If he is the only doctor available, he may need to begin the assessment while seeking support, but this practical consideration should not override the principle of avoiding conflicts of interest.', 2);

  -- S09: Rough handling of anxious patient
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'During a clinical session in the dental school, dental student Mei Lin observes a qualified dentist handling an anxious teenage patient roughly, gripping the patient''s jaw firmly and telling them to stop being difficult. The patient has tears in their eyes.

How appropriate is each of the following responses by Mei Lin?')
  RETURNING id INTO v_s09;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s09, 2, 'Mei Lin offers to help calm the patient, suggesting a brief pause so the patient can collect themselves.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because offering practical support is a constructive intervention that may immediately help the patient. However, it does not directly address the dentist''s inappropriate behaviour, which is the core professional concern. The rough handling needs to be raised as a separate issue.', 0),
    (v_s09, 2, 'Mei Lin reports her observations to the clinic supervisor after the session, describing the dentist''s behaviour and the patient''s distress factually.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it raises a legitimate concern about patient welfare through the proper channel — the clinic supervisor. Describing events factually without exaggeration is the professional standard for reporting concerns, consistent with GMC guidance on raising concerns and patient safety.', 1),
    (v_s09, 2, 'Mei Lin decides the dentist probably knows best and that some patients need firm handling.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because no patient — especially a distressed teenager — should be treated roughly. Rationalising unprofessional behaviour by deferring to the dentist''s experience fails the duty to protect patient welfare. All healthcare professionals and students have a responsibility to challenge poor treatment of patients.', 2);

  -- S10: Jehovah''s Witness refusing blood transfusion
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'A patient who is a Jehovah''s Witness is scheduled for a surgical procedure that may require a blood transfusion. The patient has clearly and calmly stated that they refuse a transfusion under any circumstances, including if their life is at risk. The medical student, Freya, is observing.

How important to take into account are the following considerations for Freya when deciding how to think about this situation?')
  RETURNING id INTO v_s10;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s10, 1, 'Whether the patient''s family members agree with the decision to refuse a transfusion.', 'Of minor importance', 'This is of minor importance because while family views may provide useful context, the decision belongs to the competent patient alone. Family agreement or disagreement does not change the patient''s legal right to refuse treatment and should not influence the clinical team''s obligation to respect the patient''s wishes.', 0),
    (v_s10, 1, 'That the patient has the legal and ethical right to refuse treatment, even if that decision could result in death.', 'Very important', 'This is very important because patient autonomy is a foundational ethical principle. A competent adult has the absolute right to refuse any treatment, including life-saving treatment. GMC guidance and UK law are clear on this point, and respecting this right is non-negotiable.', 1),
    (v_s10, 1, 'That Freya personally believes the patient is making a mistake by refusing treatment that could save their life.', 'Not important at all', 'This is not important at all because a healthcare professional''s or student''s personal opinion about a patient''s decision is irrelevant when the patient has capacity and has made an informed choice. Imposing one''s own values on a patient''s autonomous decision would be paternalistic and contrary to GMC principles.', 2);

  -- S11: Unreported needlestick injury
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'Dr Pham, an F1 doctor, witnesses a fellow F1, Dr Ellis, sustain a needlestick injury while taking blood from a patient. Dr Ellis rinses the wound briefly but says she does not intend to report it because the paperwork takes too long and she is too busy.

How appropriate is each of the following responses by Dr Pham?')
  RETURNING id INTO v_s11;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s11, 2, 'Dr Pham explains to Dr Ellis that needlestick injuries must be reported for her own safety and that the process exists to protect her from blood-borne infections.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it directly addresses the colleague''s decision not to report, using private and supportive communication. Needlestick injuries carry genuine health risks, and reporting is a professional and occupational health requirement. This response prioritises colleague welfare and follows proper safety protocols.', 0),
    (v_s11, 2, 'Dr Pham accepts Dr Ellis''s decision, reasoning that it is her personal choice whether to report the injury.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because failing to report a needlestick injury has implications beyond personal choice — it affects infection control monitoring, may require follow-up testing of the source patient, and could put Dr Ellis''s health at serious risk. Professional duty requires colleagues to support each other in following safety protocols.', 1),
    (v_s11, 2, 'Dr Pham reports the incident to occupational health on Dr Ellis''s behalf without telling her.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while the reporting intention is correct, doing it without Dr Ellis''s knowledge undermines trust and autonomy. The better approach is to encourage Dr Ellis to report it herself, and only escalate if she continues to refuse. Acting behind a colleague''s back should be a last resort.', 2);

  -- S12: Suspected supply theft
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'While walking through a hospital corridor, a university student on a non-clinical placement notices a member of staff taking supplies from a storeroom and placing them in a personal bag. The student, Ben, does not know the staff member or whether they are authorised to take the items.

How appropriate is each of the following responses by Ben?')
  RETURNING id INTO v_s12;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s12, 2, 'Ben reports what he observed to a ward manager or security, describing what he saw factually and without accusation.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because reporting a potentially dishonest act through proper channels is consistent with professional integrity. Ben describes observations factually without assuming guilt, which allows the appropriate authority to investigate. This approach is proportionate and responsible.', 0),
    (v_s12, 2, 'Ben confronts the staff member directly and demands to know why they are taking the supplies.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because a direct confrontation with an unknown staff member could be aggressive, potentially unsafe, and is disproportionate. Ben does not know the full context and is not in a position of authority to challenge the person. Reporting to the appropriate authority is the correct channel.', 1),
    (v_s12, 2, 'Ben decides it is none of his business since he is only on a placement and does not work at the hospital.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Ben''s hesitation about his role is understandable, professional integrity applies even on placement. If theft is occurring, it affects the hospital''s resources and potentially patient care. However, Ben''s inaction alone does not cause direct harm.', 2);

  -- S13: Colleague struggling with bereavement
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'In a group study session, a fellow student, Amy, confides in her friend Marcus that she has been making mistakes on assignments because she is dealing with a family bereavement. Amy says she does not want anyone else to know and asks Marcus not to tell their tutors.

How important to take into account are the following considerations for Marcus when deciding how to respond?')
  RETURNING id INTO v_s13;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s13, 1, 'Whether Amy''s wellbeing and academic performance could deteriorate further without appropriate support.', 'Very important', 'This is very important because a colleague''s declining wellbeing and performance can have serious consequences for both the individual and, in a medical or clinical context, for patient safety in the longer term. Supporting Amy in accessing help is a professional and personal duty.', 0),
    (v_s13, 1, 'That Marcus does not want to betray Amy''s trust by telling anyone.', 'Not important at all', 'This is not important at all because while respecting a friend''s confidence is a natural instinct, it should not prevent Marcus from encouraging Amy to seek support. Fear of betraying trust is a form of personal discomfort that should not override genuine concern for someone''s welfare.', 1),
    (v_s13, 1, 'Whether the university offers bereavement support or extenuating circumstances processes that could help Amy.', 'Important', 'This is important because knowing what support is available allows Marcus to offer Amy practical, actionable advice. Directing Amy to appropriate resources is a constructive way to help without overstepping, and demonstrates genuine concern for her wellbeing.', 2);

  -- S14: Group presentation unfair credit
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'After a group presentation, the module convenor singles out one student, Jordan, for praise. The other group members know that most of the ideas and slides Jordan presented were actually developed by another member, Priti, who is quieter and did not present. Jordan does not correct the convenor.

How appropriate is each of the following responses by the other group members?')
  RETURNING id INTO v_s14;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s14, 2, 'A group member privately tells the convenor after the session that Priti was responsible for most of the content Jordan presented.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because it attempts to ensure Priti receives fair credit. However, it bypasses speaking to Jordan first, which would have been the more direct and collegiate approach for a non-urgent interpersonal issue.', 0),
    (v_s14, 2, 'A group member speaks to Jordan privately, pointing out that Priti deserves credit for her work and suggesting Jordan acknowledge this.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the issue directly, privately, and gives Jordan the opportunity to do the right thing. It supports Priti without publicly embarrassing Jordan, consistent with honest and respectful communication.', 1),
    (v_s14, 2, 'The group members say nothing because it would be awkward to raise and the grades have already been given.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because allowing a colleague to take credit for another''s work is a failure of integrity and fairness. The fact that grades have been given does not remove the professional obligation to ensure honest attribution. Inaction reinforces dishonest behaviour.', 2);

  -- S15: Unsafe to continue after 24-hour shift
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'After completing a 12-hour night shift, Dr Kaur, an F1 doctor, is asked by her registrar to stay and cover the morning ward round because the incoming F1 has called in sick. Dr Kaur has been awake for over 24 hours and feels she is not safe to make clinical decisions.

How appropriate is each of the following responses by Dr Kaur?')
  RETURNING id INTO v_s15;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s15, 2, 'Dr Kaur agrees to stay without raising her concerns, not wanting to let the team down.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because working when you believe you are too fatigued to practise safely puts patients at direct risk. GMC guidance is clear that doctors must recognise when they are not fit to work and must not allow pressure from colleagues to override patient safety.', 0),
    (v_s15, 2, 'Dr Kaur explains to the registrar that she is not safe to continue working after 24 hours awake and asks that the hospital find alternative cover.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because recognising your own limitations and communicating them honestly is a professional duty. Patient safety depends on doctors being fit to practise, and Dr Kaur is acting responsibly by declining to work when impaired, consistent with GMC principles on safety and quality.', 1),
    (v_s15, 2, 'Dr Kaur agrees to stay for one hour to hand over the most urgent tasks, while the registrar arranges alternative cover.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because it demonstrates commitment to patient continuity while acknowledging her limitations. However, even one additional hour may pose a risk given her level of fatigue, and she should not feel obligated to compromise her own assessment of fitness to practise.', 2);

  -- S16: Expensive gift from elderly patient
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'After several weeks of home visits during a GP placement, a grateful elderly patient offers Ayesha, a fourth-year medical student, an expensive watch as a thank-you gift. The patient insists and says Ayesha has been the most caring person she has met in years.

How important to take into account are the following considerations for Ayesha when deciding how to respond?')
  RETURNING id INTO v_s16;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s16, 1, 'Whether accepting the gift could be perceived as taking advantage of a vulnerable patient or could compromise professional boundaries.', 'Very important', 'This is very important because accepting expensive gifts from patients raises serious concerns about professional boundaries, potential exploitation of vulnerability, and the appearance of impropriety. GMC guidance advises caution around gifts, particularly those of significant value from vulnerable patients.', 0),
    (v_s16, 1, 'That the patient''s feelings might be hurt if Ayesha declines the gift.', 'Of minor importance', 'This is of minor importance because while being sensitive to the patient''s feelings is reasonable, it should not override professional boundary considerations. A polite and warm explanation for declining can address the patient''s feelings without compromising professionalism.', 1),
    (v_s16, 1, 'That Ayesha would like to keep the watch because it is valuable and she feels she earned it through hard work.', 'Not important at all', 'This is not important at all because personal desire for the gift is pure self-interest and should play no role in the decision. Professional boundary decisions must be based on ethical principles, not personal gain.', 2);

  -- S17: Unauthorised access to patient records
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'A second-year medical student, Dominic, is on a GP placement and has access to the electronic patient records system. Out of curiosity, Dominic looks up the medical records of a friend who is registered at the same practice but is not one of his assigned patients.

How appropriate is each of the following responses after Dominic realises what he has done?')
  RETURNING id INTO v_s17;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s17, 2, 'Dominic decides not to tell anyone, hoping that the access will not be noticed in the audit logs.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it compounds the original breach with concealment. Accessing records without a clinical reason is a serious confidentiality breach, and attempting to hide it violates GMC principles on honesty and maintaining trust. Audit systems exist precisely to detect such breaches.', 0),
    (v_s17, 2, 'Dominic immediately informs his GP supervisor that he accessed a patient''s records without a legitimate clinical reason and accepts the consequences.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because self-reporting demonstrates honesty and integrity — core GMC values. While the initial access was wrong, coming forward immediately shows professional accountability and allows the breach to be managed appropriately.', 1),
    (v_s17, 2, 'Dominic tells a fellow student what happened and asks for advice on whether he should report it.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Dominic''s instinct to seek advice is understandable, discussing the breach with a fellow student delays proper reporting and involves someone who cannot resolve the situation. The correct step is to report directly to his supervisor.', 2);

  -- S18: Data falsification in research
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'While helping to compile data for a research project, a student, Layla, notices that the lead researcher — a senior academic — appears to have altered several data points to make the results more statistically significant. The research is being submitted for publication in a medical journal.

How important to take into account are the following considerations for Layla when deciding how to respond?')
  RETURNING id INTO v_s18;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s18, 1, 'That the senior academic could negatively affect Layla''s grades or references if she raises the concern.', 'Not important at all', 'This is not important at all because fear of personal repercussions is a form of self-interest that must not prevent reporting research misconduct. GMC principles and research ethics codes are clear that integrity must be maintained regardless of the personal cost.', 0),
    (v_s18, 1, 'That falsified research data published in a medical journal could influence clinical decisions and ultimately harm patients.', 'Very important', 'This is very important because research integrity directly affects patient safety. Published data that has been falsified could lead to incorrect treatment decisions, wasted resources, and harm to patients. This is the primary reason why research misconduct must be reported.', 1),
    (v_s18, 1, 'Whether Layla may have misunderstood the data analysis methods and the changes might be legitimate.', 'Important', 'This is important because Layla should consider whether she might be mistaken before making a serious allegation. However, this uncertainty should lead her to seek clarification or report her concerns for investigation — not to dismiss them entirely. It is better to raise a concern that turns out to be unfounded than to ignore potential misconduct.', 2);

  -- S19: Missed allergy communication during handover
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'Following a busy weekend on call, Dr Asante, an F2 doctor, realises that important information about a patient''s drug allergy was not communicated during a handover to the receiving team at another hospital. The patient has already been transferred.

How appropriate is each of the following responses by Dr Asante?')
  RETURNING id INTO v_s19;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s19, 2, 'Dr Asante contacts the receiving hospital immediately to communicate the allergy information and documents the error.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it addresses the patient safety risk immediately by ensuring the receiving team has the critical allergy information. Documenting the error is consistent with the duty of candour and allows the incident to be reviewed and learned from.', 0),
    (v_s19, 2, 'Dr Asante assumes the allergy will be in the patient''s electronic notes and that the receiving team will find it themselves.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because assuming someone else will catch the error is a dangerous form of inaction. Drug allergies are critical safety information, and the omission during handover creates a direct risk of harm. Professional duty requires Dr Asante to act immediately rather than rely on assumptions.', 1),
    (v_s19, 2, 'Dr Asante asks a colleague to call the other hospital on her behalf because she is busy with other patients.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because while delegating the call ensures the information is communicated, Dr Asante is the person with direct knowledge of the error and is best placed to communicate it accurately. Delegating introduces a risk of further miscommunication, though it is better than doing nothing.', 2);

  -- S20: Confused patient, family insisting on extraction
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'In a dental clinic, dental student Tariq is treating an elderly patient who appears confused about which tooth is to be extracted. The patient''s daughter, who accompanied her, insists that the extraction should go ahead because it was already agreed at a previous appointment. The patient seems uncertain.

How important to take into account are the following considerations for Tariq when deciding how to respond?')
  RETURNING id INTO v_s20;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s20, 1, 'Whether the patient currently understands what procedure is being proposed and can give informed consent.', 'Very important', 'This is very important because valid consent requires that the patient understands the proposed treatment at the time it is given. Previous agreement does not substitute for current informed consent, especially if the patient now appears confused. GMC and dental council guidance is clear that capacity and consent must be assessed in the moment.', 0),
    (v_s20, 1, 'That the daughter is insisting the treatment go ahead and may become upset if it is delayed.', 'Of minor importance', 'This is of minor importance because while managing the daughter''s expectations is a reasonable communication concern, her wishes cannot override the patient''s right to informed consent. Family members do not have the authority to consent on behalf of a competent adult, and their frustration should not pressure clinicians into proceeding without proper consent.', 1),
    (v_s20, 1, 'Whether delaying the procedure could worsen the patient''s dental condition.', 'Important', 'This is important because clinical consequences of delay are a legitimate consideration. However, proceeding without valid consent is never justified, even if delay poses some clinical risk. The appropriate response is to assess capacity, ensure consent, and manage the clinical situation accordingly.', 2);

  -- S21: Using medical student as interpreter
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'During a GP consultation, the doctor discovers that the patient speaks very limited English. The doctor turns to the medical student, Amira, who happens to speak the same language as the patient, and asks her to interpret the consultation including the diagnosis and treatment plan.

How appropriate is each of the following responses by Amira?')
  RETURNING id INTO v_s21;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s21, 2, 'Amira agrees to interpret the full consultation, including the diagnosis and treatment options, to help the doctor and patient communicate.', 'Inappropriate, but not awful', 'This is inappropriate, but not awful because while Amira''s willingness to help is well-intentioned, using an untrained interpreter for clinical discussions risks inaccurate translation of medical information, which could compromise patient understanding and safety. Professional interpreting services exist for this reason. However, the intent is to help and no malice is involved.', 0),
    (v_s21, 2, 'Amira suggests to the doctor that a professional telephone interpreting service would be more appropriate for the clinical discussion, and offers to help with basic communication in the meantime.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it prioritises accurate clinical communication while still being helpful. Professional interpreters are trained to handle medical terminology and maintain neutrality, which ensures the patient receives accurate information and can give informed consent.', 1),
    (v_s21, 2, 'Amira refuses to help at all, saying it is not part of her role as a medical student.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because flatly refusing to assist when a patient is struggling to communicate shows a lack of compassion and teamwork. While full clinical interpreting is not her role, Amira could help in a limited capacity while a professional service is arranged. Refusing entirely fails the patient.', 2);

  -- S22: Peer exclusion from study group
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'In a university study group, the other members have gradually stopped inviting Femi to their sessions. When asked, they say Femi talks too much and slows the group down. Another student, Grace, notices that Femi has become withdrawn and appears upset.

How important to take into account are the following considerations for Grace when deciding how to respond?')
  RETURNING id INTO v_s22;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s22, 1, 'That the group has been working more efficiently without Femi.', 'Not important at all', 'This is not important at all because group efficiency does not justify excluding a peer. Professional values of teamwork and respect for colleagues require that concerns about someone''s behaviour are addressed constructively, not through exclusion. Convenience should never override fairness.', 0),
    (v_s22, 1, 'That Femi may have valuable contributions to offer and that exclusion could affect his academic performance and wellbeing.', 'Important', 'This is important because exclusion can have serious effects on a person''s mental health, confidence, and academic outcomes. Recognising the potential harm helps Grace understand why the situation needs to be addressed, consistent with the professional value of supporting colleagues.', 1),
    (v_s22, 1, 'Whether anyone has spoken to Femi directly about how his participation style affects the group.', 'Of minor importance', 'This is of minor importance because while knowing whether the issue has already been raised helps Grace decide her next step, it does not change the fundamental obligation to address the exclusion. Even if Femi has been spoken to before, excluding him without further dialogue is not the appropriate response.', 2);

  -- S23: Parent refusing treatment for child''s painful tooth
  INSERT INTO timed_situational_judgement_scenarios (test_id, body)
  VALUES (3, 'A mother brings her eight-year-old son to the dental clinic with a severely decayed tooth that is causing him significant pain. The supervising dentist recommends extraction under local anaesthetic, but the mother refuses all treatment, saying she wants to try herbal remedies first. The child is crying and holding his face.

How appropriate is each of the following responses by the dental student, Chloe, who is assisting?')
  RETURNING id INTO v_s23;
  INSERT INTO timed_situational_judgement_questions (scenario_id, label_set, question_text, correct_answer, answer_reason, order_index) VALUES
    (v_s23, 2, 'Chloe supports the supervising dentist in explaining the risks of leaving the tooth untreated, including the possibility of infection spreading, while respecting the mother''s right to make decisions for her child.', 'A very appropriate thing to do', 'This is a very appropriate thing to do because it ensures the parent is fully informed of the risks while respecting parental authority. The approach balances the child''s welfare with the parent''s right to make treatment decisions, and ensures the clinical team has fulfilled their duty to inform.', 0),
    (v_s23, 2, 'Chloe tells the mother that herbal remedies do not work and that she is being irresponsible by letting her child suffer.', 'A very inappropriate thing to do', 'This is a very inappropriate thing to do because it is confrontational, disrespectful, and judgmental. Criticising a parent''s choices in this way damages the therapeutic relationship, is unlikely to change the decision, and does not demonstrate the empathy and respect required by GMC guidance on communication.', 1),
    (v_s23, 2, 'Chloe suggests to the supervising dentist that they arrange a follow-up appointment soon, so the child can be reassessed if the herbal remedies do not work.', 'Appropriate, but not ideal', 'This is appropriate, but not ideal because arranging follow-up ensures the child is not lost to care and provides a safety net. However, it does not fully address the immediate concern — the child is in pain now, and more effort should be made to explore the mother''s concerns and find an acceptable treatment plan before accepting the refusal.', 2);

  COMMIT;
END $$;
