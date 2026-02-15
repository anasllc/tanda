import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../src/theme';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background.primary } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="friends" />
      <Stack.Screen name="add-friend" />
      <Stack.Screen name="bank-accounts" />
      <Stack.Screen name="add-bank" />
      <Stack.Screen name="security" />
      <Stack.Screen name="limits" />
      <Stack.Screen name="request-money" />
    </Stack>
  );
}
