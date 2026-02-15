import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  disabled = false,
  onFocus,
  onBlur,
  style,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = error
    ? colors.error.main
    : isFocused
      ? colors.border.focus
      : colors.border.default;

  return (
    <View className="mb-4" style={containerStyle}>
      {label && (
        <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center h-14 bg-bg-tertiary rounded-xl px-4 border ${disabled ? 'opacity-60 bg-bg-secondary' : ''}`}
        style={{
          borderColor,
          ...(isFocused && !error ? {
            shadowColor: colors.border.focus,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
          } : {}),
        }}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          ref={ref}
          className="flex-1 h-full text-body-lg text-txt-primary p-0 m-0"
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          textAlignVertical="center"
          style={[
            leftIcon ? { paddingLeft: 0 } : undefined,
            rightIcon ? { paddingRight: 0 } : undefined,
            Platform.OS === 'android' ? { textAlignVertical: 'center' } : {},
            style,
          ]}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            className="ml-3"
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {(error || hint) && (
        <Text className={`text-body-sm mt-1 ml-1 ${error ? 'text-error-main' : 'text-txt-tertiary'}`}>
          {error || hint}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';
