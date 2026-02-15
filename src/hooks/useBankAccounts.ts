import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface BankAccount {
  id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
}

interface BankAccountsResponse {
  accounts: BankAccount[];
}

export function useBankAccounts() {
  return useQuery({
    queryKey: ['bankAccounts'],
    queryFn: () => api.listBankAccounts() as Promise<BankAccountsResponse>,
  });
}

export function useAddBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { bankCode: string; accountNumber: string; bankName?: string }) =>
      api.addBankAccount(params.bankCode, params.accountNumber, params.bankName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
}

export type { BankAccount };
