import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Chip, Avatar, EmptyState } from '../../../src/components/ui';
import { useTransactions, Transaction } from '../../../src/hooks/useTransactions';
import { formatCurrency, formatTransactionDate, formatDateGroup } from '../../../src/utils/formatters';
import { lightHaptic } from '../../../src/utils/haptics';

type TransactionType = 'send' | 'receive' | 'deposit' | 'airtime';

const filters: { label: string; value: TransactionType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Sent', value: 'send' },
  { label: 'Received', value: 'receive' },
  { label: 'Deposits', value: 'deposit' },
  { label: 'Bills', value: 'airtime' },
];

export default function TransactionsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<TransactionType | 'all'>('all');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactions({
    type: activeFilter !== 'all' ? activeFilter : undefined,
  });

  const allTransactions = useMemo(
    () => data?.pages?.flatMap((p) => p.transactions) ?? [],
    [data]
  );

  const groupedTransactions = useMemo(() => {
    return allTransactions.reduce((groups, transaction) => {
      const date = formatDateGroup(transaction.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }, [allTransactions]);

  const sections = Object.entries(groupedTransactions).map(([title, items]) => ({
    title,
    data: items,
  }));

  const handleTransactionPress = (transaction: Transaction) => {
    lightHaptic();
    router.push(`/(main)/(wallet)/transaction-detail?id=${transaction.id}`);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isPositive = item.type === 'receive' || item.type === 'deposit';
    const name = item.recipient?.name || item.sender?.name || item.description;

    return (
      <TouchableOpacity
        className="flex-row items-center py-3 border-b border-border"
        onPress={() => handleTransactionPress(item)}
        activeOpacity={0.7}
      >
        <Avatar name={name} size="medium" />
        <View className="flex-1 ml-3">
          <Text className="text-body-lg font-inter text-txt-primary" numberOfLines={1}>{name}</Text>
          <Text className="text-body-sm font-inter text-txt-tertiary mt-0.5">{formatTransactionDate(item.created_at)}</Text>
        </View>
        <Text className={`text-title-md font-inter-medium font-semibold ${
          isPositive ? 'text-success-main' : 'text-txt-primary'
        }`}>
          {isPositive ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color={colors.primary[500]} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Transactions" />

      <View className="border-b border-border">
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) => (
            <Chip
              label={item.label}
              selected={activeFilter === item.value}
              onPress={() => setActiveFilter(item.value)}
              style={{ marginRight: 8 }}
            />
          )}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-5 py-3 gap-2"
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : allTransactions.length === 0 ? (
        <EmptyState
          type="transactions"
          title="No transactions"
          description="You haven't made any transactions yet"
        />
      ) : (
        <FlatList
          data={allTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 pt-4"
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
}
