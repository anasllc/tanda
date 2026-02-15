import React from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { useCountUp } from '../../hooks/useAnimations';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: TextStyle;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 800,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  style,
}) => {
  const animatedValue = useCountUp(value, duration);

  const animatedProps = useAnimatedProps(() => {
    const num = animatedValue.value;
    const formatted = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
    return {
      text: `${prefix}${formatted}${suffix}`,
    } as any;
  });

  return (
    <AnimatedText
      className={className}
      style={style}
      animatedProps={animatedProps}
    />
  );
};
