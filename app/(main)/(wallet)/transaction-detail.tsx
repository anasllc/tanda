import React from 'react';
import { View, Text, ScrollView, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Avatar, Badge, Button, Card } from '../../../src/components/ui';
import { useTransactionDetail } from '../../../src/hooks/useTransactions';
import { formatCurrency, formatFullDate, formatTime } from '../../../src/utils/formatters';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: transaction, isLoading } = useTransactionDetail(id);
  const showToast = useUIStore((state) => state.showToast);

  const handleShareReceipt = async () => {
    if (!transaction) return;
    lightHaptic();

    const receiptText = `
Tanda Transaction Receipt

Amount: ${transaction.type === 'receive' || transaction.type === 'deposit' ? '+' : '-'}${formatCurrency(transaction.amount)}
Status: ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
Date: ${formatFullDate(transaction.created_at)}
Time: ${formatTime(transaction.created_at)}
Reference: ${transaction.reference}
${transaction.description ? `Description: ${transaction.description}` : ''}

Sent via Tanda
    `.trim();

    try {
      await Share.share({
        message: receiptText,
        title: 'Transaction Receipt',
      });
    } catch (error) {
      await Clipboard.setStringAsync(receiptText);
      showToast({ type: 'success', title: 'Receipt copied to clipboard' });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Transaction" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Transaction" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-body-lg font-inter text-txt-tertiary">Transaction not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPositive = transaction.type === 'receive' || transaction.type === 'deposit';
  const name = transaction.recipient?.name || transaction.sender?.name || 'Transaction';

  const getStatusVariant = () => {
    switch (transaction.status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Transaction Details" />

      <ScrollView contentContainerClassName="px-5 pt-4 pb-8">
        <View className="items-center mb-8">
          <Avatar name={name} size="xlarge" />
          <Text className={`text-display-md font-inter-bold mt-4 mb-3 ${
            isPositive ? 'text-success-main' : 'text-txt-primary'
          }`}>
            {isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
          <Badge
            label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            variant={getStatusVariant()}
          />
        </View>

        <Card className="mb-6">
          <View className="flex-row justify-between py-3 border-b border-border">
            <Text className="text-body-md font-inter text-txt-secondary">{transaction.sender ? 'From' : 'To'}</Text>
            <Text className="text-body-md font-inter text-txt-primary font-medium text-right flex-1 ml-4">{name}</Text>
          </View>

          <View className="flex-row justify-between py-3 border-b border-border">
            <Text className="text-body-md font-inter text-txt-secondary">Type</Text>
            <Text className="text-body-md font-inter text-txt-primary font-medium text-right flex-1 ml-4">{transaction.type.replace('_', ' ').toUpperCase()}</Text>
          </View>

          <View className="flex-row justify-between py-3 border-b border-border">
            <Text className="text-body-md font-inter text-txt-secondary">Date</Text>
            <Text className="text-body-md font-inter text-txt-primary font-medium text-right flex-1 ml-4">{formatFullDate(transaction.created_at)}</Text>
          </View>

          <View className="flex-row justify-between py-3 border-b border-border">
            <Text className="text-body-md font-inter text-txt-secondary">Time</Text>
            <Text className="text-body-md font-inter text-txt-primary font-medium text-right flex-1 ml-4">{formatTime(transaction.created_at)}</Text>
          </View>

          <View className="flex-row justify-between py-3 border-b border-border">
            <Text className="text-body-md font-inter text-txt-secondary">Reference</Text>
            <Text className="text-body-md font-inter text-txt-primary font-medium text-right flex-1 ml-4">{transaction.reference}</Text>
          </View>

          {transaction.description && (
            <View className="flex-row justify-between py-3">
              <Text className="text-body-md font-inter text-txt-secondary">Description</Text>
              <Text className="text-body-md font-inter text-txt-primary font-medium text-right flex-1 ml-4">{transaction.description}</Text>
            </View>
          )}
        </Card>

        <Button
          title="Share Receipt"
          variant="secondary"
          fullWidth
          onPress={handleShareReceipt}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
