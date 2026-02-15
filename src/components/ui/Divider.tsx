import React from 'react';
import { View, ViewStyle } from 'react-native';

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
      className={vertical ? 'w-px bg-border mx-3' : 'h-px bg-border my-3'}
      style={[
        customSpacing !== undefined && {
          marginVertical: vertical ? 0 : customSpacing,
          marginHorizontal: vertical ? customSpacing : 0,
        },
        style,
      ]}
    />
  );
};
