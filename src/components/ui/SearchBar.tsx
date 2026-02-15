import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

const SearchIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} stroke={colors.text.tertiary} strokeWidth={2} />
    <Path d="M20 20L16.5 16.5" stroke={colors.text.tertiary} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ClearIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={colors.text.secondary} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const SearchBar = forwardRef<TextInput, SearchBarProps>(({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      className="flex-row items-center h-[52px] bg-bg-tertiary rounded-xl px-4 border"
      style={{
        borderColor: isFocused ? colors.border.focus : colors.border.default,
        ...(isFocused ? {
          shadowColor: colors.border.focus,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        } : {}),
      }}
    >
      <View className="mr-3">
        <SearchIcon />
      </View>

      <TextInput
        ref={ref}
        className="flex-1 h-full text-body-lg text-txt-primary p-0 m-0"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        {...props}
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} className="ml-2 p-1">
          <ClearIcon />
        </TouchableOpacity>
      )}
    </View>
  );
});

SearchBar.displayName = 'SearchBar';
