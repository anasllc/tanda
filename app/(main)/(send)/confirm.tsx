import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, Avatar, Card, PinInput, Keypad } from '../../../src/components/ui';
import { formatCurrency } from '../../../src/utils/formatters';
import { getContactById } from '../../../src/mock/contacts';

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    contactId: string;
    contactName: string;
    amount: string;
  }>();

  const [note, setNote] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const contact = params.contactId ? getContactById(params.contactId) : null;
  const amount = parseFloat(params.amount || '0');
  const fee = 0; // Free transfers

  const handleConfirm = () => {
    setShowPin(true);
  };

  const handlePinComplete = async (enteredPin: string) => {
    setIsProcessing(true);

    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (enteredPin === '123456' || enteredPin.length === 6) {
      router.replace({
        pathname: '/(main)/(send)/success',
        params: {
          contactName: params.contactName,
          amount: params.amount,
        },
      });
    } else {
      setPinError(true);
      setPin('');
    }

    setIsProcessing(false);
  };

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      const newPin = pin + key;
      setPin(newPin);
      setPinError(false);
      if (newPin.length === 6) {
        handlePinComplete(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setPinError(false);
  };

  if (showPin) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack title="Enter PIN" onBack={() => setShowPin(false)} />

        <View style={styles.pinContent}>
          <Text style={styles.pinTitle}>Enter your PIN to confirm</Text>
          <Text style={styles.pinSubtitle}>
            Sending {formatCurrency(amount)} to {params.contactName}
          </Text>

          <View style={styles.pinContainer}>
            <PinInput
              value={pin}
              onChange={setPin}
              error={pinError}
              disabled={isProcessing}
            />
          </View>

          {pinError && (
            <Text style={styles.errorText}>Incorrect PIN. Please try again.</Text>
          )}
        </View>

        <Keypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          disabled={isProcessing}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.flex}>
            <Header showBack title="Confirm Transfer" />

            <View style={styles.content}>
              <Card style={styles.summaryCard}>
                <View style={styles.recipientRow}>
                  <Avatar name={params.contactName || 'User'} size="large" />
                  <View style={styles.recipientInfo}>
                    <Text style={styles.recipientName}>{params.contactName}</Text>
                    {contact?.username && (
                      <Text style={styles.recipientUsername}>@{contact.username}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
                </View>

                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Fee</Text>
                  <Text style={styles.feeValue}>Free</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatCurrency(amount + fee)}</Text>
                </View>
              </Card>

              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>Add a note (optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="What's this for?"
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  maxLength={100}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                title="Confirm & Send"
                onPress={handleConfirm}
                fullWidth
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
    paddingTop: spacing[4],
  },
  summaryCard: {
    marginBottom: spacing[6],
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  recipientInfo: {
    marginLeft: spacing[4],
  },
  recipientName: {
    ...typography.titleLarge,
    color: colors.text.primary,
  },
  recipientUsername: {
    ...typography.bodyMedium,
    color: colors.primary[500],
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  amountLabel: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
  },
  amountValue: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  feeLabel: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
  },
  feeValue: {
    ...typography.bodyLarge,
    color: colors.success.main,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginBottom: spacing[4],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...typography.titleMedium,
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '700',
  },
  noteContainer: {
    marginBottom: spacing[4],
  },
  noteLabel: {
    ...typography.labelLarge,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  noteInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[4],
    minHeight: 100,
    ...typography.bodyLarge,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  pinContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing[8],
  },
  pinTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  pinSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing[8],
  },
  pinContainer: {
    marginBottom: spacing[4],
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.error.main,
  },
});
