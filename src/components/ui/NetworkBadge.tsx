import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { colors } from '../../theme';
import { NetworkProvider } from '../../mock/services';
import { withOpacity } from '../../utils';

interface NetworkBadgeProps {
  network: NetworkProvider;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: ViewStyle;
}

const networkColors: Record<NetworkProvider, string> = {
  mtn: colors.networks.mtn,
  airtel: colors.networks.airtel,
  glo: colors.networks.glo,
  '9mobile': colors.networks['9mobile'],
};

const networkNames: Record<NetworkProvider, string> = {
  mtn: 'MTN',
  airtel: 'Airtel',
  glo: 'Glo',
  '9mobile': '9mobile',
};

const badgeSizeClasses: Record<string, string> = {
  small: 'w-6 h-6',
  medium: 'w-8 h-8',
  large: 'w-11 h-11',
};

const textSizeStyles: Record<string, { fontSize: number }> = {
  small: { fontSize: 10 },
  medium: { fontSize: 12 },
  large: { fontSize: 16 },
};

const labelSizeStyles: Record<string, { fontSize: number }> = {
  small: { fontSize: 12 },
  medium: { fontSize: 14 },
  large: { fontSize: 16 },
};

export const NetworkBadge: React.FC<NetworkBadgeProps> = ({
  network,
  size = 'medium',
  showLabel = true,
  style,
}) => {
  const color = networkColors[network];
  const name = networkNames[network];

  return (
    <View className="flex-row items-center" style={style}>
      <View
        className={`rounded-full border-2 items-center justify-center ${badgeSizeClasses[size]}`}
        style={{ backgroundColor: withOpacity(color, 0.12), borderColor: color }}
      >
        <Text
          className="font-inter-bold"
          style={[textSizeStyles[size], { color }]}
        >
          {name.charAt(0)}
        </Text>
      </View>
      {showLabel && (
        <Text
          className="text-label-lg font-inter-medium text-txt-primary ml-2"
          style={labelSizeStyles[size]}
        >
          {name}
        </Text>
      )}
    </View>
  );
};
