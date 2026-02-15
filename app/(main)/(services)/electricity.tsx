import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, PinInput, Keypad } from '../../../src/components/ui';
import { electricityProviders } from '../../../src/mock/services';
import { formatCurrency } from '../../../src/utils/formatters';
import { lightHaptic, withOpacity } from '../../../src/utils';
import { useUIStore } from '../../../src/stores';
import { usePayElectricity } from '../../../src/hooks/useBills';

export default function ElectricityScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const payElectricity = usePayElectricity();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleProviderSelect = (providerId: string) => {
    lightHaptic();
    setSelectedProvider(providerId);
  };

  const isValid = selectedProvider && meterNumber.length >= 10 && parseFloat(amount) > 0;

  const handleContinue = () => {
    if (!isValid) return;
    setShowPin(true);
  };

  const handlePinComplete = async (enteredPin: string) => {
    if (!selectedProvider) return;
    try {
      await payElectricity.mutateAsync({
        meterNumber,
        provider: selectedProvider,
        amountLocal: parseFloat(amount),
        meterType,
        pin: enteredPin,
      });
      const provider = electricityProviders.find(p => p.id === selectedProvider);
      showToast({
        type: 'success',
        title: 'Payment successful',
        message: `${formatCurrency(parseFloat(amount))} for meter ${meterNumber} (${provider?.name})`,
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
            Paying {formatCurrency(parseFloat(amount))} for electricity
          </Text>

          <View className="mb-4">
            <PinInput
              value={pin}
              onChange={setPin}
              error={pinError}
              disabled={payElectricity.isPending}
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
          disabled={payElectricity.isPending}
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
            <Header showBack title="Electricity" />

            <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-4" showsVerticalScrollIndicator={false}>
              <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2 mt-4">Select Provider</Text>
              <View className="flex-row flex-wrap gap-2">
                {electricityProviders.map((provider) => (
                  <TouchableOpacity
                    key={provider.id}
                    className={`rounded-lg border px-3 py-2 ${
                      selectedProvider === provider.id
                        ? 'border-accent-500'
                        : 'bg-bg-secondary border-border'
                    }`}
                    style={selectedProvider === provider.id ? { backgroundColor: withOpacity(colors.primary[500], 0.06) } : undefined}
                    onPress={() => handleProviderSelect(provider.id)}
                  >
                    <Text className={`text-label-md font-inter-medium ${
                      selectedProvider === provider.id ? 'text-accent-500' : 'text-txt-primary'
                    }`}>{provider.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2 mt-4">Meter Type</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 rounded-xl border py-3 items-center ${
                    meterType === 'prepaid'
                      ? 'border-accent-500'
                      : 'bg-bg-secondary border-border'
                  }`}
                  style={meterType === 'prepaid' ? { backgroundColor: withOpacity(colors.primary[500], 0.06) } : undefined}
                  onPress={() => { lightHaptic(); setMeterType('prepaid'); }}
                >
                  <Text className={`text-label-lg font-inter-medium ${
                    meterType === 'prepaid' ? 'text-accent-500' : 'text-txt-secondary'
                  }`}>Prepaid</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 rounded-xl border py-3 items-center ${
                    meterType === 'postpaid'
                      ? 'border-accent-500'
                      : 'bg-bg-secondary border-border'
                  }`}
                  style={meterType === 'postpaid' ? { backgroundColor: withOpacity(colors.primary[500], 0.06) } : undefined}
                  onPress={() => { lightHaptic(); setMeterType('postpaid'); }}
                >
                  <Text className={`text-label-lg font-inter-medium ${
                    meterType === 'postpaid' ? 'text-accent-500' : 'text-txt-secondary'
                  }`}>Postpaid</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2 mt-4">Meter Number</Text>
              <TextInput
                className="bg-bg-tertiary rounded-xl border border-border px-4 py-0 text-[16px] text-txt-primary h-14"
                value={meterNumber}
                onChangeText={setMeterNumber}
                placeholder="Enter meter number"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={13}
              />

              <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2 mt-4">Amount</Text>
              <TextInput
                className="bg-bg-tertiary rounded-xl border border-border px-4 py-0 text-[16px] text-txt-primary h-14"
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
              />

              <View className="flex-row flex-wrap gap-2 mt-4">
                {[1000, 2000, 5000, 10000].map((value) => (
                  <TouchableOpacity
                    key={value}
                    className={`rounded-lg px-4 py-2 border ${
                      amount === value.toString()
                        ? 'border-accent-500'
                        : 'bg-bg-secondary border-border'
                    }`}
                    style={amount === value.toString() ? { backgroundColor: withOpacity(colors.primary[500], 0.12) } : undefined}
                    onPress={() => { lightHaptic(); setAmount(value.toString()); }}
                  >
                    <Text className={`text-label-lg font-inter-medium ${
                      amount === value.toString() ? 'text-accent-500' : 'text-txt-secondary'
                    }`}>
                      {formatCurrency(value)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
