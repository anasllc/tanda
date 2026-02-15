import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '../../../src/components/layout';
import { Button, Card, Avatar, PinInput, Keypad } from '../../../src/components/ui';
import { useTransactionDetail } from '../../../src/hooks/useTransactions';
import { api } from '../../../src/lib/api';

export default function ClaimScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'preview' | 'pin'>('preview');
  const [pin, setPin] = useState('');
  const [claiming, setClaiming] = useState(false);

  const { data: transaction, isLoading } = useTransactionDetail(id);

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === 6) {
        handleClaimPayment(newPin);
      }
    }
  };

  const handleClaimPayment = async (enteredPin: string) => {
    if (!id) return;
    setClaiming(true);
    try {
      await api.claimPayment(id);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      router.push('/(main)/(send)/success');
    } catch (error) {
      setPin('');
      setClaiming(false);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleClaim = () => {
    setStep('pin');
  };

  if (isLoading || !transaction) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Claim Payment" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'pin') {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Enter PIN" />
        <View className="flex-1 items-center pt-8">
          <Text className="text-headline-md font-inter-semibold text-txt-primary mb-2">
            Enter PIN to claim
          </Text>
          <Text className="text-body-md font-inter text-txt-secondary mb-8">
            Verify your identity
          </Text>
          <View className="mb-4">
            <PinInput value={pin} onChange={setPin} />
          </View>
        </View>
        <Keypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Claim Payment" />
      <View className="flex-1 px-5 pt-4">
        <Card className="items-center py-8">
          <View className="items-center mb-4">
            <Avatar name={transaction.recipient?.name || transaction.sender?.name || transaction.description} size="large" />
            <Text className="text-title-lg font-inter-semibold text-txt-primary mt-3">
              {transaction.recipient?.name || transaction.sender?.name || transaction.description}
            </Text>
            <Text className="text-body-md font-inter text-txt-secondary">sent you</Text>
          </View>
          <Text className="text-display-lg font-inter-bold text-accent-400 mb-4">
            ${Math.abs(transaction.amount).toFixed(2)}
          </Text>
          {transaction.description && (
            <View className="items-center">
              <Text className="text-label-sm font-inter text-txt-tertiary mb-1">Note</Text>
              <Text className="text-body-md font-inter text-txt-secondary">
                {transaction.description}
              </Text>
            </View>
          )}
        </Card>

        <View className="bg-bg-secondary rounded-lg p-4 mt-4">
          <Text className="text-body-sm font-inter text-txt-tertiary text-center">
            This payment will be added to your Tanda wallet balance once claimed.
          </Text>
        </View>
      </View>

      <View className="px-5 pb-6">
        <Button title="Claim Payment" onPress={handleClaim} fullWidth />
      </View>
    </SafeAreaView>
  );
}
