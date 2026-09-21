import { useEffect, useMemo, useRef } from 'react';
import {
  BackHandler,
  PanResponder,
  Platform,
  type GestureResponderHandlers,
} from 'react-native';

const IOS_EDGE_WIDTH = 30;
const SWIPE_DISTANCE = 74;
const SWIPE_VELOCITY = 0.55;

export function useScreenBackNavigation(
  onBack?: () => void,
  enabled = true,
): GestureResponderHandlers {
  const onBackRef = useRef(onBack);
  const enabledRef = useRef(enabled);

  onBackRef.current = onBack;
  enabledRef.current = enabled;

  useEffect(() => {
    if (Platform.OS !== 'android' || !enabled) return undefined;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!enabledRef.current || !onBackRef.current) return false;
        onBackRef.current();
        return true;
      },
    );

    return () => subscription.remove();
  }, [enabled]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) => {
          if (
            Platform.OS !== 'ios' ||
            !enabledRef.current ||
            !onBackRef.current ||
            gesture.x0 > IOS_EDGE_WIDTH
          ) {
            return false;
          }

          const horizontalMotion = Math.abs(gesture.dx);
          const verticalMotion = Math.abs(gesture.dy);

          return (
            gesture.dx > 10 &&
            horizontalMotion > verticalMotion * 1.25
          );
        },
        onPanResponderRelease: (_, gesture) => {
          if (!enabledRef.current || !onBackRef.current) return;

          if (
            gesture.dx >= SWIPE_DISTANCE ||
            (gesture.dx >= 34 && gesture.vx >= SWIPE_VELOCITY)
          ) {
            onBackRef.current();
          }
        },
        onPanResponderTerminationRequest: () => true,
      }),
    [],
  );

  return panResponder.panHandlers;
}
