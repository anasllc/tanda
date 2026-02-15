import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  Animated,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { lightHaptic } from '../../utils/haptics';

interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  pressable?: boolean;
  haptic?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  pressable = false,
  haptic = true,
  onPress,
  ...props
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (pressable) {
      Animated.spring(scale, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = (e: any) => {
    if (haptic && pressable) lightHaptic();
    onPress?.(e);
  };

  const variantStyle = getVariantStyle(variant);

  if (pressable) {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={[styles.base, variantStyle, style]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          activeOpacity={0.9}
          {...props}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.base, variantStyle, style]}>
      {children}
    </View>
  );
};

const getVariantStyle = (variant: 'default' | 'elevated' | 'outlined'): ViewStyle => {
  switch (variant) {
    case 'elevated':
      return {
        backgroundColor: colors.background.elevated,
        ...shadows.md,
      };
    case 'outlined':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border.default,
      };
    default:
      return {
        backgroundColor: colors.background.secondary,
        borderWidth: 1,
        borderColor: colors.border.default,
      };
  }
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius['2xl'],
    padding: spacing[4],
  },
});
