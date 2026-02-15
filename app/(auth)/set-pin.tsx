import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinInput, Keypad } from '../../src/components/ui';
import { Header } from '../../src/components/layout';
import { useAuthStore, useUIStore } from '../../src/stores';
import { useSetupPin } from '../../src/hooks/usePin';
import { useAuth } from '../../src/hooks/useAuth';
import { pinSuccessHaptic } from '../../src/utils/haptics';

type Step = 'create' | 'confirm';

export default function SetPinScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const setupPin = useSetupPin();
  const { loadProfile } = useAuth();

  const [step, setStep] = useState<Step>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);

  // Animation values for step transition
  const slideAnim = useSharedValue(0);
  const errorOpacityValue = useSharedValue(0);

  const currentPin = step === 'create' ? pin : confirmPin;
  const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

  // Animate step transition
  useEffect(() => {
    slideAnim.value = withSpring(step === 'create' ? 0 : 1, {
      damping: 15,
      stiffness: 100,
    });
  }, [step]);

  // Animate error visibility
  useEffect(() => {
    errorOpacityValue.value = withTiming(error ? 1 : 0, { duration: 200 });
  }, [error]);

  const errorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: errorOpacityValue.value,
  }));

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
        try {
          await setupPin.mutateAsync(completedPin);
          await pinSuccessHaptic();
          showToast({ type: 'success', title: 'PIN created successfully!' });

          // Load full profile and navigate to main app
          await loadProfile();
          router.replace('/(main)/(home)');
        } catch (err: any) {
          setError(true);
          setConfirmPin('');
          showToast({ type: 'error', title: 'Failed to set PIN', message: err.message });
        }
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
    <SafeAreaView className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="flex-1">
            <Header showBack onBack={handleBack} />

            <View className="flex-1 px-5">
              <View className="mt-4 items-center">
                <Text className="text-headline-lg font-inter-bold text-txt-primary mb-2 text-center">
                  {step === 'create' ? 'Create your PIN' : 'Confirm your PIN'}
                </Text>
                <Text className="text-body-lg font-inter text-txt-secondary text-center">
                  {step === 'create'
                    ? "You'll use this to confirm transactions"
                    : 'Enter your PIN again to confirm'}
                </Text>
              </View>

              <View className="items-center mt-12">
                <PinInput
                  value={currentPin}
                  onChange={setCurrentPin}
                  error={error}
                />

                <Animated.Text
                  className="text-body-md font-inter text-error-main mt-4 text-center"
                  style={errorAnimatedStyle}
                >
                  PINs don't match. Try again.
                </Animated.Text>
              </View>
            </View>

            <View className="pb-8">
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
