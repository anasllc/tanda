import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Avatar } from '../ui';
import { formatCurrency, formatTransactionDate } from '../../utils/formatters';
import { Transaction, getRecentTransactions } from '../../mock/transactions';
import { lightHaptic } from '../../utils/haptics';

const getTransactionIcon = (type: Transaction['type']) => {
  switch (type) {
    case 'send':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M7 17L17 7M17 7H7M17 7V17"
            stroke={colors.error.main}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'receive':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M17 7L7 17M7 17H17M7 17V7"
            stroke={colors.success.main}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'deposit':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 5V19M5 12L12 19L19 12"
            stroke={colors.success.main}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'withdraw':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 19V5M5 12L12 5L19 12"
            stroke={colors.error.main}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={8} stroke={colors.text.tertiary} strokeWidth={2} />
        </Svg>
      );
  }
};

const getTransactionColor = (transaction: Transaction) => {
  if (transaction.status === 'failed') return colors.error.main;
  if (transaction.status === 'pending') return colors.warning.main;

  switch (transaction.type) {
    case 'receive':
    case 'deposit':
      return colors.success.main;
    case 'send':
    case 'withdraw':
      return colors.text.primary;
    default:
      return colors.text.primary;
  }
};

const getAmountPrefix = (transaction: Transaction) => {
  switch (transaction.type) {
    case 'receive':
    case 'deposit':
      return '+';
    case 'send':
    case 'withdraw':
      return '-';
    default:
      return '';
  }
};

const getTransactionName = (transaction: Transaction) => {
  if (transaction.recipient) return transaction.recipient.name;
  if (transaction.sender) return transaction.sender.name;
  return transaction.description;
};

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const name = getTransactionName(transaction);
  const amountColor = getTransactionColor(transaction);
  const prefix = getAmountPrefix(transaction);

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        {transaction.recipient || transaction.sender ? (
          <Avatar name={name} size="medium" />
        ) : (
          <View style={styles.iconCircle}>{getTransactionIcon(transaction.type)}</View>
        )}
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.itemName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.itemDate}>
          {formatTransactionDate(transaction.createdAt)}
        </Text>
      </View>

      <View style={styles.itemAmount}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {prefix}{formatCurrency(transaction.amount)}
        </Text>
        {transaction.status === 'pending' && (
          <Text style={styles.pendingLabel}>Pending</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const RecentActivity: React.FC = () => {
  const router = useRouter();
  const recentTransactions = getRecentTransactions(5);

  const handleViewAll = () => {
    lightHaptic();
    router.push('/(main)/(wallet)/transactions');
  };

  const handleTransactionPress = (transactionId: string) => {
    lightHaptic();
    router.push(`/(main)/(wallet)/transaction-detail?id=${transactionId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Activity</Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {recentTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onPress={() => handleTransactionPress(transaction.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing[8],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing[3],
  },
  title: {
    ...typography.titleMedium,
    color: colors.text.primary,
  },
  viewAll: {
    ...typography.labelLarge,
    color: colors.primary[500],
  },
  list: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  iconContainer: {
    marginRight: spacing[3],
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    marginRight: spacing[3],
  },
  itemName: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    marginBottom: 2,
  },
  itemDate: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  itemAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.titleMedium,
    fontWeight: '600',
  },
  pendingLabel: {
    ...typography.labelSmall,
    color: colors.warning.main,
    marginTop: 2,
  },
});
