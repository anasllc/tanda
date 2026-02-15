import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../src/theme';

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="deposit" />
      <Stack.Screen name="deposit-bank" />
      <Stack.Screen name="deposit-card" />
      <Stack.Screen name="withdraw" />
      <Stack.Screen name="transactions" />
      <Stack.Screen name="transaction-detail" />
    </Stack>
  );
}
