import React from 'react';
import { ViewProps } from 'react-native';
import Animated, { FadeInDown, FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';

interface AnimatedViewProps extends ViewProps {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

export function FadeInView({
  delay = 0,
  duration = 350,
  children,
  className,
  ...props
}: AnimatedViewProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(duration).springify()}
      className={className}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

export function ScaleInView({
  delay = 0,
  duration = 400,
  children,
  className,
  ...props
}: AnimatedViewProps) {
  return (
    <Animated.View
      entering={ZoomIn.delay(delay).duration(duration).springify()}
      className={className}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

export function SlideInView({
  delay = 0,
  duration = 350,
  children,
  className,
  ...props
}: AnimatedViewProps) {
  return (
    <Animated.View
      entering={SlideInDown.delay(delay).duration(duration).springify()}
      className={className}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

export function FadeView({
  delay = 0,
  duration = 300,
  children,
  className,
  ...props
}: AnimatedViewProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(duration)}
      className={className}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
