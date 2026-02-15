import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, Avatar, Keypad } from '../../../src/components/ui';
import { formatCurrency } from '../../../src/utils/formatters';
import { useAuthStore } from '../../../src/stores';
import { useShakeAnimation } from '../../../src/hooks/useAnimations';

export default function AmountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ contactId: string; contactName: string; contactUsername?: string }>();
  const balance = useAuthStore((state) => state.balance);

  const [amount, setAmount] = useState('');
  const { animatedStyle: shakeStyle, shake } = useShakeAnimation();

  const numericAmount = parseFloat(amount) || 0;
  const isValidAmount = numericAmount > 0 && numericAmount <= balance;
  const isOverBalance = numericAmount > balance;

  const handleKeyPress = (key: string) => {
    if (amount.length < 10) {
      if (amount === '0' && key !== '.') {
        setAmount(key);
      } else {
        setAmount(amount + key);
      }
    }
  };

  const handleDelete = () => {
    setAmount(amount.slice(0, -1));
  };

  const handleContinue = () => {
    if (isOverBalance) {
      shake();
      return;
    }
    if (isValidAmount) {
      router.push({
        pathname: '/(main)/(send)/confirm',
        params: {
          contactId: params.contactId,
          contactName: params.contactName,
          contactUsername: params.contactUsername || '',
          amount: amount,
        },
      });
    }
  };

  const balancePercent = Math.min((numericAmount / balance) * 100, 100);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Enter Amount" />

      <View className="flex-1 items-center pt-6">
        <View className="items-center mb-8">
          <Avatar name={params.contactName || 'User'} size="medium" />
          <Text className="text-title-md font-inter-medium text-txt-primary mt-2">
            {params.contactName}
          </Text>
          {params.contactUsername && (
            <Text className="text-body-sm font-inter text-accent-500 mt-0.5">
              @{params.contactUsername}
            </Text>
          )}
        </View>

        <Animated.View className="flex-row items-start justify-center" style={shakeStyle}>
          <Text className="text-headline-md font-inter-bold text-accent-400 mt-2 mr-1">
            ₦
          </Text>
          <Text
            className={`text-amount font-inter-bold ${amount ? 'text-txt-primary' : 'text-txt-tertiary'}`}
            style={{ letterSpacing: -3 }}
          >
            {amount || '0'}
          </Text>
        </Animated.View>

        {/* Balance progress bar */}
        <View className="w-48 mt-4">
          <View className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
            <View
              className={`h-full rounded-full ${isOverBalance ? 'bg-error-main' : 'bg-accent-500'}`}
              style={{ width: `${balancePercent}%` }}
            />
          </View>
        </View>

        <Text className="text-body-md font-inter text-txt-tertiary mt-3">
          Available: {formatCurrency(balance)}
        </Text>

        {isOverBalance && (
          <Text className="text-body-md font-inter text-error-main mt-2">
            Insufficient balance
          </Text>
        )}
      </View>

      <View className="pb-8">
        <Keypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
        />

        <View className="px-5 mt-4">
          <Button
            title="Continue"
            onPress={handleContinue}
            fullWidth
            disabled={!isValidAmount}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
