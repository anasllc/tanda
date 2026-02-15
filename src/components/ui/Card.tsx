import React from 'react';
import {
  View,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { shadows } from '../../theme';
import { usePressAnimation } from '../../hooks/useAnimations';
import { lightHaptic } from '../../utils/haptics';

interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  pressable?: boolean;
  haptic?: boolean;
}

const variantClasses: Record<string, string> = {
  default: 'bg-bg-card rounded-2xl p-4',
  elevated: 'bg-bg-elevated rounded-2xl p-4',
  outlined: 'bg-transparent rounded-2xl p-4 border border-border',
  glass: 'bg-bg-card/80 rounded-2xl p-4',
  gradient: 'rounded-2xl p-4',
};

export const Card: React.FC<CardProps> = ({
  children,
  style,
  className = '',
  variant = 'default',
  pressable = false,
  haptic = true,
  onPress,
  ...props
}) => {
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation(0.98);

  const handlePress = (e: any) => {
    if (haptic && pressable) lightHaptic();
    onPress?.(e);
  };

  const baseClass = variantClasses[variant] || variantClasses.default;
  const elevatedShadow = variant === 'elevated' ? shadows.glowPrimarySubtle : undefined;

  if (pressable) {
    return (
      <Animated.View style={[animatedStyle, elevatedShadow]}>
        <TouchableOpacity
          className={`${baseClass} ${className}`}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={handlePress}
          activeOpacity={0.9}
          style={style}
          {...props}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View className={`${baseClass} ${className}`} style={[elevatedShadow, style]}>
      {children}
    </View>
  );
};
