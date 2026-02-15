import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = colors.primary[500],
  backgroundColor = colors.background.tertiary,
  animated = true,
  style,
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const clampedProgress = Math.min(1, Math.max(0, progress));
    if (animated) {
      animatedProgress.value = withTiming(clampedProgress * 100, { duration: 500 });
    } else {
      animatedProgress.value = clampedProgress * 100;
    }
  }, [progress, animated]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  return (
    <View
      className="overflow-hidden"
      style={[
        { height, backgroundColor, borderRadius: height / 2 },
        style,
      ]}
    >
      <Animated.View
        className="h-full"
        style={[
          { backgroundColor: color, borderRadius: height / 2 },
          fillStyle,
        ]}
      />
    </View>
  );
};

// Circular progress variant
interface CircularProgressProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 100,
  strokeWidth = 8,
  color = colors.primary[500],
  backgroundColor = colors.background.tertiary,
  children,
}) => {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View className="absolute inset-0">
        {/* Background circle */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          }}
        />
      </View>
      <View
        className="absolute inset-0"
        style={{
          transform: [{ rotate: '-90deg' }],
        }}
      >
        {/* Progress circle - simplified without SVG for animation */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [{ rotate: `${clampedProgress * 360}deg` }],
          }}
        />
      </View>
      {children && (
        <View className="absolute items-center justify-center">
          {children}
        </View>
      )}
    </View>
  );
};
