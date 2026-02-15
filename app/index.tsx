import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores';

export default function Index() {
  const status = useAuthStore((state) => state.status);
  const isOnboarded = useAuthStore((state) => state.isOnboarded);

  // For demo: always start at welcome
  // In production, this would check actual auth state
  if (status === 'authenticated' && isOnboarded) {
    return <Redirect href="/(main)/(home)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
