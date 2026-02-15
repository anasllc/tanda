import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
export type BadgeSize = 'small' | 'medium';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  style,
  icon,
}) => {
  const variantStyle = getVariantStyle(variant);
  const sizeStyle = getSizeStyle(size);

  return (
    <View style={[styles.base, variantStyle.container, sizeStyle.container, style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, sizeStyle.text, { color: variantStyle.textColor }]}>
        {label}
      </Text>
    </View>
  );
};

const getVariantStyle = (variant: BadgeVariant) => {
  const styles: Record<BadgeVariant, { container: ViewStyle; textColor: string }> = {
    success: {
      container: { backgroundColor: colors.success.background },
      textColor: colors.success.main,
    },
    warning: {
      container: { backgroundColor: colors.warning.background },
      textColor: colors.warning.main,
    },
    error: {
      container: { backgroundColor: colors.error.background },
      textColor: colors.error.main,
    },
    info: {
      container: { backgroundColor: colors.info.background },
      textColor: colors.info.main,
    },
    default: {
      container: { backgroundColor: colors.background.tertiary },
      textColor: colors.text.secondary,
    },
  };

  return styles[variant];
};

const getSizeStyle = (size: BadgeSize) => {
  const styles: Record<BadgeSize, { container: ViewStyle; text: { fontSize: number } }> = {
    small: {
      container: {
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[0.5],
      },
      text: { fontSize: 10 },
    },
    medium: {
      container: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
      },
      text: { fontSize: 12 },
    },
  };

  return styles[size];
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: spacing[1],
  },
  text: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
});
