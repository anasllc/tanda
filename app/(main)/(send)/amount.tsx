import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Button, Avatar, Keypad } from '../../../src/components/ui';
import { formatCurrency } from '../../../src/utils/formatters';
import { useAuthStore } from '../../../src/stores';
import { getContactById } from '../../../src/mock/contacts';

export default function AmountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ contactId: string; contactName: string }>();
  const balance = useAuthStore((state) => state.balance);

  const [amount, setAmount] = useState('');

  const contact = params.contactId ? getContactById(params.contactId) : null;
  const numericAmount = parseFloat(amount) || 0;
  const isValidAmount = numericAmount > 0 && numericAmount <= balance;

  const handleKeyPress = (key: string) => {
    if (amount.length < 10) {
      // Prevent leading zeros
      if (amount === '0' && key !== '.') {
        setAmount(key);
      } else {
        setAmount(amount + key);
      }
    }
  };

  const handleDelete = () => {
    setAmount(amount.slice(0, -1));
  };

  const handleContinue = () => {
    if (isValidAmount) {
      router.push({
        pathname: '/(main)/(send)/confirm',
        params: {
          contactId: params.contactId,
          contactName: params.contactName,
          amount: amount,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Enter Amount" />

      <View style={styles.content}>
        <View style={styles.recipientContainer}>
          <Avatar name={params.contactName || 'User'} size="medium" />
          <Text style={styles.recipientName}>{params.contactName}</Text>
          {contact?.username && (
            <Text style={styles.recipientUsername}>@{contact.username}</Text>
          )}
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>₦</Text>
          <Text style={[styles.amount, !amount && styles.amountPlaceholder]}>
            {amount || '0'}
          </Text>
        </View>

        <Text style={styles.balanceText}>
          Available: {formatCurrency(balance)}
        </Text>

        {numericAmount > balance && (
          <Text style={styles.errorText}>Insufficient balance</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Keypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            fullWidth
            disabled={!isValidAmount}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing[6],
  },
  recipientContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  recipientName: {
    ...typography.titleMedium,
    color: colors.text.primary,
    marginTop: spacing[2],
  },
  recipientUsername: {
    ...typography.bodySmall,
    color: colors.primary[500],
    marginTop: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  currencySymbol: {
    ...typography.headlineMedium,
    color: colors.text.secondary,
    marginTop: spacing[2],
    marginRight: spacing[1],
  },
  amount: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -2,
  },
  amountPlaceholder: {
    color: colors.text.tertiary,
  },
  balanceText: {
    ...typography.bodyMedium,
    color: colors.text.tertiary,
    marginTop: spacing[4],
  },
  errorText: {
    ...typography.bodyMedium,
    color: colors.error.main,
    marginTop: spacing[2],
  },
  footer: {
    paddingBottom: spacing[8],
  },
  buttonContainer: {
    paddingHorizontal: spacing[5],
    marginTop: spacing[4],
  },
});
