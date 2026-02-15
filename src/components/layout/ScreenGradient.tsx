import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ScreenGradientProps {
  children?: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  height?: number;
  opacity?: number;
}

export const ScreenGradient: React.FC<ScreenGradientProps> = ({
  children,
  className = '',
  style,
  height = 200,
  opacity = 0.04,
}) => {
  return (
    <View className={`absolute top-0 left-0 right-0 ${className}`} style={style}>
      <LinearGradient
        colors={[`rgba(139, 92, 246, ${opacity})`, 'transparent']}
        style={{ height }}
      />
      {children}
    </View>
  );
};
