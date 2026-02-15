import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, layout } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, Card } from '../../../src/components/ui';
import { savedBankAccounts, BankAccount } from '../../../src/mock/bankAccounts';
import { useAuthStore, useUIStore } from '../../../src/stores';
import { formatCurrency, withOpacity, lightHaptic } from '../../../src/utils';

export default function WithdrawScreen() {
  const router = useRouter();
  const balance = useAuthStore((state) => state.balance);
  const showToast = useUIStore((state) => state.showToast);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(
    savedBankAccounts.find(a => a.isDefault) || null
  );
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'select' | 'amount'>('select');

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
        showToast({ type: 'error', title: 'Minimum withdrawal is ₦100' });
        return;
      }
      lightHaptic();
      showToast({
        type: 'success',
        title: 'Withdrawal initiated',
        message: `${formatCurrency(amountNum)} will be sent to ${selectedAccount.bankName}`
      });
      router.back();
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.flex}>
            <Header showBack title="Withdraw" onBack={handleBack} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Card style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Available to withdraw</Text>
                <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
              </Card>

              {step === 'select' ? (
                <>
                  <Text style={styles.sectionTitle}>Select Bank Account</Text>

                  {savedBankAccounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountCard,
                        selectedAccount?.id === account.id && styles.accountCardSelected,
                      ]}
                      onPress={() => handleSelectAccount(account)}
                    >
                      <View style={styles.accountInfo}>
                        <Text style={styles.bankName}>{account.bankName}</Text>
                        <Text style={styles.accountNumber}>{account.accountNumber}</Text>
                        <Text style={styles.accountName}>{account.accountName}</Text>
                      </View>
                      {selectedAccount?.id === account.id && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
                    <Text style={styles.addButtonText}>+ Add New Bank Account</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Card style={styles.selectedBankCard}>
                    <Text style={styles.selectedBankLabel}>Sending to</Text>
                    <Text style={styles.selectedBankName}>{selectedAccount?.bankName}</Text>
                    <Text style={styles.selectedAccountNumber}>{selectedAccount?.accountNumber}</Text>
                  </Card>

                  <Text style={styles.sectionTitle}>Enter Amount</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="numeric"
                    autoFocus
                  />

                  <View style={styles.quickAmounts}>
                    {quickAmounts.map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[styles.quickAmount, amount === value.toString() && styles.quickAmountSelected]}
                        onPress={() => { lightHaptic(); setAmount(value.toString()); }}
                      >
                        <Text style={[styles.quickAmountText, amount === value.toString() && styles.quickAmountTextSelected]}>
                          {formatCurrency(value)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <Button
                title={step === 'select' ? 'Continue' : 'Withdraw'}
                onPress={handleContinue}
                fullWidth
                disabled={step === 'select' ? !selectedAccount : !isValidAmount}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4] },
  balanceCard: { alignItems: 'center', marginBottom: spacing[6] },
  balanceLabel: { ...typography.bodyMedium, color: colors.text.secondary, marginBottom: spacing[1] },
  balanceAmount: { ...typography.displaySmall, color: colors.text.primary },
  sectionTitle: { ...typography.titleMedium, color: colors.text.primary, marginBottom: spacing[4] },
  accountCard: { backgroundColor: colors.background.secondary, borderRadius: borderRadius['2xl'], borderWidth: 1, borderColor: colors.border.default, padding: spacing[4], marginBottom: spacing[3], flexDirection: 'row', alignItems: 'center' },
  accountCardSelected: { borderColor: colors.primary[500], backgroundColor: withOpacity(colors.primary[500], 0.06) },
  accountInfo: { flex: 1 },
  bankName: { ...typography.titleSmall, color: colors.text.primary },
  accountNumber: { ...typography.bodyMedium, color: colors.text.secondary, marginTop: 2 },
  accountName: { ...typography.bodySmall, color: colors.text.tertiary, marginTop: 2 },
  checkmark: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  checkmarkText: { color: colors.white, fontWeight: '700' },
  addButton: { alignItems: 'center', paddingVertical: spacing[4] },
  addButtonText: { ...typography.labelLarge, color: colors.primary[500] },
  selectedBankCard: { marginBottom: spacing[6] },
  selectedBankLabel: { ...typography.bodySmall, color: colors.text.tertiary, marginBottom: spacing[1] },
  selectedBankName: { ...typography.titleMedium, color: colors.text.primary },
  selectedAccountNumber: { ...typography.bodyMedium, color: colors.text.secondary, marginTop: 2 },
  amountInput: { backgroundColor: colors.background.tertiary, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing[4], fontSize: 24, fontWeight: '600', color: colors.text.primary, height: 64, textAlign: 'center', marginBottom: spacing[4] },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  quickAmount: { backgroundColor: colors.background.secondary, borderRadius: borderRadius.lg, paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderWidth: 1, borderColor: colors.border.default },
  quickAmountSelected: { borderColor: colors.primary[500], backgroundColor: withOpacity(colors.primary[500], 0.12) },
  quickAmountText: { ...typography.labelLarge, color: colors.text.secondary },
  quickAmountTextSelected: { color: colors.primary[500] },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
});
