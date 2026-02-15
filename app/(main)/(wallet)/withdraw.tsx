import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, Card } from '../../../src/components/ui';
import { useBankAccounts, BankAccount } from '../../../src/hooks/useBankAccounts';
import { useInitiateOfframp } from '../../../src/hooks/useWallet';
import { useAuthStore, useUIStore } from '../../../src/stores';
import { formatCurrency, withOpacity, lightHaptic } from '../../../src/utils';

export default function WithdrawScreen() {
  const router = useRouter();
  const balance = useAuthStore((state) => state.balance);
  const showToast = useUIStore((state) => state.showToast);
  const { data: bankAccountsData, isLoading: accountsLoading } = useBankAccounts();
  const offramp = useInitiateOfframp();

  const bankAccounts = bankAccountsData?.accounts ?? [];

  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'select' | 'amount'>('select');

  // Auto-select default account once data loads
  React.useEffect(() => {
    if (bankAccounts.length > 0 && !selectedAccount) {
      const defaultAccount = bankAccounts.find((a) => a.is_default) || null;
      setSelectedAccount(defaultAccount);
    }
  }, [bankAccounts, selectedAccount]);

  const handleSelectAccount = (account: BankAccount) => {
    lightHaptic();
    setSelectedAccount(account);
  };

  const handleContinue = () => {
    if (step === 'select') {
      if (!selectedAccount) return;
      lightHaptic();
      setStep('amount');
    } else {
      if (!selectedAccount || !amount) return;
      const amountNum = parseFloat(amount);
      if (amountNum > balance) {
        showToast({ type: 'error', title: 'Insufficient balance' });
        return;
      }
      if (amountNum < 100) {
        showToast({ type: 'error', title: 'Minimum withdrawal is \u20A6100' });
        return;
      }
      lightHaptic();
      offramp.mutate(
        { amountUsdc: amountNum, bankAccountId: selectedAccount.id, pin: '' },
        {
          onSuccess: () => {
            showToast({
              type: 'success',
              title: 'Withdrawal initiated',
              message: `${formatCurrency(amountNum)} will be sent to ${selectedAccount.bank_name}`,
            });
            router.back();
          },
          onError: (error: any) => {
            showToast({
              type: 'error',
              title: 'Withdrawal failed',
              message: error?.message || 'Something went wrong',
            });
          },
        }
      );
    }
  };

  const handleAddAccount = () => {
    lightHaptic();
    router.push('/(main)/(profile)/bank-accounts');
  };

  const handleBack = () => {
    if (step === 'amount') {
      setStep('select');
      setAmount('');
    } else {
      router.back();
    }
  };

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000].filter(a => a <= balance);
  const isValidAmount = amount && parseFloat(amount) >= 100 && parseFloat(amount) <= balance;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <Header showBack title="Withdraw" onBack={handleBack} />

            <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-4" showsVerticalScrollIndicator={false}>
              <Card className="items-center mb-6">
                <Text className="text-body-md font-inter text-txt-secondary mb-1">Available to withdraw</Text>
                <Text className="text-display-sm font-inter-bold text-txt-primary">{formatCurrency(balance)}</Text>
              </Card>

              {step === 'select' ? (
                <>
                  <Text className="text-title-md font-inter-medium text-txt-primary mb-4">Select Bank Account</Text>

                  {accountsLoading ? (
                    <View className="py-8 items-center">
                      <ActivityIndicator color={colors.primary[500]} />
                    </View>
                  ) : bankAccounts.length === 0 ? (
                    <View className="py-8 items-center">
                      <Text className="text-body-md font-inter text-txt-tertiary mb-4">No bank accounts added yet</Text>
                    </View>
                  ) : (
                    bankAccounts.map((account) => (
                      <TouchableOpacity
                        key={account.id}
                        className={`bg-bg-secondary rounded-2xl border p-4 mb-3 flex-row items-center ${
                          selectedAccount?.id === account.id
                            ? 'border-accent-500'
                            : 'border-border'
                        }`}
                        style={selectedAccount?.id === account.id ? { backgroundColor: withOpacity(colors.primary[500], 0.06) } : undefined}
                        onPress={() => handleSelectAccount(account)}
                      >
                        <View className="flex-1">
                          <Text className="text-title-sm font-inter-medium text-txt-primary">{account.bank_name}</Text>
                          <Text className="text-body-md font-inter text-txt-secondary mt-0.5">{account.account_number}</Text>
                          <Text className="text-body-sm font-inter text-txt-tertiary mt-0.5">{account.account_name}</Text>
                        </View>
                        {selectedAccount?.id === account.id && (
                          <View className="w-6 h-6 rounded-full bg-accent-500 items-center justify-center">
                            <Text className="text-white font-bold">{'\u2713'}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))
                  )}

                  <TouchableOpacity className="items-center py-4" onPress={handleAddAccount}>
                    <Text className="text-label-lg font-inter-medium text-accent-500">+ Add New Bank Account</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Card className="mb-6">
                    <Text className="text-body-sm font-inter text-txt-tertiary mb-1">Sending to</Text>
                    <Text className="text-title-md font-inter-medium text-txt-primary">{selectedAccount?.bank_name}</Text>
                    <Text className="text-body-md font-inter text-txt-secondary mt-0.5">{selectedAccount?.account_number}</Text>
                  </Card>

                  <Text className="text-title-md font-inter-medium text-txt-primary mb-4">Enter Amount</Text>
                  <TextInput
                    className="bg-bg-tertiary rounded-xl border border-border px-4 text-txt-primary text-center h-16 text-2xl font-semibold mb-4"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="numeric"
                    autoFocus
                  />

                  <View className="flex-row flex-wrap gap-2">
                    {quickAmounts.map((value) => (
                      <TouchableOpacity
                        key={value}
                        className={`rounded-lg px-4 py-2 border ${
                          amount === value.toString()
                            ? 'border-accent-500'
                            : 'bg-bg-secondary border-border'
                        }`}
                        style={amount === value.toString() ? { backgroundColor: withOpacity(colors.primary[500], 0.12) } : undefined}
                        onPress={() => { lightHaptic(); setAmount(value.toString()); }}
                      >
                        <Text className={`text-label-lg font-inter-medium ${
                          amount === value.toString()
                            ? 'text-accent-500'
                            : 'text-txt-secondary'
                        }`}>
                          {formatCurrency(value)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <View className="px-5 pb-8">
              <Button
                title={step === 'select' ? 'Continue' : offramp.isPending ? 'Processing...' : 'Withdraw'}
                onPress={handleContinue}
                fullWidth
                disabled={step === 'select' ? !selectedAccount : !isValidAmount || offramp.isPending}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
