import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';
import { keypadHaptic } from '../../utils/haptics';

interface KeypadButtonProps {
  value: string | 'delete' | 'biometric';
  onPress: (value: string) => void;
  disabled?: boolean;
}

const KeypadButton: React.FC<KeypadButtonProps> = ({
  value,
  onPress,
  disabled = false,
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
    keypadHaptic();
    onPress(value);
  };

  const renderContent = () => {
    if (value === 'delete') {
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 18L15 12L9 6"
            stroke={colors.text.primary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="rotate(180 12 12)"
          />
        </Svg>
      );
    }

    if (value === 'biometric') {
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 11C12.5523 11 13 11.4477 13 12V14C13 14.5523 12.5523 15 12 15C11.4477 15 11 14.5523 11 14V12C11 11.4477 11.4477 11 12 11Z"
            fill={colors.text.primary}
          />
          <Path
            d="M7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12V14C17 16.7614 14.7614 19 12 19C9.23858 19 7 16.7614 7 14V12Z"
            stroke={colors.text.primary}
            strokeWidth={2}
          />
          <Path
            d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12V14C20 18.4183 16.4183 22 12 22C7.58172 22 4 18.4183 4 14V12Z"
            stroke={colors.text.primary}
            strokeWidth={2}
          />
        </Svg>
      );
    }

    return (
      <Text className="text-display-sm font-inter-bold text-txt-primary">
        {value}
      </Text>
    );
  };

  if (value === '' || disabled) {
    return <View className="w-18 h-18 rounded-full items-center justify-center bg-bg-secondary" />;
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        className="w-18 h-18 rounded-full items-center justify-center bg-bg-secondary"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  showBiometric?: boolean;
  disabled?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onKeyPress,
  onDelete,
  onBiometric,
  showBiometric = false,
  disabled = false,
}) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [showBiometric ? 'biometric' : '', '0', 'delete'],
  ];

  const handlePress = (value: string) => {
    if (value === 'delete') {
      onDelete();
    } else if (value === 'biometric') {
      onBiometric?.();
    } else {
      onKeyPress(value);
    }
  };

  return (
    <View className="px-6 py-4">
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-around mb-3">
          {row.map((key, keyIndex) => (
            <KeypadButton
              key={`${rowIndex}-${keyIndex}`}
              value={key}
              onPress={handlePress}
              disabled={disabled}
            />
          ))}
        </View>
      ))}
    </View>
  );
};
