import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Button } from '../../../src/components/ui';
import { savedBankAccounts } from '../../../src/mock/bankAccounts';
import { useUIStore } from '../../../src/stores';
import { withOpacity, lightHaptic } from '../../../src/utils';

export default function BankAccountsScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);

  const handleAddAccount = () => {
    lightHaptic();
    router.push('/(main)/(profile)/add-bank' as any);
  };

  const handleAccountPress = (accountId: string) => {
    lightHaptic();
    showToast({ type: 'info', title: 'Account options coming soon' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Bank Accounts" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {savedBankAccounts.map((account) => (
          <Card key={account.id} style={styles.accountCard} pressable onPress={() => handleAccountPress(account.id)}>
            <View style={styles.accountHeader}>
              <Text style={styles.bankName}>{account.bankName}</Text>
              {account.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
            </View>
            <Text style={styles.accountNumber}>{account.accountNumber}</Text>
            <Text style={styles.accountName}>{account.accountName}</Text>
          </Card>
        ))}
        <Button title="+ Add Bank Account" variant="secondary" fullWidth onPress={handleAddAccount} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4] },
  accountCard: { marginBottom: spacing[3] },
  accountHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] },
  bankName: { ...typography.titleMedium, color: colors.text.primary },
  defaultBadge: { ...typography.labelSmall, color: colors.primary[500], backgroundColor: withOpacity(colors.primary[500], 0.12), paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: borderRadius.sm },
  accountNumber: { ...typography.bodyLarge, color: colors.text.secondary, marginBottom: 2 },
  accountName: { ...typography.bodySmall, color: colors.text.tertiary },
});
