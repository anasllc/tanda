import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
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
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const hasCalledComplete = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep ref updated with latest onComplete
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (error) {
      errorHaptic();
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
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
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length }).map((_, index) => {
          const char = value[index];
          const isActive = index === value.length && isFocused;
          const isFilled = index < value.length;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                isActive && styles.cellActive,
                isFilled && styles.cellFilled,
                error && styles.cellError,
              ]}
            >
              <Text style={styles.cellText}>
                {char || ''}
              </Text>
              {isActive && <View style={styles.cursor} />}
            </View>
          );
        })}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[3],
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  cell: {
    width: 48,
    height: 56,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  cellFilled: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.light,
  },
  cellError: {
    borderColor: colors.error.main,
  },
  cellText: {
    ...typography.headlineMedium,
    color: colors.text.primary,
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 24,
    backgroundColor: colors.primary[500],
  },
});
