import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { colors } from '../../theme';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
export type BadgeSize = 'small' | 'medium';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-main/10',
  warning: 'bg-warning-main/10',
  error: 'bg-error-main/10',
  info: 'bg-info-main/10',
  default: 'bg-bg-tertiary',
};

const variantTextColors: Record<BadgeVariant, string> = {
  success: colors.success.main,
  warning: colors.warning.main,
  error: colors.error.main,
  info: colors.info.main,
  default: colors.text.secondary,
};

const sizeClasses: Record<BadgeSize, string> = {
  small: 'px-2 py-0.5',
  medium: 'px-3 py-1',
};

const textSizeClasses: Record<BadgeSize, string> = {
  small: 'text-label-sm',
  medium: 'text-label-md',
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  style,
  icon,
}) => {
  return (
    <View
      className={`flex-row items-center rounded-full self-start ${variantClasses[variant]} ${sizeClasses[size]}`}
      style={style}
    >
      {icon && <View className="mr-1">{icon}</View>}
      <Text
        className={`${textSizeClasses[size]} font-inter-semibold`}
        style={{ color: variantTextColors[variant] }}
      >
        {label}
      </Text>
    </View>
  );
};
