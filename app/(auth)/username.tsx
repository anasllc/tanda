import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Keyboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../src/theme';
import { Button } from '../../src/components/ui';
import { Header } from '../../src/components/layout';
import { api } from '../../src/lib/api';
import { useRegisterUsername } from '../../src/hooks/useProfile';
import { useUIStore } from '../../src/stores';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const CheckIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill={colors.success.main} />
    <Path
      d="M8 12L11 15L16 9"
      stroke={colors.white}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const XIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill={colors.error.main} />
    <Path
      d="M15 9L9 15M9 9L15 15"
      stroke={colors.white}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export default function UsernameScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const registerUsername = useRegisterUsername();

  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<UsernameStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounced availability check via API
  useEffect(() => {
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);

    if (username.length < 3) {
      setStatus('idle');
      return;
    }

    // Validate format
    const isValidFormat = /^[a-z0-9_]+$/.test(username);
    if (!isValidFormat) {
      setStatus('invalid');
      return;
    }

    setStatus('checking');

    checkTimerRef.current = setTimeout(async () => {
      try {
        const result = await api.checkUsername(username);
        setStatus(result.available ? 'available' : 'taken');
      } catch {
        setStatus('idle');
      }
    }, 500);

    return () => {
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    };
  }, [username]);

  const handleUsernameChange = (text: string) => {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
  };

  const handleContinue = async () => {
    if (status !== 'available') return;

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      await registerUsername.mutateAsync(username);
      router.push('/(auth)/set-pin');
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to register username', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'checking':
        return 'Checking availability...';
      case 'available':
        return `@${username} is available!`;
      case 'taken':
        return `@${username} is already taken`;
      case 'invalid':
        return 'Only lowercase letters, numbers, and underscores allowed';
      default:
        return 'At least 3 characters';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'available':
        return <CheckIcon />;
      case 'taken':
      case 'invalid':
        return <XIcon />;
      default:
        return null;
    }
  };

  const getStatusTextClass = () => {
    if (status === 'available') return 'text-body-sm font-inter text-success-main ml-1';
    if (status === 'taken' || status === 'invalid') return 'text-body-sm font-inter text-error-main ml-1';
    return 'text-body-sm font-inter text-txt-tertiary ml-1';
  };

  const isValid = status === 'available';

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="flex-1">
            <Header showBack />

            <View className="flex-1 px-5">
              <View className="mt-4 mb-8">
                <Text className="text-headline-lg font-inter-bold text-txt-primary mb-2">
                  Choose a username
                </Text>
                <Text className="text-body-lg font-inter text-txt-secondary">
                  This is how friends will find and pay you
                </Text>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center h-14 bg-bg-tertiary rounded-xl border border-border px-4">
                  <Text className="text-body-lg font-inter text-txt-tertiary mr-1">@</Text>
                  <TextInput
                    className="flex-1 h-full text-[16px] text-txt-primary p-0 m-0"
                    style={{ includeFontPadding: false }}
                    value={username}
                    onChangeText={handleUsernameChange}
                    placeholder="username"
                    placeholderTextColor={colors.text.tertiary}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                  />
                  <View className="ml-2">{getStatusIcon()}</View>
                </View>

                <Text className={getStatusTextClass()}>
                  {getStatusMessage()}
                </Text>
              </View>
            </View>

            <View className="px-5 pb-8">
              <Button
                title="Continue"
                onPress={handleContinue}
                fullWidth
                loading={isSubmitting}
                disabled={!isValid}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
