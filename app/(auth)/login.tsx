import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';
import { Button, CountryPicker, countries, Country } from '../../src/components/ui';
import { Header } from '../../src/components/layout';
import { useAuth } from '../../src/hooks/useAuth';
import { useUIStore } from '../../src/stores';

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp } = useAuth();
  const showToast = useUIStore((state) => state.showToast);

  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Nigeria
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isValidPhone = phone.length >= 10;

  const handleContinue = async () => {
    if (!isValidPhone) {
      setError('Please enter a valid phone number');
      return;
    }

    Keyboard.dismiss();
    const fullNumber = `${selectedCountry.dialCode}${phone.replace(/^0+/, '')}`;

    setIsSending(true);
    try {
      await sendOtp(fullNumber);
      router.push('/(auth)/verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
      showToast({ type: 'error', title: 'Failed to send code', message: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhone(cleaned);
    setError('');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="flex-1">
            <Header showBack />

            <View className="flex-1 px-5 justify-start pt-2">
              <View className="mb-8">
                <Text className="text-headline-lg font-inter-bold text-txt-primary mb-2">
                  Enter your phone number
                </Text>
                <Text className="text-body-lg font-inter text-txt-secondary">
                  We'll send you a verification code to confirm it's you
                </Text>
              </View>

              <View className="gap-3">
                <View className="flex-row gap-3">
                  <CountryPicker
                    selectedCountry={selectedCountry}
                    onSelect={setSelectedCountry}
                  />

                  <View className="flex-1 h-14 bg-bg-tertiary rounded-xl border border-border flex-row items-center px-4">
                    <TextInput
                      ref={inputRef}
                      className="flex-1 h-full text-[16px] text-txt-primary p-0 m-0"
                      style={{ includeFontPadding: false }}
                      value={phone}
                      onChangeText={handlePhoneChange}
                      placeholder="812 345 6789"
                      placeholderTextColor={colors.text.tertiary}
                      keyboardType="phone-pad"
                      autoFocus
                      maxLength={11}
                      returnKeyType="done"
                      onSubmitEditing={dismissKeyboard}
                    />
                  </View>
                </View>

                {error && (
                  <Text className="text-body-sm font-inter text-error-main mt-1">
                    {error}
                  </Text>
                )}
              </View>
            </View>

            <View className="px-5 pb-8">
              <Button
                title="Continue"
                onPress={handleContinue}
                fullWidth
                disabled={!isValidPhone}
                loading={isSending}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
