import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useInitiateOnramp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { amountNgn: number; method: string }) =>
      api.initiateOnramp(params.amountNgn, params.method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useInitiateOfframp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { amountUsdc: number; bankAccountId: string; pin: string }) =>
      api.initiateOfframp(params.amountUsdc, params.bankAccountId, params.pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
