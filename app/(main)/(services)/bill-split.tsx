import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Input, Button, Card, Avatar, Chip } from '../../../src/components/ui';
import { useFriends } from '../../../src/hooks/useFriends';
import { useCreateSplit } from '../../../src/hooks/useBillSplits';
import { useUIStore } from '../../../src/stores';
import Svg, { Path } from 'react-native-svg';

export default function BillSplitScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const { data: friendsData, isLoading: loadingFriends } = useFriends('accepted');
  const createSplit = useCreateSplit();
  const friends = friendsData?.friends ?? [];

  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');

  const toggleContact = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const perPersonAmount = selectedContacts.length > 0 && totalAmount
    ? (parseFloat(totalAmount) / (selectedContacts.length + 1)).toFixed(2)
    : '0.00';

  const handleCreate = async () => {
    try {
      await createSplit.mutateAsync({
        title,
        total_amount_usdc: parseFloat(totalAmount),
        split_type: splitType,
        participants: selectedContacts.map(id => ({ user_id: id })),
      });
      showToast({ type: 'success', title: 'Bill split created!' });
      router.push('/(main)/(services)/bill-split-detail');
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to create split', message: err.message });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Split a Bill" />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-6 gap-5">
        <Input
          label="What's the bill for?"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Dinner at Cafe"
        />

        <Input
          label="Total Amount"
          value={totalAmount}
          onChangeText={setTotalAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          leftIcon={<Text className="text-body-lg font-inter text-txt-secondary">$</Text>}
        />

        <View>
          <Text className="text-title-sm font-inter-medium text-txt-primary mb-3">Split Type</Text>
          <View className="flex-row gap-3">
            <Chip
              label="Split Equally"
              selected={splitType === 'equal'}
              onPress={() => setSplitType('equal')}
            />
            <Chip
              label="Custom Amounts"
              selected={splitType === 'custom'}
              onPress={() => setSplitType('custom')}
            />
          </View>
        </View>

        <View>
          <Text className="text-title-sm font-inter-medium text-txt-primary mb-3">Split With</Text>
          {loadingFriends ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color={colors.primary[500]} />
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {friends.slice(0, 8).map(friend => (
                <TouchableOpacity
                  key={friend.id}
                  className={`items-center p-3 rounded-lg w-[80px] relative ${
                    selectedContacts.includes(friend.id)
                      ? 'border border-accent-500'
                      : 'bg-bg-secondary'
                  }`}
                  style={selectedContacts.includes(friend.id) ? { backgroundColor: colors.primary[500] + '30' } : undefined}
                  onPress={() => toggleContact(friend.id)}
                >
                  <Avatar name={friend.display_name} size="small" />
                  <Text className="text-label-sm font-inter-medium text-txt-secondary mt-2" numberOfLines={1}>{friend.display_name.split(' ')[0]}</Text>
                  {selectedContacts.includes(friend.id) && (
                    <View className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-accent-500 items-center justify-center">
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <Path d="M20 6L9 17l-5-5" stroke={colors.text.inverse} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {selectedContacts.length > 0 && totalAmount && (
          <Card>
            <Text className="text-title-sm font-inter-medium text-txt-primary mb-3">Split Summary</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-body-md font-inter text-txt-secondary">Total</Text>
              <Text className="text-body-md font-inter text-txt-primary">${totalAmount}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-body-md font-inter text-txt-secondary">People</Text>
              <Text className="text-body-md font-inter text-txt-primary">{selectedContacts.length + 1} (including you)</Text>
            </View>
            <View className="h-px bg-border-light my-3" />
            <View className="flex-row justify-between mb-2">
              <Text className="text-title-sm font-inter-medium text-txt-primary">Per Person</Text>
              <Text className="text-title-sm font-inter-medium text-accent-400">${perPersonAmount}</Text>
            </View>
          </Card>
        )}
      </ScrollView>

      <View className="px-5 pb-6">
        <Button
          title="Create Split"
          onPress={handleCreate}
          fullWidth
          disabled={!title || !totalAmount || selectedContacts.length === 0}
          loading={createSplit.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
