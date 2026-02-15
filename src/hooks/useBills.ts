import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useBuyAirtime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { phone: string; network: string; amountLocal: number; pin: string }) =>
      api.buyAirtime(params.phone, params.network, params.amountLocal, params.pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useBuyData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      phone: string;
      network: string;
      planId: string;
      amountLocal: number;
      pin: string;
    }) => api.buyData(params.phone, params.network, params.planId, params.amountLocal, params.pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function usePayElectricity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      meterNumber: string;
      provider: string;
      amountLocal: number;
      meterType: 'prepaid' | 'postpaid';
      pin: string;
    }) => api.payElectricity(params.meterNumber, params.provider, params.amountLocal, params.meterType, params.pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function usePayCable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      smartcardNumber: string;
      provider: string;
      packageCode: string;
      amountLocal: number;
      pin: string;
    }) => api.payCable(params.smartcardNumber, params.provider, params.packageCode, params.amountLocal, params.pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
