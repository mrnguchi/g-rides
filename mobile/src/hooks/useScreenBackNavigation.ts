import { useEffect, useMemo, useRef } from 'react';
import {
  BackHandler,
  PanResponder,
  Platform,
  type GestureResponderHandlers,
} from 'react-native';

const IOS_EDGE_WIDTH = 20;
const SWIPE_DISTANCE = 100;

export function useScreenBackNavigation(
  onBack?: () => void,
  enabled = true,
  swipeEnabled = true,
): GestureResponderHandlers {
  const onBackRef = useRef(onBack);
  const enabledRef = useRef(enabled);
  const swipeEnabledRef = useRef(swipeEnabled);
  const edgeStartRef = useRef(false);

  onBackRef.current = onBack;
  enabledRef.current = enabled;
  swipeEnabledRef.current = swipeEnabled;

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
        onStartShouldSetPanResponderCapture: (event) => {
          const { pageX, touches } = event.nativeEvent;
          edgeStartRef.current = touches.length === 1 && Number.isFinite(pageX) && pageX >= 0 && pageX <= IOS_EDGE_WIDTH;
          return false;
        },
        onMoveShouldSetPanResponderCapture: (_, gesture) => {
          if (gesture.numberActiveTouches !== 1) edgeStartRef.current = false;
          if (
            Platform.OS !== 'ios' ||
            !enabledRef.current ||
            !onBackRef.current ||
            !swipeEnabledRef.current ||
            !edgeStartRef.current
          ) {
            return false;
          }

          const horizontalMotion = Math.abs(gesture.dx);
          const verticalMotion = Math.abs(gesture.dy);

          return (
            gesture.dx >= 30 &&
            horizontalMotion > verticalMotion * 2
          );
        },
        onPanResponderRelease: (_, gesture) => {
          const startedAtEdge = edgeStartRef.current;
          edgeStartRef.current = false;
          if (!enabledRef.current || !swipeEnabledRef.current || !startedAtEdge || !onBackRef.current) return;

          if (
            gesture.dx >= SWIPE_DISTANCE &&
            gesture.dx > Math.abs(gesture.dy) * 2
          ) {
            onBackRef.current();
          }
        },
        onPanResponderTerminationRequest: () => true,
        onPanResponderTerminate: () => { edgeStartRef.current = false; },
      }),
    [],
  );

  return panResponder.panHandlers;
}
