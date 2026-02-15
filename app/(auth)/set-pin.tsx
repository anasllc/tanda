import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../src/theme';
import { PinInput, Keypad } from '../../src/components/ui';
import { Header } from '../../src/components/layout';
import { useAuthStore, useUIStore } from '../../src/stores';
import { pinSuccessHaptic } from '../../src/utils/haptics';

type Step = 'create' | 'confirm';

export default function SetPinScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const showToast = useUIStore((state) => state.showToast);

  const [step, setStep] = useState<Step>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);

  // Animation values for step transition
  const slideAnim = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  const currentPin = step === 'create' ? pin : confirmPin;
  const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

  // Animate step transition
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: step === 'create' ? 0 : 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 100,
    }).start();
  }, [step]);

  // Animate error visibility
  useEffect(() => {
    Animated.timing(errorOpacity, {
      toValue: error ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [error]);

  const handleKeyPress = (key: string) => {
    if (currentPin.length < 6) {
      setCurrentPin(currentPin + key);
      setError(false);
    }
  };

  const handleDelete = () => {
    setCurrentPin(currentPin.slice(0, -1));
    setError(false);
  };

  const handlePinComplete = async (completedPin: string) => {
    if (step === 'create') {
      // Move to confirmation step
      setStep('confirm');
    } else {
      // Verify PIN matches
      if (completedPin === pin) {
        await pinSuccessHaptic();
        showToast({ type: 'success', title: 'PIN created successfully!' });

        // Log user in (for demo)
        login();

        // Navigate to main app
        router.replace('/(main)/(home)');
      } else {
        setError(true);
        setConfirmPin('');
      }
    }
  };

  // Auto-submit when 6 digits entered
  React.useEffect(() => {
    if (currentPin.length === 6) {
      handlePinComplete(currentPin);
    }
  }, [currentPin]);

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('create');
      setConfirmPin('');
      setError(false);
    } else {
      router.back();
    }
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
            <Header showBack onBack={handleBack} />

            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {step === 'create' ? 'Create your PIN' : 'Confirm your PIN'}
                </Text>
                <Text style={styles.subtitle}>
                  {step === 'create'
                    ? "You'll use this to confirm transactions"
                    : 'Enter your PIN again to confirm'}
                </Text>
              </View>

              <View style={styles.pinContainer}>
                <PinInput
                  value={currentPin}
                  onChange={setCurrentPin}
                  error={error}
                />

                <Animated.Text
                  style={[
                    styles.errorText,
                    { opacity: errorOpacity },
                  ]}
                >
                  PINs don't match. Try again.
                </Animated.Text>
              </View>
            </View>

            <View style={styles.keypadContainer}>
              <Keypad
                onKeyPress={handleKeyPress}
                onDelete={handleDelete}
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
    alignItems: 'center',
  },
  title: {
    ...typography.headlineLarge,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  pinContainer: {
    alignItems: 'center',
    marginTop: spacing[12],
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.error.main,
    marginTop: spacing[4],
    textAlign: 'center',
  },
  keypadContainer: {
    paddingBottom: spacing[8],
  },
});
