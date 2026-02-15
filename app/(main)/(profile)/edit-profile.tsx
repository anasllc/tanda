import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Avatar, Button, Badge } from '../../../src/components/ui';
import { useAuthStore, useUIStore } from '../../../src/stores';
import { useRouter } from 'expo-router';
import { lightHaptic } from '../../../src/utils/haptics';
import { useUpdateProfile } from '../../../src/hooks/useProfile';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const showToast = useUIStore((state) => state.showToast);
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = async () => {
    lightHaptic();
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        username,
        email,
      });
      showToast({ type: 'success', title: 'Profile updated successfully' });
      router.back();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update failed', message: err.message });
    }
  };

  const handleChangePhoto = () => {
    lightHaptic();
    showToast({ type: 'info', title: 'Photo picker', message: 'Install expo-image-picker to enable' });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Header showBack title="Edit Profile" />
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pt-4 pb-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <View className="items-center mb-8">
                <Avatar name={displayName} size="xlarge" />
                <TouchableOpacity className="mt-3" onPress={handleChangePhoto}>
                  <Text className="text-label-lg font-inter-medium text-accent-500">Change Photo</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <Text className="text-label-lg font-inter-medium text-txt-secondary mb-1">Display Name</Text>
                <TextInput
                  className="bg-bg-tertiary rounded-xl border border-border px-4 py-0 text-[16px] text-txt-primary h-14"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your name"
                  placeholderTextColor={colors.text.tertiary}
                />

                <Text className="text-label-lg font-inter-medium text-txt-secondary mb-1">Username</Text>
                <TextInput
                  className="bg-bg-tertiary rounded-xl border border-border px-4 py-0 text-[16px] text-txt-primary h-14"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="username"
                  placeholderTextColor={colors.text.tertiary}
                  autoCapitalize="none"
                />

                <Text className="text-label-lg font-inter-medium text-txt-secondary mb-1">Email</Text>
                <TextInput
                  className="bg-bg-tertiary rounded-xl border border-border px-4 py-0 text-[16px] text-txt-primary h-14"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text className="text-label-lg font-inter-medium text-txt-secondary mb-1">Phone Number</Text>
                <View className="flex-row items-center justify-between bg-bg-tertiary rounded-xl border border-border px-4 h-14">
                  <Text className="text-[16px] text-txt-secondary">{user?.phoneNumber || '+234 XXX XXX XXXX'}</Text>
                  <Badge label="Verified" variant="success" size="small" />
                </View>

                <Text className="text-label-lg font-inter-medium text-txt-secondary mb-1">Account Status</Text>
                <View className="flex-row items-center justify-between bg-bg-tertiary rounded-xl border border-border px-4 h-14">
                  <Text className="text-[16px] text-txt-secondary">
                    {user?.isVerified ? 'Verified' : 'Unverified'}
                  </Text>
                  {user?.isVerified && <Badge label="KYC Complete" variant="success" size="small" />}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        <View className="px-5 pb-8">
          <Button title="Save Changes" onPress={handleSave} fullWidth loading={updateProfile.isPending} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
