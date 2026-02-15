import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { shadows } from '../../theme';
import { usePressAnimation } from '../../hooks/useAnimations';
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

const sizeClasses: Record<ButtonSize, string> = {
  small: 'h-11 px-4',
  medium: 'h-14 px-6',
  large: 'h-16 px-8',
};

const textSizeClasses: Record<ButtonSize, string> = {
  small: 'text-label-lg font-inter-medium',
  medium: 'text-title-md font-inter-medium',
  large: 'text-title-lg font-inter-semibold',
};

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
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation(0.97);
  const isDisabled = disabled || loading;

  const handlePress = (e: any) => {
    if (haptic) mediumHaptic();
    onPress?.(e);
  };

  const textColor = getTextColor(variant, isDisabled);

  if (variant === 'primary' && !isDisabled) {
    return (
      <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }, shadows.buttonGlow]}>
        <TouchableOpacity
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={handlePress}
          disabled={isDisabled}
          activeOpacity={0.9}
          {...props}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
              },
              size === 'small' && { height: 44, paddingHorizontal: 16 },
              size === 'medium' && { height: 56, paddingHorizontal: 24 },
              size === 'large' && { height: 64, paddingHorizontal: 32 },
              style,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={textColor} size="small" />
            ) : (
              <>
                {leftIcon}
                <Text
                  className={`${textSizeClasses[size]} ${leftIcon ? 'ml-2' : ''} ${rightIcon ? 'mr-2' : ''}`}
                  style={[{ color: textColor }, textStyle]}
                >
                  {title}
                </Text>
                {rightIcon}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  const variantClasses = getVariantClasses(variant, isDisabled);

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
      <TouchableOpacity
        className={`flex-row items-center justify-center rounded-xl ${sizeClasses[size]} ${variantClasses}`}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.9}
        style={style}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {leftIcon}
            <Text
              className={`${textSizeClasses[size]} ${leftIcon ? 'ml-2' : ''} ${rightIcon ? 'mr-2' : ''}`}
              style={[{ color: textColor }, textStyle]}
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

function getVariantClasses(variant: ButtonVariant, disabled: boolean): string {
  switch (variant) {
    case 'primary':
      return disabled ? 'bg-accent-800' : 'bg-accent-500';
    case 'secondary':
      return 'bg-bg-tertiary border border-border';
    case 'ghost':
      return 'bg-transparent';
    case 'danger':
      return disabled ? 'bg-error-dark' : 'bg-error-main';
  }
}

function getTextColor(variant: ButtonVariant, disabled: boolean): string {
  if (disabled) return colors.text.tertiary;
  switch (variant) {
    case 'primary': return colors.text.primary;
    case 'secondary': return colors.text.primary;
    case 'ghost': return colors.primary[500];
    case 'danger': return colors.text.primary;
  }
}
