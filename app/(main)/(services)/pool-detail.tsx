import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Avatar, Badge, Button, ProgressBar } from '../../../src/components/ui';
import { pools } from '../../../src/mock/pools';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';
import Svg, { Path } from 'react-native-svg';

export default function PoolDetailScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const pool = pools[0];
  const progress = pool.currentAmount / pool.targetAmount;

  const [showContribute, setShowContribute] = useState(false);

  const handleSharePool = async () => {
    lightHaptic();
    const poolLink = `https://tanda.app/pool/${pool.id}`;
    const message = `Help us reach our goal for "${pool.title}"! We've raised $${pool.currentAmount.toFixed(2)} of $${pool.targetAmount.toFixed(2)}. Contribute here: ${poolLink}`;

    try {
      await Share.share({
        message,
        title: 'Share Pool',
      });
    } catch (error) {
      await Clipboard.setStringAsync(poolLink);
      showToast({ type: 'success', title: 'Pool link copied!' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Pool Details" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.headerCard}>
          <View style={styles.poolIcon}>
            <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
              <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={colors.primary[400]} strokeWidth={1.5} strokeLinecap="round" />
              <Path d="M9 11a4 4 0 100-8 4 4 0 000 8z" stroke={colors.primary[400]} strokeWidth={1.5} />
              <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={colors.primary[400]} strokeWidth={1.5} strokeLinecap="round" />
            </Svg>
          </View>
          <Text style={styles.poolTitle}>{pool.title}</Text>
          {pool.description && <Text style={styles.poolDescription}>{pool.description}</Text>}

          <View style={styles.amountSection}>
            <Text style={styles.currentAmount}>${pool.currentAmount.toFixed(2)}</Text>
            <Text style={styles.targetAmount}>of ${pool.targetAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.progressSection}>
            <ProgressBar progress={progress} height={8} />
            <Text style={styles.progressText}>{Math.round(progress * 100)}% collected</Text>
          </View>

          {pool.deadline && (
            <View style={styles.deadlineRow}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.text.tertiary} strokeWidth={1.5} strokeLinecap="round" />
              </Svg>
              <Text style={styles.deadlineText}>Ends {pool.deadline}</Text>
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Contributors ({pool.contributors.length})</Text>

        {pool.contributors.map(contributor => (
          <Card key={contributor.id} style={styles.contributorCard}>
            <View style={styles.contributorRow}>
              <Avatar name={contributor.name} size="md" />
              <View style={styles.contributorInfo}>
                <Text style={styles.contributorName}>{contributor.name}</Text>
                <Text style={styles.contributorDate}>Contributed on {contributor.date}</Text>
              </View>
              <Text style={styles.contributorAmount}>${contributor.amount.toFixed(2)}</Text>
            </View>
          </Card>
        ))}

        <View style={styles.actionsSection}>
          <Button
            title="Share Pool"
            variant="secondary"
            fullWidth
            onPress={handleSharePool}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Contribute"
          onPress={() => router.push('/(main)/(send)/amount')}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[6] },
  headerCard: { alignItems: 'center', marginBottom: spacing[6] },
  poolIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary[500] + '20', alignItems: 'center', justifyContent: 'center', marginBottom: spacing[3] },
  poolTitle: { ...typography.headlineSmall, color: colors.text.primary, marginBottom: spacing[1] },
  poolDescription: { ...typography.bodyMedium, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing[4] },
  amountSection: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing[3] },
  currentAmount: { ...typography.displayMedium, color: colors.primary[400] },
  targetAmount: { ...typography.bodyLarge, color: colors.text.tertiary, marginLeft: spacing[2] },
  progressSection: { width: '100%', marginBottom: spacing[3] },
  progressText: { ...typography.bodySmall, color: colors.text.secondary, textAlign: 'center', marginTop: spacing[2] },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  deadlineText: { ...typography.bodySmall, color: colors.text.tertiary },
  sectionTitle: { ...typography.titleSmall, color: colors.text.primary, marginBottom: spacing[3] },
  contributorCard: { marginBottom: spacing[3] },
  contributorRow: { flexDirection: 'row', alignItems: 'center' },
  contributorInfo: { flex: 1, marginLeft: spacing[3] },
  contributorName: { ...typography.bodyLarge, color: colors.text.primary },
  contributorDate: { ...typography.bodySmall, color: colors.text.tertiary },
  contributorAmount: { ...typography.titleMedium, color: colors.success.main },
  actionsSection: { marginTop: spacing[4] },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6] },
});
