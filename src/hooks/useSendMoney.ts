import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface SendResult {
  transaction_id: string;
  reference: string;
  status: string;
}

export function useSendToRegistered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      recipient: string;
      amountUsdc: number;
      memo?: string;
      pin: string;
    }) => api.sendToRegistered(params.recipient, params.amountUsdc, params.memo, params.pin) as Promise<SendResult>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useSendToUnregistered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      phone: string;
      amountUsdc: number;
      memo?: string;
      pin: string;
    }) => api.sendToUnregistered(params.phone, params.amountUsdc, params.memo, params.pin) as Promise<SendResult>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export type { SendResult };
