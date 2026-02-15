import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../stores';

export function useSetupPin() {
  const setPinSet = useAuthStore((s) => s.setPinSet);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pin: string) => api.setupPin(pin),
    onSuccess: () => {
      setPinSet(true);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useVerifyPin() {
  return useMutation({
    mutationFn: (pin: string) => api.verifyPin(pin),
  });
}
