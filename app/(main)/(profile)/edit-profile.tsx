import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, layout } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Avatar, Button, Badge } from '../../../src/components/ui';
import { useAuthStore, useUIStore } from '../../../src/stores';
import { useRouter } from 'expo-router';
import { lightHaptic } from '../../../src/utils/haptics';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const showToast = useUIStore((state) => state.showToast);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    lightHaptic();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast({ type: 'success', title: 'Profile updated successfully' });
    setIsSaving(false);
    router.back();
  };

  const handleChangePhoto = () => {
    lightHaptic();
    showToast({ type: 'info', title: 'Photo picker', message: 'Install expo-image-picker to enable' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Header showBack title="Edit Profile" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <View style={styles.avatarSection}>
                <Avatar name={displayName} size="xlarge" />
                <TouchableOpacity style={styles.changePhoto} onPress={handleChangePhoto}>
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                <Text style={styles.label}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your name"
                  placeholderTextColor={colors.text.tertiary}
                />

                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="username"
                  placeholderTextColor={colors.text.tertiary}
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText}>{user?.phoneNumber || '+234 XXX XXX XXXX'}</Text>
                  <Badge label="Verified" variant="success" size="small" />
                </View>

                <Text style={styles.label}>Account Status</Text>
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText}>
                    {user?.isVerified ? 'Verified' : 'Unverified'}
                  </Text>
                  {user?.isVerified && <Badge label="KYC Complete" variant="success" size="small" />}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        <View style={styles.footer}>
          <Button title="Save Changes" onPress={handleSave} fullWidth loading={isSaving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[4] },
  avatarSection: { alignItems: 'center', marginBottom: spacing[8] },
  changePhoto: { marginTop: spacing[3] },
  changePhotoText: { ...typography.labelLarge, color: colors.primary[500] },
  form: { gap: spacing[4] },
  label: { ...typography.labelLarge, color: colors.text.secondary, marginBottom: spacing[1] },
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing[4],
    paddingVertical: 0,
    fontSize: 16,
    color: colors.text.primary,
    height: layout.inputHeight,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing[4],
    height: layout.inputHeight,
  },
  readOnlyText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
});
