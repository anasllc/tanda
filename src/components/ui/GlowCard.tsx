import React from 'react';
import { View, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { shadows } from '../../theme';
import { usePressAnimation } from '../../hooks/useAnimations';
import { lightHaptic } from '../../utils/haptics';

type GlowColor = 'primary' | 'success' | 'none';

interface GlowCardProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  glow?: GlowColor;
  className?: string;
  style?: ViewStyle;
  pressable?: boolean;
}

const glowStyles: Record<GlowColor, ViewStyle | undefined> = {
  primary: shadows.glowPrimarySubtle,
  success: shadows.glowSuccess,
  none: undefined,
};

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  glow = 'primary',
  className = '',
  style,
  pressable = false,
  onPress,
  ...props
}) => {
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation(0.98);

  const handlePress = (e: any) => {
    lightHaptic();
    onPress?.(e);
  };

  const glowShadow = glowStyles[glow];

  if (pressable) {
    return (
      <Animated.View style={[animatedStyle, glowShadow]}>
        <TouchableOpacity
          className={`bg-bg-card rounded-2xl p-4 ${className}`}
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
    <View className={`bg-bg-card rounded-2xl p-4 ${className}`} style={[glowShadow, style]}>
      {children}
    </View>
  );
};
