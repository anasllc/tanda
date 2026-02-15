import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme';
import { keypadHaptic, errorHaptic } from '../../utils/haptics';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  error = false,
  disabled = false,
  autoFocus = true,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const shakeX = useSharedValue(0);
  const hasCalledComplete = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep ref updated with latest onComplete
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    if (error) {
      errorHaptic();
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error]);

  // Reset the completion flag when value changes to less than length
  useEffect(() => {
    if (value.length < length) {
      hasCalledComplete.current = false;
    }
  }, [value, length]);

  // Call onComplete only once when value reaches full length
  useEffect(() => {
    if (value.length === length && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onCompleteRef.current?.(value);
    }
  }, [value, length]);

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
        autoFocus={autoFocus}
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <Animated.View className="flex-row justify-center gap-3" style={animatedStyle}>
        {Array.from({ length }).map((_, index) => {
          const char = value[index];
          const isActive = index === value.length && isFocused;
          const isFilled = index < value.length;

          return (
            <View
              key={index}
              className={`w-12 h-14 rounded-lg border items-center justify-center
                ${error ? 'border-error-main' : ''}
                ${isActive && !error ? 'border-2 border-accent-500' : ''}
                ${isFilled && !error && !isActive ? 'bg-bg-secondary border-border-light' : ''}
                ${!isFilled && !isActive && !error ? 'bg-bg-tertiary border-border' : ''}
              `}
            >
              <Text className="text-headline-md font-inter-semibold text-txt-primary">
                {char || ''}
              </Text>
              {isActive && (
                <View className="absolute w-0.5 h-6 bg-accent-500" />
              )}
            </View>
          );
        })}
      </Animated.View>
    </Pressable>
  );
};
