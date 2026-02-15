import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, layout } from '../../theme';
import { mediumHaptic } from '../../utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  haptic = true,
  onPress,
  ...props
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (e: any) => {
    if (haptic) mediumHaptic();
    onPress?.(e);
  };

  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyles(variant, isDisabled);
  const sizeStyles = getSizeStyles(size);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.base,
          variantStyles.container,
          sizeStyles.container,
          fullWidth && styles.fullWidth,
          style,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.9}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            color={variantStyles.textColor}
            size={size === 'small' ? 'small' : 'small'}
          />
        ) : (
          <>
            {leftIcon}
            <Text
              style={[
                styles.text,
                sizeStyles.text,
                { color: variantStyles.textColor },
                leftIcon && { marginLeft: spacing[2] },
                rightIcon && { marginRight: spacing[2] },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {rightIcon}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const getVariantStyles = (variant: ButtonVariant, disabled: boolean) => {
  const styles: Record<ButtonVariant, { container: ViewStyle; textColor: string }> = {
    primary: {
      container: {
        backgroundColor: disabled ? colors.primary[800] : colors.primary[500],
      },
      textColor: disabled ? colors.text.tertiary : colors.text.primary,
    },
    secondary: {
      container: {
        backgroundColor: colors.background.tertiary,
        borderWidth: 1,
        borderColor: colors.border.default,
      },
      textColor: disabled ? colors.text.tertiary : colors.text.primary,
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
      },
      textColor: disabled ? colors.text.tertiary : colors.primary[500],
    },
    danger: {
      container: {
        backgroundColor: disabled ? colors.error.dark : colors.error.main,
      },
      textColor: disabled ? colors.text.tertiary : colors.text.primary,
    },
  };

  return styles[variant];
};

const getSizeStyles = (size: ButtonSize) => {
  const styles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    small: {
      container: {
        height: layout.buttonHeightSmall,
        paddingHorizontal: spacing[4],
      },
      text: {
        ...typography.labelLarge,
      },
    },
    medium: {
      container: {
        height: layout.buttonHeight,
        paddingHorizontal: spacing[6],
      },
      text: {
        ...typography.titleMedium,
      },
    },
    large: {
      container: {
        height: 64,
        paddingHorizontal: spacing[8],
      },
      text: {
        ...typography.titleLarge,
      },
    },
  };

  return styles[size];
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
  },
});
