import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Divider } from '../../../src/components/ui';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';

const helpItems = [
  { id: 'faq', label: 'FAQs', icon: 'help', description: 'Find answers to common questions' },
  { id: 'chat', label: 'Live Chat', icon: 'chat', description: 'Chat with our support team' },
  { id: 'email', label: 'Email Support', icon: 'mail', description: 'support@tanda.app' },
  { id: 'call', label: 'Call Us', icon: 'phone', description: '+234 800 123 4567' },
];

const getIcon = (icon: string) => {
  const props = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' };
  const stroke = colors.primary[500];
  switch (icon) {
    case 'help':
      return <Svg {...props}><Circle cx={12} cy={12} r={10} stroke={stroke} strokeWidth={2} /><Path d="M9 9C9 7.34 10.34 6 12 6C13.66 6 15 7.34 15 9C15 10.31 14.17 11.42 13 11.83V14M12 17H12.01" stroke={stroke} strokeWidth={2} strokeLinecap="round" /></Svg>;
    case 'chat':
      return <Svg {...props}><Path d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
    case 'mail':
      return <Svg {...props}><Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={stroke} strokeWidth={2} /><Path d="M22 6L12 13L2 6" stroke={stroke} strokeWidth={2} strokeLinecap="round" /></Svg>;
    case 'phone':
      return <Svg {...props}><Path d="M22 16.92V19.92C22 20.48 21.56 20.96 21 20.99C17.81 21.26 14.74 20.59 12 19.09C9.26 17.59 6.91 15.24 5.41 12.5C3.91 9.76 3.24 6.69 3.51 3.5C3.54 2.94 4.02 2.5 4.58 2.5H7.58C8.1 2.5 8.54 2.89 8.59 3.41C8.69 4.48 8.94 5.53 9.32 6.53C9.52 7.04 9.4 7.62 9 8L7.35 9.65C8.65 11.93 10.5 13.79 12.78 15.09L14.43 13.44C14.81 13.06 15.39 12.94 15.9 13.14C16.9 13.52 17.95 13.77 19.02 13.87C19.54 13.92 19.93 14.36 19.93 14.88V17.88C19.93 17.88 22 16.92 22 16.92Z" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
    default:
      return <Svg {...props}><Circle cx={12} cy={12} r={8} stroke={stroke} strokeWidth={2} /></Svg>;
  }
};

export default function HelpScreen() {
  const showToast = useUIStore((state) => state.showToast);

  const handleItemPress = (id: string) => {
    lightHaptic();
    switch (id) {
      case 'faq':
        showToast({ type: 'info', title: 'FAQs coming soon' });
        break;
      case 'chat':
        showToast({ type: 'info', title: 'Live chat coming soon' });
        break;
      case 'email':
        Linking.openURL('mailto:support@tanda.app');
        break;
      case 'call':
        Linking.openURL('tel:+2348001234567');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Help & Support" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>How can we help you?</Text>

        <Card style={styles.card}>
          {helpItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity style={styles.item} onPress={() => handleItemPress(item.id)}>
                <View style={styles.iconContainer}>
                  {getIcon(item.icon)}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18L15 12L9 6" stroke={colors.text.tertiary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
              {index < helpItems.length - 1 && <Divider spacing={0} />}
            </React.Fragment>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  subtitle: { ...typography.bodyLarge, color: colors.text.secondary, marginBottom: spacing[6] },
  card: { padding: 0, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', padding: spacing[4] },
  iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary[500] + '15', alignItems: 'center', justifyContent: 'center', marginRight: spacing[4] },
  itemInfo: { flex: 1 },
  itemLabel: { ...typography.bodyLarge, color: colors.text.primary },
  itemDescription: { ...typography.bodySmall, color: colors.text.tertiary, marginTop: 2 },
});
