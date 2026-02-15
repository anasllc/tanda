import { create } from 'zustand';
import { currentUser, User } from '../mock/users';

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
  login: () => void;
  logout: () => void;
  updateBalance: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'unauthenticated',
  user: null,
  phoneNumber: null,
  isOnboarded: false,
  isPinSet: false,
  balance: 247500.00, // Mock balance
  pendingBalance: 15000.00, // Mock pending
  lockedBalance: 0,

  setPhoneNumber: (phone) => set({ phoneNumber: phone }),

  setUser: (user) => set({ user, status: 'authenticated' }),

  setOnboarded: (value) => set({ isOnboarded: value }),

  setPinSet: (value) => set({ isPinSet: value }),

  login: () => set({
    status: 'authenticated',
    user: currentUser,
    isOnboarded: true,
    isPinSet: true,
  }),

  logout: () => set({
    status: 'unauthenticated',
    user: null,
    phoneNumber: null,
    isOnboarded: false,
    isPinSet: false,
  }),

  updateBalance: (amount) => set((state) => ({
    balance: state.balance + amount,
  })),
}));

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.status === 'authenticated';
export const selectBalance = (state: AuthState) => state.balance;
export const selectTotalBalance = (state: AuthState) =>
  state.balance + state.pendingBalance + state.lockedBalance;
