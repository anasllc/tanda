import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../../src/theme';
import { Card, Avatar, Badge } from '../../../src/components/ui';
import { BalanceCard } from '../../../src/components/home';
import { formatCurrency, formatTransactionDate } from '../../../src/utils/formatters';
import { useRecentTransactions } from '../../../src/hooks/useTransactions';
import { useProfile } from '../../../src/hooks/useProfile';
import { lightHaptic } from '../../../src/utils/haptics';
import { useUIStore } from '../../../src/stores';

const CopyIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect x={9} y={9} width={13} height={13} rx={2} stroke={colors.text.secondary} strokeWidth={2} />
    <Path
      d="M5 15H4C2.9 15 2 14.1 2 13V4C2 2.9 2.9 2 4 2H13C14.1 2 15 2.9 15 4V5"
      stroke={colors.text.secondary}
      strokeWidth={2}
    />
  </Svg>
);

export default function WalletScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const { data: recentTransactions = [], isLoading: txLoading } = useRecentTransactions(3);
  const { data: profile } = useProfile();
  const virtualAccount = profile?.virtual_account;

  const handleDeposit = () => {
    lightHaptic();
    router.push('/(main)/(wallet)/deposit');
  };

  const handleWithdraw = () => {
    lightHaptic();
    router.push('/(main)/(wallet)/withdraw');
  };

  const handleViewTransactions = () => {
    lightHaptic();
    router.push('/(main)/(wallet)/transactions');
  };

  const handleCopyAccount = async () => {
    lightHaptic();
    if (virtualAccount?.account_number) {
      await Clipboard.setStringAsync(virtualAccount.account_number);
      showToast({ type: 'success', title: 'Account number copied!' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView
        contentContainerClassName="px-5 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <BalanceCard />

        <View className="flex-row gap-4 mt-6">
          <TouchableOpacity
            className="flex-1 bg-bg-secondary rounded-2xl border border-border p-4 items-center"
            onPress={handleDeposit}
          >
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mb-2"
              style={{ backgroundColor: colors.success.background }}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 5V19M5 12H19"
                  stroke={colors.success.main}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <Text className="text-label-lg font-inter-medium text-txt-primary">Add Money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-bg-secondary rounded-2xl border border-border p-4 items-center"
            onPress={handleWithdraw}
          >
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mb-2"
              style={{ backgroundColor: colors.error.background }}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 19V5M5 12L12 5L19 12"
                  stroke={colors.error.main}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text className="text-label-lg font-inter-medium text-txt-primary">Withdraw</Text>
          </TouchableOpacity>
        </View>

        {virtualAccount && (
          <Card className="mt-6">
            <Text className="text-title-md font-inter-medium text-txt-primary mb-1">Virtual Account</Text>
            <Text className="text-body-sm font-inter text-txt-tertiary mb-4">Deposit via bank transfer</Text>

            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-body-md font-inter text-txt-secondary">Bank</Text>
                <Text className="text-body-md font-inter text-txt-primary font-semibold">{virtualAccount.bank_name}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-body-md font-inter text-txt-secondary">Account Number</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-body-md font-inter text-txt-primary font-semibold">{virtualAccount.account_number}</Text>
                  <TouchableOpacity onPress={handleCopyAccount} className="p-1">
                    <CopyIcon />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-body-md font-inter text-txt-secondary">Account Name</Text>
                <Text className="text-body-md font-inter text-txt-primary font-semibold">{virtualAccount.account_name}</Text>
              </View>
            </View>
          </Card>
        )}

        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-title-md font-inter-medium text-txt-primary">Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewTransactions}>
              <Text className="text-label-lg font-inter-medium text-accent-500">View All</Text>
            </TouchableOpacity>
          </View>

          <Card>
            {txLoading ? (
              <View className="py-6 items-center">
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : recentTransactions.length === 0 ? (
              <View className="py-6 items-center">
                <Text className="text-body-md font-inter text-txt-tertiary">No transactions yet</Text>
              </View>
            ) : (
              recentTransactions.map((transaction, index) => (
                <View
                  key={transaction.id}
                  className={`flex-row justify-between items-center py-3 ${
                    index < recentTransactions.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-body-md font-inter text-txt-primary">{transaction.description}</Text>
                    <Text className="text-body-sm font-inter text-txt-tertiary mt-0.5">
                      {formatTransactionDate(transaction.created_at)}
                    </Text>
                  </View>
                  <Text
                    className={`text-title-sm font-inter-medium font-semibold ${
                      transaction.type === 'receive' || transaction.type === 'deposit'
                        ? 'text-success-main'
                        : 'text-txt-primary'
                    }`}
                  >
                    {transaction.type === 'receive' || transaction.type === 'deposit' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))
            )}
          </Card>
        </View>

        <View className="h-[100px]" />
      </ScrollView>
    </SafeAreaView>
  );
}
