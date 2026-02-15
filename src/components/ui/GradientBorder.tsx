import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

interface GradientBorderProps {
  children: React.ReactNode;
  borderWidth?: number;
  borderRadius?: number;
  gradientColors?: readonly string[];
  className?: string;
  style?: ViewStyle;
}

export const GradientBorder: React.FC<GradientBorderProps> = ({
  children,
  borderWidth = 1,
  borderRadius = 20,
  gradientColors = colors.gradients.primary,
  className = '',
  style,
}) => {
  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius, padding: borderWidth }, style]}
    >
      <View
        className={`bg-bg-card ${className}`}
        style={{ borderRadius: borderRadius - borderWidth }}
      >
        {children}
      </View>
    </LinearGradient>
  );
};
