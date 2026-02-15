import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme';
import { Avatar, Skeleton } from '../ui';
import { formatCurrency, formatTransactionDate } from '../../utils/formatters';
import { useRecentTransactions, type Transaction } from '../../hooks/useTransactions';
import { lightHaptic } from '../../utils/haptics';

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'send':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M7 17L17 7M17 7H7M17 7V17" stroke={colors.error.main} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'receive':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M17 7L7 17M7 17H17M7 17V7" stroke={colors.success.main} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'deposit':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M12 5V19M5 12L12 19L19 12" stroke={colors.success.main} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'withdraw':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M12 19V5M5 12L12 5L19 12" stroke={colors.error.main} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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

const getIndicatorColor = (type: string) => {
  switch (type) {
    case 'receive':
    case 'deposit':
      return 'bg-success-main';
    case 'send':
    case 'withdraw':
      return 'bg-error-main';
    default:
      return 'bg-txt-tertiary';
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

const getAmountPrefix = (type: string) => {
  switch (type) {
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
  isLast: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress, isLast }) => {
  const name = getTransactionName(transaction);
  const amountColor = getTransactionColor(transaction);
  const prefix = getAmountPrefix(transaction.type);
  const indicatorClass = getIndicatorColor(transaction.type);

  return (
    <TouchableOpacity
      className={`flex-row items-center px-4 py-3 ${!isLast ? 'mb-1' : ''}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Color indicator bar */}
      <View className={`w-1 h-10 rounded-full ${indicatorClass} mr-3`} />

      <View className="mr-3">
        {transaction.recipient || transaction.sender ? (
          <Avatar name={name} size="medium" />
        ) : (
          <View className="w-11 h-11 rounded-full bg-bg-tertiary items-center justify-center">
            {getTransactionIcon(transaction.type)}
          </View>
        )}
      </View>

      <View className="flex-1 mr-3">
        <Text className="text-body-lg font-inter text-txt-primary mb-0.5" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-body-sm font-inter text-txt-tertiary">
          {formatTransactionDate(transaction.created_at)}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-title-md font-inter-semibold" style={{ color: amountColor }}>
          {prefix}{formatCurrency(transaction.amount)}
        </Text>
        {transaction.status === 'pending' && (
          <Text className="text-label-sm font-inter-medium text-warning-main mt-0.5">
            Pending
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const TransactionSkeleton = () => (
  <View className="px-4 py-3">
    <View className="flex-row items-center">
      <Skeleton width={4} height={40} borderRadius={2} />
      <View className="ml-3 mr-3">
        <Skeleton width={44} height={44} borderRadius={22} />
      </View>
      <View className="flex-1">
        <Skeleton width={120} height={16} borderRadius={4} />
        <Skeleton width={80} height={12} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
      <Skeleton width={60} height={16} borderRadius={4} />
    </View>
  </View>
);

export const RecentActivity: React.FC = () => {
  const router = useRouter();
  const { data: recentTransactions, isLoading } = useRecentTransactions(5);

  const handleViewAll = () => {
    lightHaptic();
    router.push('/(main)/(wallet)/transactions');
  };

  const handleTransactionPress = (transactionId: string) => {
    lightHaptic();
    router.push(`/(main)/(wallet)/transaction-detail?id=${transactionId}`);
  };

  return (
    <View className="mt-8">
      <View className="flex-row justify-between items-baseline mb-3">
        <Text className="text-title-md font-inter-medium text-txt-primary">
          Recent Activity
        </Text>
        <TouchableOpacity
          onPress={handleViewAll}
          className="px-3 py-1 rounded-full border border-accent-500"
        >
          <Text className="text-label-lg font-inter-medium text-accent-500">
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-bg-card rounded-2xl py-2">
        {isLoading ? (
          <>
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </>
        ) : recentTransactions && recentTransactions.length > 0 ? (
          recentTransactions.map((transaction, index) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              isLast={index === recentTransactions.length - 1}
              onPress={() => handleTransactionPress(transaction.id)}
            />
          ))
        ) : (
          <View className="py-8 items-center">
            <Text className="text-body-md font-inter text-txt-tertiary">
              No recent transactions
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
