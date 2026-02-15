import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { EmptyState, Card, Avatar } from '../../../src/components/ui';
import { lightHaptic } from '../../../src/utils/haptics';
import { useFriends } from '../../../src/hooks/useFriends';

export default function FriendsScreen() {
  const router = useRouter();
  const { data, isLoading } = useFriends('accepted');
  const friends = data?.friends ?? [];

  const handleAddFriends = () => {
    lightHaptic();
    router.push('/(main)/(profile)/add-friend' as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Friends" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (friends.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Friends" />
        <EmptyState type="friends" title="No friends yet" description="Add friends to send and receive money easily" actionLabel="Add Friends" onAction={handleAddFriends} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Friends" />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-4">
        {friends.map((friend) => (
          <Card key={friend.id} className="mb-3">
            <View className="flex-row items-center">
              <Avatar name={friend.display_name} source={friend.avatar_url} size="large" />
              <View className="flex-1 ml-3">
                <Text className="text-body-lg font-inter text-txt-primary">{friend.display_name}</Text>
                <Text className="text-body-sm font-inter text-txt-tertiary">@{friend.username}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
