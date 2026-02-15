import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, shadows } from '../../theme';
import { useUIStore, Toast as ToastType } from '../../stores/uiStore';

const SuccessIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill={colors.success.main} />
    <Path
      d="M8 12L11 15L16 9"
      stroke={colors.white}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ErrorIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill={colors.error.main} />
    <Path
      d="M15 9L9 15M9 9L15 15"
      stroke={colors.white}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const WarningIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 22H22L12 2Z"
      fill={colors.warning.main}
    />
    <Path
      d="M12 9V13M12 17H12.01"
      stroke={colors.black}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const InfoIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill={colors.info.main} />
    <Path
      d="M12 8H12.01M12 11V16"
      stroke={colors.white}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const getIcon = (type: ToastType['type']) => {
  switch (type) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
  }
};

interface ToastItemProps {
  toast: ToastType;
  onHide: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide }) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    translateY.value = withSpring(0);
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const handleDismiss = () => {
    opacity.value = withTiming(0, { duration: 150 });
    translateY.value = withTiming(-100, { duration: 200 }, () => {
      // Note: runOnJS would be needed here for calling JS from worklet
      // but since withTiming callback runs on JS thread in this pattern, it's fine
    });
    // Delay the hide call to match animation
    setTimeout(() => {
      onHide(toast.id);
    }, 200);
  };

  return (
    <Animated.View
      className="mb-2 bg-bg-elevated rounded-xl border border-border"
      style={[shadows.lg, animatedStyle]}
    >
      <TouchableOpacity
        className="flex-row items-center p-4"
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        <View className="mr-3">{getIcon(toast.type)}</View>
        <View className="flex-1">
          <Text className="text-title-sm font-inter-medium text-txt-primary">
            {toast.title}
          </Text>
          {toast.message && (
            <Text className="text-body-sm font-inter text-txt-secondary mt-0.5">
              {toast.message}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((state) => state.toasts);
  const hideToast = useUIStore((state) => state.hideToast);

  if (toasts.length === 0) return null;

  return (
    <View className="absolute top-[60px] left-4 right-4 z-[9999]" pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={hideToast} />
      ))}
    </View>
  );
};
