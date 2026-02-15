import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Chip, Avatar, EmptyState } from '../../../src/components/ui';
import { transactions, Transaction, TransactionType } from '../../../src/mock/transactions';
import { formatCurrency, formatTransactionDate, formatDateGroup } from '../../../src/utils/formatters';
import { lightHaptic } from '../../../src/utils/haptics';

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

  const filteredTransactions = activeFilter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === activeFilter);

  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = formatDateGroup(transaction.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const sections = Object.entries(groupedTransactions).map(([title, data]) => ({
    title,
    data,
  }));

  const handleTransactionPress = (transaction: Transaction) => {
    lightHaptic();
    router.push(`/(main)/(wallet)/transaction-detail?id=${transaction.id}`);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isPositive = item.type === 'receive' || item.type === 'deposit';
    const name = item.recipient?.name || item.sender?.name || item.description;

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}
        activeOpacity={0.7}
      >
        <Avatar name={name} size="medium" />
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionName} numberOfLines={1}>{name}</Text>
          <Text style={styles.transactionDate}>{formatTransactionDate(item.createdAt)}</Text>
        </View>
        <Text style={[styles.transactionAmount, isPositive ? styles.positive : styles.negative]}>
          {isPositive ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Transactions" />

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) => (
            <Chip
              label={item.label}
              selected={activeFilter === item.value}
              onPress={() => setActiveFilter(item.value)}
              style={styles.chip}
            />
          )}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          type="transactions"
          title="No transactions"
          description="You haven't made any transactions yet"
        />
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  filterContainer: { borderBottomWidth: 1, borderBottomColor: colors.border.default },
  filterList: { paddingHorizontal: spacing[5], paddingVertical: spacing[3], gap: spacing[2] },
  chip: { marginRight: spacing[2] },
  list: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border.default },
  transactionInfo: { flex: 1, marginLeft: spacing[3] },
  transactionName: { ...typography.bodyLarge, color: colors.text.primary },
  transactionDate: { ...typography.bodySmall, color: colors.text.tertiary, marginTop: 2 },
  transactionAmount: { ...typography.titleMedium, fontWeight: '600' },
  positive: { color: colors.success.main },
  negative: { color: colors.text.primary },
});
