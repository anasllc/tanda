import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Keyboard, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius, layout } from '../../src/theme';
import { Button } from '../../src/components/ui';
import { Header } from '../../src/components/layout';

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

// Simulated taken usernames
const takenUsernames = ['john', 'jane', 'admin', 'user', 'test'];

export default function UsernameScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<UsernameStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced availability check
  useEffect(() => {
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

    const timer = setTimeout(() => {
      // Simulate API check
      const isTaken = takenUsernames.includes(username.toLowerCase());
      setStatus(isTaken ? 'taken' : 'available');
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleUsernameChange = (text: string) => {
    // Only allow lowercase letters, numbers, and underscores
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
  };

  const handleContinue = async () => {
    if (status !== 'available') return;

    Keyboard.dismiss();
    setIsSubmitting(true);

    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 500));

    router.push('/(auth)/set-pin');
    setIsSubmitting(false);
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

  const isValid = status === 'available';

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
                <Text style={styles.title}>Choose a username</Text>
                <Text style={styles.subtitle}>
                  This is how friends will find and pay you
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.atSymbol}>@</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={handleUsernameChange}
                    placeholder="username"
                    placeholderTextColor={colors.text.tertiary}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                  />
                  <View style={styles.statusIcon}>{getStatusIcon()}</View>
                </View>

                <Text
                  style={[
                    styles.statusText,
                    status === 'available' && styles.statusSuccess,
                    (status === 'taken' || status === 'invalid') && styles.statusError,
                  ]}
                >
                  {getStatusMessage()}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
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
  },
  form: {
    gap: spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.inputHeight,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing[4],
  },
  atSymbol: {
    ...typography.bodyLarge,
    color: colors.text.tertiary,
    marginRight: spacing[1],
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  statusIcon: {
    marginLeft: spacing[2],
  },
  statusText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginLeft: spacing[1],
  },
  statusSuccess: {
    color: colors.success.main,
  },
  statusError: {
    color: colors.error.main,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
});
