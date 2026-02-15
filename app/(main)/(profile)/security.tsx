import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Divider } from '../../../src/components/ui';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';

export default function SecurityScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const [biometrics, setBiometrics] = useState(true);

  const handleBiometricsChange = (value: boolean) => {
    lightHaptic();
    setBiometrics(value);
    showToast({
      type: 'success',
      title: value ? 'Biometric login enabled' : 'Biometric login disabled'
    });
  };

  const handleChangePIN = () => {
    lightHaptic();
    router.push('/(auth)/set-pin' as any);
  };

  const handleChangePassword = () => {
    lightHaptic();
    showToast({ type: 'info', title: 'Password change', message: 'Check your email for instructions' });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Security" />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4">
        <Card>
          <View className="flex-row items-center py-4">
            <View className="flex-1">
              <Text className="text-body-lg font-inter text-txt-primary">Biometric Login</Text>
              <Text className="text-body-sm font-inter text-txt-tertiary mt-0.5">Use Face ID or fingerprint</Text>
            </View>
            <Switch value={biometrics} onValueChange={handleBiometricsChange} trackColor={{ true: colors.primary[500] }} />
          </View>
          <Divider spacing={0} />
          <TouchableOpacity className="flex-row items-center py-4" onPress={handleChangePIN}>
            <View className="flex-1">
              <Text className="text-body-lg font-inter text-txt-primary">Change PIN</Text>
              <Text className="text-body-sm font-inter text-txt-tertiary mt-0.5">Update your transaction PIN</Text>
            </View>
          </TouchableOpacity>
          <Divider spacing={0} />
          <TouchableOpacity className="flex-row items-center py-4" onPress={handleChangePassword}>
            <View className="flex-1">
              <Text className="text-body-lg font-inter text-txt-primary">Change Password</Text>
              <Text className="text-body-sm font-inter text-txt-tertiary mt-0.5">Update your account password</Text>
            </View>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
