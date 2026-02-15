import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Input, Button, Card, Avatar, Chip } from '../../../src/components/ui';
import { contacts } from '../../../src/mock/contacts';
import Svg, { Path } from 'react-native-svg';

export default function PoolCreateScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const registeredContacts = contacts.filter(c => c.isRegistered);

  const toggleContact = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    router.push('/(main)/(services)/pool-detail');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Create Pool" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Input
          label="Pool Name"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Birthday Gift for Sarah"
        />

        <Input
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="What's this pool for?"
          multiline
          numberOfLines={3}
        />

        <Input
          label="Target Amount"
          value={targetAmount}
          onChangeText={setTargetAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          leftIcon={<Text style={styles.currencyIcon}>$</Text>}
        />

        <Input
          label="Deadline (Optional)"
          value={deadline}
          onChangeText={setDeadline}
          placeholder="e.g., Dec 25, 2024"
        />

        <View style={styles.inviteSection}>
          <Text style={styles.sectionTitle}>Invite Contributors</Text>
          <Text style={styles.sectionSubtitle}>Select people to invite to this pool</Text>

          <View style={styles.contactsList}>
            {registeredContacts.slice(0, 8).map(contact => (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactItem, selectedContacts.includes(contact.id) && styles.contactItemSelected]}
                onPress={() => toggleContact(contact.id)}
              >
                <Avatar name={contact.name} size="sm" />
                <Text style={styles.contactName} numberOfLines={1}>{contact.name.split(' ')[0]}</Text>
                {selectedContacts.includes(contact.id) && (
                  <View style={styles.checkMark}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17l-5-5" stroke={colors.text.inverse} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {targetAmount && (
          <Card style={styles.previewCard}>
            <View style={styles.previewIcon}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={colors.primary[400]} strokeWidth={1.5} strokeLinecap="round" />
                <Path d="M9 11a4 4 0 100-8 4 4 0 000 8z" stroke={colors.primary[400]} strokeWidth={1.5} />
                <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={colors.primary[400]} strokeWidth={1.5} strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={styles.previewTitle}>{title || 'Pool Name'}</Text>
            <Text style={styles.previewAmount}>Target: ${targetAmount}</Text>
            <Text style={styles.previewInvites}>{selectedContacts.length} people invited</Text>
          </Card>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Create Pool"
          onPress={handleCreate}
          fullWidth
          disabled={!title || !targetAmount}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[6], gap: spacing[5] },
  currencyIcon: { ...typography.bodyLarge, color: colors.text.secondary },
  inviteSection: { },
  sectionTitle: { ...typography.titleSmall, color: colors.text.primary, marginBottom: spacing[1] },
  sectionSubtitle: { ...typography.bodySmall, color: colors.text.tertiary, marginBottom: spacing[3] },
  contactsList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  contactItem: {
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    width: 80,
    position: 'relative',
  },
  contactItemSelected: { backgroundColor: colors.primary[500] + '30', borderWidth: 1, borderColor: colors.primary[500] },
  contactName: { ...typography.labelSmall, color: colors.text.secondary, marginTop: spacing[2] },
  checkMark: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  previewCard: { alignItems: 'center', paddingVertical: spacing[6] },
  previewIcon: { marginBottom: spacing[3] },
  previewTitle: { ...typography.titleMedium, color: colors.text.primary, marginBottom: spacing[1] },
  previewAmount: { ...typography.bodyMedium, color: colors.primary[400], marginBottom: spacing[1] },
  previewInvites: { ...typography.bodySmall, color: colors.text.tertiary },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6] },
});
