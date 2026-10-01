// One static DM question used by the in-lesson AI tutor demo.
// Schema matches the post-mapped form produced by useDecisionMakingQuestions
// so the renderer can consume it directly without going through Supabase.

export const DM_TUTOR_DEMO_QUESTION = {
  id: 'demo-dm-tutor',
  title: 'Sample DM Question',
  type: 'strongest_argument',
  difficulty: 'normal',
  isFree: true,
  tableData: null,
  stimulusDiagram: null,
  stimulusVennGeometry: null,
  hideLabels: false,
  subtype: null,
  stem: 'A small hospital is considering whether to extend its outpatient clinic hours into the early evening, until 8 pm on weekdays.\n\nWhich is the strongest argument?',
  answer: 'B',
  answeringReason:
    'Apply FREES (Factual, Relevant, Entire, Emotionless, Sensible). Option B is the strongest argument because it cites concrete data (DNA rates, attendance figures), directly addresses the proposal (evening clinic access), engages with the actual mechanism (working-age patients cannot attend daytime slots), uses neutral language, and follows a clear logical chain. Option A appeals to feelings without evidence (fails Factual and Sensible). Option C raises a side issue not central to the decision (fails Entire). Option D uses extreme moral language ("deserve") rather than evidence (fails Factual and Emotionless).',
  options: [
    {
      label: 'A',
      text: 'Yes, because patients would feel more cared for if the clinic stayed open later.',
      vennConfig: null,
      vennGeometry: null,
    },
    {
      label: 'B',
      text: 'Yes, because hospital data show that did-not-attend rates are highest among working-age patients who cannot attend daytime slots, and a recent survey identified evening access as the most commonly requested change.',
      vennConfig: null,
      vennGeometry: null,
    },
    {
      label: 'C',
      text: 'No, because some staff prefer not to work late shifts.',
      vennConfig: null,
      vennGeometry: null,
    },
    {
      label: 'D',
      text: 'Yes, because every patient deserves the most convenient care possible.',
      vennConfig: null,
      vennGeometry: null,
    },
  ],
  statements: [],
};
