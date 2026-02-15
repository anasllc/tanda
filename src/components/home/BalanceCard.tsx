import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore, useUIStore } from '../../stores';
import { lightHaptic } from '../../utils/haptics';

const EyeIcon = ({ visible }: { visible: boolean }) => {
  const iconColor = 'rgba(255, 255, 255, 0.7)';
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {visible ? (
        <>
          <Path
            d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
            stroke={iconColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
            stroke={iconColor}
            strokeWidth={2}
          />
        </>
      ) : (
        <>
          <Path
            d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.481 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88"
            stroke={iconColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M1 1L23 23"
            stroke={iconColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );
};

export const BalanceCard: React.FC = () => {
  const balance = useAuthStore((state) => state.balance);
  const pendingBalance = useAuthStore((state) => state.pendingBalance);
  const isBalanceVisible = useUIStore((state) => state.isBalanceVisible);
  const toggleBalanceVisibility = useUIStore((state) => state.toggleBalanceVisibility);

  const handleToggle = () => {
    lightHaptic();
    toggleBalanceVisibility();
  };

  return (
    <LinearGradient
      colors={[colors.primary[600], colors.primary[800]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.label}>Available Balance</Text>
        <TouchableOpacity onPress={handleToggle} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
          <EyeIcon visible={isBalanceVisible} />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceContainer}>
        {isBalanceVisible ? (
          <Text style={styles.balance}>{formatCurrency(balance)}</Text>
        ) : (
          <Text style={styles.balance}>********</Text>
        )}
      </View>

      {pendingBalance > 0 && (
        <View style={styles.pendingContainer}>
          <Text style={styles.pendingLabel}>Pending</Text>
          <Text style={styles.pendingAmount}>
            {isBalanceVisible ? formatCurrency(pendingBalance) : '****'}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['3xl'],
    padding: spacing[6],
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  label: {
    ...typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  balanceContainer: {
    position: 'relative',
  },
  balance: {
    ...typography.displayMedium,
    color: colors.text.primary,
    letterSpacing: -1,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  pendingLabel: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: spacing[2],
  },
  pendingAmount: {
    ...typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
