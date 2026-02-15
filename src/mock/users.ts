export interface User {
  id: string;
  username: string;
  displayName: string;
  phoneNumber: string;
  email?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export const currentUser: User = {
  id: 'user_001',
  username: 'chioma',
  displayName: 'Chioma Adeyemi',
  phoneNumber: '+2348012345678',
  email: 'chioma@email.com',
  avatar: undefined,
  isVerified: true,
  createdAt: '2024-01-15T10:30:00Z',
};

export const users: User[] = [
  currentUser,
  {
    id: 'user_002',
    username: 'emeka',
    displayName: 'Emeka Okonkwo',
    phoneNumber: '+2348023456789',
    avatar: undefined,
    isVerified: true,
    createdAt: '2024-02-10T14:20:00Z',
  },
  {
    id: 'user_003',
    username: 'ngozi',
    displayName: 'Ngozi Eze',
    phoneNumber: '+2348034567890',
    avatar: undefined,
    isVerified: true,
    createdAt: '2024-01-20T09:15:00Z',
  },
  {
    id: 'user_004',
    username: 'chidi',
    displayName: 'Chidi Nwosu',
    phoneNumber: '+2348045678901',
    avatar: undefined,
    isVerified: false,
    createdAt: '2024-03-05T16:45:00Z',
  },
  {
    id: 'user_005',
    username: 'amara',
    displayName: 'Amara Obi',
    phoneNumber: '+2348056789012',
    avatar: undefined,
    isVerified: true,
    createdAt: '2024-02-28T11:00:00Z',
  },
  {
    id: 'user_006',
    username: 'kelechi',
    displayName: 'Kelechi Udoka',
    phoneNumber: '+2348067890123',
    avatar: undefined,
    isVerified: true,
    createdAt: '2024-01-08T08:30:00Z',
  },
  {
    id: 'user_007',
    username: 'adaeze',
    displayName: 'Adaeze Ikenna',
    phoneNumber: '+2348078901234',
    avatar: undefined,
    isVerified: true,
    createdAt: '2024-03-12T13:20:00Z',
  },
  {
    id: 'user_008',
    username: 'obinna',
    displayName: 'Obinna Chukwu',
    phoneNumber: '+2348089012345',
    avatar: undefined,
    isVerified: false,
    createdAt: '2024-02-15T10:10:00Z',
  },
];

export const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};
