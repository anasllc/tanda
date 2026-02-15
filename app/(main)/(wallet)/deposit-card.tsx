import React, { useState } from 'react';
import { View, Text, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
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
    <SafeAreaView className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <Header showBack title="Card Payment" />
            <View className="flex-1 px-5 pt-4">
              <Card
                className="p-5 mb-6 h-[180px] justify-between"
                style={{ backgroundColor: colors.primary[600] }}
              >
                <View className="flex-row justify-between items-center">
                  <Svg width={40} height={28} viewBox="0 0 40 28">
                    <Rect width={40} height={28} rx={4} fill={colors.primary[600]} />
                    <Path d="M12 18H8v-2h4v2zm6-4H8v-2h10v2z" fill={colors.text.inverse} />
                  </Svg>
                  <Text className="text-title-md font-inter-medium text-txt-inverse tracking-widest">VISA</Text>
                </View>
                <Text className="text-headline-sm font-inter-semibold text-txt-inverse tracking-widest">
                  {cardNumber || '•••• •••• •••• ••••'}
                </Text>
                <View className="flex-row">
                  <View>
                    <Text className="text-label-sm font-inter-medium mb-0.5" style={{ color: colors.primary[200] }}>EXPIRES</Text>
                    <Text className="text-body-md font-inter text-txt-inverse">{expiry || 'MM/YY'}</Text>
                  </View>
                </View>
              </Card>

              <View className="gap-4">
                <Input
                  label="Amount"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  leftIcon={<Text className="text-body-lg font-inter text-txt-secondary">$</Text>}
                />

                <Input
                  label="Card Number"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="number-pad"
                  maxLength={19}
                />

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Input
                      label="Expiry"
                      value={expiry}
                      onChangeText={(text) => setExpiry(formatExpiry(text))}
                      placeholder="MM/YY"
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  <View className="flex-1">
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

              <View className="flex-row items-center justify-center gap-2 mt-6">
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={colors.success.main} strokeWidth={1.5} />
                </Svg>
                <Text className="text-body-sm font-inter text-success-main">Your card details are encrypted and secure</Text>
              </View>
            </View>

            <View className="px-5 pb-6">
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
