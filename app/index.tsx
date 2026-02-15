import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { usePrivy } from '@privy-io/expo';
import { useAuth } from '../src/hooks/useAuth';
import { useAuthStore } from '../src/stores';
import { colors } from '../src/theme';

export default function Index() {
  const { isReady, user } = usePrivy();
  const { loadProfile } = useAuth();
  const status = useAuthStore((state) => state.status);
  const isOnboarded = useAuthStore((state) => state.isOnboarded);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    const init = async () => {
      if (user) {
        await loadProfile();
      } else {
        useAuthStore.getState().logout();
      }
      setIsLoading(false);
    };

    init();
  }, [isReady, user]);

  if (!isReady || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050506' }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (status === 'authenticated' && isOnboarded) {
    return <Redirect href="/(main)/(home)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
