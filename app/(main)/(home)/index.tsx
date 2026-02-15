import React from 'react';
import { View, Text, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../../src/theme';
import { Avatar } from '../../../src/components/ui';
import { BalanceCard, QuickActions, RecentActivity } from '../../../src/components/home';
import { useAuthStore } from '../../../src/stores';
import { useBalance } from '../../../src/hooks/useBalance';
import { useRecentTransactions } from '../../../src/hooks/useTransactions';
import { useUnreadCount } from '../../../src/hooks/useNotifications';
import { lightHaptic } from '../../../src/utils/haptics';

const BellIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke={colors.text.primary}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke={colors.text.primary}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const balanceQuery = useBalance();
  const transactionsQuery = useRecentTransactions(5);
  const unreadCount = useUnreadCount();

  const refreshing = balanceQuery.isRefetching || transactionsQuery.isRefetching;

  const handleNotifications = () => {
    lightHaptic();
    router.push('/(main)/(home)/notifications');
  };

  const handleProfile = () => {
    lightHaptic();
    router.push('/(main)/(profile)/edit-profile');
  };

  const onRefresh = async () => {
    await Promise.all([
      balanceQuery.refetch(),
      transactionsQuery.refetch(),
    ]);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-5 py-3">
          <TouchableOpacity onPress={handleProfile} className="mr-3">
            <Avatar
              name={user?.displayName || 'User'}
              size="medium"
              source={user?.avatar}
            />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-body-sm font-inter text-txt-tertiary">
              {greeting()}
            </Text>
            <Text className="text-title-lg font-inter-semibold text-txt-primary">
              {user?.displayName?.split(' ')[0] || 'there'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleNotifications} className="relative">
            <View className="w-10 h-10 rounded-full bg-bg-tertiary items-center justify-center">
              <BellIcon />
            </View>
            {unreadCount > 0 && (
              <View
                className="absolute -top-1 -right-1 bg-error-main rounded-full min-w-[18px] h-[18px] items-center justify-center px-1"
                style={{ shadowColor: colors.error.main, shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }}
              >
                <Text className="text-[10px] font-inter-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
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
          <Animated.View entering={FadeInDown.delay(0).duration(400).springify()}>
            <BalanceCard />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
            <QuickActions />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400).springify()}>
            <RecentActivity />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
