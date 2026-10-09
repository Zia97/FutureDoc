import { useRef, useEffect } from 'react';
import { PanResponder } from 'react-native';
import { QUESTION_SWIPE_DISTANCE, shouldClaimQuestionSwipe } from '../../utils/questionSwipe';

// onPrev / onNext: callback or null when at boundary
export function useSwipeGesture(onPrev, onNext) {
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);

  useEffect(() => { onPrevRef.current = onPrev; }, [onPrev]);
  useEffect(() => { onNextRef.current = onNext; }, [onNext]);

  return useRef(
    PanResponder.create({
      // A small finger drift must not cancel a press without navigating.
      onMoveShouldSetPanResponder: (_, gesture) => shouldClaimQuestionSwipe(gesture),
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: (_, { dx }) => {
        if (Math.abs(dx) < QUESTION_SWIPE_DISTANCE) return;
        if (dx > 0) onPrevRef.current?.();
        else onNextRef.current?.();
      },
    })
  ).current.panHandlers;
}
