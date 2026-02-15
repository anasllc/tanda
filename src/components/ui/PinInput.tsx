import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, TextInput, Animated } from 'react-native';
import { colors, spacing } from '../../theme';
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
      style={[
        styles.dot,
        {
          backgroundColor: error
            ? colors.error.main
            : filled
            ? colors.primary[500]
            : colors.border.light,
          transform: [{ scale: filled ? 1 : 0.6 }],
        },
      ]}
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
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      pinErrorHaptic();
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
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
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        editable={!disabled}
        secureTextEntry
        showSoftInputOnFocus={false}
        caretHidden={true}
      />

      <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[4],
    paddingVertical: spacing[4],
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
