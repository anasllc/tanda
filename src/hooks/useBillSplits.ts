import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface BillSplitParticipant {
  id: string;
  user_id: string;
  display_name: string;
  username?: string;
  amount_usdc: number;
  status: string;
  paid_at?: string;
}

interface BillSplit {
  id: string;
  title: string;
  totalAmount: number;
  total_amount_usdc: number;
  split_type: string;
  status: string;
  note?: string;
  created_at: string;
  payment_deadline?: string;
  participants: BillSplitParticipant[];
  creator: { id: string; display_name: string; username?: string };
}

export function useBillSplit(splitId?: string) {
  return useQuery({
    queryKey: ['billSplit', splitId],
    queryFn: () => api.getSplit(splitId!) as Promise<BillSplit>,
    enabled: !!splitId,
  });
}

export function useCreateSplit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Parameters<typeof api.createSplit>[0]) => api.createSplit(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billSplit'] });
    },
  });
}

export function usePaySplit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { splitId: string; pin: string }) =>
      api.paySplit(params.splitId, params.pin),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['billSplit', variables.splitId] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useRemindSplit() {
  return useMutation({
    mutationFn: (splitId: string) => api.remindSplit(splitId),
  });
}
