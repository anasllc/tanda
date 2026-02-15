import React, { useEffect, useRef } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme';
import { keypadHaptic, pinErrorHaptic } from '../../utils/haptics';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

const Dot: React.FC<{ filled: boolean; error: boolean }> = ({
  filled,
  error,
}) => {
  return (
    <View
      className="w-4 h-4 rounded-full"
      style={{
        backgroundColor: error
          ? colors.error.main
          : filled
          ? colors.primary[500]
          : colors.border.light,
        transform: [{ scale: filled ? 1 : 0.6 }],
      }}
    />
  );
};

export const PinInput: React.FC<PinInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  error = false,
  disabled = false,
}) => {
  const inputRef = useRef<TextInput>(null);
  const shakeX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    if (error) {
      pinErrorHaptic();
      shakeX.value = withSequence(
        withTiming(-15, { duration: 50 }),
        withTiming(15, { duration: 50 }),
        withTiming(-15, { duration: 50 }),
        withTiming(15, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error]);

  useEffect(() => {
    if (value.length === length && !error) {
      onComplete?.(value);
    }
  }, [value, length, error, onComplete]);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    if (cleaned.length > value.length) {
      keypadHaptic();
    }
    onChange(cleaned);
  };

  return (
    <Pressable onPress={handlePress}>
      <TextInput
        ref={inputRef}
        className="absolute w-px h-px opacity-0"
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        editable={!disabled}
        secureTextEntry
        showSoftInputOnFocus={false}
        caretHidden={true}
      />

      <Animated.View className="flex-row justify-center gap-4 py-4" style={animatedStyle}>
        {Array.from({ length }).map((_, index) => (
          <Dot
            key={index}
            filled={index < value.length}
            error={error}
          />
        ))}
      </Animated.View>
    </Pressable>
  );
};
