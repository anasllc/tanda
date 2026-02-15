import { useCallback, useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { springPresets, timingPresets } from '@/theme';

/**
 * Press animation - scale down + slight opacity change on press
 * Replaces 12+ duplicated Animated.spring patterns across the codebase
 */
export function usePressAnimation(scaleValue = 0.97) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(scaleValue, springPresets.press);
    opacity.value = withTiming(0.9, timingPresets.fast);
  }, [scale, opacity, scaleValue]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, springPresets.press);
    opacity.value = withTiming(1, timingPresets.fast);
  }, [scale, opacity]);

  return { animatedStyle, onPressIn, onPressOut };
}

/**
 * Entrance animation - fade in + slide up
 */
export function useEntrance(delay = 0) {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSpring(0, springPresets.gentle)
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: timingPresets.entrance.duration })
    );
  }, [delay, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
}

/**
 * Staggered list entrance - each item enters with increasing delay
 */
export function useStaggeredList(count: number, baseDelay = 80) {
  const items: SharedValue<number>[] = [];
  const opacities: SharedValue<number>[] = [];

  for (let i = 0; i < count; i++) {
    items.push(useSharedValue(20));
    opacities.push(useSharedValue(0));
  }

  useEffect(() => {
    items.forEach((item, index) => {
      const delay = index * baseDelay;
      item.value = withDelay(delay, withSpring(0, springPresets.gentle));
      opacities[index].value = withDelay(
        delay,
        withTiming(1, { duration: timingPresets.entrance.duration })
      );
    });
  }, [count]);

  const getStyle = useCallback(
    (index: number) => ({
      transform: [{ translateY: items[index]?.value ?? 0 }],
      opacity: opacities[index]?.value ?? 1,
    }),
    [items, opacities]
  );

  return getStyle;
}

/**
 * Shake animation - for error states
 */
export function useShakeAnimation() {
  const translateX = useSharedValue(0);

  const shake = useCallback(() => {
    translateX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-3, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { animatedStyle, shake };
}

/**
 * Count-up animation for numbers
 */
export function useCountUp(target: number, duration = 800) {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withTiming(target, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, duration, value]);

  return value;
}
