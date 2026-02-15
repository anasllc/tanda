import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../src/theme';

export default function SendLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="amount" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="success" />
      <Stack.Screen name="claim" />
    </Stack>
  );
}
