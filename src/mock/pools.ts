export type PoolStatus = 'active' | 'completed' | 'cancelled';

export interface PoolContributor {
  id: string;
  userId: string;
  name: string;
  username?: string;
  amount: number;
  contributedAt: string;
}

export interface Pool {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  creatorId: string;
  creatorName: string;
  contributors: PoolContributor[];
  status: PoolStatus;
  deadline?: string;
  createdAt: string;
  completedAt?: string;
}

export const pools: Pool[] = [
  {
    id: 'pool_001',
    title: 'Office Party Fund',
    description: 'End of year party for the team. Food, drinks, and entertainment.',
    targetAmount: 200000,
    currentAmount: 200000,
    currency: 'NGN',
    creatorId: 'user_001',
    creatorName: 'Chioma Adeyemi',
    contributors: [
      {
        id: 'contrib_001',
        userId: 'user_001',
        name: 'Chioma Adeyemi',
        username: 'chioma',
        amount: 50000,
        contributedAt: '2024-03-10T10:00:00Z',
      },
      {
        id: 'contrib_002',
        userId: 'user_002',
        name: 'Emeka Okonkwo',
        username: 'emeka',
        amount: 40000,
        contributedAt: '2024-03-10T14:00:00Z',
      },
      {
        id: 'contrib_003',
        userId: 'user_003',
        name: 'Ngozi Eze',
        username: 'ngozi',
        amount: 30000,
        contributedAt: '2024-03-11T09:00:00Z',
      },
      {
        id: 'contrib_004',
        userId: 'user_006',
        name: 'Kelechi Udoka',
        username: 'kelechi',
        amount: 20000,
        contributedAt: '2024-03-11T14:00:00Z',
      },
      {
        id: 'contrib_005',
        userId: 'user_005',
        name: 'Amara Obi',
        username: 'amara',
        amount: 35000,
        contributedAt: '2024-03-11T15:30:00Z',
      },
      {
        id: 'contrib_006',
        userId: 'user_004',
        name: 'Chidi Nwosu',
        username: 'chidi',
        amount: 25000,
        contributedAt: '2024-03-11T16:00:00Z',
      },
    ],
    status: 'completed',
    deadline: '2024-03-15T23:59:59Z',
    createdAt: '2024-03-10T09:00:00Z',
    completedAt: '2024-03-11T16:00:00Z',
  },
  {
    id: 'pool_002',
    title: 'Wedding Gift for Ada',
    description: 'Contributions for Ada\'s wedding gift. She\'s getting married on April 20th!',
    targetAmount: 150000,
    currentAmount: 85000,
    currency: 'NGN',
    creatorId: 'user_003',
    creatorName: 'Ngozi Eze',
    contributors: [
      {
        id: 'contrib_007',
        userId: 'user_003',
        name: 'Ngozi Eze',
        username: 'ngozi',
        amount: 25000,
        contributedAt: '2024-03-08T10:00:00Z',
      },
      {
        id: 'contrib_008',
        userId: 'user_001',
        name: 'Chioma Adeyemi',
        username: 'chioma',
        amount: 20000,
        contributedAt: '2024-03-09T11:00:00Z',
      },
      {
        id: 'contrib_009',
        userId: 'user_002',
        name: 'Emeka Okonkwo',
        username: 'emeka',
        amount: 15000,
        contributedAt: '2024-03-10T09:30:00Z',
      },
      {
        id: 'contrib_010',
        userId: 'user_005',
        name: 'Amara Obi',
        username: 'amara',
        amount: 25000,
        contributedAt: '2024-03-12T14:00:00Z',
      },
    ],
    status: 'active',
    deadline: '2024-04-15T23:59:59Z',
    createdAt: '2024-03-08T09:00:00Z',
  },
];

export const getPoolById = (id: string): Pool | undefined => {
  return pools.find(pool => pool.id === id);
};

export const getPoolsForUser = (userId: string): Pool[] => {
  return pools.filter(pool =>
    pool.creatorId === userId ||
    pool.contributors.some(c => c.userId === userId)
  );
};

export const getActivePoolsForUser = (userId: string): Pool[] => {
  return pools.filter(pool =>
    pool.status === 'active' &&
    (pool.creatorId === userId || pool.contributors.some(c => c.userId === userId))
  );
};

export const getPoolProgress = (pool: Pool): number => {
  return (pool.currentAmount / pool.targetAmount) * 100;
};

export const getRemainingAmount = (pool: Pool): number => {
  return pool.targetAmount - pool.currentAmount;
};

export const getDaysRemaining = (pool: Pool): number | null => {
  if (!pool.deadline) return null;
  const now = new Date();
  const deadline = new Date(pool.deadline);
  const diff = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
