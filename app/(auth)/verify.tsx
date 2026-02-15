import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OTPInput, Button } from '../../src/components/ui';
import { Header } from '../../src/components/layout';
import { useAuthStore, useUIStore } from '../../src/stores';
import { useAuth } from '../../src/hooks/useAuth';
import { formatPhoneNumber } from '../../src/utils/formatters';

const COUNTDOWN_SECONDS = 60;

export default function VerifyScreen() {
  const router = useRouter();
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const showToast = useUIStore((state) => state.showToast);
  const { verifyOtp, sendOtp } = useAuth();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpComplete = async (code: string) => {
    if (isVerifying) return;

    setIsVerifying(true);
    setError(false);

    try {
      const result = await verifyOtp(code);

      showToast({ type: 'success', title: 'Phone verified!' });

      if (result.needsUsername) {
        router.replace('/(auth)/username');
      } else if (result.needsPin) {
        router.replace('/(auth)/set-pin');
      } else {
        router.replace('/(main)/(home)');
      }
    } catch (err: any) {
      setError(true);
      setOtp('');
      showToast({ type: 'error', title: 'Verification failed', message: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!phoneNumber) return;
    setCountdown(COUNTDOWN_SECONDS);
    setCanResend(false);
    setError(false);
    setOtp('');

    try {
      await sendOtp(phoneNumber);
      showToast({ type: 'info', title: 'Code resent', message: 'Check your SMS' });
    } catch {
      showToast({ type: 'error', title: 'Failed to resend code' });
    }
  };

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

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
                  Enter verification code
                </Text>
                <Text className="text-body-lg font-inter text-txt-secondary leading-[26px]">
                  We sent a 6-digit code to{'\n'}
                  <Text className="text-txt-primary font-inter-semibold">
                    {phoneNumber ? formatPhoneNumber(phoneNumber) : '+234 *** *** ****'}
                  </Text>
                </Text>
              </View>

              <View className="items-center">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleOtpComplete}
                  error={error}
                  disabled={isVerifying}
                />

                {error && (
                  <Text className="text-body-md font-inter text-error-main mt-4 text-center">
                    Invalid code. Please try again.
                  </Text>
                )}
              </View>

              <View className="items-center mt-8">
                {canResend ? (
                  <TouchableOpacity onPress={handleResend}>
                    <Text className="text-body-md font-inter text-txt-secondary">
                      Didn't receive the code?{' '}
                      <Text className="text-accent-500 font-inter-semibold">Resend</Text>
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text className="text-body-md font-inter text-txt-tertiary">
                    Resend code in{' '}
                    <Text className="text-txt-secondary font-inter-semibold">
                      {formatCountdown()}
                    </Text>
                  </Text>
                )}
              </View>
            </View>

            <View className="px-5 pb-8">
              <Button
                title="Verify"
                onPress={() => handleOtpComplete(otp)}
                fullWidth
                loading={isVerifying}
                disabled={otp.length < 6}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
