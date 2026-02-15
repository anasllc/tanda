import React from 'react';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Avatar, Badge, Button, Card } from '../../../src/components/ui';
import { getTransactionById } from '../../../src/mock/transactions';
import { formatCurrency, formatFullDate, formatTime } from '../../../src/utils/formatters';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const transaction = id ? getTransactionById(id) : null;
  const showToast = useUIStore((state) => state.showToast);

  const handleShareReceipt = async () => {
    if (!transaction) return;
    lightHaptic();

    const receiptText = `
Tanda Transaction Receipt

Amount: ${transaction.type === 'receive' || transaction.type === 'deposit' ? '+' : '-'}${formatCurrency(transaction.amount)}
Status: ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
Date: ${formatFullDate(transaction.createdAt)}
Time: ${formatTime(transaction.createdAt)}
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

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack title="Transaction" />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Transaction not found</Text>
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
    <SafeAreaView style={styles.container}>
      <Header showBack title="Transaction Details" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar name={name} size="xlarge" />
          <Text style={[styles.amount, isPositive ? styles.positive : styles.negative]}>
            {isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
          <Badge
            label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            variant={getStatusVariant()}
          />
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.label}>{transaction.sender ? 'From' : 'To'}</Text>
            <Text style={styles.value}>{name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{transaction.type.replace('_', ' ').toUpperCase()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatFullDate(transaction.createdAt)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{formatTime(transaction.createdAt)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Reference</Text>
            <Text style={styles.value}>{transaction.reference}</Text>
          </View>

          {transaction.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{transaction.description}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[8] },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { ...typography.bodyLarge, color: colors.text.tertiary },
  header: { alignItems: 'center', marginBottom: spacing[8] },
  amount: { ...typography.displayMedium, marginTop: spacing[4], marginBottom: spacing[3] },
  positive: { color: colors.success.main },
  negative: { color: colors.text.primary },
  detailsCard: { marginBottom: spacing[6] },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border.default },
  label: { ...typography.bodyMedium, color: colors.text.secondary },
  value: { ...typography.bodyMedium, color: colors.text.primary, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: spacing[4] },
});
