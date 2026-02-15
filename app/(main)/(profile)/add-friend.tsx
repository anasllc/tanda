import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { SearchBar, Avatar, Button, Card } from '../../../src/components/ui';
import { useSearchUsers } from '../../../src/hooks/useContacts';
import { useSendFriendRequest } from '../../../src/hooks/useFriends';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';
import Svg, { Path } from 'react-native-svg';

export default function AddFriendScreen() {
  const showToast = useUIStore((state) => state.showToast);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const { data, isLoading } = useSearchUsers(searchQuery);
  const sendFriendRequest = useSendFriendRequest();

  const searchResults = data?.users ?? [];

  const handleSendRequest = async (userId: string) => {
    lightHaptic();
    try {
      await sendFriendRequest.mutateAsync(userId);
      setSentRequests(prev => [...prev, userId]);
      showToast({ type: 'success', title: 'Friend request sent!' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to send request', message: err.message });
    }
  };

  const handleShareReferral = async () => {
    lightHaptic();
    const referralLink = 'https://tanda.app/invite/user123';
    const message = `Join me on Tanda! Send money, pay bills, and more. Use my referral link: ${referralLink}`;

    try {
      await Share.share({
        message,
        title: 'Invite to Tanda',
      });
    } catch (error) {
      await Clipboard.setStringAsync(referralLink);
      showToast({ type: 'success', title: 'Referral link copied!' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Add Friend" />
      <View className="flex-1 px-5 pt-4">
        <SearchBar
          placeholder="Search by name or username"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View className="mt-4 mb-3">
          <Text className="text-title-sm font-inter-medium text-txt-primary">
            {searchQuery ? 'Search Results' : 'Suggested Friends'}
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {isLoading && searchQuery.length >= 2 && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          )}

          {searchResults.map(user => (
            <Card key={user.id} className="mb-3">
              <View className="flex-row items-center">
                <Avatar name={user.display_name} source={user.avatar_url} size="large" />
                <View className="flex-1 ml-3">
                  <Text className="text-body-lg font-inter text-txt-primary">{user.display_name}</Text>
                  <Text className="text-body-sm font-inter text-txt-tertiary">@{user.username}</Text>
                </View>
                {sentRequests.includes(user.id) ? (
                  <View className="flex-row items-center gap-1">
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17l-5-5" stroke={colors.success.main} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text className="text-label-md font-inter-medium text-success-main">Sent</Text>
                  </View>
                ) : (
                  <Button
                    title="Add"
                    variant="secondary"
                    size="small"
                    onPress={() => handleSendRequest(user.id)}
                  />
                )}
              </View>
            </Card>
          ))}

          {searchQuery && searchQuery.length >= 2 && !isLoading && searchResults.length === 0 && (
            <View className="items-center py-8">
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke={colors.text.tertiary} strokeWidth={1.5} strokeLinecap="round" />
              </Svg>
              <Text className="text-title-md font-inter-medium text-txt-primary mt-4">No users found</Text>
              <Text className="text-body-md font-inter text-txt-tertiary text-center mt-2">Try searching with a different name or username</Text>
            </View>
          )}
        </ScrollView>

        <Card className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-accent-500/20 items-center justify-center mr-3">
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={colors.primary[400]} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View>
              <Text className="text-body-lg font-inter text-txt-primary">Invite friends to Tanda</Text>
              <Text className="text-body-sm font-inter text-txt-tertiary">Share your referral link</Text>
            </View>
          </View>
          <Button title="Share" variant="ghost" size="small" onPress={handleShareReferral} />
        </Card>
      </View>
    </SafeAreaView>
  );
}
