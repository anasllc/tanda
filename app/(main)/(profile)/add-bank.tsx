import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Input, Button, Card, SearchBar } from '../../../src/components/ui';
import { banks } from '../../../src/mock/bankAccounts';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';
import Svg, { Path } from 'react-native-svg';

export default function AddBankScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const [selectedBank, setSelectedBank] = useState<typeof banks[0] | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState('');

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleVerifyAccount = () => {
    lightHaptic();
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setAccountName('John Adebayo');
      setVerified(true);
      showToast({ type: 'success', title: 'Account verified!' });
    }, 1500);
  };

  const handleAddBank = () => {
    lightHaptic();
    showToast({ type: 'success', title: 'Bank account added successfully' });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Add Bank Account" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.bankSelector} onPress={() => setShowBankPicker(true)}>
          <View>
            <Text style={styles.label}>Bank</Text>
            <Text style={[styles.bankName, !selectedBank && styles.placeholder]}>
              {selectedBank ? selectedBank.name : 'Select a bank'}
            </Text>
          </View>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke={colors.text.tertiary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <Input
          label="Account Number"
          value={accountNumber}
          onChangeText={(text) => {
            setAccountNumber(text);
            setVerified(false);
            setAccountName('');
          }}
          placeholder="0123456789"
          keyboardType="number-pad"
          maxLength={10}
        />

        {accountNumber.length === 10 && selectedBank && !verified && (
          <Button
            title={verifying ? 'Verifying...' : 'Verify Account'}
            variant="secondary"
            onPress={handleVerifyAccount}
            loading={verifying}
            fullWidth
          />
        )}

        {verified && (
          <Card style={styles.verifiedCard}>
            <View style={styles.verifiedRow}>
              <View style={styles.checkIcon}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M20 6L9 17l-5-5" stroke={colors.success.main} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <View>
                <Text style={styles.verifiedLabel}>Account Verified</Text>
                <Text style={styles.accountName}>{accountName}</Text>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.infoSection}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={colors.text.tertiary} strokeWidth={1.5} />
          </Svg>
          <Text style={styles.infoText}>
            Your bank account information is encrypted and stored securely. We only use it for withdrawals.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Add Bank Account"
          onPress={handleAddBank}
          fullWidth
          disabled={!verified}
        />
      </View>

      <Modal visible={showBankPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Bank</Text>
            <TouchableOpacity onPress={() => setShowBankPicker(false)}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke={colors.text.primary} strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <SearchBar
              placeholder="Search banks"
              value={bankSearch}
              onChangeText={setBankSearch}
            />

            <ScrollView style={styles.bankList}>
              {filteredBanks.map(bank => (
                <TouchableOpacity
                  key={bank.code}
                  style={styles.bankItem}
                  onPress={() => {
                    setSelectedBank(bank);
                    setShowBankPicker(false);
                    setVerified(false);
                    setAccountName('');
                  }}
                >
                  <Text style={styles.bankItemName}>{bank.name}</Text>
                  {selectedBank?.code === bank.code && (
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17l-5-5" stroke={colors.primary[400]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], gap: spacing[4] },
  label: { ...typography.labelSmall, color: colors.text.tertiary, marginBottom: 4 },
  bankSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  bankName: { ...typography.bodyLarge, color: colors.text.primary },
  placeholder: { color: colors.text.tertiary },
  verifiedCard: { backgroundColor: colors.success.main + '15' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  checkIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.success.main + '20', alignItems: 'center', justifyContent: 'center' },
  verifiedLabel: { ...typography.labelMedium, color: colors.success.main },
  accountName: { ...typography.bodyLarge, color: colors.text.primary },
  infoSection: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], paddingTop: spacing[4] },
  infoText: { flex: 1, ...typography.bodySmall, color: colors.text.tertiary },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6] },
  modalContainer: { flex: 1, backgroundColor: colors.background.elevated },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[5], paddingVertical: spacing[4] },
  modalTitle: { ...typography.titleLarge, color: colors.text.primary },
  modalContent: { flex: 1, paddingHorizontal: spacing[5] },
  bankList: { marginTop: spacing[4] },
  bankItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  bankItemName: { ...typography.bodyLarge, color: colors.text.primary },
});
