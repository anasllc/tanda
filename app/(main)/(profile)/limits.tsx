import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../../src/theme';
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
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Transaction Limits" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Card className="mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-body-sm font-inter text-txt-tertiary mb-0.5">Current Tier</Text>
              <Text className="text-headline-sm font-inter-semibold text-txt-primary">{limits.tier}</Text>
            </View>
            <Badge
              label={user?.isVerified ? 'Verified' : 'Unverified'}
              variant={user?.isVerified ? 'success' : 'warning'}
              size="small"
            />
          </View>

          <View className="gap-2 mb-4">
            {tierBenefits[limits.tier as keyof typeof tierBenefits].map((benefit, index) => (
              <View key={index} className="flex-row items-center gap-2">
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M20 6L9 17L4 12"
                    stroke={colors.success.main}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text className="text-body-md font-inter text-txt-secondary">{benefit}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="items-center py-3 rounded-xl"
            style={{ backgroundColor: colors.primary[500] + '15' }}
            onPress={handleUpgrade}
          >
            <Text className="text-label-lg font-inter-medium text-accent-500">Upgrade Tier</Text>
          </TouchableOpacity>
        </Card>

        <Text className="text-title-md font-inter-medium text-txt-primary mb-3">Daily Limits</Text>
        <Card>
          <LimitRow label="Transfer" amount={limits.daily.transfer} />
          <LimitRow label="Withdrawal" amount={limits.daily.withdrawal} />
          <LimitRow label="Deposit" amount={limits.daily.deposit} isLast />
        </Card>

        <Text className="text-title-md font-inter-medium text-txt-primary mb-3">Monthly Limits</Text>
        <Card>
          <LimitRow label="Transfer" amount={limits.monthly.transfer} />
          <LimitRow label="Withdrawal" amount={limits.monthly.withdrawal} />
          <LimitRow label="Deposit" amount={limits.monthly.deposit} isLast />
        </Card>

        <Text className="text-title-md font-inter-medium text-txt-primary mb-3">Per Transaction</Text>
        <Card>
          <LimitRow label="Max Transfer" amount={limits.single.transfer} />
          <LimitRow label="Max Withdrawal" amount={limits.single.withdrawal} isLast />
        </Card>

        <View className="h-8" />
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
  <View className={`flex-row justify-between items-center py-3 ${!isLast ? 'border-b border-border' : ''}`}>
    <Text className="text-body-md font-inter text-txt-secondary">{label}</Text>
    <Text className="text-title-sm font-inter-medium text-txt-primary">{formatCurrency(amount)}</Text>
  </View>
);
