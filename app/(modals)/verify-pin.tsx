import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';
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
    <SafeAreaView className="flex-1 bg-bg-elevated">
      <View className="items-end px-4 pt-2">
        <IconButton
          icon={<Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M18 6L6 18M6 6L18 18" stroke={colors.text.primary} strokeWidth={2} strokeLinecap="round" /></Svg>}
          onPress={handleClose}
          variant="ghost"
        />
      </View>

      <View className="flex-1 items-center pt-8">
        <Text className="text-headline-md font-inter-semibold text-txt-primary mb-2">
          Enter your PIN
        </Text>
        <Text className="text-body-md font-inter text-txt-secondary mb-8">
          Verify your identity to continue
        </Text>

        <View className="mb-4">
          <PinInput value={pin} onChange={setPin} error={error} />
        </View>

        {error && (
          <Text className="text-body-md font-inter text-error-main">
            Incorrect PIN. Please try again.
          </Text>
        )}
      </View>

      <Keypad onKeyPress={handleKeyPress} onDelete={handleDelete} showBiometric onBiometric={() => {}} />
    </SafeAreaView>
  );
}
