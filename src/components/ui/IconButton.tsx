import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Animated } from 'react-native';
import { colors, borderRadius } from '../../theme';
import { lightHaptic } from '../../utils/haptics';

type IconButtonSize = 'small' | 'medium' | 'large';
type IconButtonVariant = 'default' | 'filled' | 'ghost';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'medium',
  variant = 'default',
  disabled = false,
  style,
  haptic = true,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (haptic) lightHaptic();
    onPress?.();
  };

  const sizeStyle = getSizeStyle(size);
  const variantStyle = getVariantStyle(variant);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.base,
          sizeStyle,
          variantStyle,
          disabled && styles.disabled,
          style,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {icon}
      </TouchableOpacity>
    </Animated.View>
  );
};

const getSizeStyle = (size: IconButtonSize): ViewStyle => {
  const sizes: Record<IconButtonSize, ViewStyle> = {
    small: { width: 32, height: 32 },
    medium: { width: 44, height: 44 },
    large: { width: 56, height: 56 },
  };
  return sizes[size];
};

const getVariantStyle = (variant: IconButtonVariant): ViewStyle => {
  const variants: Record<IconButtonVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.background.tertiary,
    },
    filled: {
      backgroundColor: colors.primary[500],
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };
  return variants[variant];
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
