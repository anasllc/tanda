import React, { useState } from 'react';
import { View, Text, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, Avatar, Card, PinInput, Keypad } from '../../../src/components/ui';
import { formatCurrency } from '../../../src/utils/formatters';
import { useSendToRegistered } from '../../../src/hooks/useSendMoney';
import { useUIStore } from '../../../src/stores';

export default function ConfirmScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const sendMoney = useSendToRegistered();
  const params = useLocalSearchParams<{
    contactId: string;
    contactName: string;
    contactUsername: string;
    amount: string;
  }>();

  const [note, setNote] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const amount = parseFloat(params.amount || '0');
  const fee = 0; // Free transfers

  const handleConfirm = () => {
    setShowPin(true);
  };

  const handlePinComplete = async (enteredPin: string) => {
    try {
      const result = await sendMoney.mutateAsync({
        recipient: params.contactId,
        amountUsdc: amount,
        memo: note || undefined,
        pin: enteredPin,
      });

      router.replace({
        pathname: '/(main)/(send)/success',
        params: {
          contactName: params.contactName,
          amount: params.amount,
          transactionId: result.transaction_id,
          reference: result.reference,
        },
      });
    } catch (err: any) {
      if (err.code === 'INVALID_PIN') {
        setPinError(true);
        setPin('');
      } else {
        showToast({ type: 'error', title: 'Transfer failed', message: err.message });
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
            Sending {formatCurrency(amount)} to {params.contactName}
          </Text>

          <View className="mb-4">
            <PinInput
              value={pin}
              onChange={setPin}
              error={pinError}
              disabled={sendMoney.isPending}
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
          disabled={sendMoney.isPending}
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
            <Header showBack title="Confirm Transfer" />

            <View className="flex-1 px-5 pt-4">
              <Card className="mb-6">
                <View className="flex-row items-center mb-6">
                  <Avatar name={params.contactName || 'User'} size="large" />
                  <View className="ml-4">
                    <Text className="text-title-lg font-inter-semibold text-txt-primary">
                      {params.contactName}
                    </Text>
                    {params.contactUsername && (
                      <Text className="text-body-md font-inter text-accent-500 mt-0.5">
                        @{params.contactUsername}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="flex-row justify-between mb-3">
                  <Text className="text-body-lg font-inter text-txt-secondary">Amount</Text>
                  <Text className="text-body-lg font-inter-semibold text-txt-primary">
                    {formatCurrency(amount)}
                  </Text>
                </View>

                <View className="flex-row justify-between mb-4">
                  <Text className="text-body-lg font-inter text-txt-secondary">Fee</Text>
                  <Text className="text-body-lg font-inter text-success-main">Free</Text>
                </View>

                <View className="h-px bg-border mb-4" />

                <View className="flex-row justify-between">
                  <Text className="text-title-md font-inter-medium text-txt-primary">Total</Text>
                  <Text className="text-title-lg font-inter-bold text-txt-primary">
                    {formatCurrency(amount + fee)}
                  </Text>
                </View>
              </Card>

              <View className="mb-4">
                <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2">
                  Add a note (optional)
                </Text>
                <TextInput
                  className="bg-bg-tertiary rounded-xl border border-border p-4 min-h-[100px] text-body-lg font-inter text-txt-primary"
                  style={{ textAlignVertical: 'top' }}
                  value={note}
                  onChangeText={setNote}
                  placeholder="What's this for?"
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  maxLength={100}
                />
              </View>
            </View>

            <View className="px-5 pb-8">
              <Button
                title="Confirm & Send"
                onPress={handleConfirm}
                fullWidth
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
