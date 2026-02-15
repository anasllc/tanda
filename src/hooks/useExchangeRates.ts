import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface ExchangeRates {
  usdc_ngn: number;
  ngn_usdc: number;
  updated_at: string;
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchangeRates'],
    queryFn: () => api.getExchangeRates() as Promise<ExchangeRates>,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export type { ExchangeRates };
