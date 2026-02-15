import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

interface DividerProps {
  style?: ViewStyle;
  vertical?: boolean;
  spacing?: number;
}

export const Divider: React.FC<DividerProps> = ({
  style,
  vertical = false,
  spacing: customSpacing,
}) => {
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        customSpacing !== undefined && {
          marginVertical: vertical ? 0 : customSpacing,
          marginHorizontal: vertical ? customSpacing : 0,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing[3],
  },
  vertical: {
    width: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing[3],
  },
});
