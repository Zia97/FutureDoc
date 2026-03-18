import { useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

export default function ZoomableView({ children, maxZoom = 4, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale } }],
    { useNativeDriver: true },
  );

  function onPinchStateChange({ nativeEvent }) {
    if (nativeEvent.oldState === State.ACTIVE) {
      const clamped = Math.min(maxZoom, Math.max(1, nativeEvent.scale * lastScale.current));
      lastScale.current = clamped;
      scale.setValue(clamped);
    }
  }

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchEvent}
      onHandlerStateChange={onPinchStateChange}
    >
      <Animated.View style={[styles.container, style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </PinchGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
