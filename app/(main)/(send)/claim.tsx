import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, Card, Avatar, PinInput, Keypad } from '../../../src/components/ui';
import { transactions } from '../../../src/mock/transactions';

export default function ClaimScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [step, setStep] = useState<'preview' | 'pin'>('preview');
  const [pin, setPin] = useState('');

  const transaction = transactions.find(t => t.id === id) || transactions[0];

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === 6) {
        router.push('/(main)/(send)/success');
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleClaim = () => {
    setStep('pin');
  };

  if (step === 'pin') {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack title="Enter PIN" />
        <View style={styles.pinContent}>
          <Text style={styles.pinTitle}>Enter PIN to claim</Text>
          <Text style={styles.pinSubtitle}>Verify your identity</Text>
          <View style={styles.pinContainer}>
            <PinInput value={pin} onChange={setPin} />
          </View>
        </View>
        <Keypad onKeyPress={handleKeyPress} onDelete={handleDelete} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Claim Payment" />
      <View style={styles.content}>
        <Card style={styles.claimCard}>
          <View style={styles.senderInfo}>
            <Avatar name={transaction.title} size="lg" />
            <Text style={styles.senderName}>{transaction.title}</Text>
            <Text style={styles.sentText}>sent you</Text>
          </View>
          <Text style={styles.amount}>${Math.abs(transaction.amount).toFixed(2)}</Text>
          {transaction.note && (
            <View style={styles.noteContainer}>
              <Text style={styles.noteLabel}>Note</Text>
              <Text style={styles.noteText}>{transaction.note}</Text>
            </View>
          )}
        </Card>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            This payment will be added to your Tanda wallet balance once claimed.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Claim Payment" onPress={handleClaim} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1, paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  claimCard: { alignItems: 'center', paddingVertical: spacing[8] },
  senderInfo: { alignItems: 'center', marginBottom: spacing[4] },
  senderName: { ...typography.titleLarge, color: colors.text.primary, marginTop: spacing[3] },
  sentText: { ...typography.bodyMedium, color: colors.text.secondary },
  amount: { ...typography.displayLarge, color: colors.primary[400], marginBottom: spacing[4] },
  noteContainer: { alignItems: 'center' },
  noteLabel: { ...typography.labelSmall, color: colors.text.tertiary, marginBottom: spacing[1] },
  noteText: { ...typography.bodyMedium, color: colors.text.secondary },
  infoCard: { backgroundColor: colors.background.secondary, borderRadius: borderRadius.lg, padding: spacing[4], marginTop: spacing[4] },
  infoText: { ...typography.bodySmall, color: colors.text.tertiary, textAlign: 'center' },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6] },
  pinContent: { flex: 1, alignItems: 'center', paddingTop: spacing[8] },
  pinTitle: { ...typography.headlineMedium, color: colors.text.primary, marginBottom: spacing[2] },
  pinSubtitle: { ...typography.bodyMedium, color: colors.text.secondary, marginBottom: spacing[8] },
  pinContainer: { marginBottom: spacing[4] },
});
