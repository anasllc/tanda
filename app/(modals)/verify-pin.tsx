import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../src/theme';
import { PinInput, Keypad, IconButton } from '../../src/components/ui';
import Svg, { Path } from 'react-native-svg';

export default function VerifyPinModal() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      const newPin = pin + key;
      setPin(newPin);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon={<Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M18 6L6 18M6 6L18 18" stroke={colors.text.primary} strokeWidth={2} strokeLinecap="round" /></Svg>}
          onPress={handleClose}
          variant="ghost"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter your PIN</Text>
        <Text style={styles.subtitle}>Verify your identity to continue</Text>

        <View style={styles.pinContainer}>
          <PinInput value={pin} onChange={setPin} error={error} />
        </View>

        {error && <Text style={styles.errorText}>Incorrect PIN. Please try again.</Text>}
      </View>

      <Keypad onKeyPress={handleKeyPress} onDelete={handleDelete} showBiometric onBiometric={() => {}} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.elevated },
  header: { alignItems: 'flex-end', paddingHorizontal: spacing[4], paddingTop: spacing[2] },
  content: { flex: 1, alignItems: 'center', paddingTop: spacing[8] },
  title: { ...typography.headlineMedium, color: colors.text.primary, marginBottom: spacing[2] },
  subtitle: { ...typography.bodyMedium, color: colors.text.secondary, marginBottom: spacing[8] },
  pinContainer: { marginBottom: spacing[4] },
  errorText: { ...typography.bodyMedium, color: colors.error.main },
});
