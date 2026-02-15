import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Badge } from '../../../src/components/ui';
import { useUIStore, useAuthStore } from '../../../src/stores';
import { formatCurrency } from '../../../src/utils/formatters';
import { lightHaptic } from '../../../src/utils/haptics';

const limits = {
  tier: 'Standard',
  daily: {
    transfer: 500000,
    withdrawal: 200000,
    deposit: 1000000,
  },
  monthly: {
    transfer: 5000000,
    withdrawal: 2000000,
    deposit: 10000000,
  },
  single: {
    transfer: 100000,
    withdrawal: 50000,
  },
};

const tierBenefits = {
  Standard: ['Basic transaction limits', 'Bank transfers', 'Bill payments'],
  Premium: ['Higher limits', 'Priority support', 'Lower fees'],
  Business: ['Unlimited transfers', 'API access', 'Dedicated manager'],
};

export default function LimitsScreen() {
  const showToast = useUIStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);

  const handleUpgrade = () => {
    lightHaptic();
    showToast({
      type: 'info',
      title: 'Upgrade Available',
      message: 'Contact support to upgrade your account tier',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Transaction Limits" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <View>
              <Text style={styles.tierLabel}>Current Tier</Text>
              <Text style={styles.tierValue}>{limits.tier}</Text>
            </View>
            <Badge
              label={user?.isVerified ? 'Verified' : 'Unverified'}
              variant={user?.isVerified ? 'success' : 'warning'}
              size="small"
            />
          </View>

          <View style={styles.benefits}>
            {tierBenefits[limits.tier as keyof typeof tierBenefits].map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M20 6L9 17L4 12"
                    stroke={colors.success.main}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeText}>Upgrade Tier</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitle}>Daily Limits</Text>
        <Card>
          <LimitRow label="Transfer" amount={limits.daily.transfer} />
          <LimitRow label="Withdrawal" amount={limits.daily.withdrawal} />
          <LimitRow label="Deposit" amount={limits.daily.deposit} isLast />
        </Card>

        <Text style={styles.sectionTitle}>Monthly Limits</Text>
        <Card>
          <LimitRow label="Transfer" amount={limits.monthly.transfer} />
          <LimitRow label="Withdrawal" amount={limits.monthly.withdrawal} />
          <LimitRow label="Deposit" amount={limits.monthly.deposit} isLast />
        </Card>

        <Text style={styles.sectionTitle}>Per Transaction</Text>
        <Card>
          <LimitRow label="Max Transfer" amount={limits.single.transfer} />
          <LimitRow label="Max Withdrawal" amount={limits.single.withdrawal} isLast />
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface LimitRowProps {
  label: string;
  amount: number;
  isLast?: boolean;
}

const LimitRow: React.FC<LimitRowProps> = ({ label, amount, isLast }) => (
  <View style={[styles.limitRow, !isLast && styles.limitRowBorder]}>
    <Text style={styles.limitLabel}>{label}</Text>
    <Text style={styles.limitAmount}>{formatCurrency(amount)}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  tierCard: {
    marginBottom: spacing[6],
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  tierLabel: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  tierValue: {
    ...typography.headlineSmall,
    color: colors.text.primary,
  },
  benefits: {
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  benefitText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  upgradeButton: {
    backgroundColor: colors.primary[500] + '15',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  upgradeText: {
    ...typography.labelLarge,
    color: colors.primary[500],
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  limitRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  limitLabel: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  limitAmount: {
    ...typography.titleSmall,
    color: colors.text.primary,
  },
  bottomPadding: {
    height: spacing[8],
  },
});
