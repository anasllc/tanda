import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../src/theme';
import { IconButton, Button, Avatar, Divider } from '../../src/components/ui';
import { useTransactionDetail } from '../../src/hooks/useTransactions';
import Svg, { Path } from 'react-native-svg';

export default function ReceiptModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: transaction, isLoading } = useTransactionDetail(id);

  const handleClose = () => {
    router.back();
  };

  const handleShare = () => {};

  if (isLoading || !transaction) {
    return (
      <SafeAreaView className="flex-1 bg-bg-elevated">
        <View className="flex-row justify-between items-center px-4 py-2">
          <View className="w-10" />
          <Text className="text-title-md font-inter-medium text-txt-primary">Receipt</Text>
          <IconButton
            icon={<Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M18 6L6 18M6 6L18 18" stroke={colors.text.primary} strokeWidth={2} strokeLinecap="round" /></Svg>}
            onPress={handleClose}
            variant="ghost"
          />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const isCredit = transaction.amount > 0;

  return (
    <SafeAreaView className="flex-1 bg-bg-elevated">
      <View className="flex-row justify-between items-center px-4 py-2">
        <View className="w-10" />
        <Text className="text-title-md font-inter-medium text-txt-primary">Receipt</Text>
        <IconButton
          icon={<Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M18 6L6 18M6 6L18 18" stroke={colors.text.primary} strokeWidth={2} strokeLinecap="round" /></Svg>}
          onPress={handleClose}
          variant="ghost"
        />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
        <View className="bg-bg-primary rounded-xl p-6">
          <View className="items-center mb-6">
            <View className="w-12 h-12 rounded-full bg-accent-500 items-center justify-center mb-2">
              <Text className="text-headline-md font-inter-semibold text-txt-inverse">T</Text>
            </View>
            <Text className="text-title-md font-inter-medium text-txt-primary">Tanda</Text>
          </View>

          <View className="items-center mb-4">
            <View className="w-14 h-14 rounded-full items-center justify-center mb-2" style={{ backgroundColor: colors.success.main + '20' }}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path d="M20 6L9 17l-5-5" stroke={colors.success.main} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text className="text-title-sm font-inter-medium text-success-main">Successful</Text>
          </View>

          <Text className="text-display-lg font-inter-bold text-txt-primary text-center">
            {isCredit ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
          </Text>

          <Divider spacing={16} />

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-body-md font-inter text-txt-tertiary">Type</Text>
            <Text className="text-body-md font-inter text-txt-primary">{transaction.type}</Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-body-md font-inter text-txt-tertiary">{isCredit ? 'From' : 'To'}</Text>
            <View className="flex-row items-center gap-2">
              <Avatar name={transaction.recipient?.name || transaction.sender?.name || transaction.description} size="small" />
              <Text className="text-body-md font-inter text-txt-primary">{transaction.recipient?.name || transaction.sender?.name || transaction.description}</Text>
            </View>
          </View>

          {transaction.description && (
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-body-md font-inter text-txt-tertiary">Note</Text>
              <Text className="text-body-md font-inter text-txt-primary">{transaction.description}</Text>
            </View>
          )}

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-body-md font-inter text-txt-tertiary">Date</Text>
            <Text className="text-body-md font-inter text-txt-primary">{new Date(transaction.created_at).toLocaleDateString()}</Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-body-md font-inter text-txt-tertiary">Reference</Text>
            <Text className="text-body-md font-inter text-txt-primary">{transaction.id}</Text>
          </View>

          <Divider spacing={16} />

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-body-md font-inter text-txt-tertiary">Amount</Text>
            <Text className="text-body-md font-inter text-txt-primary">${Math.abs(transaction.amount).toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-body-md font-inter text-txt-tertiary">Fee</Text>
            <Text className="text-body-md font-inter text-txt-primary">$0.00</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-title-sm font-inter-medium text-txt-primary">Total</Text>
            <Text className="text-title-sm font-inter-medium text-txt-primary">${Math.abs(transaction.amount).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-6 gap-3">
        <Button
          title="Share Receipt"
          variant="secondary"
          fullWidth
          onPress={handleShare}
        />
        <Button
          title="Download PDF"
          variant="ghost"
          fullWidth
          onPress={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}
