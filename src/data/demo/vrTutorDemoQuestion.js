// One static VR passage + question used by the in-lesson AI tutor demo.
// Not loaded from Supabase; not stored in attempts cache.

export const VR_TUTOR_DEMO_PASSAGE = {
  id: 'demo-vr-tutor',
  title: 'Sample VR Passage',
  isFree: true,
  resource:
    'A council in Bristol introduced a low-traffic neighbourhood scheme in early 2022. By the end of the year, traffic on residential side streets within the scheme area had fallen by an average of 31%. Traffic on the surrounding main roads, however, increased by around 14% over the same period. Council officials said they were "encouraged" by the side-street figures but planned to review the wider impact before extending the scheme to other parts of the city.',
  questions: [
    {
      questionId: 'demo-vr-tutor-q1',
      questionText: 'Side-street traffic in the scheme area more than halved during 2022.',
      options: ['True', 'False', "Can't Tell"],
      answer: 'False',
      answeringReason:
        'The passage states that side-street traffic fell by an average of 31%. "More than halved" would require a fall of over 50%, which the passage does not support. The correct answer is False.',
    },
  ],
};
