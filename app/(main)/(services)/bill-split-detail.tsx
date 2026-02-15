import React from 'react';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Avatar, Badge, Button, ProgressBar } from '../../../src/components/ui';
import { billSplits } from '../../../src/mock/billSplits';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';
import Svg, { Path } from 'react-native-svg';

export default function BillSplitDetailScreen() {
  const showToast = useUIStore((state) => state.showToast);
  const split = billSplits[0];
  const paidCount = split.participants.filter(p => p.status === 'paid').length;
  const progress = paidCount / split.participants.length;

  const handleSendReminder = (participantName: string) => {
    lightHaptic();
    showToast({ type: 'success', title: `Reminder sent to ${participantName}` });
  };

  const handleShareSplitLink = async () => {
    lightHaptic();
    const splitLink = `https://tanda.app/split/${split.id}`;
    const message = `Join my bill split for "${split.title}" - $${split.perPersonAmount.toFixed(2)} per person. Pay here: ${splitLink}`;

    try {
      await Share.share({
        message,
        title: 'Share Bill Split',
      });
    } catch (error) {
      await Clipboard.setStringAsync(splitLink);
      showToast({ type: 'success', title: 'Split link copied!' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Split Details" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.headerCard}>
          <Text style={styles.splitTitle}>{split.title}</Text>
          <Text style={styles.totalAmount}>${split.totalAmount.toFixed(2)}</Text>
          <Text style={styles.perPerson}>${split.perPersonAmount.toFixed(2)} per person</Text>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>{paidCount} of {split.participants.length} paid</Text>
              <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
            </View>
            <ProgressBar progress={progress} />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Participants</Text>

        {split.participants.map(participant => (
          <Card key={participant.id} style={styles.participantCard}>
            <View style={styles.participantRow}>
              <Avatar name={participant.name} size="md" />
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{participant.name}</Text>
                <Text style={styles.participantAmount}>${split.perPersonAmount.toFixed(2)}</Text>
              </View>
              <Badge
                label={participant.status === 'paid' ? 'Paid' : participant.status === 'pending' ? 'Pending' : 'Declined'}
                variant={participant.status === 'paid' ? 'success' : participant.status === 'pending' ? 'warning' : 'error'}
              />
            </View>
            {participant.status === 'pending' && (
              <View style={styles.reminderRow}>
                <Button
                  title="Send Reminder"
                  variant="ghost"
                  size="sm"
                  onPress={() => handleSendReminder(participant.name)}
                />
              </View>
            )}
          </Card>
        ))}

        <View style={styles.actionsSection}>
          <Button
            title="Share Split Link"
            variant="secondary"
            fullWidth
            onPress={handleShareSplitLink}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[6] },
  headerCard: { alignItems: 'center', marginBottom: spacing[6] },
  splitTitle: { ...typography.titleMedium, color: colors.text.secondary, marginBottom: spacing[2] },
  totalAmount: { ...typography.displayMedium, color: colors.text.primary, marginBottom: spacing[1] },
  perPerson: { ...typography.bodyMedium, color: colors.text.tertiary, marginBottom: spacing[6] },
  progressSection: { width: '100%' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] },
  progressText: { ...typography.bodySmall, color: colors.text.secondary },
  progressPercent: { ...typography.labelMedium, color: colors.primary[400] },
  sectionTitle: { ...typography.titleSmall, color: colors.text.primary, marginBottom: spacing[3] },
  participantCard: { marginBottom: spacing[3] },
  participantRow: { flexDirection: 'row', alignItems: 'center' },
  participantInfo: { flex: 1, marginLeft: spacing[3] },
  participantName: { ...typography.bodyLarge, color: colors.text.primary },
  participantAmount: { ...typography.bodySmall, color: colors.text.tertiary },
  reminderRow: { marginTop: spacing[3], alignItems: 'flex-start' },
  actionsSection: { marginTop: spacing[4] },
});
