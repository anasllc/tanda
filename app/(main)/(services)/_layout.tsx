import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../src/theme';

export default function ServicesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background.primary } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="airtime" />
      <Stack.Screen name="data" />
      <Stack.Screen name="electricity" />
      <Stack.Screen name="cable" />
      <Stack.Screen name="bill-split" />
      <Stack.Screen name="bill-split-detail" />
      <Stack.Screen name="pool-create" />
      <Stack.Screen name="pool-detail" />
    </Stack>
  );
}
