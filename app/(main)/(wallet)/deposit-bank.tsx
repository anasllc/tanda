import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Button } from '../../../src/components/ui';
import { useProfile } from '../../../src/hooks/useProfile';
import { lightHaptic } from '../../../src/utils/haptics';
import { useUIStore } from '../../../src/stores';
import Svg, { Path } from 'react-native-svg';

export default function DepositBankScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const { data: profile, isLoading } = useProfile();

  const virtualAccount = profile?.virtual_account;

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    lightHaptic();
    showToast({ type: 'success', title: 'Copied to clipboard' });
  };

  const handleConfirmPayment = () => {
    lightHaptic();
    showToast({ type: 'success', title: 'Payment confirmed!', message: 'Your wallet will be credited shortly.' });
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Bank Transfer" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!virtualAccount) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Bank Transfer" />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-body-md font-inter text-txt-secondary text-center">
            Virtual account not available. Please try again later.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Bank Transfer" />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-4">
        <Text className="text-body-md font-inter text-txt-secondary mb-4 text-center">
          Transfer to the account details below. Your wallet will be credited automatically.
        </Text>

        <Card className="mb-4">
          <View className="flex-row items-center py-3">
            <View className="flex-1">
              <Text className="text-label-sm font-inter-medium text-txt-tertiary mb-0.5">Bank Name</Text>
              <Text className="text-body-lg font-inter text-txt-primary">{virtualAccount.bank_name}</Text>
            </View>
          </View>

          <View className="h-px bg-border/50" />

          <View className="flex-row items-center py-3">
            <View className="flex-1">
              <Text className="text-label-sm font-inter-medium text-txt-tertiary mb-0.5">Account Number</Text>
              <Text className="text-body-lg font-inter text-txt-primary">{virtualAccount.account_number}</Text>
            </View>
            <TouchableOpacity onPress={() => handleCopy(virtualAccount.account_number)} className="p-2">
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" stroke={colors.primary[400]} strokeWidth={1.5} />
                <Path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" stroke={colors.primary[400]} strokeWidth={1.5} />
              </Svg>
            </TouchableOpacity>
          </View>

          <View className="h-px bg-border/50" />

          <View className="flex-row items-center py-3">
            <View className="flex-1">
              <Text className="text-label-sm font-inter-medium text-txt-tertiary mb-0.5">Account Name</Text>
              <Text className="text-body-lg font-inter text-txt-primary">{virtualAccount.account_name}</Text>
            </View>
          </View>
        </Card>

        <View
          className="flex-row rounded-lg p-4 gap-3 mb-6"
          style={{ backgroundColor: colors.warning.main + '15' }}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 9v4m0 4h.01M12 3l9 16H3L12 3z" stroke={colors.warning.main} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text className="flex-1 text-body-sm font-inter" style={{ color: colors.warning.main }}>
            Only transfer from bank accounts registered in your name. Third-party transfers may be rejected.
          </Text>
        </View>

        <View>
          <Text className="text-title-sm font-inter-medium text-txt-primary mb-4">How it works</Text>
          <View className="flex-row items-center mb-3">
            <Text className="w-6 h-6 rounded-full bg-accent-500 text-label-md font-inter-medium text-txt-inverse text-center leading-6 mr-3 overflow-hidden">1</Text>
            <Text className="text-body-md font-inter text-txt-secondary">Copy the account details above</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Text className="w-6 h-6 rounded-full bg-accent-500 text-label-md font-inter-medium text-txt-inverse text-center leading-6 mr-3 overflow-hidden">2</Text>
            <Text className="text-body-md font-inter text-txt-secondary">Open your bank app and make a transfer</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Text className="w-6 h-6 rounded-full bg-accent-500 text-label-md font-inter-medium text-txt-inverse text-center leading-6 mr-3 overflow-hidden">3</Text>
            <Text className="text-body-md font-inter text-txt-secondary">Your wallet will be credited instantly</Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-6">
        <Button title="I've Sent the Money" variant="secondary" fullWidth onPress={handleConfirmPayment} />
      </View>
    </SafeAreaView>
  );
}
