import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius, layout } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Avatar, Button, Card, SearchBar } from '../../../src/components/ui';
import { otherUsers } from '../../../src/mock/users';
import { useUIStore } from '../../../src/stores';
import { lightHaptic, formatCurrency, withOpacity } from '../../../src/utils';
import Svg, { Path } from 'react-native-svg';

export default function RequestMoneyScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<typeof otherUsers[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'select' | 'amount'>('select');

  const filteredUsers = otherUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (user: typeof otherUsers[0]) => {
    lightHaptic();
    setSelectedUser(user);
    setStep('amount');
  };

  const handleBack = () => {
    if (step === 'amount') {
      setStep('select');
      setAmount('');
      setNote('');
    } else {
      router.back();
    }
  };

  const handleRequest = () => {
    if (!selectedUser || !amount) return;
    lightHaptic();
    showToast({
      type: 'success',
      title: 'Request sent!',
      message: `Requested ${formatCurrency(parseFloat(amount))} from ${selectedUser.name}`
    });
    router.back();
  };

  const isValid = amount && parseFloat(amount) >= 100;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Header showBack title="Request Money" onBack={handleBack} />

        {step === 'select' ? (
          <View style={styles.selectContent}>
            <SearchBar
              placeholder="Search contacts"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'Recent Contacts'}
            </Text>

            <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
              {filteredUsers.map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userCard}
                  onPress={() => handleSelectUser(user)}
                  activeOpacity={0.7}
                >
                  <Avatar name={user.name} image={user.avatar} size="medium" />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userUsername}>@{user.username}</Text>
                  </View>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M9 18L15 12L9 6" stroke={colors.text.tertiary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.amountContent}>
              <Card style={styles.recipientCard}>
                <View style={styles.recipientRow}>
                  <Avatar name={selectedUser?.name || ''} size="medium" />
                  <View style={styles.recipientInfo}>
                    <Text style={styles.recipientName}>{selectedUser?.name}</Text>
                    <Text style={styles.recipientUsername}>@{selectedUser?.username}</Text>
                  </View>
                </View>
              </Card>

              <Text style={styles.amountLabel}>Enter Amount</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
                autoFocus
              />

              <Text style={styles.noteLabel}>Add a note (optional)</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="What's this for?"
                placeholderTextColor={colors.text.tertiary}
                multiline
              />

              <View style={styles.footer}>
                <Button
                  title="Send Request"
                  onPress={handleRequest}
                  fullWidth
                  disabled={!isValid}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
  selectContent: { flex: 1, paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  sectionTitle: { ...typography.titleSmall, color: colors.text.primary, marginTop: spacing[4], marginBottom: spacing[3] },
  usersList: { flex: 1 },
  userCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border.default },
  userInfo: { flex: 1, marginLeft: spacing[3] },
  userName: { ...typography.bodyLarge, color: colors.text.primary },
  userUsername: { ...typography.bodySmall, color: colors.text.tertiary },
  amountContent: { flex: 1, paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  recipientCard: { marginBottom: spacing[6] },
  recipientRow: { flexDirection: 'row', alignItems: 'center' },
  recipientInfo: { marginLeft: spacing[3] },
  recipientName: { ...typography.titleMedium, color: colors.text.primary },
  recipientUsername: { ...typography.bodySmall, color: colors.text.tertiary },
  amountLabel: { ...typography.labelLarge, color: colors.text.secondary, marginBottom: spacing[2] },
  amountInput: { backgroundColor: colors.background.tertiary, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing[4], fontSize: 24, fontWeight: '600', color: colors.text.primary, height: 64, textAlign: 'center', marginBottom: spacing[6] },
  noteLabel: { ...typography.labelLarge, color: colors.text.secondary, marginBottom: spacing[2] },
  noteInput: { backgroundColor: colors.background.tertiary, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing[4], paddingVertical: spacing[4], fontSize: 16, color: colors.text.primary, height: 100, textAlignVertical: 'top' },
  footer: { flex: 1, justifyContent: 'flex-end', paddingBottom: spacing[8] },
});
