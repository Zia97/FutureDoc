export const QUESTION_SWIPE_DISTANCE = 60;
export function shouldClaimQuestionSwipe({ dx, dy, numberActiveTouches = 1 }) {
  return numberActiveTouches === 1 && Math.abs(dx) >= QUESTION_SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 2;
}
