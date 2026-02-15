import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { IconButton, Button, Avatar, Divider } from '../../src/components/ui';
import { transactions } from '../../src/mock/transactions';
import Svg, { Path } from 'react-native-svg';

export default function ReceiptModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const transaction = transactions.find(t => t.id === id) || transactions[0];
  const isCredit = transaction.amount > 0;

  const handleClose = () => {
    router.back();
  };

  const handleShare = () => {
    // Share functionality
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Receipt</Text>
        <IconButton
          icon={<Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M18 6L6 18M6 6L18 18" stroke={colors.text.primary} strokeWidth={2} strokeLinecap="round" /></Svg>}
          onPress={handleClose}
          variant="ghost"
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.receiptCard}>
          <View style={styles.logoSection}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>T</Text>
            </View>
            <Text style={styles.logoName}>Tanda</Text>
          </View>

          <View style={styles.statusSection}>
            <View style={[styles.statusIcon, { backgroundColor: colors.success.main + '20' }]}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path d="M20 6L9 17l-5-5" stroke={colors.success.main} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={styles.statusText}>Successful</Text>
          </View>

          <Text style={styles.amount}>
            {isCredit ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
          </Text>

          <Divider spacing={spacing[4]} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{transaction.type}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{isCredit ? 'From' : 'To'}</Text>
            <View style={styles.recipientRow}>
              <Avatar name={transaction.title} size="xs" />
              <Text style={styles.detailValue}>{transaction.title}</Text>
            </View>
          </View>

          {transaction.note && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Note</Text>
              <Text style={styles.detailValue}>{transaction.note}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{transaction.date}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference</Text>
            <Text style={styles.detailValue}>{transaction.id}</Text>
          </View>

          <Divider spacing={spacing[4]} />

          <View style={styles.feeSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>${Math.abs(transaction.amount).toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fee</Text>
              <Text style={styles.detailValue}>$0.00</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${Math.abs(transaction.amount).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.elevated },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  headerTitle: { ...typography.titleMedium, color: colors.text.primary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[6] },
  receiptCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
  },
  logoSection: { alignItems: 'center', marginBottom: spacing[6] },
  logo: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
  logoText: { ...typography.headlineMedium, color: colors.text.inverse },
  logoName: { ...typography.titleMedium, color: colors.text.primary },
  statusSection: { alignItems: 'center', marginBottom: spacing[4] },
  statusIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
  statusText: { ...typography.titleSmall, color: colors.success.main },
  amount: { ...typography.displayLarge, color: colors.text.primary, textAlign: 'center' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  detailLabel: { ...typography.bodyMedium, color: colors.text.tertiary },
  detailValue: { ...typography.bodyMedium, color: colors.text.primary },
  recipientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  feeSection: { },
  totalLabel: { ...typography.titleSmall, color: colors.text.primary },
  totalValue: { ...typography.titleSmall, color: colors.text.primary },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6], gap: spacing[3] },
});
