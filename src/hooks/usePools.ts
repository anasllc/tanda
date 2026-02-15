import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface PoolContributor {
  id: string;
  user_id: string;
  display_name: string;
  username?: string;
  amount_usdc: number;
  message?: string;
  is_anonymous: boolean;
  created_at: string;
}

interface Pool {
  id: string;
  title: string;
  description?: string;
  pool_type: string;
  target_amount: number;
  current_amount: number;
  status: string;
  deadline?: string;
  allow_anonymous: boolean;
  share_token: string;
  created_at: string;
  creator: { id: string; display_name: string; username?: string };
  contributors: PoolContributor[];
}

export function usePool(poolId?: string, shareToken?: string) {
  return useQuery({
    queryKey: ['pool', poolId ?? shareToken],
    queryFn: () => api.getPool(poolId, shareToken) as Promise<Pool>,
    enabled: !!(poolId || shareToken),
  });
}

export function useCreatePool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Parameters<typeof api.createPool>[0]) => api.createPool(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool'] });
    },
  });
}

export function useContributeToPool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      poolId: string;
      amount: number;
      pin: string;
      message?: string;
      isAnonymous?: boolean;
    }) => api.contributeToPool(params.poolId, params.amount, params.pin, params.message, params.isAnonymous),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pool', variables.poolId] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useWithdrawFromPool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { poolId: string; pin: string; amountUsdc?: number }) =>
      api.withdrawFromPool(params.poolId, params.pin, params.amountUsdc),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pool', variables.poolId] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}
