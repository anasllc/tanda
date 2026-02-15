export type TransactionType =
  | 'send'
  | 'receive'
  | 'deposit'
  | 'withdraw'
  | 'airtime'
  | 'data'
  | 'electricity'
  | 'cable'
  | 'bill_split'
  | 'pool_contribution';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  description: string;
  recipient?: {
    id: string;
    name: string;
    username?: string;
  };
  sender?: {
    id: string;
    name: string;
    username?: string;
  };
  reference: string;
  metadata?: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export const transactions: Transaction[] = [
  {
    id: 'txn_001',
    type: 'receive',
    status: 'completed',
    amount: 50000,
    currency: 'NGN',
    description: 'Payment from Emeka',
    sender: { id: 'user_002', name: 'Emeka Okonkwo', username: 'emeka' },
    reference: 'TND1234567890',
    createdAt: '2024-03-15T14:30:00Z',
    completedAt: '2024-03-15T14:30:05Z',
  },
  {
    id: 'txn_002',
    type: 'send',
    status: 'completed',
    amount: 25000,
    currency: 'NGN',
    description: 'Lunch money',
    recipient: { id: 'user_003', name: 'Ngozi Eze', username: 'ngozi' },
    reference: 'TND1234567891',
    createdAt: '2024-03-15T12:15:00Z',
    completedAt: '2024-03-15T12:15:03Z',
  },
  {
    id: 'txn_003',
    type: 'airtime',
    status: 'completed',
    amount: 2000,
    currency: 'NGN',
    description: 'MTN Airtime',
    reference: 'TND1234567892',
    metadata: { network: 'mtn', phoneNumber: '+2348012345678' },
    createdAt: '2024-03-15T10:00:00Z',
    completedAt: '2024-03-15T10:00:02Z',
  },
  {
    id: 'txn_004',
    type: 'deposit',
    status: 'completed',
    amount: 100000,
    currency: 'NGN',
    description: 'Bank Transfer Deposit',
    reference: 'TND1234567893',
    metadata: { bank: 'GTBank', accountNumber: '0123456789' },
    createdAt: '2024-03-14T16:45:00Z',
    completedAt: '2024-03-14T16:50:00Z',
  },
  {
    id: 'txn_005',
    type: 'data',
    status: 'completed',
    amount: 3500,
    currency: 'NGN',
    description: 'Airtel 5GB Data',
    reference: 'TND1234567894',
    metadata: { network: 'airtel', plan: '5GB Monthly', phoneNumber: '+2348012345678' },
    createdAt: '2024-03-14T09:30:00Z',
    completedAt: '2024-03-14T09:30:05Z',
  },
  {
    id: 'txn_006',
    type: 'send',
    status: 'pending',
    amount: 15000,
    currency: 'NGN',
    description: 'Gift for Chidi',
    recipient: { id: 'user_004', name: 'Chidi Nwosu', username: 'chidi' },
    reference: 'TND1234567895',
    createdAt: '2024-03-14T08:00:00Z',
  },
  {
    id: 'txn_007',
    type: 'withdraw',
    status: 'completed',
    amount: 75000,
    currency: 'NGN',
    description: 'Withdrawal to Access Bank',
    reference: 'TND1234567896',
    metadata: { bank: 'Access Bank', accountNumber: '9876543210', accountName: 'Chioma Adeyemi' },
    createdAt: '2024-03-13T15:20:00Z',
    completedAt: '2024-03-13T15:25:00Z',
  },
  {
    id: 'txn_008',
    type: 'electricity',
    status: 'completed',
    amount: 10000,
    currency: 'NGN',
    description: 'IKEDC Prepaid',
    reference: 'TND1234567897',
    metadata: { provider: 'IKEDC', meterNumber: '12345678901', token: '1234-5678-9012-3456' },
    createdAt: '2024-03-13T11:00:00Z',
    completedAt: '2024-03-13T11:00:10Z',
  },
  {
    id: 'txn_009',
    type: 'receive',
    status: 'completed',
    amount: 35000,
    currency: 'NGN',
    description: 'Split payment from Amara',
    sender: { id: 'user_005', name: 'Amara Obi', username: 'amara' },
    reference: 'TND1234567898',
    createdAt: '2024-03-12T19:45:00Z',
    completedAt: '2024-03-12T19:45:02Z',
  },
  {
    id: 'txn_010',
    type: 'cable',
    status: 'completed',
    amount: 21000,
    currency: 'NGN',
    description: 'DStv Compact Plus',
    reference: 'TND1234567899',
    metadata: { provider: 'DStv', smartCardNumber: '1234567890', plan: 'Compact Plus' },
    createdAt: '2024-03-12T14:30:00Z',
    completedAt: '2024-03-12T14:30:08Z',
  },
  {
    id: 'txn_011',
    type: 'send',
    status: 'failed',
    amount: 5000,
    currency: 'NGN',
    description: 'Payment to Kelechi',
    recipient: { id: 'user_006', name: 'Kelechi Udoka', username: 'kelechi' },
    reference: 'TND1234567900',
    createdAt: '2024-03-12T10:15:00Z',
  },
  {
    id: 'txn_012',
    type: 'bill_split',
    status: 'completed',
    amount: 8000,
    currency: 'NGN',
    description: 'Dinner at Bukka',
    reference: 'TND1234567901',
    metadata: { splitId: 'split_001', participants: 4 },
    createdAt: '2024-03-11T21:00:00Z',
    completedAt: '2024-03-11T21:00:05Z',
  },
  {
    id: 'txn_013',
    type: 'pool_contribution',
    status: 'completed',
    amount: 20000,
    currency: 'NGN',
    description: 'Office Party Fund',
    reference: 'TND1234567902',
    metadata: { poolId: 'pool_001' },
    createdAt: '2024-03-11T15:30:00Z',
    completedAt: '2024-03-11T15:30:03Z',
  },
  {
    id: 'txn_014',
    type: 'receive',
    status: 'completed',
    amount: 12500,
    currency: 'NGN',
    description: 'Refund from Adaeze',
    sender: { id: 'user_007', name: 'Adaeze Ikenna', username: 'adaeze' },
    reference: 'TND1234567903',
    createdAt: '2024-03-11T09:00:00Z',
    completedAt: '2024-03-11T09:00:04Z',
  },
  {
    id: 'txn_015',
    type: 'airtime',
    status: 'completed',
    amount: 1000,
    currency: 'NGN',
    description: 'Glo Airtime',
    reference: 'TND1234567904',
    metadata: { network: 'glo', phoneNumber: '+2348045678901' },
    createdAt: '2024-03-10T16:20:00Z',
    completedAt: '2024-03-10T16:20:02Z',
  },
  {
    id: 'txn_016',
    type: 'deposit',
    status: 'pending',
    amount: 250000,
    currency: 'NGN',
    description: 'Card Payment',
    reference: 'TND1234567905',
    metadata: { method: 'card', last4: '4242' },
    createdAt: '2024-03-10T12:00:00Z',
  },
  {
    id: 'txn_017',
    type: 'send',
    status: 'completed',
    amount: 45000,
    currency: 'NGN',
    description: 'Rent contribution',
    recipient: { id: 'user_008', name: 'Obinna Chukwu', username: 'obinna' },
    reference: 'TND1234567906',
    createdAt: '2024-03-09T18:30:00Z',
    completedAt: '2024-03-09T18:30:06Z',
  },
  {
    id: 'txn_018',
    type: 'data',
    status: 'completed',
    amount: 5000,
    currency: 'NGN',
    description: '9mobile 10GB Data',
    reference: 'TND1234567907',
    metadata: { network: '9mobile', plan: '10GB Monthly', phoneNumber: '+2348012345678' },
    createdAt: '2024-03-09T10:45:00Z',
    completedAt: '2024-03-09T10:45:04Z',
  },
  {
    id: 'txn_019',
    type: 'receive',
    status: 'completed',
    amount: 80000,
    currency: 'NGN',
    description: 'Freelance payment',
    sender: { id: 'user_002', name: 'Emeka Okonkwo', username: 'emeka' },
    reference: 'TND1234567908',
    createdAt: '2024-03-08T14:00:00Z',
    completedAt: '2024-03-08T14:00:08Z',
  },
  {
    id: 'txn_020',
    type: 'withdraw',
    status: 'failed',
    amount: 150000,
    currency: 'NGN',
    description: 'Withdrawal to Zenith Bank',
    reference: 'TND1234567909',
    metadata: { bank: 'Zenith Bank', accountNumber: '1122334455', failReason: 'Invalid account' },
    createdAt: '2024-03-08T11:30:00Z',
  },
  {
    id: 'txn_021',
    type: 'electricity',
    status: 'completed',
    amount: 15000,
    currency: 'NGN',
    description: 'EKEDC Prepaid',
    reference: 'TND1234567910',
    metadata: { provider: 'EKEDC', meterNumber: '98765432101', token: '9876-5432-1012-3456' },
    createdAt: '2024-03-07T17:15:00Z',
    completedAt: '2024-03-07T17:15:12Z',
  },
  {
    id: 'txn_022',
    type: 'send',
    status: 'completed',
    amount: 7500,
    currency: 'NGN',
    description: 'Transport fare',
    recipient: { id: 'user_003', name: 'Ngozi Eze', username: 'ngozi' },
    reference: 'TND1234567911',
    createdAt: '2024-03-07T08:00:00Z',
    completedAt: '2024-03-07T08:00:03Z',
  },
  {
    id: 'txn_023',
    type: 'cable',
    status: 'completed',
    amount: 4500,
    currency: 'NGN',
    description: 'GOtv Max',
    reference: 'TND1234567912',
    metadata: { provider: 'GOtv', smartCardNumber: '0987654321', plan: 'Max' },
    createdAt: '2024-03-06T13:45:00Z',
    completedAt: '2024-03-06T13:45:06Z',
  },
  {
    id: 'txn_024',
    type: 'receive',
    status: 'completed',
    amount: 22000,
    currency: 'NGN',
    description: 'Birthday gift from Kelechi',
    sender: { id: 'user_006', name: 'Kelechi Udoka', username: 'kelechi' },
    reference: 'TND1234567913',
    createdAt: '2024-03-05T20:00:00Z',
    completedAt: '2024-03-05T20:00:02Z',
  },
  {
    id: 'txn_025',
    type: 'deposit',
    status: 'completed',
    amount: 500000,
    currency: 'NGN',
    description: 'USSD Deposit',
    reference: 'TND1234567914',
    metadata: { method: 'ussd', bank: 'UBA' },
    createdAt: '2024-03-05T10:30:00Z',
    completedAt: '2024-03-05T10:35:00Z',
  },
];

export const getTransactionById = (id: string): Transaction | undefined => {
  return transactions.find(txn => txn.id === id);
};

export const getRecentTransactions = (limit: number = 5): Transaction[] => {
  return [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const getTransactionsByType = (type: TransactionType): Transaction[] => {
  return transactions.filter(txn => txn.type === type);
};

export const getTransactionsByStatus = (status: TransactionStatus): Transaction[] => {
  return transactions.filter(txn => txn.status === status);
};
