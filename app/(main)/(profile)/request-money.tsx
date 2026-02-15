import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Avatar, Button, Card, SearchBar } from '../../../src/components/ui';
import { useSearchUsers, SearchResult } from '../../../src/hooks/useContacts';
import { api } from '../../../src/lib/api';
import { useUIStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';
import { formatCurrency } from '../../../src/utils/formatters';
import Svg, { Path } from 'react-native-svg';

export default function RequestMoneyScreen() {
  const router = useRouter();
  const showToast = useUIStore((state) => state.showToast);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'select' | 'amount'>('select');
  const [submitting, setSubmitting] = useState(false);

  const { data: searchData, isLoading: isSearching } = useSearchUsers(searchQuery);
  const users = searchData?.users ?? [];

  const handleSelectUser = (user: SearchResult) => {
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

  const handleRequest = async () => {
    if (!selectedUser || !amount) return;
    lightHaptic();
    setSubmitting(true);
    try {
      await api.requestMoney(selectedUser.id, parseFloat(amount), note || undefined);
      showToast({
        type: 'success',
        title: 'Request sent!',
        message: `Requested ${formatCurrency(parseFloat(amount))} from ${selectedUser.display_name}`
      });
      router.back();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Request failed',
        message: 'Could not send money request. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = amount && parseFloat(amount) >= 100;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Header showBack title="Request Money" onBack={handleBack} />

        {step === 'select' ? (
          <View className="flex-1 px-5 pt-4">
            <SearchBar
              placeholder="Search contacts"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <Text className="text-title-sm font-inter-medium text-txt-primary mt-4 mb-3">
              {searchQuery ? 'Search Results' : 'Search for a user'}
            </Text>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {isSearching && searchQuery.length >= 2 && (
                <View className="py-8 items-center">
                  <ActivityIndicator size="small" />
                </View>
              )}
              {users.map(user => (
                <TouchableOpacity
                  key={user.id}
                  className="flex-row items-center py-3 border-b border-border"
                  onPress={() => handleSelectUser(user)}
                  activeOpacity={0.7}
                >
                  <Avatar name={user.display_name} source={user.avatar_url} size="medium" />
                  <View className="flex-1 ml-3">
                    <Text className="text-body-lg font-inter text-txt-primary">{user.display_name}</Text>
                    <Text className="text-body-sm font-inter text-txt-tertiary">@{user.username}</Text>
                  </View>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M9 18L15 12L9 6" stroke={colors.text.tertiary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              ))}
              {searchQuery.length >= 2 && !isSearching && users.length === 0 && (
                <Text className="text-body-md font-inter text-txt-tertiary text-center py-8">
                  No users found
                </Text>
              )}
            </ScrollView>
          </View>
        ) : (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 px-5 pt-4">
              <Card className="mb-6">
                <View className="flex-row items-center">
                  <Avatar name={selectedUser?.display_name || ''} size="medium" />
                  <View className="ml-3">
                    <Text className="text-title-md font-inter-medium text-txt-primary">{selectedUser?.display_name}</Text>
                    <Text className="text-body-sm font-inter text-txt-tertiary">@{selectedUser?.username}</Text>
                  </View>
                </View>
              </Card>

              <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2">Enter Amount</Text>
              <TextInput
                className="bg-bg-tertiary rounded-xl border border-border px-4 text-[24px] font-semibold text-txt-primary h-16 text-center mb-6"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="numeric"
                autoFocus
              />

              <Text className="text-label-lg font-inter-medium text-txt-secondary mb-2">Add a note (optional)</Text>
              <TextInput
                className="bg-bg-tertiary rounded-xl border border-border px-4 py-4 text-[16px] text-txt-primary h-[100px]"
                style={{ textAlignVertical: 'top' }}
                value={note}
                onChangeText={setNote}
                placeholder="What's this for?"
                placeholderTextColor={colors.text.tertiary}
                multiline
              />

              <View className="flex-1 justify-end pb-8">
                <Button
                  title={submitting ? "Sending..." : "Send Request"}
                  onPress={handleRequest}
                  fullWidth
                  disabled={!isValid || submitting}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
