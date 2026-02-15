import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Button } from '../../../src/components/ui';
import { virtualAccount } from '../../../src/mock/bankAccounts';
import { triggerHaptic } from '../../../src/utils/haptics';
import { useUIStore } from '../../../src/stores';
import Svg, { Path } from 'react-native-svg';

export default function DepositBankScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    triggerHaptic('success');
    showToast({ type: 'success', title: 'Copied to clipboard' });
  };

  const handleConfirmPayment = () => {
    triggerHaptic('success');
    showToast({ type: 'success', title: 'Payment confirmed!', message: 'Your wallet will be credited shortly.' });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Bank Transfer" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.instructions}>
          Transfer to the account details below. Your wallet will be credited automatically.
        </Text>

        <Card style={styles.accountCard}>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Bank Name</Text>
              <Text style={styles.value}>{virtualAccount.bankName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Account Number</Text>
              <Text style={styles.value}>{virtualAccount.accountNumber}</Text>
            </View>
            <TouchableOpacity onPress={() => handleCopy(virtualAccount.accountNumber)} style={styles.copyButton}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" stroke={colors.primary[400]} strokeWidth={1.5} />
                <Path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" stroke={colors.primary[400]} strokeWidth={1.5} />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>Account Name</Text>
              <Text style={styles.value}>{virtualAccount.accountName}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.warningCard}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 9v4m0 4h.01M12 3l9 16H3L12 3z" stroke={colors.warning.main} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.warningText}>
            Only transfer from bank accounts registered in your name. Third-party transfers may be rejected.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>1</Text>
            <Text style={styles.infoText}>Copy the account details above</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>2</Text>
            <Text style={styles.infoText}>Open your bank app and make a transfer</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>3</Text>
            <Text style={styles.infoText}>Your wallet will be credited instantly</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="I've Sent the Money" variant="secondary" fullWidth onPress={handleConfirmPayment} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4] },
  instructions: { ...typography.bodyMedium, color: colors.text.secondary, marginBottom: spacing[4], textAlign: 'center' },
  accountCard: { marginBottom: spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3] },
  rowInfo: { flex: 1 },
  label: { ...typography.labelSmall, color: colors.text.tertiary, marginBottom: 2 },
  value: { ...typography.bodyLarge, color: colors.text.primary },
  copyButton: { padding: spacing[2] },
  divider: { height: 1, backgroundColor: colors.border.subtle },
  warningCard: { flexDirection: 'row', backgroundColor: colors.warning.main + '15', borderRadius: borderRadius.lg, padding: spacing[4], gap: spacing[3], marginBottom: spacing[6] },
  warningText: { flex: 1, ...typography.bodySmall, color: colors.warning.main },
  infoSection: { },
  infoTitle: { ...typography.titleSmall, color: colors.text.primary, marginBottom: spacing[4] },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[3] },
  infoNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center', ...typography.labelMedium, color: colors.text.inverse, textAlign: 'center', lineHeight: 24, marginRight: spacing[3] },
  infoText: { ...typography.bodyMedium, color: colors.text.secondary },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6] },
});
