import React from 'react';
import { View, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, typography, borderRadius, layout } from '../../theme';
import { getInitials } from '../../utils/formatters';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  showBadge?: boolean;
  badgeColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name = '',
  size = 'medium',
  style,
  showBadge = false,
  badgeColor = colors.success.main,
}) => {
  const sizeStyle = getSizeStyle(size);
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);

  return (
    <View style={[styles.container, sizeStyle.container, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[styles.image, sizeStyle.container as ImageStyle]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.fallback, sizeStyle.container, { backgroundColor }]}>
          <Text style={[styles.initials, sizeStyle.text]}>{initials}</Text>
        </View>
      )}

      {showBadge && (
        <View style={[styles.badge, sizeStyle.badge, { backgroundColor: badgeColor }]} />
      )}
    </View>
  );
};

const getSizeStyle = (size: AvatarSize) => {
  const sizes: Record<AvatarSize, {
    container: ViewStyle;
    text: { fontSize: number };
    badge: ViewStyle;
  }> = {
    small: {
      container: {
        width: layout.avatarSizeSmall,
        height: layout.avatarSizeSmall,
      },
      text: { fontSize: 12 },
      badge: { width: 8, height: 8, right: 0, bottom: 0 },
    },
    medium: {
      container: {
        width: layout.avatarSizeMedium,
        height: layout.avatarSizeMedium,
      },
      text: { fontSize: 16 },
      badge: { width: 12, height: 12, right: 0, bottom: 0 },
    },
    large: {
      container: {
        width: layout.avatarSizeLarge,
        height: layout.avatarSizeLarge,
      },
      text: { fontSize: 24 },
      badge: { width: 14, height: 14, right: 2, bottom: 2 },
    },
    xlarge: {
      container: {
        width: layout.avatarSizeXLarge,
        height: layout.avatarSizeXLarge,
      },
      text: { fontSize: 36 },
      badge: { width: 18, height: 18, right: 4, bottom: 4 },
    },
  };

  return sizes[size];
};

// Generate consistent color based on name using theme colors
const getColorFromName = (name: string): string => {
  const avatarColors = [
    colors.primary[600],
    colors.success.dark,
    colors.warning.dark,
    colors.info.dark,
    colors.primary[700],
    colors.info.main,
    colors.error.dark,
    colors.success.main,
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderRadius: borderRadius.full,
  },
  fallback: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.titleMedium,
    color: colors.white,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
});
