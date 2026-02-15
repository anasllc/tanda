import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { EmptyState } from '../../../src/components/ui';
import { lightHaptic } from '../../../src/utils/haptics';

export default function FriendsScreen() {
  const router = useRouter();

  const handleAddFriends = () => {
    lightHaptic();
    router.push('/(main)/(profile)/add-friend' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Friends" />
      <EmptyState type="friends" title="No friends yet" description="Add friends to send and receive money easily" actionLabel="Add Friends" onPress={handleAddFriends} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
});
