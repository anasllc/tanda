import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { SearchBar, Avatar, EmptyState } from '../../../src/components/ui';
import { useSearchUsers, type SearchResult } from '../../../src/hooks/useContacts';
import { useFriends } from '../../../src/hooks/useFriends';
import { lightHaptic } from '../../../src/utils/haptics';

interface ContactItemProps {
  user: SearchResult;
  onPress: () => void;
}

const ContactItem: React.FC<ContactItemProps> = ({ user, onPress }) => (
  <TouchableOpacity className="flex-row items-center py-3" onPress={onPress} activeOpacity={0.7}>
    <Avatar name={user.display_name} size="medium" source={user.avatar_url} />
    <View className="flex-1 ml-3">
      <Text className="text-body-lg font-inter text-txt-primary">{user.display_name}</Text>
      {user.username ? (
        <Text className="text-body-sm font-inter text-accent-500 mt-0.5">@{user.username}</Text>
      ) : (
        <Text className="text-body-sm font-inter text-txt-tertiary mt-0.5">{user.phone}</Text>
      )}
    </View>
  </TouchableOpacity>
);

export default function SendScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);
  const { data: friendsData } = useFriends('accepted');

  const friends = friendsData?.friends ?? [];

  const handleContactPress = (user: SearchResult) => {
    lightHaptic();
    router.push({
      pathname: '/(main)/(send)/amount',
      params: { contactId: user.id, contactName: user.display_name, contactUsername: user.username },
    });
  };

  const handleFriendPress = (friend: any) => {
    lightHaptic();
    router.push({
      pathname: '/(main)/(send)/amount',
      params: { contactId: friend.id, contactName: friend.display_name, contactUsername: friend.username },
    });
  };

  const renderSearchResults = () => {
    const users = searchResults?.users ?? [];

    if (isSearching) {
      return (
        <View className="items-center py-8">
          <Text className="text-body-md font-inter text-txt-tertiary">Searching...</Text>
        </View>
      );
    }

    if (users.length === 0) {
      return (
        <EmptyState
          type="search"
          title="No results found"
          description="Try searching with a different name or phone number"
        />
      );
    }

    return (
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <ContactItem user={item} onPress={() => handleContactPress(item)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    );
  };

  const renderContacts = () => (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {friends.length > 0 && (
        <View className="mb-6">
          <Text className="text-label-lg font-inter-medium text-txt-tertiary mb-3 uppercase tracking-wide">
            Friends
          </Text>
          {friends.map((friend: any) => (
            <TouchableOpacity
              key={friend.id}
              className="flex-row items-center py-3"
              onPress={() => handleFriendPress(friend)}
              activeOpacity={0.7}
            >
              <Avatar name={friend.display_name} size="medium" source={friend.avatar_url} />
              <View className="flex-1 ml-3">
                <Text className="text-body-lg font-inter text-txt-primary">{friend.display_name}</Text>
                <Text className="text-body-sm font-inter text-accent-500 mt-0.5">@{friend.username}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {friends.length === 0 && (
        <View className="items-center py-12">
          <Text className="text-body-md font-inter text-txt-tertiary text-center">
            Search for a user by name, username, or phone number to send money
          </Text>
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <Header title="Send Money" showBack />

      <View className="px-5 pb-4">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search name, username, or phone"
        />
      </View>

      {searchQuery.length >= 2 ? renderSearchResults() : renderContacts()}
    </SafeAreaView>
  );
}
