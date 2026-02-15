import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, layout } from '../../../src/theme';
import { Avatar } from '../../../src/components/ui';
import { BalanceCard, QuickActions, RecentActivity } from '../../../src/components/home';
import { useAuthStore } from '../../../src/stores';
import { getUnreadCount } from '../../../src/mock/notifications';
import { lightHaptic } from '../../../src/utils/haptics';

const BellIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke={colors.text.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke={colors.text.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = getUnreadCount();

  const handleNotifications = () => {
    lightHaptic();
    router.push('/(main)/(home)/notifications');
  };

  const handleProfile = () => {
    lightHaptic();
    router.push('/(main)/(profile)/edit-profile');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfile} style={styles.profileButton}>
          <Avatar
            name={user?.displayName || 'User'}
            size="medium"
            source={user?.avatar}
          />
        </TouchableOpacity>

        <View style={styles.greeting}>
          <Text style={styles.greetingText}>{greeting()},</Text>
          <Text style={styles.userName}>{user?.displayName?.split(' ')[0] || 'there'}</Text>
        </View>

        <TouchableOpacity onPress={handleNotifications} style={styles.notificationButton}>
          <BellIcon />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        <BalanceCard />
        <QuickActions />
        <RecentActivity />

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  profileButton: {
    marginRight: spacing[3],
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  userName: {
    ...typography.titleLarge,
    color: colors.text.primary,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing[2],
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error.main,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    ...typography.labelSmall,
    color: colors.white,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
  },
  bottomPadding: {
    height: layout.tabBarHeight + spacing[4],
  },
});
