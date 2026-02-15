import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, layout } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button } from '../../../src/components/ui';
import { cableProviders, cablePlans } from '../../../src/mock/services';
import { formatCurrency } from '../../../src/utils/formatters';
import { lightHaptic, withOpacity } from '../../../src/utils';
import { useUIStore } from '../../../src/stores';

export default function CableScreen() {
  const showToast = useUIStore((state) => state.showToast);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<typeof cablePlans[0] | null>(null);

  const handleProviderSelect = (providerId: string) => {
    lightHaptic();
    setSelectedProvider(providerId);
    setSelectedPlan(null);
  };

  const handlePlanSelect = (plan: typeof cablePlans[0]) => {
    lightHaptic();
    setSelectedPlan(plan);
  };

  const providerPlans = cablePlans.filter(plan => plan.provider === selectedProvider);
  const isValid = selectedProvider && smartCardNumber.length >= 10 && selectedPlan !== null;

  const handleContinue = () => {
    if (!isValid || !selectedPlan) return;
    const provider = cableProviders.find(p => p.id === selectedProvider);
    showToast({
      type: 'success',
      title: `Subscribing to ${selectedPlan.name}`,
      message: `${provider?.name} - ${formatCurrency(selectedPlan.price)}`
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
            <Header showBack title="Cable TV" />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Select Provider</Text>
              <View style={styles.providers}>
                {cableProviders.map((provider) => (
                  <TouchableOpacity
                    key={provider.id}
                    style={[styles.providerCard, selectedProvider === provider.id && styles.providerCardSelected]}
                    onPress={() => handleProviderSelect(provider.id)}
                  >
                    <Text style={[styles.providerName, selectedProvider === provider.id && styles.providerNameSelected]}>{provider.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Smart Card / IUC Number</Text>
              <TextInput
                style={styles.input}
                value={smartCardNumber}
                onChangeText={setSmartCardNumber}
                placeholder="Enter smart card number"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={13}
              />

              {selectedProvider && (
                <>
                  <Text style={styles.label}>Select Plan</Text>
                  <View style={styles.plans}>
                    {providerPlans.map((plan) => (
                      <TouchableOpacity
                        key={plan.id}
                        style={[styles.planCard, selectedPlan?.id === plan.id && styles.planCardSelected]}
                        onPress={() => handlePlanSelect(plan)}
                      >
                        <Text style={[styles.planName, selectedPlan?.id === plan.id && styles.planNameSelected]}>{plan.name}</Text>
                        <Text style={[styles.planChannels, selectedPlan?.id === plan.id && styles.planChannelsSelected]}>{plan.channels} Channels</Text>
                        <Text style={[styles.planPrice, selectedPlan?.id === plan.id && styles.planPriceSelected]}>{formatCurrency(plan.price)}/mo</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
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
  providerCard: { backgroundColor: colors.background.secondary, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  providerCardSelected: { borderColor: colors.primary[500], backgroundColor: withOpacity(colors.primary[500], 0.06) },
  providerName: { ...typography.labelLarge, color: colors.text.primary },
  providerNameSelected: { color: colors.primary[500] },
  input: { backgroundColor: colors.background.tertiary, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing[4], paddingVertical: 0, fontSize: 16, color: colors.text.primary, height: layout.inputHeight },
  plans: { gap: spacing[3] },
  planCard: { backgroundColor: colors.background.secondary, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border.default, padding: spacing[4] },
  planCardSelected: { borderColor: colors.primary[500], backgroundColor: withOpacity(colors.primary[500], 0.06) },
  planName: { ...typography.titleSmall, color: colors.text.primary, marginBottom: spacing[1] },
  planNameSelected: { color: colors.primary[500] },
  planChannels: { ...typography.bodySmall, color: colors.text.tertiary, marginBottom: spacing[2] },
  planChannelsSelected: { color: colors.primary[400] },
  planPrice: { ...typography.titleMedium, color: colors.text.primary },
  planPriceSelected: { color: colors.primary[500] },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
});
