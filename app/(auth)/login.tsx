import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, layout } from '../../src/theme';
import { Button, CountryPicker, countries, Country } from '../../src/components/ui';
import { Header } from '../../src/components/layout';
import { useAuthStore } from '../../src/stores';

export default function LoginScreen() {
  const router = useRouter();
  const setPhoneNumber = useAuthStore((state) => state.setPhoneNumber);

  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Nigeria
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const isValidPhone = phone.length >= 10;

  const handleContinue = () => {
    if (!isValidPhone) {
      setError('Please enter a valid phone number');
      return;
    }

    Keyboard.dismiss();
    const fullNumber = `${selectedCountry.dialCode}${phone.replace(/^0+/, '')}`;
    setPhoneNumber(fullNumber);
    router.push('/(auth)/verify');
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.inner}>
            <Header showBack />

            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Enter your phone number</Text>
                <Text style={styles.subtitle}>
                  We'll send you a verification code to confirm it's you
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputRow}>
                  <CountryPicker
                    selectedCountry={selectedCountry}
                    onSelect={setSelectedCountry}
                  />

                  <View style={styles.phoneInputContainer}>
                    <TextInput
                      ref={inputRef}
                      style={styles.phoneInput}
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

                {error && <Text style={styles.error}>{error}</Text>}
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                title="Continue"
                onPress={handleContinue}
                fullWidth
                disabled={!isValidPhone}
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
  keyboardAvoid: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[5],
    justifyContent: 'flex-start',
    paddingTop: spacing[2],
  },
  header: {
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
    gap: spacing[3],
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  phoneInputContainer: {
    flex: 1,
    height: layout.inputHeight,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error.main,
    marginTop: spacing[1],
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
});
