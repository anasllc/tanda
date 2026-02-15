import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, PinInput, Keypad } from '../../../src/components/ui';
import { cableProviders, cablePlans } from '../../../src/mock/services';
import { formatCurrency } from '../../../src/utils/formatters';
import { lightHaptic, withOpacity } from '../../../src/utils';
import { useUIStore } from '../../../src/stores';
import { usePayCable } from '../../../src/hooks/useBills';

export default function CableScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const payCable = usePayCable();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<typeof cablePlans[0] | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

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
    setShowPin(true);
  };

  const handlePinComplete = async (enteredPin: string) => {
    if (!selectedPlan || !selectedProvider) return;
    try {
      await payCable.mutateAsync({
        smartcardNumber: smartCardNumber,
        provider: selectedProvider,
        packageCode: selectedPlan.id,
        amountLocal: selectedPlan.price,
        pin: enteredPin,
      });
      const provider = cableProviders.find(p => p.id === selectedProvider);
      showToast({
        type: 'success',
        title: 'Subscription successful',
        message: `${selectedPlan.name} - ${provider?.name}`,
      });
      router.back();
    } catch (err: any) {
      if (err.code === 'INVALID_PIN') {
        setPinError(true);
        setPin('');
      } else {
        showToast({ type: 'error', title: 'Payment failed', message: err.message });
        setShowPin(false);
        setPin('');
      }
    }
  };

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      const newPin = pin + key;
      setPin(newPin);
      setPinError(false);
      if (newPin.length === 6) {
        handlePinComplete(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setPinError(false);
  };

  if (showPin) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Enter PIN" onBack={() => { setShowPin(false); setPin(''); }} />

        <View className="flex-1 items-center pt-8">
          <Text className="text-headline-sm font-inter-semibold text-txt-primary mb-2">
            Enter your PIN to confirm
          </Text>
          <Text className="text-body-md font-inter text-txt-secondary mb-8">
            Subscribing to {selectedPlan?.name} - {formatCurrency(selectedPlan?.price ?? 0)}
          </Text>

          <View className="mb-4">
            <PinInput
              value={pin}
              onChange={setPin}
              error={pinError}
              disabled={payCable.isPending}
            />
          </View>

          {pinError && (
            <Text className="text-body-md font-inter text-error-main">
              Incorrect PIN. Please try again.
            </Text>
          )}
        </View>

        <Keypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          disabled={payCable.isPending}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <Header showBack title="Cable TV" />

            <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-4" showsVerticalScrollIndicator={false}>
              <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2 mt-4">Select Provider</Text>
              <View className="flex-row flex-wrap gap-2">
                {cableProviders.map((provider) => (
                  <TouchableOpacity
                    key={provider.id}
                    className={`rounded-lg border px-4 py-3 ${
                      selectedProvider === provider.id
                        ? 'border-accent-500'
                        : 'bg-bg-secondary border-border'
                    }`}
                    style={selectedProvider === provider.id ? { backgroundColor: withOpacity(colors.primary[500], 0.06) } : undefined}
                    onPress={() => handleProviderSelect(provider.id)}
                  >
                    <Text className={`text-label-lg font-inter-medium ${
                      selectedProvider === provider.id ? 'text-accent-500' : 'text-txt-primary'
                    }`}>{provider.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2 mt-4">Smart Card / IUC Number</Text>
              <TextInput
                className="bg-bg-tertiary rounded-xl border border-border px-4 py-0 text-[16px] text-txt-primary h-14"
                value={smartCardNumber}
                onChangeText={setSmartCardNumber}
                placeholder="Enter smart card number"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={13}
              />

              {selectedProvider && (
                <>
                  <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2 mt-4">Select Plan</Text>
                  <View className="gap-3">
                    {providerPlans.map((plan) => (
                      <TouchableOpacity
                        key={plan.id}
                        className={`rounded-xl border p-4 ${
                          selectedPlan?.id === plan.id
                            ? 'border-accent-500'
                            : 'bg-bg-secondary border-border'
                        }`}
                        style={selectedPlan?.id === plan.id ? { backgroundColor: withOpacity(colors.primary[500], 0.06) } : undefined}
                        onPress={() => handlePlanSelect(plan)}
                      >
                        <Text className={`text-title-sm font-inter-medium mb-1 ${
                          selectedPlan?.id === plan.id ? 'text-accent-500' : 'text-txt-primary'
                        }`}>{plan.name}</Text>
                        <Text className={`text-body-sm font-inter mb-2 ${
                          selectedPlan?.id === plan.id ? 'text-accent-400' : 'text-txt-tertiary'
                        }`}>{plan.channels} Channels</Text>
                        <Text className={`text-title-md font-inter-medium ${
                          selectedPlan?.id === plan.id ? 'text-accent-500' : 'text-txt-primary'
                        }`}>{formatCurrency(plan.price)}/mo</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <View className="px-5 pb-8">
              <Button title="Continue" onPress={handleContinue} fullWidth disabled={!isValid} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
