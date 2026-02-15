import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card } from '../../../src/components/ui';
import { useProfile } from '../../../src/hooks/useProfile';
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
  const { data: profile } = useProfile();
  const virtualAccount = profile?.virtual_account;

  const handleCopyAccount = async () => {
    lightHaptic();
    if (virtualAccount?.account_number) {
      await Clipboard.setStringAsync(virtualAccount.account_number);
      showToast({ type: 'success', title: 'Account number copied!' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Add Money" />

      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-4">
        <Text className="text-body-lg font-inter text-txt-secondary mb-6">Choose how you want to add money</Text>

        <Card className="flex-row items-center mb-3 p-4" pressable onPress={() => showToast({ type: 'info', title: 'Use the account details below to transfer' })}>
          <View className="w-14 h-14 rounded-xl bg-bg-tertiary items-center justify-center mr-4">
            <BankIcon />
          </View>
          <View className="flex-1">
            <Text className="text-title-md font-inter-medium text-txt-primary">Bank Transfer</Text>
            <Text className="text-body-sm font-inter text-txt-tertiary mt-0.5">Transfer from any bank</Text>
          </View>
          <Text className="text-label-md font-inter-medium text-success-main bg-success-main/10 px-2 py-1 rounded-md overflow-hidden">Free</Text>
        </Card>

        <Card className="flex-row items-center mb-3 p-4" pressable onPress={() => router.push('/(main)/(wallet)/deposit-card')}>
          <View className="w-14 h-14 rounded-xl bg-bg-tertiary items-center justify-center mr-4">
            <CardIcon />
          </View>
          <View className="flex-1">
            <Text className="text-title-md font-inter-medium text-txt-primary">Card Payment</Text>
            <Text className="text-body-sm font-inter text-txt-tertiary mt-0.5">Visa, Mastercard, Verve</Text>
          </View>
          <Text className="text-label-md font-inter-medium text-txt-tertiary bg-bg-tertiary px-2 py-1 rounded-md overflow-hidden">1.5%</Text>
        </Card>

        {virtualAccount && (
          <>
            <View className="h-px bg-border my-6" />

            <Text className="text-title-md font-inter-medium text-txt-primary mb-3">Your Virtual Account</Text>
            <Card className="mb-4">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-body-md font-inter text-txt-secondary">Bank</Text>
                <Text className="text-body-md font-inter text-txt-primary">{virtualAccount.bank_name}</Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-body-md font-inter text-txt-secondary">Account Number</Text>
                <TouchableOpacity onPress={handleCopyAccount} className="flex-row items-center gap-2">
                  <Text className="text-body-md font-inter text-txt-primary font-bold">{virtualAccount.account_number}</Text>
                  <Text className="text-label-md font-inter-medium text-accent-500">Copy</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-body-md font-inter text-txt-secondary">Account Name</Text>
                <Text className="text-body-md font-inter text-txt-primary">{virtualAccount.account_name}</Text>
              </View>
            </Card>

            <Text className="text-body-sm font-inter text-txt-tertiary text-center">
              Transfers to this account will be credited instantly 24/7
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
