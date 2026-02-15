import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Divider } from '../../../src/components/ui';
import { lightHaptic } from '../../../src/utils/haptics';

const aboutItems = [
  { id: 'terms', label: 'Terms of Service', url: 'https://tanda.app/terms' },
  { id: 'privacy', label: 'Privacy Policy', url: 'https://tanda.app/privacy' },
  { id: 'licenses', label: 'Open Source Licenses', url: null },
];

export default function AboutScreen() {
  const handleItemPress = (url: string | null) => {
    lightHaptic();
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="About" />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-8">
        <View className="items-center mb-8">
          <View className="mb-4">
            <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={10} fill={colors.primary[500]} />
              <Path d="M8 12L11 15L16 9" stroke={colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text className="text-headline-lg font-inter-bold text-txt-primary mb-1">Tanda</Text>
          <Text className="text-body-md font-inter text-txt-tertiary mb-2">Version 1.0.0</Text>
          <Text className="text-body-md font-inter text-txt-secondary text-center">Send money, pay bills, and more.</Text>
        </View>

        <Card className="p-0 overflow-hidden mb-6">
          {aboutItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity className="flex-row items-center justify-between p-4" onPress={() => handleItemPress(item.url)}>
                <Text className="text-body-lg font-inter text-txt-primary">{item.label}</Text>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18L15 12L9 6" stroke={colors.text.tertiary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
              {index < aboutItems.length - 1 && <Divider spacing={0} />}
            </React.Fragment>
          ))}
        </Card>

        <Text className="text-body-sm font-inter text-txt-tertiary text-center">
          2024 Tanda Inc. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
