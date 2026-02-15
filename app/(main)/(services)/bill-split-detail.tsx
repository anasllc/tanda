import React from 'react';
import { View, Text, ScrollView, Share, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Avatar, Badge, Button, ProgressBar } from '../../../src/components/ui';
import { useBillSplit } from '../../../src/hooks/useBillSplits';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';

export default function BillSplitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const showToast = useUIStore((state) => state.showToast);
  const { data: split, isLoading } = useBillSplit(id);

  if (isLoading || !split) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Split Details" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const perPersonAmount = split.totalAmount / split.participants.length;
  const paidCount = split.participants.filter((p: any) => p.status === 'paid').length;
  const progress = paidCount / split.participants.length;

  const handleSendReminder = (participantName: string) => {
    lightHaptic();
    showToast({ type: 'success', title: `Reminder sent to ${participantName}` });
  };

  const handleShareSplitLink = async () => {
    lightHaptic();
    const splitLink = `https://tanda.app/split/${split.id}`;
    const message = `Join my bill split for "${split.title}" - $${perPersonAmount.toFixed(2)} per person. Pay here: ${splitLink}`;

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
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Split Details" />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-6">
        <Card className="items-center mb-6">
          <Text className="text-title-md font-inter-medium text-txt-secondary mb-2">{split.title}</Text>
          <Text className="text-display-md font-inter-bold text-txt-primary mb-1">${split.totalAmount.toFixed(2)}</Text>
          <Text className="text-body-md font-inter text-txt-tertiary mb-6">${perPersonAmount.toFixed(2)} per person</Text>

          <View className="w-full">
            <View className="flex-row justify-between mb-2">
              <Text className="text-body-sm font-inter text-txt-secondary">{paidCount} of {split.participants.length} paid</Text>
              <Text className="text-label-md font-inter-medium text-accent-400">{Math.round(progress * 100)}%</Text>
            </View>
            <ProgressBar progress={progress} />
          </View>
        </Card>

        <Text className="text-title-sm font-inter-medium text-txt-primary mb-3">Participants</Text>

        {split.participants.map((participant: any) => (
          <Card key={participant.id} className="mb-3">
            <View className="flex-row items-center">
              <Avatar name={participant.name} size="medium" />
              <View className="flex-1 ml-3">
                <Text className="text-body-lg font-inter text-txt-primary">{participant.name}</Text>
                <Text className="text-body-sm font-inter text-txt-tertiary">${perPersonAmount.toFixed(2)}</Text>
              </View>
              <Badge
                label={participant.status === 'paid' ? 'Paid' : participant.status === 'pending' ? 'Pending' : 'Declined'}
                variant={participant.status === 'paid' ? 'success' : participant.status === 'pending' ? 'warning' : 'error'}
              />
            </View>
            {participant.status === 'pending' && (
              <View className="mt-3 items-start">
                <Button
                  title="Send Reminder"
                  variant="ghost"
                  size="small"
                  onPress={() => handleSendReminder(participant.name)}
                />
              </View>
            )}
          </Card>
        ))}

        <View className="mt-4">
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
