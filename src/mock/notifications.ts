export type NotificationType =
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

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export const notifications: Notification[] = [
  {
    id: 'notif_001',
    type: 'payment_received',
    title: 'Payment Received',
    message: 'Emeka sent you ₦50,000',
    isRead: false,
    data: { transactionId: 'txn_001', senderId: 'user_002' },
    createdAt: '2024-03-15T14:30:00Z',
  },
  {
    id: 'notif_002',
    type: 'payment_sent',
    title: 'Payment Sent',
    message: 'You sent ₦25,000 to Ngozi',
    isRead: true,
    data: { transactionId: 'txn_002', recipientId: 'user_003' },
    createdAt: '2024-03-15T12:15:00Z',
  },
  {
    id: 'notif_003',
    type: 'payment_pending',
    title: 'Pending Payment',
    message: 'Your payment of ₦15,000 to Chidi is pending claim',
    isRead: false,
    data: { transactionId: 'txn_006', recipientId: 'user_004' },
    createdAt: '2024-03-14T08:00:00Z',
  },
  {
    id: 'notif_004',
    type: 'deposit_completed',
    title: 'Deposit Successful',
    message: 'Your deposit of ₦100,000 has been credited',
    isRead: true,
    data: { transactionId: 'txn_004' },
    createdAt: '2024-03-14T16:50:00Z',
  },
  {
    id: 'notif_005',
    type: 'friend_request',
    title: 'New Friend Request',
    message: 'Tochi wants to connect with you',
    isRead: false,
    data: { userId: 'user_010' },
    createdAt: '2024-03-14T11:20:00Z',
  },
  {
    id: 'notif_006',
    type: 'bill_split_request',
    title: 'Bill Split Request',
    message: 'Amara invited you to split ₦32,000 for "Dinner at Bukka"',
    isRead: false,
    data: { splitId: 'split_001', creatorId: 'user_005' },
    createdAt: '2024-03-13T20:00:00Z',
  },
  {
    id: 'notif_007',
    type: 'withdraw_completed',
    title: 'Withdrawal Successful',
    message: '₦75,000 has been sent to your Access Bank account',
    isRead: true,
    data: { transactionId: 'txn_007' },
    createdAt: '2024-03-13T15:25:00Z',
  },
  {
    id: 'notif_008',
    type: 'pool_contribution',
    title: 'Pool Contribution',
    message: 'Kelechi contributed ₦20,000 to "Office Party Fund"',
    isRead: true,
    data: { poolId: 'pool_001', contributorId: 'user_006' },
    createdAt: '2024-03-13T14:00:00Z',
  },
  {
    id: 'notif_009',
    type: 'payment_received',
    title: 'Payment Received',
    message: 'Amara sent you ₦35,000',
    isRead: true,
    data: { transactionId: 'txn_009', senderId: 'user_005' },
    createdAt: '2024-03-12T19:45:00Z',
  },
  {
    id: 'notif_010',
    type: 'payment_failed',
    title: 'Payment Failed',
    message: 'Your payment of ₦5,000 to Kelechi failed',
    isRead: true,
    data: { transactionId: 'txn_011', recipientId: 'user_006' },
    createdAt: '2024-03-12T10:15:00Z',
  },
  {
    id: 'notif_011',
    type: 'friend_joined',
    title: 'Friend Joined Tanda',
    message: 'Your contact "Mama" just joined Tanda!',
    isRead: false,
    data: { contactId: 'contact_016' },
    createdAt: '2024-03-12T09:00:00Z',
  },
  {
    id: 'notif_012',
    type: 'bill_split_paid',
    title: 'Split Payment Received',
    message: 'Ngozi paid ₦8,000 for "Dinner at Bukka"',
    isRead: true,
    data: { splitId: 'split_001', payerId: 'user_003' },
    createdAt: '2024-03-11T22:30:00Z',
  },
  {
    id: 'notif_013',
    type: 'pool_goal_reached',
    title: 'Pool Goal Reached!',
    message: '"Office Party Fund" has reached its goal of ₦200,000',
    isRead: true,
    data: { poolId: 'pool_001' },
    createdAt: '2024-03-11T16:00:00Z',
  },
  {
    id: 'notif_014',
    type: 'security_alert',
    title: 'New Device Login',
    message: 'Your account was accessed from a new iPhone in Lagos',
    isRead: false,
    data: { device: 'iPhone', location: 'Lagos, Nigeria' },
    createdAt: '2024-03-10T08:30:00Z',
  },
  {
    id: 'notif_015',
    type: 'promo',
    title: 'Special Offer!',
    message: 'Get 10% cashback on your next airtime purchase',
    isRead: true,
    data: { promoCode: 'AIRTIME10', expiresAt: '2024-03-20T23:59:59Z' },
    createdAt: '2024-03-09T10:00:00Z',
  },
];

export const getUnreadNotifications = (): Notification[] => {
  return notifications.filter(notif => !notif.isRead);
};

export const getUnreadCount = (): number => {
  return notifications.filter(notif => !notif.isRead).length;
};

export const getNotificationsByType = (type: NotificationType): Notification[] => {
  return notifications.filter(notif => notif.type === type);
};

export const markAsRead = (id: string): void => {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.isRead = true;
  }
};

export const markAllAsRead = (): void => {
  notifications.forEach(n => {
    n.isRead = true;
  });
};
