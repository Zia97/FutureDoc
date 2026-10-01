// Static SJ worked-example scenarios used by the SJ Learning Pathway.
// Each entry is a single scenario + one question with a step-by-step
// answeringReason that walks the student through the method.
// Indexed by lesson id so the learn screen can launch the matching
// example from each Worked Example lesson.
//
// Schema mirrors the post-mapped form produced by useSituationalJudgementScenarios
// so SJScenarioScreen can consume it directly without going through Supabase.
// labelSet 1 = importance scale, labelSet 2 = appropriateness scale.

export const SJ_WORKED_EXAMPLES = {
  'appropriateness-worked-example': {
    id: 'sj-we-appropriateness',
    scenarioId: 'sj-we-appropriateness',
    title: 'Worked example: Appropriateness',
    topic: 'Appropriateness — group project conflict',
    isFree: true,
    resource:
      'You are working on a university group project alongside two classmates, Aisha and Marcus. Without consulting the rest of the group, Aisha has decided what topic the project will cover and assigned the workload to each member as she sees fit. Marcus feels the approach is unfair and that the group has been cut out of decisions that should have been made together.',
    questions: [
      {
        questionId: 'sj-we-appropriateness-q1',
        questionText:
          'How appropriate is it for Marcus to quietly ask the other group members how they feel about Aisha\'s approach, without involving Aisha?',
        answer: 'Appropriate, but not ideal',
        answeringReason:
          'Identify the core issue:\nThe real problem is that one team member made unilateral decisions and the workload was distributed without group input. The professional issue is fair collaboration and respectful teamwork — not personal feelings about Aisha.\n\nWhy this rating fits:\nMarcus is doing something constructive — he is gathering the group\'s view before reacting. That is better than acting alone or reporting Aisha as a first move. But the action does not fix the actual problem (the decision-making process). It also risks turning into a side conversation that excludes Aisha, which can cause more friction. So it helps, but it stops short of resolving the issue.\n\nWhy the other ratings would be wrong:\n• A very appropriate thing to do — this option helps, but there is a clearly better step available: speaking to Aisha directly and proposing a fairer way to share decisions. Whenever a stronger option is obviously available, the action drops out of "very appropriate".\n• Inappropriate, but not awful — Marcus is not doing anything dishonest, unsafe, or hostile. Talking to teammates about a real concern is reasonable.\n• A very inappropriate thing to do — only fits if the action caused harm or was clearly wrong. Discussing a teamwork issue is not in that category.\n\nKey lesson:\nIn SJ, "Appropriate, but not ideal" usually means: this action helps, but a more direct or more complete action exists. If you can think of a better local-resolution step that the action skips over, that is your signal to drop from the strongest rating to the second.',
        labelSet: 2,
      },
    ],
  },

  'importance-worked-example': {
    id: 'sj-we-importance',
    scenarioId: 'sj-we-importance',
    title: 'Worked example: Importance',
    topic: 'Importance — wrong dose about to be given',
    isFree: true,
    resource:
      'A junior doctor on the ward is about to administer a medication to one of the patients. As you watch the doctor prepare the medication, you notice that the dose looks much higher than the dose you usually see for that drug. The doctor has not yet given anything to the patient.',
    questions: [
      {
        questionId: 'sj-we-importance-q1',
        questionText:
          'How important is the risk to the patient if the wrong dose is given?',
        answer: 'Very important',
        answeringReason:
          'Identify the core issue:\nThis question is testing whether you can spot that patient safety is the dominant concern in the scenario. A possible medication error sits at the top of the SJ priority list.\n\nWhy this rating fits:\nThe risk of harm to the patient is the central reason anyone should act here. If you ignored the risk, the entire safety net of speaking up, double-checking, or escalating would collapse. In SJ, factors that determine whether a patient is harmed are almost always rated "Very important".\n\nWhy the other ratings would be wrong:\n• Important — understates the role of patient safety. "Important" is for factors that should influence the decision but are not the deciding factor. Here the patient risk is the deciding factor.\n• Of minor importance — this would mean the risk to the patient only slightly affects what should be done. That is incompatible with SJ\'s safety-first principle.\n• Not important at all — would mean the patient\'s safety has no bearing on the decision. There is no plausible reading of the scenario in which that is true.\n\nFor contrast, factors like the doctor\'s embarrassment about being corrected would usually rate "Not important at all" — feelings can shape how you raise the issue but should not change whether you raise it. Hospital protocol for double-checking medications would usually be "Important" — relevant and helpful, but the duty to act exists with or without a written protocol.\n\nKey lesson:\nWhen a factor sits between "do the right thing" and "patient comes to harm", that is the signature of "Very important". Do not soften the rating just because the action it implies feels socially uncomfortable.',
        labelSet: 1,
      },
    ],
  },

  'professionalism-worked-example': {
    id: 'sj-we-professionalism',
    scenarioId: 'sj-we-professionalism',
    title: 'Worked example: Admitting your own error',
    topic: 'Appropriateness — admitting your own error',
    isFree: true,
    resource:
      'While charting a patient\'s vital signs after a routine review, you realise that you have written down the wrong blood pressure reading on the chart. The patient is currently stable, but the chart will be used by other members of the team to make decisions about their care later in the shift.',
    questions: [
      {
        questionId: 'sj-we-professionalism-q1',
        questionText:
          'How appropriate is it to tell your supervisor about the error immediately and correct the chart?',
        answer: 'A very appropriate thing to do',
        answeringReason:
          'Identify the core issue:\nThis is a duty-of-candour scenario. You have made a documentation error that could affect future clinical decisions. The professional issue is honesty plus correcting harm.\n\nWhy this rating fits:\nThe action does three things at once: it is honest, it puts the record right, and it gives the team a chance to check whether the wrong figure influenced any earlier decision. That is precisely what is expected when an error is identified — own up, correct, and let others verify.\n\nWhy the other ratings would be wrong:\n• Appropriate, but not ideal — there is no obvious better alternative the action skips. Telling the supervisor and correcting the chart is the textbook response.\n• Inappropriate, but not awful — quietly correcting the chart without telling anyone would land here. It fixes the data but hides a problem you created. That is a step short of full transparency.\n• A very inappropriate thing to do — this rating would apply to ignoring the error or "waiting to see" if it caused a problem. Both are unsafe and dishonest.\n\nWhy "wait and see" is so badly rated:\nIt is functionally identical to ignoring the error: you have decided not to act on a known mistake. The duty of candour applies regardless of whether the error has caused visible harm yet.\n\nKey lesson:\nWhen you have made a mistake that affects a patient or their record, transparency plus correction is "Very appropriate". Anything less than transparency — even if you fix the underlying data — drops into the inappropriate half of the scale.',
        labelSet: 2,
      },
    ],
  },

  'close-call-worked-example': {
    id: 'sj-we-close-call',
    scenarioId: 'sj-we-close-call',
    title: 'Worked example: Close call',
    topic: 'Close call — the anxious patient',
    isFree: true,
    resource:
      'You are a medical student shadowing in an outpatient clinic. A patient in the waiting area looks visibly anxious about the test results they are about to be told. The next appointment is not for another fifteen minutes, and the supervising doctor is finishing notes nearby.',
    questions: [
      {
        questionId: 'sj-we-close-call-q1',
        questionText:
          'How appropriate is it for the medical student to sit with the patient, ask what they are worried about, and explain what is going to happen during their appointment?',
        answer: 'A very appropriate thing to do',
        answeringReason:
          'Why this is a close call:\nMany students hesitate between "Very appropriate" and "Appropriate, but not ideal" here. The hesitation usually comes from the worry that a student might cross into giving clinical advice they should not give. That is a sensible instinct — but the action described is firmly inside the student\'s role.\n\nWhat the student is doing right:\n• Acknowledging the patient\'s anxiety rather than ignoring it.\n• Listening before explaining — finding out what the worry actually is.\n• Explaining the process of the appointment, not the clinical content of the results.\n• Doing all of this with a supervisor nearby and time available, so nothing is being neglected.\n\nWhy this rating fits:\nThe action is patient-centred, kind, and proportionate, and it stays inside the student\'s competence. There is no hidden flaw to soften the rating. SJ rewards the student who can pick this kind of tailored, present response over a generic "try not to worry".\n\nWhy the lower rating loses:\nThe instinct to drop to "Appropriate, but not ideal" usually rests on imagining the student giving wrong information or stepping outside their role. The scenario describes neither of those — it describes listening and explaining the process. Penalising that response is rating the imagined version of the action, not the one in front of you.\n\nWhen the answer would actually shift:\nIf the patient asked the student to interpret the results, or to predict the diagnosis, the most appropriate action would shift toward flagging the patient\'s distress to the supervising doctor. SJ answers depend on what the role permits — always re-read the role and the action before locking in.\n\nKey lesson:\nWhen the action is honest, kind, in-role, and uses time the student genuinely has, default to the strongest rating. Do not drop to "Appropriate, but not ideal" just because you can imagine a different action going wrong.',
        labelSet: 2,
      },
    ],
  },
};

export const SJ_WORKED_EXAMPLE_IDS = Object.keys(SJ_WORKED_EXAMPLES);
