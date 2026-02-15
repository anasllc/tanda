import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { usePrivy } from '@privy-io/expo';
import { colors } from '../../src/theme';
import { CustomTabBar } from '../../src/components/layout';

export default function MainLayout() {
  const { isReady, user } = usePrivy();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050506' }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="(send)" />
      <Tabs.Screen name="(services)" />
      <Tabs.Screen name="(wallet)" />
      <Tabs.Screen name="(profile)" />
    </Tabs>
  );
}
