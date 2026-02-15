import React, { useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle, Animated } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
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
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    selectionHaptic();
    onPress?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.container,
          selected && styles.selected,
          disabled && styles.disabled,
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
          style={[
            styles.label,
            selected && styles.labelSelected,
            icon && { marginLeft: spacing[1.5] },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  selected: {
    backgroundColor: withOpacity(colors.primary[500], 0.12),
    borderColor: colors.primary[500],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.labelLarge,
    color: colors.text.secondary,
  },
  labelSelected: {
    color: colors.primary[400],
  },
});
