import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card } from '../../../src/components/ui';
import { virtualAccount } from '../../../src/mock/bankAccounts';
import { lightHaptic } from '../../../src/utils/haptics';
import * as Clipboard from 'expo-clipboard';
import { useUIStore } from '../../../src/stores';

const BankIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M3 21H21M3 10H21M5 6L12 3L19 6M4 10V21M20 10V21M8 14V17M12 14V17M16 14V17" stroke={colors.primary[500]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CardIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={5} width={20} height={14} rx={2} stroke={colors.info.main} strokeWidth={2} />
    <Path d="M2 10H22" stroke={colors.info.main} strokeWidth={2} />
  </Svg>
);

export default function DepositScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);

  const handleCopyAccount = async () => {
    lightHaptic();
    await Clipboard.setStringAsync(virtualAccount.accountNumber);
    showToast({ type: 'success', title: 'Account number copied!' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Add Money" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Choose how you want to add money</Text>

        <Card style={styles.methodCard} pressable onPress={() => showToast({ type: 'info', title: 'Use the account details below to transfer' })}>
          <View style={styles.methodIcon}>
            <BankIcon />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Bank Transfer</Text>
            <Text style={styles.methodDesc}>Transfer from any bank</Text>
          </View>
          <Text style={styles.methodBadge}>Free</Text>
        </Card>

        <Card style={styles.methodCard} pressable onPress={() => router.push('/(main)/(wallet)/deposit-card')}>
          <View style={styles.methodIcon}>
            <CardIcon />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>Card Payment</Text>
            <Text style={styles.methodDesc}>Visa, Mastercard, Verve</Text>
          </View>
          <Text style={styles.methodBadgeFee}>1.5%</Text>
        </Card>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Your Virtual Account</Text>
        <Card style={styles.accountCard}>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Bank</Text>
            <Text style={styles.accountValue}>{virtualAccount.bankName}</Text>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Account Number</Text>
            <TouchableOpacity onPress={handleCopyAccount} style={styles.copyRow}>
              <Text style={styles.accountValueBold}>{virtualAccount.accountNumber}</Text>
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Account Name</Text>
            <Text style={styles.accountValue}>{virtualAccount.accountName}</Text>
          </View>
        </Card>

        <Text style={styles.note}>
          Transfers to this account will be credited instantly 24/7
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4] },
  subtitle: { ...typography.bodyLarge, color: colors.text.secondary, marginBottom: spacing[6] },
  methodCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[3], padding: spacing[4] },
  methodIcon: { width: 56, height: 56, borderRadius: borderRadius.xl, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', marginRight: spacing[4] },
  methodInfo: { flex: 1 },
  methodTitle: { ...typography.titleMedium, color: colors.text.primary },
  methodDesc: { ...typography.bodySmall, color: colors.text.tertiary, marginTop: 2 },
  methodBadge: { ...typography.labelMedium, color: colors.success.main, backgroundColor: colors.success.background, paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: borderRadius.md },
  methodBadgeFee: { ...typography.labelMedium, color: colors.text.tertiary, backgroundColor: colors.background.tertiary, paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: borderRadius.md },
  divider: { height: 1, backgroundColor: colors.border.default, marginVertical: spacing[6] },
  sectionTitle: { ...typography.titleMedium, color: colors.text.primary, marginBottom: spacing[3] },
  accountCard: { marginBottom: spacing[4] },
  accountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[2] },
  accountLabel: { ...typography.bodyMedium, color: colors.text.secondary },
  accountValue: { ...typography.bodyMedium, color: colors.text.primary },
  accountValueBold: { ...typography.bodyMedium, color: colors.text.primary, fontWeight: '700' },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  copyText: { ...typography.labelMedium, color: colors.primary[500] },
  note: { ...typography.bodySmall, color: colors.text.tertiary, textAlign: 'center' },
});
