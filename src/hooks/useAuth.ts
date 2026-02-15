import { useCallback } from 'react';
import { usePrivy, useLoginWithSMS, useEmbeddedEthereumWallet } from '@privy-io/expo';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../stores';

export function useAuth() {
  const { isReady, user: privyUser, logout: privyLogout } = usePrivy();
  const { sendCode, loginWithCode } = useLoginWithSMS();
  const wallet = useEmbeddedEthereumWallet();
  const queryClient = useQueryClient();

  const authStore = useAuthStore();
  const isAuthenticated = privyUser !== null;

  const sendOtp = useCallback(async (phone: string) => {
    authStore.setPhoneNumber(phone);
    await sendCode({ phone });
  }, [sendCode, authStore]);

  const verifyOtp = useCallback(async (code: string) => {
    const phone = authStore.phoneNumber;
    if (!phone) throw new Error('Phone number not set');

    await loginWithCode({ code, phone });

    // Get or create embedded wallet
    let walletAddress = '';
    if (wallet.wallets && wallet.wallets.length > 0) {
      walletAddress = wallet.wallets[0].address;
    } else {
      await wallet.create();
      // After creation, the wallet should appear in the wallets list
      // but since state may not have updated yet, we re-read
      walletAddress = wallet.wallets?.[0]?.address ?? '';
    }

    // Sync with our backend
    const syncResult = await api.syncUser(phone, walletAddress) as any;

    return {
      needsUsername: syncResult.needs_username ?? false,
      needsPin: syncResult.needs_pin ?? false,
      user: syncResult.user,
    };
  }, [loginWithCode, authStore, wallet]);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await api.getProfile() as any;
      const user = {
        id: profile.id,
        username: profile.username || '',
        displayName: profile.display_name || '',
        phoneNumber: profile.phone || authStore.phoneNumber || '',
        email: profile.email,
        avatar: profile.avatar_url,
        isVerified: profile.kyc_level !== 'none',
        createdAt: profile.created_at,
        walletAddress: profile.wallet_address,
        needsUsername: !profile.username,
        needsPin: !profile.has_pin,
      };

      authStore.setUser(user);
      authStore.setOnboarded(!!profile.username && profile.has_pin);
      authStore.setPinSet(!!profile.has_pin);

      return user;
    } catch {
      return null;
    }
  }, [authStore]);

  const logout = useCallback(async () => {
    await privyLogout();
    authStore.logout();
    queryClient.clear();
  }, [privyLogout, authStore, queryClient]);

  return {
    isReady,
    isAuthenticated,
    privyUser,
    sendOtp,
    verifyOtp,
    loadProfile,
    logout,
  };
}
