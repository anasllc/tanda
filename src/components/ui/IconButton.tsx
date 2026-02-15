import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme';
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

const sizeClasses: Record<IconButtonSize, string> = {
  small: 'w-8 h-8',
  medium: 'w-11 h-11',
  large: 'w-14 h-14',
};

const variantClasses: Record<IconButtonVariant, string> = {
  default: 'bg-bg-tertiary',
  filled: 'bg-accent-500',
  ghost: 'bg-transparent',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'medium',
  variant = 'default',
  disabled = false,
  style,
  haptic = true,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (haptic) lightHaptic();
    onPress?.();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        className={`rounded-full items-center justify-center
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${disabled ? 'opacity-50' : ''}
        `}
        style={style}
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
