import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, layout } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button } from '../../../src/components/ui';
import { electricityProviders } from '../../../src/mock/services';
import { formatCurrency } from '../../../src/utils/formatters';
import { lightHaptic, withOpacity } from '../../../src/utils';
import { useUIStore } from '../../../src/stores';

export default function ElectricityScreen() {
  const showToast = useUIStore((state) => state.showToast);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [amount, setAmount] = useState('');

  const handleProviderSelect = (providerId: string) => {
    lightHaptic();
    setSelectedProvider(providerId);
  };

  const isValid = selectedProvider && meterNumber.length >= 10 && parseFloat(amount) > 0;

  const handleContinue = () => {
    if (!isValid) return;
    const provider = electricityProviders.find(p => p.id === selectedProvider);
    showToast({
      type: 'success',
      title: `Paying ${formatCurrency(parseFloat(amount))} for meter ${meterNumber}`,
      message: `${provider?.name} - ${meterType === 'prepaid' ? 'Prepaid' : 'Postpaid'}`
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
            <Header showBack title="Electricity" />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Select Provider</Text>
              <View style={styles.providers}>
                {electricityProviders.map((provider) => (
                  <TouchableOpacity
                    key={provider.id}
                    style={[styles.providerCard, selectedProvider === provider.id && styles.providerCardSelected]}
                    onPress={() => handleProviderSelect(provider.id)}
                  >
                    <Text style={[styles.providerName, selectedProvider === provider.id && styles.providerNameSelected]}>{provider.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Meter Type</Text>
              <View style={styles.meterTypes}>
                <TouchableOpacity
                  style={[styles.meterTypeCard, meterType === 'prepaid' && styles.meterTypeCardSelected]}
                  onPress={() => { lightHaptic(); setMeterType('prepaid'); }}
                >
                  <Text style={[styles.meterTypeText, meterType === 'prepaid' && styles.meterTypeTextSelected]}>Prepaid</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.meterTypeCard, meterType === 'postpaid' && styles.meterTypeCardSelected]}
                  onPress={() => { lightHaptic(); setMeterType('postpaid'); }}
                >
                  <Text style={[styles.meterTypeText, meterType === 'postpaid' && styles.meterTypeTextSelected]}>Postpaid</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Meter Number</Text>
              <TextInput
                style={styles.input}
                value={meterNumber}
                onChangeText={setMeterNumber}
                placeholder="Enter meter number"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={13}
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
                {[1000, 2000, 5000, 10000].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.quickAmount, amount === value.toString() && styles.quickAmountSelected]}
                    onPress={() => { lightHaptic(); setAmount(value.toString()); }}
                  >
                    <Text style={[styles.quickAmountText, amount === value.toString() && styles.quickAmountTextSelected]}>
                      {formatCurrency(value)}
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
  providers: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  providerCard: { backgroundColor: colors.background.secondary, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  providerCardSelected: { borderColor: colors.primary[500], backgroundColor: withOpacity(colors.primary[500], 0.06) },
  providerName: { ...typography.labelMedium, color: colors.text.primary },
  providerNameSelected: { color: colors.primary[500] },
  meterTypes: { flexDirection: 'row', gap: spacing[3] },
  meterTypeCard: { flex: 1, backgroundColor: colors.background.secondary, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border.default, paddingVertical: spacing[3], alignItems: 'center' },
  meterTypeCardSelected: { borderColor: colors.primary[500], backgroundColor: withOpacity(colors.primary[500], 0.06) },
  meterTypeText: { ...typography.labelLarge, color: colors.text.secondary },
  meterTypeTextSelected: { color: colors.primary[500] },
  input: { backgroundColor: colors.background.tertiary, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing[4], paddingVertical: 0, fontSize: 16, color: colors.text.primary, height: layout.inputHeight },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[4] },
  quickAmount: { backgroundColor: colors.background.secondary, borderRadius: borderRadius.lg, paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderWidth: 1, borderColor: colors.border.default },
  quickAmountSelected: { borderColor: colors.primary[500], backgroundColor: withOpacity(colors.primary[500], 0.12) },
  quickAmountText: { ...typography.labelLarge, color: colors.text.secondary },
  quickAmountTextSelected: { color: colors.primary[500] },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
});
