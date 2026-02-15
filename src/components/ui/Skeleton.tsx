import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: customBorderRadius = borderRadius.md,
  style,
}) => {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -200 + shimmerPosition.value * 400 },
    ],
  }));

  return (
    <View
      className="bg-bg-tertiary overflow-hidden"
      style={[
        {
          width: width as any,
          height,
          borderRadius: customBorderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        className="absolute top-0 left-0 right-0 bottom-0"
        style={[{ width: 200 }, shimmerStyle]}
      >
        <LinearGradient
          colors={[
            'transparent',
            colors.overlay.light,
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, width: '100%' }}
        />
      </Animated.View>
    </View>
  );
};

// Pre-built skeleton components
export const SkeletonText: React.FC<{ lines?: number; lastLineWidth?: string }> = ({
  lines = 1,
  lastLineWidth = '60%',
}) => (
  <View>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height={16}
        width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
        style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
      />
    ))}
  </View>
);

export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <Skeleton
    width={size}
    height={size}
    borderRadius={size / 2}
  />
);

export const SkeletonCard: React.FC = () => (
  <View className="bg-bg-secondary rounded-2xl p-4 border border-border">
    <View className="flex-row items-center mb-4">
      <SkeletonAvatar />
      <View className="ml-3 flex-1">
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={14} style={{ marginTop: 4 }} />
      </View>
    </View>
    <SkeletonText lines={2} />
  </View>
);

export const SkeletonListItem: React.FC = () => (
  <View className="flex-row items-center py-3">
    <SkeletonAvatar />
    <View className="flex-1 ml-3">
      <Skeleton width="70%" height={16} />
      <Skeleton width="50%" height={14} style={{ marginTop: 4 }} />
    </View>
    <Skeleton width={60} height={16} />
  </View>
);
