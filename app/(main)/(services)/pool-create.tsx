import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Input, Button, Card, Avatar, Chip } from '../../../src/components/ui';
import { useFriends, Friend } from '../../../src/hooks/useFriends';
import { useCreatePool } from '../../../src/hooks/usePools';
import Svg, { Path } from 'react-native-svg';

export default function PoolCreateScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const { data: friendsData, isLoading: loadingFriends } = useFriends('accepted');
  const friends = friendsData?.friends ?? [];

  const createPool = useCreatePool();

  const toggleContact = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    try {
      await createPool.mutateAsync({
        title,
        description: description || undefined,
        target_amount_usdc: parseFloat(targetAmount),
        deadline: deadline || undefined,
        members: selectedContacts.map(id => ({ user_id: id })),
      });
      router.push('/(main)/(services)/pool-detail');
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Create Pool" />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-6 gap-5">
        <Input
          label="Pool Name"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Birthday Gift for Sarah"
        />

        <Input
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="What's this pool for?"
          multiline
          numberOfLines={3}
        />

        <Input
          label="Target Amount"
          value={targetAmount}
          onChangeText={setTargetAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          leftIcon={<Text className="text-body-lg font-inter text-txt-secondary">$</Text>}
        />

        <Input
          label="Deadline (Optional)"
          value={deadline}
          onChangeText={setDeadline}
          placeholder="e.g., Dec 25, 2024"
        />

        <View>
          <Text className="text-title-sm font-inter-medium text-txt-primary mb-1">Invite Contributors</Text>
          <Text className="text-body-sm font-inter text-txt-tertiary mb-3">Select people to invite to this pool</Text>

          {loadingFriends ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" />
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {friends.slice(0, 8).map((friend: Friend) => (
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
                  <Avatar name={friend.display_name} source={friend.avatar_url} size="small" />
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

        {targetAmount && (
          <Card className="items-center py-6">
            <View className="mb-3">
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={colors.primary[400]} strokeWidth={1.5} strokeLinecap="round" />
                <Path d="M9 11a4 4 0 100-8 4 4 0 000 8z" stroke={colors.primary[400]} strokeWidth={1.5} />
                <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={colors.primary[400]} strokeWidth={1.5} strokeLinecap="round" />
              </Svg>
            </View>
            <Text className="text-title-md font-inter-medium text-txt-primary mb-1">{title || 'Pool Name'}</Text>
            <Text className="text-body-md font-inter text-accent-400 mb-1">Target: ${targetAmount}</Text>
            <Text className="text-body-sm font-inter text-txt-tertiary">{selectedContacts.length} people invited</Text>
          </Card>
        )}
      </ScrollView>

      <View className="px-5 pb-6">
        <Button
          title={createPool.isPending ? "Creating..." : "Create Pool"}
          onPress={handleCreate}
          fullWidth
          disabled={!title || !targetAmount || createPool.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
