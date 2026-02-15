import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../stores';
import { useEffect } from 'react';

interface BalanceResponse {
  available: number;
  pending: number;
  locked: number;
}

export function useBalance() {
  const setBalance = useAuthStore((s) => s.setBalance);

  const query = useQuery({
    queryKey: ['balance'],
    queryFn: () => api.getBalance() as Promise<BalanceResponse>,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (query.data) {
      setBalance(query.data.available, query.data.pending, query.data.locked);
    }
  }, [query.data, setBalance]);

  return query;
}
