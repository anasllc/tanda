import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Card, Avatar, Badge, Button, ProgressBar, PinInput, Keypad } from '../../../src/components/ui';
import { usePool, useContributeToPool } from '../../../src/hooks/usePools';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';
import Svg, { Path } from 'react-native-svg';

export default function PoolDetailScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const params = useLocalSearchParams<{ id?: string }>();
  const poolId = params.id ?? 'pool_1';
  const { data: pool, isLoading } = usePool(poolId);
  const contributeToPool = useContributeToPool();

  const [showContribute, setShowContribute] = useState(false);
  const [contributeAmount, setContributeAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const progress = pool ? (pool.current_amount ?? 0) / (pool.target_amount ?? 1) : 0;

  const handleSharePool = async () => {
    if (!pool) return;
    lightHaptic();
    const poolLink = `https://tanda.app/pool/${pool.id}`;
    const message = `Help us reach our goal for "${pool.title}"! We've raised $${(pool.current_amount ?? 0).toFixed(2)} of $${(pool.target_amount ?? 0).toFixed(2)}. Contribute here: ${poolLink}`;

    try {
      await Share.share({
        message,
        title: 'Share Pool',
      });
    } catch (error) {
      await Clipboard.setStringAsync(poolLink);
      showToast({ type: 'success', title: 'Pool link copied!' });
    }
  };

  const handleContributePress = () => {
    if (!contributeAmount || parseFloat(contributeAmount) <= 0) {
      showToast({ type: 'error', title: 'Enter a valid amount' });
      return;
    }
    setShowPin(true);
  };

  const handlePinComplete = async (enteredPin: string) => {
    try {
      await contributeToPool.mutateAsync({
        poolId,
        amount: parseFloat(contributeAmount),
        pin: enteredPin,
      });
      showToast({ type: 'success', title: 'Contribution successful!' });
      setShowContribute(false);
      setContributeAmount('');
      setShowPin(false);
      setPin('');
    } catch (err: any) {
      if (err.code === 'INVALID_PIN') {
        setPinError(true);
        setPin('');
      } else {
        showToast({ type: 'error', title: 'Contribution failed', message: err.message });
        setShowPin(false);
        setPin('');
      }
    }
  };

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      const newPin = pin + key;
      setPin(newPin);
      setPinError(false);
      if (newPin.length === 6) {
        handlePinComplete(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setPinError(false);
  };

  if (showPin) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Enter PIN" onBack={() => { setShowPin(false); setPin(''); }} />

        <View className="flex-1 items-center pt-8">
          <Text className="text-headline-sm font-inter-semibold text-txt-primary mb-2">
            Enter your PIN to confirm
          </Text>
          <Text className="text-body-md font-inter text-txt-secondary mb-8">
            Contributing ${contributeAmount} to pool
          </Text>

          <View className="mb-4">
            <PinInput
              value={pin}
              onChange={setPin}
              error={pinError}
              disabled={contributeToPool.isPending}
            />
          </View>

          {pinError && (
            <Text className="text-body-md font-inter text-error-main">
              Incorrect PIN. Please try again.
            </Text>
          )}
        </View>

        <Keypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          disabled={contributeToPool.isPending}
        />
      </SafeAreaView>
    );
  }

  if (isLoading || !pool) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <Header showBack title="Pool Details" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <Header showBack title="Pool Details" />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-6">
        <Card className="items-center mb-6">
          <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colors.primary[500] + '20' }}>
            <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
              <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={colors.primary[400]} strokeWidth={1.5} strokeLinecap="round" />
              <Path d="M9 11a4 4 0 100-8 4 4 0 000 8z" stroke={colors.primary[400]} strokeWidth={1.5} />
              <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={colors.primary[400]} strokeWidth={1.5} strokeLinecap="round" />
            </Svg>
          </View>
          <Text className="text-headline-sm font-inter-semibold text-txt-primary mb-1">{pool.title}</Text>
          {pool.description && <Text className="text-body-md font-inter text-txt-secondary text-center mb-4">{pool.description}</Text>}

          <View className="flex-row items-baseline mb-3">
            <Text className="text-display-md font-inter-bold text-accent-400">${(pool.current_amount ?? 0).toFixed(2)}</Text>
            <Text className="text-body-lg font-inter text-txt-tertiary ml-2">of ${(pool.target_amount ?? 0).toFixed(2)}</Text>
          </View>

          <View className="w-full mb-3">
            <ProgressBar progress={progress} height={8} />
            <Text className="text-body-sm font-inter text-txt-secondary text-center mt-2">{Math.round(progress * 100)}% collected</Text>
          </View>

          {pool.deadline && (
            <View className="flex-row items-center gap-2">
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.text.tertiary} strokeWidth={1.5} strokeLinecap="round" />
              </Svg>
              <Text className="text-body-sm font-inter text-txt-tertiary">Ends {pool.deadline}</Text>
            </View>
          )}
        </Card>

        <Text className="text-title-sm font-inter-medium text-txt-primary mb-3">Contributors ({pool.contributors?.length ?? 0})</Text>

        {(pool.contributors ?? []).map((contributor: any) => (
          <Card key={contributor.id} className="mb-3">
            <View className="flex-row items-center">
              <Avatar name={contributor.display_name ?? contributor.name ?? 'User'} size="medium" />
              <View className="flex-1 ml-3">
                <Text className="text-body-lg font-inter text-txt-primary">{contributor.display_name ?? contributor.name ?? 'Anonymous'}</Text>
                <Text className="text-body-sm font-inter text-txt-tertiary">Contributed on {new Date(contributor.contributed_at ?? contributor.contributedAt).toLocaleDateString()}</Text>
              </View>
              <Text className="text-title-md font-inter-medium text-success-main">${(contributor.amount ?? contributor.amount_usdc ?? 0).toFixed(2)}</Text>
            </View>
          </Card>
        ))}

        {showContribute && (
          <Card className="mt-4">
            <Text className="text-title-sm font-inter-medium text-txt-primary mb-3">Contribution Amount</Text>
            <TextInput
              className="bg-bg-tertiary rounded-xl border border-border px-4 py-0 text-[16px] text-txt-primary h-14 mb-4"
              value={contributeAmount}
              onChangeText={setContributeAmount}
              placeholder="0.00"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="decimal-pad"
            />
            <Button
              title="Confirm Contribution"
              onPress={handleContributePress}
              fullWidth
              disabled={!contributeAmount || parseFloat(contributeAmount) <= 0}
            />
          </Card>
        )}

        <View className="mt-4">
          <Button
            title="Share Pool"
            variant="secondary"
            fullWidth
            onPress={handleSharePool}
          />
        </View>
      </ScrollView>

      <View className="px-5 pb-6">
        <Button
          title={showContribute ? 'Cancel' : 'Contribute'}
          onPress={() => setShowContribute(!showContribute)}
          fullWidth
          variant={showContribute ? 'secondary' : 'primary'}
        />
      </View>
    </SafeAreaView>
  );
}
