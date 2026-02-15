import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  reference: string;
  created_at: string;
  sender?: { id: string; name: string; username: string };
  recipient?: { id: string; name: string; username: string };
}

interface TransactionsResponse {
  transactions: Transaction[];
  cursor?: string;
  has_more: boolean;
}

export function useTransactions(params?: { type?: string; status?: string }) {
  return useInfiniteQuery({
    queryKey: ['transactions', params],
    queryFn: ({ pageParam }) =>
      api.getTransactions({
        cursor: pageParam as string | undefined,
        type: params?.type,
        status: params?.status,
      }) as Promise<TransactionsResponse>,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.cursor : undefined,
  });
}

export function useRecentTransactions(limit = 5) {
  return useQuery({
    queryKey: ['transactions', 'recent', limit],
    queryFn: async () => {
      const data = await api.getTransactions({ page: 1 }) as TransactionsResponse;
      return data.transactions?.slice(0, limit) ?? [];
    },
  });
}

export function useTransactionDetail(txId: string | undefined) {
  return useQuery({
    queryKey: ['transaction', txId],
    queryFn: () => api.getTransactionDetail(txId!) as Promise<Transaction>,
    enabled: !!txId,
  });
}

export type { Transaction, TransactionsResponse };
