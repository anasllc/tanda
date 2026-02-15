import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { EmptyState } from '../../../src/components/ui';
import { useNotifications, useMarkNotificationsRead } from '../../../src/hooks/useNotifications';
import { formatRelativeTime } from '../../../src/utils/formatters';
import { lightHaptic } from '../../../src/utils/haptics';

type NotificationType =
  | 'payment_received'
  | 'payment_sent'
  | 'payment_pending'
  | 'payment_failed'
  | 'deposit_completed'
  | 'withdraw_completed'
  | 'friend_request'
  | 'friend_joined'
  | 'bill_split_request'
  | 'bill_split_paid'
  | 'pool_contribution'
  | 'pool_goal_reached'
  | 'security_alert'
  | 'promo';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

const getNotificationIcon = (type: string) => {
  switch (type as NotificationType) {
    case 'payment_received':
      return (
        <View className="w-11 h-11 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.success.background }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M17 7L7 17M7 17H17M7 17V7" stroke={colors.success.main} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>
      );
    case 'payment_sent':
      return (
        <View className="w-11 h-11 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.info.background }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M7 17L17 7M17 7H7M17 7V17" stroke={colors.info.main} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>
      );
    case 'payment_pending':
    case 'payment_failed':
      return (
        <View className="w-11 h-11 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: type === 'payment_failed' ? colors.error.background : colors.warning.background }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={8} stroke={type === 'payment_failed' ? colors.error.main : colors.warning.main} strokeWidth={2} />
            <Path d="M12 8V12M12 16H12.01" stroke={type === 'payment_failed' ? colors.error.main : colors.warning.main} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>
      );
    case 'friend_request':
    case 'friend_joined':
      return (
        <View className="w-11 h-11 rounded-full items-center justify-center mr-3 bg-accent-500/12">
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={8} r={4} stroke={colors.primary[500]} strokeWidth={2} />
            <Path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20" stroke={colors.primary[500]} strokeWidth={2} />
          </Svg>
        </View>
      );
    case 'security_alert':
      return (
        <View className="w-11 h-11 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.error.background }}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={colors.error.main} strokeWidth={2} />
          </Svg>
        </View>
      );
    default:
      return (
        <View className="w-11 h-11 rounded-full items-center justify-center mr-3 bg-bg-tertiary">
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={8} stroke={colors.text.tertiary} strokeWidth={2} />
          </Svg>
        </View>
      );
  }
};

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  return (
    <TouchableOpacity
      className={`flex-row items-start py-4 ${!notification.is_read ? 'bg-accent-500/5 -mx-5 px-5' : ''}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {getNotificationIcon(notification.type)}
      <View className="flex-1">
        <Text className="text-title-sm font-inter-medium text-txt-primary mb-0.5">
          {notification.title}
        </Text>
        <Text className="text-body-md font-inter text-txt-secondary mb-1" numberOfLines={2}>
          {notification.message}
        </Text>
        <Text className="text-body-sm font-inter text-txt-tertiary">
          {formatRelativeTime(notification.created_at)}
        </Text>
      </View>
      {!notification.is_read && (
        <View className="w-2 h-2 rounded-full bg-accent-500 ml-2 mt-2" />
      )}
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const notificationsList = data?.notifications ?? [];

  useEffect(() => {
    // Mark all notifications as read when viewing the screen
    if (notificationsList.length > 0) {
      markRead.mutate({ all: true });
    }
  }, [notificationsList.length]);

  const handleNotificationPress = (notification: Notification) => {
    lightHaptic();

    switch (notification.type as NotificationType) {
      case 'payment_received':
      case 'payment_sent':
        if (notification.data?.transactionId) {
          router.push(`/(main)/(wallet)/transaction-detail?id=${notification.data.transactionId}` as any);
        } else {
          router.push('/(main)/(wallet)/transactions' as any);
        }
        break;
      case 'payment_pending':
      case 'payment_failed':
        router.push('/(main)/(wallet)/transactions' as any);
        break;
      case 'friend_request':
      case 'friend_joined':
        router.push('/(main)/(profile)/friends' as any);
        break;
      case 'security_alert':
        router.push('/(main)/(profile)/security' as any);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header title="Notifications" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (notificationsList.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header title="Notifications" showBack />
        <EmptyState
          type="notifications"
          title="No notifications yet"
          description="We'll notify you when something important happens"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header title="Notifications" showBack />

      <FlatList
        data={notificationsList}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-px bg-border" />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary[500]}
          />
        }
      />
    </SafeAreaView>
  );
}
