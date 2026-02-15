import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Button, EmptyState } from '../../../src/components/ui';
import { useBankAccounts } from '../../../src/hooks/useBankAccounts';
import { useUIStore } from '../../../src/stores';
import { withOpacity, lightHaptic } from '../../../src/utils';

export default function BankAccountsScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const { data, isLoading } = useBankAccounts();
  const accounts = data?.accounts ?? [];

  const handleAddAccount = () => {
    lightHaptic();
    router.push('/(main)/(profile)/add-bank' as any);
  };

  const handleAccountPress = (accountId: string) => {
    lightHaptic();
    showToast({ type: 'info', title: 'Account options coming soon' });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Bank Accounts" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Bank Accounts" />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-4">
        {accounts.length === 0 ? (
          <EmptyState
            title="No bank accounts"
            description="Add a bank account to withdraw funds"
            actionLabel="Add Bank Account"
            onAction={handleAddAccount}
          />
        ) : (
          <>
            {accounts.map((account) => (
              <Card key={account.id} className="mb-3" pressable onPress={() => handleAccountPress(account.id)}>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-title-md font-inter-medium text-txt-primary">{account.bank_name}</Text>
                  {account.is_default && (
                    <Text
                      className="text-label-sm font-inter-medium text-accent-500 px-2 py-0.5 rounded-sm"
                      style={{ backgroundColor: withOpacity(colors.primary[500], 0.12) }}
                    >
                      Default
                    </Text>
                  )}
                </View>
                <Text className="text-body-lg font-inter text-txt-secondary mb-0.5">{account.account_number}</Text>
                <Text className="text-body-sm font-inter text-txt-tertiary">{account.account_name}</Text>
              </Card>
            ))}
            <Button title="+ Add Bank Account" variant="secondary" fullWidth onPress={handleAddAccount} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
