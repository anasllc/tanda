import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, borderRadius, layout } from '../../../src/theme';
import { Card, Avatar, Badge } from '../../../src/components/ui';
import { BalanceCard } from '../../../src/components/home';
import { formatCurrency, formatTransactionDate } from '../../../src/utils/formatters';
import { getRecentTransactions, Transaction } from '../../../src/mock/transactions';
import { savedBankAccounts, virtualAccount } from '../../../src/mock/bankAccounts';
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
  const recentTransactions = getRecentTransactions(3);

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
    await Clipboard.setStringAsync(virtualAccount.accountNumber);
    showToast({ type: 'success', title: 'Account number copied!' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BalanceCard />

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDeposit}>
            <View style={[styles.actionIcon, { backgroundColor: colors.success.background }]}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 5V19M5 12H19"
                  stroke={colors.success.main}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <Text style={styles.actionLabel}>Add Money</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleWithdraw}>
            <View style={[styles.actionIcon, { backgroundColor: colors.error.background }]}>
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
            <Text style={styles.actionLabel}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.accountCard}>
          <Text style={styles.cardTitle}>Virtual Account</Text>
          <Text style={styles.cardSubtitle}>Deposit via bank transfer</Text>

          <View style={styles.accountDetails}>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Bank</Text>
              <Text style={styles.accountValue}>{virtualAccount.bankName}</Text>
            </View>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Account Number</Text>
              <View style={styles.accountValueRow}>
                <Text style={styles.accountValue}>{virtualAccount.accountNumber}</Text>
                <TouchableOpacity onPress={handleCopyAccount} style={styles.copyButton}>
                  <CopyIcon />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Account Name</Text>
              <Text style={styles.accountValue}>{virtualAccount.accountName}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewTransactions}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <Card>
            {recentTransactions.map((transaction, index) => (
              <View
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  index < recentTransactions.length - 1 && styles.transactionItemBorder,
                ]}
              >
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDesc}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>
                    {formatTransactionDate(transaction.createdAt)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.type === 'receive' || transaction.type === 'deposit'
                      ? styles.amountPositive
                      : styles.amountNegative,
                  ]}
                >
                  {transaction.type === 'receive' || transaction.type === 'deposit' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[6],
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[4],
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  actionLabel: {
    ...typography.labelLarge,
    color: colors.text.primary,
  },
  accountCard: {
    marginTop: spacing[6],
  },
  cardTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing[4],
  },
  accountDetails: {
    gap: spacing[3],
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountLabel: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  accountValue: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  accountValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  copyButton: {
    padding: spacing[1],
  },
  section: {
    marginTop: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
  },
  viewAll: {
    ...typography.labelLarge,
    color: colors.primary[500],
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  transactionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  transactionDate: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  transactionAmount: {
    ...typography.titleSmall,
    fontWeight: '600',
  },
  amountPositive: {
    color: colors.success.main,
  },
  amountNegative: {
    color: colors.text.primary,
  },
  bottomPadding: {
    height: layout.tabBarHeight + spacing[4],
  },
});
