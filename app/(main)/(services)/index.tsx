import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius, layout } from '../../../src/theme';
import { lightHaptic } from '../../../src/utils/haptics';
import { useUIStore } from '../../../src/stores';

const services = [
  { id: 'airtime', label: 'Airtime', icon: 'phone', color: colors.primary[500], route: '/(main)/(services)/airtime' },
  { id: 'data', label: 'Data', icon: 'wifi', color: colors.info.main, route: '/(main)/(services)/data' },
  { id: 'electricity', label: 'Electricity', icon: 'zap', color: colors.warning.main, route: '/(main)/(services)/electricity' },
  { id: 'cable', label: 'Cable TV', icon: 'tv', color: colors.error.main, route: '/(main)/(services)/cable' },
];

const getIcon = (icon: string, color: string) => {
  const props = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none' };
  switch (icon) {
    case 'phone':
      return <Svg {...props}><Path d="M22 16.92V19.92C22 20.48 21.56 20.96 21 20.99C14.45 21.51 8.51 18.33 5.17 13.17C1.83 8.01 1.28 1.59 3.01 -3.98M16 3H21V8M22 2L16 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
    case 'wifi':
      return <Svg {...props}><Path d="M5 12.55C7.61 10.27 10.69 9 14 9C17.31 9 20.39 10.27 23 12.55M8.53 16.11C10.07 14.83 11.97 14 14 14C16.03 14 17.93 14.83 19.47 16.11M14 19H14.01" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
    case 'zap':
      return <Svg {...props}><Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
    case 'tv':
      return <Svg {...props}><Rect x={2} y={7} width={20} height={15} rx={2} stroke={color} strokeWidth={2} /><Path d="M17 2L12 7L7 2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
    case 'globe':
      return <Svg {...props}><Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} /><Path d="M2 12H22M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z" stroke={color} strokeWidth={2} /></Svg>;
    case 'dice':
      return <Svg {...props}><Rect x={3} y={3} width={18} height={18} rx={2} stroke={color} strokeWidth={2} /><Circle cx={8} cy={8} r={1.5} fill={color} /><Circle cx={16} cy={8} r={1.5} fill={color} /><Circle cx={8} cy={16} r={1.5} fill={color} /><Circle cx={16} cy={16} r={1.5} fill={color} /><Circle cx={12} cy={12} r={1.5} fill={color} /></Svg>;
    case 'book':
      return <Svg {...props}><Path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20M4 19.5C4 20.8807 5.11929 22 6.5 22H20V2H6.5C5.11929 2 4 3.11929 4 4.5V19.5Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
    default:
      return <Svg {...props}><Circle cx={12} cy={12} r={1} fill={color} /><Circle cx={12} cy={5} r={1} fill={color} /><Circle cx={12} cy={19} r={1} fill={color} /></Svg>;
  }
};

export default function ServicesScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);

  const handleServicePress = (service: typeof services[0]) => {
    lightHaptic();
    if (service.route) {
      router.push(service.route as any);
    } else {
      showToast({ type: 'info', title: `${service.label} coming soon` });
    }
  };

  const handleBillSplit = () => {
    lightHaptic();
    router.push('/(main)/(services)/bill-split' as any);
  };

  const handleCreatePool = () => {
    lightHaptic();
    router.push('/(main)/(services)/pool-create' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Bills</Text>
        <Text style={styles.subtitle}>Pay bills and buy services instantly</Text>

        <View style={styles.grid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => handleServicePress(service)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: service.color + '20' }]}>
                {getIcon(service.icon, service.color)}
              </View>
              <Text style={styles.serviceLabel}>{service.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.socialSection}>
          <Text style={styles.sectionTitle}>Social</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} onPress={handleBillSplit} activeOpacity={0.7}>
              <View style={[styles.socialIconContainer, { backgroundColor: colors.primary[500] + '20' }]}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M16 3H21V8M21 3L13 11M8 21H3V16M3 21L11 13" stroke={colors.primary[500]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <View style={styles.socialTextContainer}>
                <Text style={styles.socialButtonLabel}>Split a Bill</Text>
                <Text style={styles.socialButtonDesc}>Share expenses with friends</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={handleCreatePool} activeOpacity={0.7}>
              <View style={[styles.socialIconContainer, { backgroundColor: colors.success.main + '20' }]}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Circle cx={9} cy={7} r={4} stroke={colors.success.main} strokeWidth={2} />
                  <Path d="M3 21V19C3 16.79 4.79 15 7 15H11C13.21 15 15 16.79 15 19V21" stroke={colors.success.main} strokeWidth={2} />
                  <Path d="M19 8V14M16 11H22" stroke={colors.success.main} strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </View>
              <View style={styles.socialTextContainer}>
                <Text style={styles.socialButtonLabel}>Create Pool</Text>
                <Text style={styles.socialButtonDesc}>Collect money together</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[2] },
  title: { ...typography.headlineLarge, color: colors.text.primary, marginBottom: spacing[1] },
  subtitle: { ...typography.bodyLarge, color: colors.text.secondary, marginBottom: spacing[6] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4] },
  serviceCard: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: spacing[6],
  },
  iconContainer: { width: 64, height: 64, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[3] },
  serviceLabel: { ...typography.titleSmall, color: colors.text.primary, textAlign: 'center' },
  socialSection: { marginTop: spacing[8] },
  sectionTitle: { ...typography.titleMedium, color: colors.text.primary, marginBottom: spacing[4] },
  socialButtons: { gap: spacing[3] },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[4],
  },
  socialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  socialTextContainer: { flex: 1 },
  socialButtonLabel: { ...typography.titleSmall, color: colors.text.primary, marginBottom: 2 },
  socialButtonDesc: { ...typography.bodySmall, color: colors.text.secondary },
  bottomPadding: { height: layout.tabBarHeight + spacing[4] },
});
