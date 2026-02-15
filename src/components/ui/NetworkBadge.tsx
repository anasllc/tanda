import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
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

export const NetworkBadge: React.FC<NetworkBadgeProps> = ({
  network,
  size = 'medium',
  showLabel = true,
  style,
}) => {
  const color = networkColors[network];
  const name = networkNames[network];
  const sizeStyle = getSizeStyle(size);

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.badge,
          sizeStyle.badge,
          { backgroundColor: withOpacity(color, 0.12), borderColor: color },
        ]}
      >
        <Text style={[styles.badgeText, sizeStyle.text, { color }]}>
          {name.charAt(0)}
        </Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, sizeStyle.label]}>{name}</Text>
      )}
    </View>
  );
};

const getSizeStyle = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: {
      badge: { width: 24, height: 24 },
      text: { fontSize: 10 },
      label: { fontSize: 12 },
    },
    medium: {
      badge: { width: 32, height: 32 },
      text: { fontSize: 12 },
      label: { fontSize: 14 },
    },
    large: {
      badge: { width: 44, height: 44 },
      text: { fontSize: 16 },
      label: { fontSize: 16 },
    },
  };

  return sizes[size];
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    borderRadius: borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '700',
  },
  label: {
    ...typography.labelLarge,
    color: colors.text.primary,
    marginLeft: spacing[2],
  },
});
