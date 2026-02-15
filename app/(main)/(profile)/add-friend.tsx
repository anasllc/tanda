import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { SearchBar, Avatar, Button, Card } from '../../../src/components/ui';
import { otherUsers } from '../../../src/mock/users';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';
import Svg, { Path } from 'react-native-svg';

export default function AddFriendScreen() {
  const showToast = useUIStore((state) => state.showToast);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const filteredUsers = otherUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendRequest = (userId: string) => {
    lightHaptic();
    setSentRequests(prev => [...prev, userId]);
    showToast({ type: 'success', title: 'Friend request sent!' });
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
    <SafeAreaView style={styles.container}>
      <Header showBack title="Add Friend" />
      <View style={styles.content}>
        <SearchBar
          placeholder="Search by name or username"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.suggestionsHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? 'Search Results' : 'Suggested Friends'}
          </Text>
        </View>

        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {filteredUsers.map(user => (
            <Card key={user.id} style={styles.userCard}>
              <View style={styles.userRow}>
                <Avatar name={user.name} image={user.avatar} size="lg" />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userUsername}>@{user.username}</Text>
                </View>
                {sentRequests.includes(user.id) ? (
                  <View style={styles.sentBadge}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17l-5-5" stroke={colors.success.main} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={styles.sentText}>Sent</Text>
                  </View>
                ) : (
                  <Button
                    title="Add"
                    variant="secondary"
                    size="sm"
                    onPress={() => handleSendRequest(user.id)}
                  />
                )}
              </View>
            </Card>
          ))}

          {searchQuery && filteredUsers.length === 0 && (
            <View style={styles.noResults}>
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke={colors.text.tertiary} strokeWidth={1.5} strokeLinecap="round" />
              </Svg>
              <Text style={styles.noResultsTitle}>No users found</Text>
              <Text style={styles.noResultsText}>Try searching with a different name or username</Text>
            </View>
          )}
        </ScrollView>

        <Card style={styles.inviteCard}>
          <View style={styles.inviteContent}>
            <View style={styles.inviteIcon}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={colors.primary[400]} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={styles.inviteTextContainer}>
              <Text style={styles.inviteTitle}>Invite friends to Tanda</Text>
              <Text style={styles.inviteSubtitle}>Share your referral link</Text>
            </View>
          </View>
          <Button title="Share" variant="ghost" size="sm" onPress={handleShareReferral} />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1, paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  suggestionsHeader: { marginTop: spacing[4], marginBottom: spacing[3] },
  sectionTitle: { ...typography.titleSmall, color: colors.text.primary },
  usersList: { flex: 1 },
  userCard: { marginBottom: spacing[3] },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  userInfo: { flex: 1, marginLeft: spacing[3] },
  userName: { ...typography.bodyLarge, color: colors.text.primary },
  userUsername: { ...typography.bodySmall, color: colors.text.tertiary },
  sentBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  sentText: { ...typography.labelMedium, color: colors.success.main },
  noResults: { alignItems: 'center', paddingVertical: spacing[8] },
  noResultsTitle: { ...typography.titleMedium, color: colors.text.primary, marginTop: spacing[4] },
  noResultsText: { ...typography.bodyMedium, color: colors.text.tertiary, textAlign: 'center', marginTop: spacing[2] },
  inviteCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[6] },
  inviteContent: { flexDirection: 'row', alignItems: 'center' },
  inviteIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary[500] + '20', alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  inviteTextContainer: { },
  inviteTitle: { ...typography.bodyLarge, color: colors.text.primary },
  inviteSubtitle: { ...typography.bodySmall, color: colors.text.tertiary },
});
