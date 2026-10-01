// One static SJ scenario used by the in-lesson AI tutor demo.
// Schema mirrors the post-mapped form produced by useSituationalJudgementScenarios
// so SJScenarioScreen can consume it directly without going through Supabase.
// labelSet 2 = appropriateness scale (Very appropriate -> Very inappropriate).

export const SJ_TUTOR_DEMO_SCENARIO = {
  id: 'demo-sj-tutor',
  scenarioId: 'demo-sj-tutor',
  isFree: true,
  resource:
    'You are a medical student observing on a busy ward round. As the team moves between patients, you notice that one of the junior doctors does not wash their hands or use the alcohol gel before approaching the next patient. The patient is clearly vulnerable and the consultant has already moved on to dictating the plan.',
  questions: [
    {
      questionId: 'demo-sj-tutor-q1',
      questionText:
        'How appropriate is it for the medical student to quietly remind the junior doctor about hand hygiene before they touch the patient?',
      answer: 'A very appropriate thing to do',
      answeringReason:
        'This is a patient-safety issue, and patient safety overrides hierarchy or personal awkwardness. Reminding the doctor privately, before any contact with the patient, prevents potential harm without publicly embarrassing them. It also stays within the student\'s role: they are flagging a concern, not overruling clinical judgement.\n\nWhy the other ratings would be wrong:\n• Appropriate, but not ideal — implies there is a better option, but speaking up promptly and discreetly is exactly the textbook response. There is no obvious downside to soften the rating.\n• Inappropriate, but not awful — this would mean staying silent and letting a possible infection risk pass. That ignores the safety issue.\n• A very inappropriate thing to do — there is nothing unsafe, dishonest, or disrespectful about a quiet hand-hygiene reminder. Treating it as harmful is the opposite of what SJ rewards.\n\nKey lesson: when a small, private action protects a patient and stays inside your role, default to the stronger end of the appropriate scale unless something specific tells you to soften.',
      labelSet: 2,
    },
  ],
};
