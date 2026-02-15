import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../src/theme';
import { OTPInput, Button } from '../../src/components/ui';
import { Header } from '../../src/components/layout';
import { useAuthStore, useUIStore } from '../../src/stores';
import { formatPhoneNumber } from '../../src/utils/formatters';

const COUNTDOWN_SECONDS = 60;

export default function VerifyScreen() {
  const router = useRouter();
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const showToast = useUIStore((state) => state.showToast);

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
    if (isVerifying) return; // Prevent double-submission

    setIsVerifying(true);
    setError(false);

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo: accept any 6-digit code or show error
    if (code === '123456' || code.length === 6) {
      showToast({ type: 'success', title: 'Phone verified!' });
      router.replace('/(auth)/username');
    } else {
      setError(true);
      setOtp('');
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    setCountdown(COUNTDOWN_SECONDS);
    setCanResend(false);
    setError(false);
    setOtp('');
    showToast({ type: 'info', title: 'Code resent', message: 'Check your SMS' });
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.flex}>
            <Header showBack />

            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Enter verification code</Text>
                <Text style={styles.subtitle}>
                  We sent a 6-digit code to{'\n'}
                  <Text style={styles.phone}>
                    {phoneNumber ? formatPhoneNumber(phoneNumber) : '+234 *** *** ****'}
                  </Text>
                </Text>
              </View>

              <View style={styles.otpContainer}>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleOtpComplete}
                  error={error}
                  disabled={isVerifying}
                />

                {error && (
                  <Text style={styles.errorText}>
                    Invalid code. Please try again.
                  </Text>
                )}
              </View>

              <View style={styles.resendContainer}>
                {canResend ? (
                  <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendText}>
                      Didn't receive the code? <Text style={styles.resendLink}>Resend</Text>
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.countdownText}>
                    Resend code in <Text style={styles.countdown}>{formatCountdown()}</Text>
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.footer}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[5],
  },
  header: {
    marginTop: spacing[4],
    marginBottom: spacing[8],
  },
  title: {
    ...typography.headlineLarge,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    lineHeight: 26,
  },
  phone: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  otpContainer: {
    alignItems: 'center',
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.error.main,
    marginTop: spacing[4],
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing[8],
  },
  resendText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  resendLink: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  countdownText: {
    ...typography.bodyMedium,
    color: colors.text.tertiary,
  },
  countdown: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
});
