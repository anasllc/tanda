import React from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme';
import { selectionHaptic, withOpacity } from '../../utils';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  disabled = false,
  style,
  icon,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    selectionHaptic();
    onPress?.();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        className={`flex-row items-center px-4 py-2 rounded-full border
          ${selected ? 'border-accent-500' : 'border-border'}
          ${disabled ? 'opacity-50' : ''}
        `}
        style={[
          {
            backgroundColor: selected
              ? withOpacity(colors.primary[500], 0.12)
              : colors.background.tertiary,
          },
          style,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {icon && <>{icon}</>}
        <Text
          className={`text-label-lg font-inter-medium
            ${selected ? 'text-accent-400' : 'text-txt-secondary'}
            ${icon ? 'ml-1.5' : ''}
          `}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
