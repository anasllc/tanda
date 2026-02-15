import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        contentStyle: { backgroundColor: colors.background.elevated },
      }}
    >
      <Stack.Screen name="verify-pin" />
      <Stack.Screen name="receipt" />
    </Stack>
  );
}
