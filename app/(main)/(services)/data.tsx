import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, layout } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, NetworkBadge } from '../../../src/components/ui';
import { networks, dataPlans, NetworkProvider } from '../../../src/mock/services';
import { formatCurrency } from '../../../src/utils/formatters';
import { lightHaptic, withOpacity } from '../../../src/utils';
import { useUIStore } from '../../../src/stores';

export default function DataScreen() {
  const showToast = useUIStore((state) => state.showToast);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkProvider>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<typeof dataPlans[0] | null>(null);

  const handleNetworkSelect = (network: NetworkProvider) => {
    lightHaptic();
    setSelectedNetwork(network);
    setSelectedPlan(null);
  };

  const handlePlanSelect = (plan: typeof dataPlans[0]) => {
    lightHaptic();
    setSelectedPlan(plan);
  };

  const networkPlans = dataPlans.filter(plan => plan.network === selectedNetwork);
  const isValid = phoneNumber.length >= 10 && selectedPlan !== null;

  const handleContinue = () => {
    if (!isValid || !selectedPlan) return;
    showToast({
      type: 'success',
      title: `Purchasing ${selectedPlan.name} for ${phoneNumber}`
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
            <Header showBack title="Buy Data" />

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

              <Text style={styles.label}>Select Plan</Text>
              <View style={styles.plans}>
                {networkPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[styles.planCard, selectedPlan?.id === plan.id && styles.planCardSelected]}
                    onPress={() => handlePlanSelect(plan)}
                  >
                    <Text style={[styles.planName, selectedPlan?.id === plan.id && styles.planNameSelected]}>{plan.name}</Text>
                    <Text style={[styles.planValidity, selectedPlan?.id === plan.id && styles.planValiditySelected]}>{plan.validity}</Text>
                    <Text style={[styles.planPrice, selectedPlan?.id === plan.id && styles.planPriceSelected]}>{formatCurrency(plan.price)}</Text>
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
  plans: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  planCard: { width: '47%', backgroundColor: colors.background.secondary, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border.default, padding: spacing[4], alignItems: 'center' },
  planCardSelected: { borderColor: colors.primary[500], backgroundColor: withOpacity(colors.primary[500], 0.06) },
  planName: { ...typography.titleSmall, color: colors.text.primary, marginBottom: spacing[1] },
  planNameSelected: { color: colors.primary[500] },
  planValidity: { ...typography.bodySmall, color: colors.text.tertiary, marginBottom: spacing[2] },
  planValiditySelected: { color: colors.primary[400] },
  planPrice: { ...typography.titleMedium, color: colors.text.primary },
  planPriceSelected: { color: colors.primary[500] },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
});
