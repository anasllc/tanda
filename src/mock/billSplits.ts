export type SplitStatus = 'pending' | 'partial' | 'completed' | 'cancelled';
export type ParticipantStatus = 'pending' | 'paid' | 'declined';

export interface SplitParticipant {
  id: string;
  userId: string;
  name: string;
  username?: string;
  amount: number;
  status: ParticipantStatus;
  paidAt?: string;
}

export interface BillSplit {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  currency: string;
  creatorId: string;
  creatorName: string;
  participants: SplitParticipant[];
  status: SplitStatus;
  splitType: 'equal' | 'custom';
  createdAt: string;
  completedAt?: string;
}

export const billSplits: BillSplit[] = [
  {
    id: 'split_001',
    title: 'Dinner at Bukka',
    description: 'Team dinner after project completion',
    totalAmount: 32000,
    currency: 'NGN',
    creatorId: 'user_005',
    creatorName: 'Amara Obi',
    participants: [
      {
        id: 'part_001',
        userId: 'user_001',
        name: 'Chioma Adeyemi',
        username: 'chioma',
        amount: 8000,
        status: 'paid',
        paidAt: '2024-03-11T21:00:00Z',
      },
      {
        id: 'part_002',
        userId: 'user_003',
        name: 'Ngozi Eze',
        username: 'ngozi',
        amount: 8000,
        status: 'paid',
        paidAt: '2024-03-11T22:30:00Z',
      },
      {
        id: 'part_003',
        userId: 'user_005',
        name: 'Amara Obi',
        username: 'amara',
        amount: 8000,
        status: 'paid',
        paidAt: '2024-03-11T20:00:00Z',
      },
      {
        id: 'part_004',
        userId: 'user_002',
        name: 'Emeka Okonkwo',
        username: 'emeka',
        amount: 8000,
        status: 'pending',
      },
    ],
    status: 'partial',
    splitType: 'equal',
    createdAt: '2024-03-11T19:30:00Z',
  },
  {
    id: 'split_002',
    title: 'Netflix Subscription',
    description: 'Monthly Netflix premium plan',
    totalAmount: 6500,
    currency: 'NGN',
    creatorId: 'user_001',
    creatorName: 'Chioma Adeyemi',
    participants: [
      {
        id: 'part_005',
        userId: 'user_001',
        name: 'Chioma Adeyemi',
        username: 'chioma',
        amount: 1625,
        status: 'paid',
        paidAt: '2024-03-01T10:00:00Z',
      },
      {
        id: 'part_006',
        userId: 'user_002',
        name: 'Emeka Okonkwo',
        username: 'emeka',
        amount: 1625,
        status: 'paid',
        paidAt: '2024-03-01T12:00:00Z',
      },
      {
        id: 'part_007',
        userId: 'user_003',
        name: 'Ngozi Eze',
        username: 'ngozi',
        amount: 1625,
        status: 'paid',
        paidAt: '2024-03-01T14:30:00Z',
      },
      {
        id: 'part_008',
        userId: 'user_004',
        name: 'Chidi Nwosu',
        username: 'chidi',
        amount: 1625,
        status: 'paid',
        paidAt: '2024-03-02T09:00:00Z',
      },
    ],
    status: 'completed',
    splitType: 'equal',
    createdAt: '2024-03-01T09:00:00Z',
    completedAt: '2024-03-02T09:00:00Z',
  },
  {
    id: 'split_003',
    title: 'Road Trip Fuel',
    description: 'Fuel for Calabar trip',
    totalAmount: 45000,
    currency: 'NGN',
    creatorId: 'user_006',
    creatorName: 'Kelechi Udoka',
    participants: [
      {
        id: 'part_009',
        userId: 'user_006',
        name: 'Kelechi Udoka',
        username: 'kelechi',
        amount: 15000,
        status: 'paid',
        paidAt: '2024-02-28T08:00:00Z',
      },
      {
        id: 'part_010',
        userId: 'user_001',
        name: 'Chioma Adeyemi',
        username: 'chioma',
        amount: 15000,
        status: 'pending',
      },
      {
        id: 'part_011',
        userId: 'user_007',
        name: 'Adaeze Ikenna',
        username: 'adaeze',
        amount: 15000,
        status: 'declined',
      },
    ],
    status: 'partial',
    splitType: 'equal',
    createdAt: '2024-02-28T07:30:00Z',
  },
];

export const getBillSplitById = (id: string): BillSplit | undefined => {
  return billSplits.find(split => split.id === id);
};

export const getBillSplitsForUser = (userId: string): BillSplit[] => {
  return billSplits.filter(split =>
    split.creatorId === userId ||
    split.participants.some(p => p.userId === userId)
  );
};

export const getPendingSplitsForUser = (userId: string): BillSplit[] => {
  return billSplits.filter(split =>
    split.participants.some(p => p.userId === userId && p.status === 'pending')
  );
};

export const getSplitProgress = (split: BillSplit): number => {
  const paidAmount = split.participants
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  return (paidAmount / split.totalAmount) * 100;
};
