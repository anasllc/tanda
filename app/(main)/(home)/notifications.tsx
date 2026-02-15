import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { EmptyState } from '../../../src/components/ui';
import { notifications, Notification, NotificationType } from '../../../src/mock/notifications';
import { formatRelativeTime } from '../../../src/utils/formatters';
import { lightHaptic } from '../../../src/utils/haptics';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'payment_received':
      return (
        <View style={[styles.iconCircle, { backgroundColor: colors.success.background }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M17 7L7 17M7 17H17M7 17V7"
              stroke={colors.success.main}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </View>
      );
    case 'payment_sent':
      return (
        <View style={[styles.iconCircle, { backgroundColor: colors.info.background }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke={colors.info.main}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </View>
      );
    case 'payment_pending':
    case 'payment_failed':
      return (
        <View style={[styles.iconCircle, { backgroundColor: type === 'payment_failed' ? colors.error.background : colors.warning.background }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={8} stroke={type === 'payment_failed' ? colors.error.main : colors.warning.main} strokeWidth={2} />
            <Path
              d="M12 8V12M12 16H12.01"
              stroke={type === 'payment_failed' ? colors.error.main : colors.warning.main}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </View>
      );
    case 'friend_request':
    case 'friend_joined':
      return (
        <View style={[styles.iconCircle, { backgroundColor: colors.primary[500] + '20' }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={8} r={4} stroke={colors.primary[500]} strokeWidth={2} />
            <Path
              d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20"
              stroke={colors.primary[500]}
              strokeWidth={2}
            />
          </Svg>
        </View>
      );
    case 'security_alert':
      return (
        <View style={[styles.iconCircle, { backgroundColor: colors.error.background }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
              stroke={colors.error.main}
              strokeWidth={2}
            />
          </Svg>
        </View>
      );
    default:
      return (
        <View style={[styles.iconCircle, { backgroundColor: colors.background.tertiary }]}>
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
      style={[styles.item, !notification.isRead && styles.itemUnread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {getNotificationIcon(notification.type)}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{notification.title}</Text>
        <Text style={styles.itemMessage} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.itemTime}>{formatRelativeTime(notification.createdAt)}</Text>
      </View>
      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: Notification) => {
    lightHaptic();
    // Mark as read
    notification.isRead = true;

    // Navigate based on notification type
    switch (notification.type) {
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

  if (notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
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
    <SafeAreaView style={styles.container}>
      <Header title="Notifications" showBack />

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  list: {
    paddingHorizontal: spacing[5],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing[4],
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.default,
  },
  itemUnread: {
    backgroundColor: colors.primary[500] + '08',
    marginHorizontal: -spacing[5],
    paddingHorizontal: spacing[5],
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...typography.titleSmall,
    color: colors.text.primary,
    marginBottom: 2,
  },
  itemMessage: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  itemTime: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginLeft: spacing[2],
    marginTop: spacing[2],
  },
});
