import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../stores';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  phone: string;
  email?: string;
  avatar_url?: string;
  kyc_level: string;
  has_pin: boolean;
  wallet_address: string;
  created_at: string;
  virtual_account?: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
}

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId ?? 'me'],
    queryFn: () => api.getProfile(userId) as Promise<Profile>,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (fields: Record<string, unknown>) => api.updateProfile(fields),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Sync relevant fields to auth store
      const updates: Record<string, any> = {};
      if (variables.display_name) updates.displayName = variables.display_name;
      if (variables.username) updates.username = variables.username;
      if (variables.email) updates.email = variables.email;
      if (Object.keys(updates).length > 0) updateUser(updates);
    },
  });
}

export function useCheckUsername() {
  return useMutation({
    mutationFn: (username: string) => api.checkUsername(username),
  });
}

export function useRegisterUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => api.registerUsername(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export type { Profile };
