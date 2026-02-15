import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { Input, Button, Card, Avatar, Chip } from '../../../src/components/ui';
import { contacts } from '../../../src/mock/contacts';
import Svg, { Path } from 'react-native-svg';

export default function BillSplitScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');

  const registeredContacts = contacts.filter(c => c.isRegistered);

  const toggleContact = (id: string) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const perPersonAmount = selectedContacts.length > 0 && totalAmount
    ? (parseFloat(totalAmount) / (selectedContacts.length + 1)).toFixed(2)
    : '0.00';

  const handleCreate = () => {
    router.push('/(main)/(services)/bill-split-detail');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Split a Bill" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Input
          label="What's the bill for?"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Dinner at Cafe"
        />

        <Input
          label="Total Amount"
          value={totalAmount}
          onChangeText={setTotalAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          leftIcon={<Text style={styles.currencyIcon}>$</Text>}
        />

        <View style={styles.splitTypeSection}>
          <Text style={styles.sectionTitle}>Split Type</Text>
          <View style={styles.splitTypeRow}>
            <Chip
              label="Split Equally"
              selected={splitType === 'equal'}
              onPress={() => setSplitType('equal')}
            />
            <Chip
              label="Custom Amounts"
              selected={splitType === 'custom'}
              onPress={() => setSplitType('custom')}
            />
          </View>
        </View>

        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>Split With</Text>
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

        {selectedContacts.length > 0 && totalAmount && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Split Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>${totalAmount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>People</Text>
              <Text style={styles.summaryValue}>{selectedContacts.length + 1} (including you)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Per Person</Text>
              <Text style={styles.summaryValueBold}>${perPersonAmount}</Text>
            </View>
          </Card>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Create Split"
          onPress={handleCreate}
          fullWidth
          disabled={!title || !totalAmount || selectedContacts.length === 0}
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
  splitTypeSection: { },
  sectionTitle: { ...typography.titleSmall, color: colors.text.primary, marginBottom: spacing[3] },
  splitTypeRow: { flexDirection: 'row', gap: spacing[3] },
  contactsSection: { },
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
  summaryCard: { },
  summaryTitle: { ...typography.titleSmall, color: colors.text.primary, marginBottom: spacing[3] },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] },
  summaryLabel: { ...typography.bodyMedium, color: colors.text.secondary },
  summaryValue: { ...typography.bodyMedium, color: colors.text.primary },
  summaryLabelBold: { ...typography.titleSmall, color: colors.text.primary },
  summaryValueBold: { ...typography.titleSmall, color: colors.primary[400] },
  divider: { height: 1, backgroundColor: colors.border.subtle, marginVertical: spacing[3] },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6] },
});
