import React from 'react';
import { View, Text, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../theme';
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

const sizeConfig: Record<AvatarSize, { wh: number; fontSize: string; badge: ViewStyle }> = {
  small: { wh: 32, fontSize: 'text-body-sm', badge: { width: 8, height: 8, right: 0, bottom: 0 } },
  medium: { wh: 44, fontSize: 'text-title-md', badge: { width: 12, height: 12, right: 0, bottom: 0 } },
  large: { wh: 64, fontSize: 'text-headline-md', badge: { width: 14, height: 14, right: 2, bottom: 2 } },
  xlarge: { wh: 96, fontSize: 'text-display-sm', badge: { width: 18, height: 18, right: 4, bottom: 4 } },
};

const getColorFromName = (name: string): string => {
  const avatarColors = [
    colors.primary[600], colors.success.dark, colors.warning.dark,
    colors.info.dark, colors.primary[700], colors.info.main,
    colors.error.dark, colors.success.main,
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name = '',
  size = 'medium',
  style,
  showBadge = false,
  badgeColor = colors.success.main,
}) => {
  const config = sizeConfig[size];
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);
  const dim = { width: config.wh, height: config.wh };

  return (
    <View className="relative" style={style}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[dim, { borderRadius: 9999 }] as ImageStyle[]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          className="rounded-full items-center justify-center border border-white/20"
          style={[dim, { backgroundColor }]}
        >
          <Text
            className={`${config.fontSize} font-inter-semibold text-white`}
          >
            {initials}
          </Text>
        </View>
      )}

      {showBadge && (
        <View
          className="absolute rounded-full border-2 border-bg-primary"
          style={[config.badge, { backgroundColor: badgeColor }]}
        />
      )}
    </View>
  );
};
