import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '../../src/theme';
import { CustomTabBar } from '../../src/components/layout';

export default function MainLayout() {
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
