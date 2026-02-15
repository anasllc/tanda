import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, layout } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, NetworkBadge } from '../../../src/components/ui';
import { networks, airtimeQuickAmounts, NetworkProvider } from '../../../src/mock/services';
import { formatCurrency, lightHaptic, withOpacity } from '../../../src/utils';
import { useUIStore } from '../../../src/stores';

export default function AirtimeScreen() {
  const showToast = useUIStore((state) => state.showToast);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkProvider>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');

  const handleNetworkSelect = (network: NetworkProvider) => {
    lightHaptic();
    setSelectedNetwork(network);
  };

  const handleQuickAmount = (value: number) => {
    lightHaptic();
    setAmount(value.toString());
  };

  const isValid = phoneNumber.length >= 10 && parseFloat(amount) > 0;

  const handleContinue = () => {
    if (!isValid) return;
    showToast({
      type: 'success',
      title: `Purchasing ${formatCurrency(parseFloat(amount))} airtime for ${phoneNumber}`
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.flex}>
            <Header showBack title="Buy Airtime" />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Select Network</Text>
              <View style={styles.networks}>
                {networks.map((network) => (
                  <TouchableOpacity
                    key={network.id}
                    style={[styles.networkCard, selectedNetwork === network.id && styles.networkCardSelected]}
                    onPress={() => handleNetworkSelect(network.id)}
                  >
                    <NetworkBadge network={network.id} showLabel={false} size="medium" />
                    <Text style={styles.networkName}>{network.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="0812 345 6789"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="phone-pad"
                maxLength={11}
              />

              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
              />

              <View style={styles.quickAmounts}>
                {airtimeQuickAmounts.map((item) => (
                  <TouchableOpacity
                    key={item.amount}
                    style={[styles.quickAmount, amount === item.amount.toString() && styles.quickAmountSelected]}
                    onPress={() => handleQuickAmount(item.amount)}
                  >
                    <Text style={[styles.quickAmountText, amount === item.amount.toString() && styles.quickAmountTextSelected]}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button title="Continue" onPress={handleContinue} fullWidth disabled={!isValid} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4] },
  label: { ...typography.labelLarge, color: colors.text.secondary, marginBottom: spacing[2], marginTop: spacing[4] },
  networks: { flexDirection: 'row', gap: spacing[3] },
  networkCard: { flex: 1, backgroundColor: colors.background.secondary, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border.default, padding: spacing[3], alignItems: 'center' },
  networkCardSelected: { borderColor: colors.primary[500], backgroundColor: withOpacity(colors.primary[500], 0.06) },
  networkName: { ...typography.labelMedium, color: colors.text.primary, marginTop: spacing[2] },
  input: { backgroundColor: colors.background.tertiary, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing[4], paddingVertical: 0, fontSize: 16, color: colors.text.primary, height: layout.inputHeight },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[4] },
  quickAmount: { backgroundColor: colors.background.secondary, borderRadius: borderRadius.lg, paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderWidth: 1, borderColor: colors.border.default },
  quickAmountSelected: { borderColor: colors.primary[500], backgroundColor: withOpacity(colors.primary[500], 0.12) },
  quickAmountText: { ...typography.labelLarge, color: colors.text.secondary },
  quickAmountTextSelected: { color: colors.primary[500] },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
});
