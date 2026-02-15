import React, { useState } from 'react';
import { View, Text, StyleSheet, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Input, Button, Card } from '../../../src/components/ui';
import { useUIStore } from '../../../src/stores';
import Svg, { Path, Rect } from 'react-native-svg';

export default function DepositCardScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.slice(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleDeposit = () => {
    Keyboard.dismiss();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast({ type: 'success', title: `$${amount} deposited successfully!` });
      router.back();
    }, 2000);
  };

  const isValid = cardNumber.length === 19 && expiry.length === 5 && cvv.length === 3 && parseFloat(amount) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.flex}>
            <Header showBack title="Card Payment" />
            <View style={styles.content}>
              <Card style={styles.cardPreview}>
                <View style={styles.cardTop}>
                  <Svg width={40} height={28} viewBox="0 0 40 28">
                    <Rect width={40} height={28} rx={4} fill={colors.primary[600]} />
                    <Path d="M12 18H8v-2h4v2zm6-4H8v-2h10v2z" fill={colors.text.inverse} />
                  </Svg>
                  <Text style={styles.cardType}>VISA</Text>
                </View>
                <Text style={styles.cardNumberPreview}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </Text>
                <View style={styles.cardBottom}>
                  <View>
                    <Text style={styles.cardLabel}>EXPIRES</Text>
                    <Text style={styles.cardValue}>{expiry || 'MM/YY'}</Text>
                  </View>
                </View>
              </Card>

              <View style={styles.form}>
                <Input
                  label="Amount"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  leftIcon={<Text style={styles.currencyIcon}>$</Text>}
                />

                <Input
                  label="Card Number"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="number-pad"
                  maxLength={19}
                />

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Input
                      label="Expiry"
                      value={expiry}
                      onChangeText={(text) => setExpiry(formatExpiry(text))}
                      placeholder="MM/YY"
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Input
                      label="CVV"
                      value={cvv}
                      onChangeText={setCvv}
                      placeholder="123"
                      keyboardType="number-pad"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>

              <View style={styles.secureNote}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={colors.success.main} strokeWidth={1.5} />
                </Svg>
                <Text style={styles.secureText}>Your card details are encrypted and secure</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                title={loading ? 'Processing...' : `Deposit $${amount || '0.00'}`}
                onPress={handleDeposit}
                fullWidth
                disabled={!isValid}
                loading={loading}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  cardPreview: {
    backgroundColor: colors.primary[600],
    padding: spacing[5],
    marginBottom: spacing[6],
    height: 180,
    justifyContent: 'space-between',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardType: { ...typography.titleMedium, color: colors.text.inverse, letterSpacing: 2 },
  cardNumberPreview: { ...typography.headlineSmall, color: colors.text.inverse, letterSpacing: 2 },
  cardBottom: { flexDirection: 'row' },
  cardLabel: { ...typography.labelSmall, color: colors.primary[200], marginBottom: 2 },
  cardValue: { ...typography.bodyMedium, color: colors.text.inverse },
  form: { gap: spacing[4] },
  row: { flexDirection: 'row', gap: spacing[4] },
  halfInput: { flex: 1 },
  currencyIcon: { ...typography.bodyLarge, color: colors.text.secondary },
  secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], marginTop: spacing[6] },
  secureText: { ...typography.bodySmall, color: colors.success.main },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6] },
});
