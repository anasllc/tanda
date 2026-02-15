import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, NetworkBadge, PinInput, Keypad } from '../../../src/components/ui';
import { networks, airtimeQuickAmounts, NetworkProvider } from '../../../src/mock/services';
import { formatCurrency, lightHaptic, withOpacity } from '../../../src/utils';
import { useUIStore } from '../../../src/stores';
import { useBuyAirtime } from '../../../src/hooks/useBills';

export default function AirtimeScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const buyAirtime = useBuyAirtime();
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkProvider>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

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
    setShowPin(true);
  };

  const handlePinComplete = async (enteredPin: string) => {
    try {
      await buyAirtime.mutateAsync({
        phone: phoneNumber,
        network: selectedNetwork,
        amountLocal: parseFloat(amount),
        pin: enteredPin,
      });
      showToast({
        type: 'success',
        title: 'Airtime purchased successfully',
        message: `${formatCurrency(parseFloat(amount))} airtime for ${phoneNumber}`,
      });
      router.back();
    } catch (err: any) {
      if (err.code === 'INVALID_PIN') {
        setPinError(true);
        setPin('');
      } else {
        showToast({ type: 'error', title: 'Purchase failed', message: err.message });
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
            Purchasing {formatCurrency(parseFloat(amount))} airtime
          </Text>

          <View className="mb-4">
            <PinInput
              value={pin}
              onChange={setPin}
              error={pinError}
              disabled={buyAirtime.isPending}
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
          disabled={buyAirtime.isPending}
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
            <Header showBack title="Buy Airtime" />

            <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-4" showsVerticalScrollIndicator={false}>
              <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2 mt-4">Select Network</Text>
              <View className="flex-row gap-3">
                {networks.map((network) => (
                  <TouchableOpacity
                    key={network.id}
                    className={`flex-1 rounded-xl border p-3 items-center ${
                      selectedNetwork === network.id
                        ? 'border-accent-500'
                        : 'bg-bg-secondary border-border'
                    }`}
                    style={selectedNetwork === network.id ? { backgroundColor: withOpacity(colors.primary[500], 0.06) } : undefined}
                    onPress={() => handleNetworkSelect(network.id)}
                  >
                    <NetworkBadge network={network.id} showLabel={false} size="medium" />
                    <Text className="text-label-md font-inter-medium text-txt-primary mt-2">{network.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2 mt-4">Phone Number</Text>
              <TextInput
                className="bg-bg-tertiary rounded-xl border border-border px-4 py-0 text-[16px] text-txt-primary h-14"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="0812 345 6789"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="phone-pad"
                maxLength={11}
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
                {airtimeQuickAmounts.map((item) => (
                  <TouchableOpacity
                    key={item.amount}
                    className={`rounded-lg px-4 py-2 border ${
                      amount === item.amount.toString()
                        ? 'border-accent-500'
                        : 'bg-bg-secondary border-border'
                    }`}
                    style={amount === item.amount.toString() ? { backgroundColor: withOpacity(colors.primary[500], 0.12) } : undefined}
                    onPress={() => handleQuickAmount(item.amount)}
                  >
                    <Text className={`text-label-lg font-inter-medium ${
                      amount === item.amount.toString() ? 'text-accent-500' : 'text-txt-secondary'
                    }`}>
                      {formatCurrency(item.amount)}
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
