import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
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
    <SafeAreaView style={styles.container}>
      <Header showBack title="About" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={10} fill={colors.primary[500]} />
              <Path d="M8 12L11 15L16 9" stroke={colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={styles.appName}>Tanda</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.tagline}>Send money, pay bills, and more.</Text>
        </View>

        <Card style={styles.card}>
          {aboutItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity style={styles.item} onPress={() => handleItemPress(item.url)}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18L15 12L9 6" stroke={colors.text.tertiary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
              {index < aboutItems.length - 1 && <Divider spacing={0} />}
            </React.Fragment>
          ))}
        </Card>

        <Text style={styles.copyright}>
          2024 Tanda Inc. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[8] },
  logoSection: { alignItems: 'center', marginBottom: spacing[8] },
  logoContainer: { marginBottom: spacing[4] },
  appName: { ...typography.headlineLarge, color: colors.text.primary, marginBottom: spacing[1] },
  version: { ...typography.bodyMedium, color: colors.text.tertiary, marginBottom: spacing[2] },
  tagline: { ...typography.bodyMedium, color: colors.text.secondary, textAlign: 'center' },
  card: { padding: 0, overflow: 'hidden', marginBottom: spacing[6] },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4] },
  itemLabel: { ...typography.bodyLarge, color: colors.text.primary },
  copyright: { ...typography.bodySmall, color: colors.text.tertiary, textAlign: 'center' },
});
