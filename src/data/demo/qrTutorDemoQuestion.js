// One static QR set used by the in-lesson AI tutor demo.
// Schema mirrors the post-mapped form produced by useQuantitativeReasoningSets
// so QRQuestionScreen can consume it directly without going through Supabase.

export const QR_TUTOR_DEMO_SET = {
  id: 'demo-qr-tutor',
  setId: 'demo-qr-tutor',
  title: 'Sample QR Question',
  isFree: true,
  stimulus: {
    type: 'text',
    text: 'A laptop is on sale at 15% off its original price of £800. After the discount, the shop adds 5% VAT to the discounted price.',
  },
  questions: [
    {
      questionId: 'demo-qr-tutor-q1',
      questionText: 'What is the final price the customer pays?',
      options: [
        { label: 'A', text: '£680.00' },
        { label: 'B', text: '£714.00' },
        { label: 'C', text: '£720.00' },
        { label: 'D', text: '£840.00' },
      ],
      answer: 'B',
      answeringReason:
        'Step 1 — Apply the discount. After 15% off, the price is 800 × 0.85 = £680.\nStep 2 — Apply VAT to the discounted price. 680 × 1.05 = £714.\n\nWhy the wrong options are tempting:\n• £680 — stops after the discount step (intermediate-value trap).\n• £720 — combines the two percentages by subtracting (15% − 5% = 10%) which is not how successive percentages work.\n• £840 — applies VAT to the original £800 instead of the discounted price.\n\nKey lesson: percentages applied in sequence multiply, they do not add or subtract directly. Always apply each multiplier to the most recent value.',
    },
  ],
};
