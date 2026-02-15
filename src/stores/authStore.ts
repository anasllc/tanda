import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  displayName: string;
  phoneNumber: string;
  email?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  walletAddress?: string;
  needsUsername?: boolean;
  needsPin?: boolean;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  phoneNumber: string | null;
  isOnboarded: boolean;
  isPinSet: boolean;
  balance: number;
  pendingBalance: number;
  lockedBalance: number;

  // Actions
  setPhoneNumber: (phone: string) => void;
  setUser: (user: User) => void;
  setOnboarded: (value: boolean) => void;
  setPinSet: (value: boolean) => void;
  setBalance: (available: number, pending: number, locked: number) => void;
  login: (user: User) => void;
  logout: () => void;
  updateBalance: (amount: number) => void;
  updateUser: (fields: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  user: null,
  phoneNumber: null,
  isOnboarded: false,
  isPinSet: false,
  balance: 0,
  pendingBalance: 0,
  lockedBalance: 0,

  setPhoneNumber: (phone) => set({ phoneNumber: phone }),

  setUser: (user) => set({ user, status: 'authenticated' }),

  setOnboarded: (value) => set({ isOnboarded: value }),

  setPinSet: (value) => set({ isPinSet: value }),

  setBalance: (available, pending, locked) => set({
    balance: available,
    pendingBalance: pending,
    lockedBalance: locked,
  }),

  login: (user) => set({
    status: 'authenticated',
    user,
    isOnboarded: true,
    isPinSet: true,
  }),

  logout: () => set({
    status: 'unauthenticated',
    user: null,
    phoneNumber: null,
    isOnboarded: false,
    isPinSet: false,
    balance: 0,
    pendingBalance: 0,
    lockedBalance: 0,
  }),

  updateBalance: (amount) => set((state) => ({
    balance: state.balance + amount,
  })),

  updateUser: (fields) => set((state) => ({
    user: state.user ? { ...state.user, ...fields } : null,
  })),
}));

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.status === 'authenticated';
export const selectBalance = (state: AuthState) => state.balance;
export const selectTotalBalance = (state: AuthState) =>
  state.balance + state.pendingBalance + state.lockedBalance;
