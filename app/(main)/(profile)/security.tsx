import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../../../src/theme';
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
    <SafeAreaView style={styles.container}>
      <Header showBack title="Security" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Biometric Login</Text>
              <Text style={styles.rowDesc}>Use Face ID or fingerprint</Text>
            </View>
            <Switch value={biometrics} onValueChange={handleBiometricsChange} trackColor={{ true: colors.primary[500] }} />
          </View>
          <Divider spacing={0} />
          <TouchableOpacity style={styles.row} onPress={handleChangePIN}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Change PIN</Text>
              <Text style={styles.rowDesc}>Update your transaction PIN</Text>
            </View>
          </TouchableOpacity>
          <Divider spacing={0} />
          <TouchableOpacity style={styles.row} onPress={handleChangePassword}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Change Password</Text>
              <Text style={styles.rowDesc}>Update your account password</Text>
            </View>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[4] },
  rowInfo: { flex: 1 },
  rowTitle: { ...typography.bodyLarge, color: colors.text.primary },
  rowDesc: { ...typography.bodySmall, color: colors.text.tertiary, marginTop: 2 },
});
