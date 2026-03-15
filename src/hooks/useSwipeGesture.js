import { useRef, useEffect } from 'react';
import { PanResponder } from 'react-native';

// onPrev / onNext: callback or null when at boundary
export function useSwipeGesture(onPrev, onNext) {
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);

  useEffect(() => { onPrevRef.current = onPrev; }, [onPrev]);
  useEffect(() => { onNextRef.current = onNext; }, [onNext]);

  return useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 15,
      onPanResponderRelease: (_, { dx }) => {
        if (Math.abs(dx) < 60) return;
        if (dx > 0) onPrevRef.current?.();
        else onNextRef.current?.();
      },
    })
  ).current.panHandlers;
}
