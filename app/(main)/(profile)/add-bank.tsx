import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Input, Button, Card, SearchBar } from '../../../src/components/ui';
import { banks } from '../../../src/mock/bankAccounts';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';
import { useAddBankAccount } from '../../../src/hooks/useBankAccounts';
import Svg, { Path } from 'react-native-svg';

export default function AddBankScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const addBankAccount = useAddBankAccount();
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

  const handleAddBank = async () => {
    if (!selectedBank) return;
    lightHaptic();
    try {
      await addBankAccount.mutateAsync({
        bankCode: selectedBank.code,
        accountNumber,
        bankName: selectedBank.name,
      });
      showToast({ type: 'success', title: 'Bank account added successfully' });
      router.back();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to add bank', message: err.message });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Add Bank Account" />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 gap-4">
        <TouchableOpacity
          className="flex-row justify-between items-center bg-bg-secondary rounded-lg p-4 border border-border"
          onPress={() => setShowBankPicker(true)}
        >
          <View>
            <Text className="text-label-sm font-inter-medium text-txt-tertiary mb-1">Bank</Text>
            <Text className={`text-body-lg font-inter ${selectedBank ? 'text-txt-primary' : 'text-txt-tertiary'}`}>
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
          <Card style={{ backgroundColor: colors.success.main + '15' }}>
            <View className="flex-row items-center gap-3">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.success.main + '20' }}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M20 6L9 17l-5-5" stroke={colors.success.main} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <View>
                <Text className="text-label-md font-inter-medium" style={{ color: colors.success.main }}>Account Verified</Text>
                <Text className="text-body-lg font-inter text-txt-primary">{accountName}</Text>
              </View>
            </View>
          </Card>
        )}

        <View className="flex-row items-start gap-3 pt-4">
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={colors.text.tertiary} strokeWidth={1.5} />
          </Svg>
          <Text className="flex-1 text-body-sm font-inter text-txt-tertiary">
            Your bank account information is encrypted and stored securely. We only use it for withdrawals.
          </Text>
        </View>
      </ScrollView>

      <View className="px-5 pb-6">
        <Button
          title="Add Bank Account"
          onPress={handleAddBank}
          fullWidth
          disabled={!verified}
          loading={addBankAccount.isPending}
        />
      </View>

      <Modal visible={showBankPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-bg-elevated">
          <View className="flex-row justify-between items-center px-5 py-4">
            <Text className="text-title-lg font-inter-semibold text-txt-primary">Select Bank</Text>
            <TouchableOpacity onPress={() => setShowBankPicker(false)}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke={colors.text.primary} strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-5">
            <SearchBar
              placeholder="Search banks"
              value={bankSearch}
              onChangeText={setBankSearch}
            />

            <ScrollView className="mt-4">
              {filteredBanks.map(bank => (
                <TouchableOpacity
                  key={bank.code}
                  className="flex-row justify-between items-center py-4 border-b border-border-light"
                  onPress={() => {
                    setSelectedBank(bank);
                    setShowBankPicker(false);
                    setVerified(false);
                    setAccountName('');
                  }}
                >
                  <Text className="text-body-lg font-inter text-txt-primary">{bank.name}</Text>
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
