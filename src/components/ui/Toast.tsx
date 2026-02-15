import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
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
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(toast.id);
    });
  };

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY }], opacity }]}>
      <TouchableOpacity
        style={styles.toastContent}
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>{getIcon(toast.type)}</View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{toast.title}</Text>
          {toast.message && (
            <Text style={styles.message}>{toast.message}</Text>
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
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={hideToast} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing[4],
    right: spacing[4],
    zIndex: 9999,
  },
  toast: {
    marginBottom: spacing[2],
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.lg,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  iconContainer: {
    marginRight: spacing[3],
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.titleSmall,
    color: colors.text.primary,
  },
  message: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing[0.5],
  },
});
